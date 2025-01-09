const cds = require("@sap/cds");
const logger = cds.log("clearingapplicationlogger");
const { util } = require("../util/util");
const constants = require("../util/constants");
const axios = require('axios');
const { uuid } = cds.utils;
const { DealMgmntInterface } = require("../externalservices/deal/dealinterface");
const { CapacityMgmntInterface } = require("../externalservices/capacity/capacityinterface");


class ClaimsHandler {

    constructor(service) {
        this.service = service;
        this.dealMgmt = new DealMgmntInterface();
        this.capacityMgmt = new CapacityMgmntInterface();
        this.Util = new util();
    }

    /**
     * @description - This function fetches claim receivables data from the S4 system.
     * It constructs the request URL with the necessary parameters, sends a GET request to the S4 system,
     * and processes the response to get the claim receivables data.
     * @param {Object} req - The request object containing selection filters
     * @returns {Promise} - A promise that resolves with the claim receivables data
     * @throws {Error} - Throws an error if any issue occurs
     */
    getClaimReceivables = async (req) => {
        try {
            let sSelectionFiltersEncoded = encodeURIComponent(
                req.data.SelectionFilters
            );
            // Initially get all the transactions which are in process
            let oTransactionsInProcess = {};
            const aTransactionsInProcess = await SELECT.from("clearingapplicationService.ClaimReceivablesPendingTransactions");
            const aUIMTransactionsInProcess = await SELECT.from("clearingapplicationService.UIMPendingTransactions");
            oTransactionsInProcess.TransactionsInProcess = aTransactionsInProcess;
            oTransactionsInProcess.UIMTransactionsInProcess = aUIMTransactionsInProcess;

            // Now Fetch the data from OnPrem 
            const oResponse = await this.service.s4Connection.send({
                method: "GET",
                path: `/getClaimReceivables?SelectionFilters='${sSelectionFiltersEncoded}'`,
            });
            const aClearingOP = oResponse;
            let oClearingOPWithDetails = aClearingOP.length > 0 ? await this.getCROtherDetails(aClearingOP, oTransactionsInProcess) : []; // todo implement this.
            oClearingOPWithDetails = this.applySelectionFiltersForClaimReceivables(req, oClearingOPWithDetails);
            return oClearingOPWithDetails;
        } catch (error) {
            logger.error(error);
            error.message && req.reject(500, error.message);
            req.reject(500, "Error Occurred");
        }
    }

    /**
     * @description - This function fetches additional details and also status for claim receivables.
     * It retrieves internal reference details from deal management and maps them to the clearing data.
     * @param {Array} aClearingOP - The array containing claim receivables data
     * @param {Object} oTransactionsInProcess - The object containing transactions in process
     * @returns {Promise} - A promise that resolves with the claim receivables data with additional details
     * @throws {Error} - Throws an error if any issue occurs
     */
    getCROtherDetails = async (aClearingOP, oTransactionsInProcess) => {

        // Get UMR
        let aInternalReferences = aClearingOP
            .map((x) => x.IntRef)
            .filter((line) => line !== "");
        const aInternalReferencesWithDetails =
            await this.dealMgmt.getInteRefAttributes(aInternalReferences);

        aClearingOP.forEach((oClearingOP) => {
            let oIntRefDetail = aInternalReferencesWithDetails.find(
                (line) => line.INTERNAL_REFERENCE_NO === oClearingOP.IntRef
            );

            oClearingOP.Umr = oIntRefDetail ? oIntRefDetail.UMR_NO : "";
        });


        // Map over aClearingOP and assign ClearingStatus based on the fetched results
        const results = aClearingOP.map(oClearingOP => {
            const relatedTransaction = oClearingOP.TrType !== "Unallocated Insurance Monies" ? oTransactionsInProcess.TransactionsInProcess.find(transaction =>
                transaction.ExtRef === oClearingOP.ExtRef &&
                transaction.IntRef === oClearingOP.IntRef &&
                transaction.TrType === oClearingOP.TrType &&
                transaction.BitRef === oClearingOP.BitRef &&
                transaction.UCR === oClearingOP.Ucr &&
                transaction.ClaimRef === oClearingOP.ClaimId &&
                transaction.TrRef === oClearingOP.TrRefNum &&
                transaction.MemberBPID === oClearingOP.MemberId
            ) : oTransactionsInProcess.UIMTransactionsInProcess.find(transaction =>
                transaction.DocumentNo === oClearingOP.Opbel &&
                transaction.ItemNo === oClearingOP.Item &&
                transaction.RepItem === oClearingOP.RepItem &&
                transaction.SubItem === oClearingOP.SubItem
            );

            if (!relatedTransaction) {
                oClearingOP.ClearingStatus = constants.ClearingStatus.NotApplicable; // Not Applicable - Nothing in process
            } else {
                oClearingOP.ClearingStatus = relatedTransaction.Status;
            }
            return oClearingOP;
        });

        return results;
    }

    /**
     * @description - This function applies selection filters to the claim receivables data.
     * It parses the selection filters from the UI, filters the data based on the selection criteria,
     * and returns the filtered data.
     * @param {Object} req - The request object containing selection filters
     * @param {Array} aClearingOP - The array containing claim receivables data
     * @returns {Array} - The filtered claim receivables data
     * @throws {Error} - Throws an error if any issue occurs
     */
    applySelectionFiltersForClaimReceivables = (req, aClearingOP) => {
        let oSelectionFilters;
        var aFilteredClearingOP = aClearingOP;
        try {
            oSelectionFilters = JSON.parse(req.data.SelectionFilters);
        } catch (error) {
            console.error("Error parsing SelectionFilters:", error); ``
            return aClearingOP; // Return original array if parsing fails
        }

        const aUWayToBeIncluded = oSelectionFilters.UWYears;

        if (aUWayToBeIncluded && aUWayToBeIncluded.length > 0) {
            aFilteredClearingOP = aFilteredClearingOP.filter(
                line => aUWayToBeIncluded.includes(line.Uway) || line.TrType === "Unallocated Insurance Monies"
            );
        }

        const aTRIds = oSelectionFilters.TransRefs;
        if (aTRIds && aTRIds.length > 0) {
            aFilteredClearingOP = aFilteredClearingOP.filter(line => aTRIds.includes(line.TrRefNum) || line.TrType === "Unallocated Insurance Monies"
                || line.TrRefNum === ""); // TODO - Remove this once TRIds are migrated.
        }

        return aFilteredClearingOP;
    }

    /**
     * @description - This function clears claim receivables by invoking the lambda function.
     * It constructs the payload, sends a request to the lambda function, and processes the response.
     * It also updates the clearing status log and interface log.
     * @param {Object} req - The request object containing claim receivables data
     * @returns {Promise} - A promise that resolves with the lambda function response
     * @throws {Error} - Throws an error if any issue occurs
     */
    clearClaimReceivables = async (req) => {

        let aClearingData = req.data.clearingdata,
            sUniqueClearingIdentifier = uuid();

        let aClearingDataWithoutPaymentTransactions = aClearingData.filter(
            (x) => !["Payment", "Bank Charge", "Unallocated Insurance Monies"].includes(x.TRANSACTION_TYPE)
        );
        if (aClearingDataWithoutPaymentTransactions.length === 0) {
            req.reject(400, "Select a valid transaction to Clear");
        }
        try {
            let aRequiredDetails = await this.getCROtherDetailsForPayload(aClearingDataWithoutPaymentTransactions);

            let oPayload = this.Util.generateClaimReceivablesPayload(
                aClearingData,
                aRequiredDetails
            );

            // add tenant info
            const { tenant } = cds.context;
            oPayload.TENANT_ID = tenant;
            if (!oPayload.TENANT_ID) {
                oPayload.TENANT_ID = "5c60ae9d-8d13-4a0b-8ee3-c9da4c8e2129"; // Todo: Remove this line after testing
            }
            oPayload.USER_ID = req.user.id;
            oPayload.UNIQUE_CLEARING_IDENTIFIER = sUniqueClearingIdentifier;
            if(!process.env.LANDSCAPE){
                req.reject(500, "LANDSCAPE Environment variable is not set");
            }
            oPayload.LANDSCAPE = process.env.LANDSCAPE;

            const aUniqueExtAndClaimRefs = [...new Set(aClearingDataWithoutPaymentTransactions.map(item => item.EXTERNAL_REFERENCE_NO + '|' + item.CLAIM_REFERENCE))];
            let aLogEntries = aUniqueExtAndClaimRefs.map(extRef => ({
                ExtRef: extRef.split('|')[0],
                ClaimRef: extRef.split('|')[1],
                ClearingType: "ClaimReceivables",
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                Payload: JSON.stringify(oPayload),
                Status: constants.ClearingStatus.InProcess,
                StatusInfo: "Before Lambda Invoke"
            }));

            var aClearingDataInPayloadForCSTableUpdate = oPayload.IT_CLEARING_DATA.filter(line => !constants.TransactionsNotIncludedInClearingStatusTableUpdate.includes(line.TRANSACTION_TYPE));
            let oLoggerResponse = await this.Util.executeTransaction(
                'INSERT',
                "clearingapplicationService.InterfaceLog",
                aLogEntries
            );
            const aLogEntriesUpdated = await SELECT`UniqueClearingIdentifier`.from("clearingapplicationService.InterfaceLog").where({
                UniqueClearingIdentifier: sUniqueClearingIdentifier
            });
            const aLogEntryIDs = aLogEntriesUpdated.map(logEntry => logEntry.UniqueClearingIdentifier);
  
            logger.info(oLoggerResponse);

            try {
                const lambdaResponse = await this.Util.invokeLambdaFunction(
                    oPayload,
                    process.env.AWS_LAMBDA_ENDPOINT_CLAIM
                );
                if (lambdaResponse.status == 200) {

                    // Remove previous transactions in error
                    await this.Util.RemovePreviousTransactionsInError(constants.ClearingTypes.ClaimReceivables, 
                        aClearingDataWithoutPaymentTransactions);
                    await this.Util.RemovePreviousTransactionsInError("Unallocated Insurance Monies", 
                        aClearingData.filter(x => x.TRANSACTION_TYPE === "Unallocated Insurance Monies"));

                    // Map data for Claim Receivables Pending Transactions
                    let aPendingTransactions = aClearingDataWithoutPaymentTransactions.map(line => ({
                        ExtRef: line.EXTERNAL_REFERENCE_NO,
                        IntRef: line.INTERNAL_REFERENCE_NO,
                        TrType: line.TRANSACTION_TYPE,
                        BitRef: line.BIT_REFERENCE,
                        UCR: line.UCR,
                        ClaimRef: line.CLAIM_REFERENCE,
                        TrRef: line.TRANSACTION_REFERENCE,
                        MemberBPID: line.MEMBERBPID,
                        Status: constants.ClearingStatus.InProcess 
                    }));

                    // Map data for UIM Pending Transactions
                    let aPendingUIMTransactions = aClearingData.filter(x => x.TRANSACTION_TYPE === "Unallocated Insurance Monies").map(line => ({
                        DocumentNo: line.DOCUMENT_NUMBER,
                        ItemNo: line.ITEM_NUMBER,
                        RepItem: line.REP_ITEM,
                        SubItem: line.SUB_ITEM,
                        Status: constants.ClearingStatus.InProcess 
                    }));

                    // Prepare all database operations
                    await this.Util.executeTransaction(
                        'INSERT',
                        "clearingapplicationService.ClaimReceivablesPendingTransactions",
                        aPendingTransactions
                    );
                    // Only run the insert operation if there are entries in aPendingUIMTransactions
                    if (aPendingUIMTransactions.length > 0) {
                        await this.Util.executeTransaction(
                            'INSERT',
                            "clearingapplicationService.UIMPendingTransactions",
                            aPendingUIMTransactions
                        );
                    }
                    await this.Util.executeTransaction(
                        'UPDATE',
                        "clearingapplicationService.InterfaceLog",
                        { Status: constants.ClearingStatus.Success, StatusInfo: "Received Response From Lambda" },
                        { ID: { in: aLogEntryIDs } }
                    );

                    await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.InProcess);

                    await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.InProcess, sUniqueClearingIdentifier);

                    return JSON.stringify(oPayload);
                } else {
                    let sStatus =
                        "Issue Occurred While Clearing - lambda function response issue";
                    await this.Util.executeTransaction(
                        'UPDATE',
                        "clearingapplicationService.InterfaceLog",
                        { Status: constants.ClearingStatus.Failed, StatusInfo: sStatus, Response: JSON.stringify(lambdaResponse) },
                        { ID: { in: aLogEntryIDs } }
                    );
                    await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.Failed);
                    await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.Failed, sUniqueClearingIdentifier);
                    req.reject(500, sStatus);
                }
            } catch (error) {
                logger.error(error);
                let sStatus =
                    "Issue Occurred While Clearing - lambda function invoke issue";
                await this.Util.executeTransaction(
                    'UPDATE',
                    "clearingapplicationService.InterfaceLog",
                    { Status: constants.ClearingStatus.Failed, StatusInfo: sStatus, Response: JSON.stringify(error) },
                    { ID: { in: aLogEntryIDs } }
                );
                await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.Failed);
                await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.Failed, sUniqueClearingIdentifier, [], sStatus);
                req.reject(500, sStatus);
            }
            return true; // Todo revert it.
        } catch (error) {
            if (aClearingDataInPayloadForCSTableUpdate?.length > 0) {
                await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.Failed, sUniqueClearingIdentifier, [], error.message);
                await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.ClaimReceivables, constants.ClearingStatus.Failed);
            }
            req.reject(500, error);
        }
    }

    /**
     * @description - This function fetches additional details for the payload of claim receivables.
     * It constructs the necessary fields to fetch member collections from the claim management system.
     * It fetches the member collections info and maps it to the clearing data.
     * Herein for Salvage and Subrogation, all members are selected. Since the money is collected from broker and paid to members.
     * For other transaction types, only relevant members are selected.
     * @param {Array} aClearingData - The array containing claim receivables data
     * @returns {Promise} - A promise that resolves with the additional details for the payload
     * @throws {Error} - Throws an error if any issue occurs
     */
    getCROtherDetailsForPayload = async (aClearingData) => {
        let aFieldToGetMemberCollections = aClearingData.map(line => {
            return {
                CLAIM_REFERENCE_NO: line.CLAIM_REFERENCE,
                POLICY_TRANSREF_NO: line.TRANSACTION_REFERENCE,
                MEMBER_BP_ID: line.MEMBERBPID,
                DOCUMENT_TYPE: line.DOCUMENT_TYPE
            }
        })

        // Remove duplicates
        const uniqueEntries = Array.from(new Set(aFieldToGetMemberCollections.map(e => JSON.stringify(e))))
            .map(e => JSON.parse(e));

        let oClaimConnection = await cds.connect.to("claim-mgmt-service");
        oClaimConnection.path = "/v2/claimmgmt-srv";

        // Construct the OR conditions dynamically
        let orConditions = uniqueEntries.map(entry => {
            return `(CLAIM_REFERENCE_NO = '${entry.CLAIM_REFERENCE_NO}'AND POLICY_TRANSREF_NO = '${entry.POLICY_TRANSREF_NO}')`; // AND MEMBER_BP_ID = '${entry.MEMBER_BP_ID}')`;
        });

        // Join all conditions with OR
        let combinedCondition = orConditions.join(' OR ');
        try {
            var aMemberCollectionsInfo = await oClaimConnection.read(SELECT.from('MemberCollections').where(combinedCondition));
        } catch (error) {
            logger.error("Error fetching Member Collections:", error);
            throw new Error("Error fetching Member Collections");
        }
        if (aMemberCollectionsInfo.length === 0 && aFieldToGetMemberCollections.length > 0) {
            throw new Error("Member Details Not found");
        }

        // Get Member Info
        // https://adev02-adev01-dev-dev-claimmgmt-router.cfapps.eu10-004.hana.ondemand.com/v2/claimmgmt-srv/
        //ClaimDetails(504)?$expand=ItsPolicyTransactions($expand=ItsMemberInfo;$filter=POLICY_TRANSREF_NO eq 'TR-01')

        // For Salvage Incoming and Subrogation -> Send All Members with OWN_VL. Docs needs to be created for all members. Herein Money is collected from Broker and Paid to Members. 
        let aMembersWithAllInfo = aFieldToGetMemberCollections.map(line => {
            let oMemberInfo = aMemberCollectionsInfo.find(member => member.CLAIM_REFERENCE_NO === line.CLAIM_REFERENCE_NO 
                && member.POLICY_TRANSREF_NO === line.POLICY_TRANSREF_NO 
                && (!(line.DOCUMENT_TYPE === "SC" || line.DOCUMENT_TYPE === "RC") ? member.MEMBER_BP_ID === line.MEMBER_BP_ID : true));
            let result = {
                CLAIM_REFERENCE: line.CLAIM_REFERENCE_NO,
                TRANSACTION_REFERENCE: line.POLICY_TRANSREF_NO,
                DOCUMENT_TYPE: line.DOCUMENT_TYPE,
                PAYEE_BP_ID: oMemberInfo?.PAYEE_BP_ID || "",
                POOL: oMemberInfo?.POOL_CD || "",
                LOB_NAME: oMemberInfo?.LOB_CD || "",
                UWAY: oMemberInfo?.UWYEAR || "",
                BROKER_ID: oMemberInfo?.BROKER_ID || ""
            };
            if (line.DOCUMENT_TYPE === "SC" || line.DOCUMENT_TYPE === "RC") { // Salvage and Subrocation - Send All Members 
                result.MEMBERS = aMemberCollectionsInfo.filter(member => member.CLAIM_REFERENCE_NO === line.CLAIM_REFERENCE_NO 
                    && member.POLICY_TRANSREF_NO === line.POLICY_TRANSREF_NO 
                    ).map(member => ({ MEMBERBPID: member.MEMBER_BP_ID, OWN_VL: member.OWN_VL, AGREEMENT_ID: member.AGREEMENT_ID,
                                    FRONTING_AGREEMENT_ID: member.FRONTING_AGREEMENT_ID, STAMP_MEMBER_ID: member.STAMPMEMBER_ID,
                                    AGREEMENT_TYPE: member.FRONTING_AGREEMENT_ID === 0 || member.FRONTING_AGREEMENT_ID === null ? "UAA" : "QS"
                     }));
            } else {
                result.MEMBERBPID = oMemberInfo?.MEMBER_BP_ID || "";
                result.OWN_VL = oMemberInfo?.OWN_VL || "";
            }
            return result;
        });
        return aMembersWithAllInfo;
        
    }

    /**
     * @description - This function fetches claim payables data from the S4 system.
     * It constructs the request URL with the necessary parameters, sends a GET request to the S4 system,
     * and processes the response to get the claim payables data.
     * @param {Object} req - The request object containing selection filters
     * @returns {Promise} - A promise that resolves with the claim payables data
     * @throws {Error} - Throws an error if any issue occurs
     */
    getClaimPayables = async (req) => {
        try {
            let sSelectionFiltersEncoded = encodeURIComponent(
                req.data.SelectionFilters
            );
            // Initially get all the transactions which are in process
            let oTransactionsInProcess = {};
            const aTransactionsInProcess = await SELECT.from("clearingapplicationService.ClaimPayablesPendingTransactions");
            const aUIMTransactionsInProcess = await SELECT.from("clearingapplicationService.UIMPendingTransactions");
            oTransactionsInProcess.TransactionsInProcess = aTransactionsInProcess;
            oTransactionsInProcess.UIMTransactionsInProcess = aUIMTransactionsInProcess;
            // Now Fetch the data from OnPrem 
            const oResponse = await this.service.s4Connection.send({
                method: "GET",
                path: `/getClaimPayables?SelectionFilters='${sSelectionFiltersEncoded}'`,
            });
            const aClearingOP = oResponse;
            let oClearingOPWithDetails = aClearingOP.length > 0 ? await this.getCPOtherDetails(aClearingOP, oTransactionsInProcess) : [];
            oClearingOPWithDetails = this.applySelectionFiltersForClaimPayables(req, oClearingOPWithDetails);
            return oClearingOPWithDetails;
        } catch (error) {
            logger.error(error);
            error.message && req.reject(500, error.message);
            req.reject(500, "Error Occurred");
        }
    }

    /**
     * @description - This function fetches additional details for the payload of claim payables.
     * It fetches the UMR and Section Name for each transaction and maps it to the clearing data.
     * @param {Array} aClearingOP - The array containing claim payables data
     * @param {Object} oTransactionsInProcess - The object containing transactions in process
     * @returns {Promise} - A promise that resolves with the additional details for the payload
     * @throws {Error} - Throws an error if any issue occurs
     */
    getCPOtherDetails = async (aClearingOP, oTransactionsInProcess) => {
        // Get UMR
        let aInternalReferences = aClearingOP
            .map((x) => x.IntRef)
            .filter((line) => line !== "");
        const aInternalReferencesWithDetails =
            await this.dealMgmt.getInteRefAttributes(aInternalReferences);

        aClearingOP.forEach((oClearingOP) => {
            let oIntRefDetail = aInternalReferencesWithDetails.find(
                (line) => line.INTERNAL_REFERENCE_NO === oClearingOP.IntRef
            );

            oClearingOP.Umr = oIntRefDetail ? oIntRefDetail.UMR_NO : "";
            oClearingOP.SectionName = oIntRefDetail ? oIntRefDetail.SECTION_NAME_TT : "";
        });


        // // Map over aClearingOP and assign ClearingStatus based on the fetched results
        const results = aClearingOP.map(oClearingOP => {
            const relatedTransaction = oClearingOP.TrType !== "Unallocated Insurance Monies" ? oTransactionsInProcess.TransactionsInProcess.find(transaction =>
                transaction.ExtRef === oClearingOP.ExtRef &&
                transaction.IntRef === oClearingOP.IntRef &&
                transaction.TrType === oClearingOP.TrType &&
                transaction.UCR === oClearingOP.Ucr &&
                transaction.ClaimRef === oClearingOP.ClaimId &&
                transaction.TrRef === oClearingOP.TrRefNum &&
                transaction.DocumentNo === oClearingOP.Opbel &&
                transaction.ItemNo === oClearingOP.Item &&
                transaction.RepItem === oClearingOP.RepItem &&
                transaction.SubItem === oClearingOP.SubItem
            ) : oTransactionsInProcess.UIMTransactionsInProcess.find(transaction =>
                transaction.DocumentNo === oClearingOP.Opbel &&
                transaction.ItemNo === oClearingOP.Item &&
                transaction.RepItem === oClearingOP.RepItem &&
                transaction.SubItem === oClearingOP.SubItem
            );

            if (!relatedTransaction) {
                oClearingOP.ClearingStatus = constants.ClearingStatus.NotApplicable; // Not Applicable - Nothing in process
            } else {
                if (relatedTransaction.TrType !== "Unallocated Insurance Monies") {
                    oClearingOP.ClearingStatus = constants.ClearingStatus.NotApplicable; //REVIEW - Set Nothing In process not NON-UIM Transactions //TODO - Check if this is correct.
                } else {
                    oClearingOP.ClearingStatus = relatedTransaction.Status;
                }
            }
            return oClearingOP;
        });

        return results;

    }

    /**
     * @description - This function applies selection filters to the claim payables data.
     * It parses the selection filters from the UI, filters the data based on the selection criteria,
     * and returns the filtered data.
     * @param {Object} req - The request object containing selection filters
     * @param {Array} aClearingOP - The array containing claim payables data
     * @returns {Array} - The filtered claim payables data
     * @throws {Error} - Throws an error if any issue occurs
     */
    applySelectionFiltersForClaimPayables = async (req, aClearingOP) => {
        let oSelectionFilters;
        var aFilteredClearingOP = aClearingOP;
        try {
            oSelectionFilters = JSON.parse(req.data.SelectionFilters);
        } catch (error) {
            console.error("Error parsing SelectionFilters:", error); ``
            return aClearingOP; // Return original array if parsing fails
        }

        // const aUWayToBeIncluded = oSelectionFilters.UWYears;

        // if (aUWayToBeIncluded && aUWayToBeIncluded.length > 0) {
        //   aFilteredClearingOP = aFilteredClearingOP.filter(
        //     line => aUWayToBeIncluded.includes(line.Uway) || line.TrType === "Unallocated Insurance Monies"
        //   );
        // }

        // const aTRIds = oSelectionFilters.TransRefs;
        // if (aTRIds && aTRIds.length > 0) {
        //   aFilteredClearingOP = aFilteredClearingOP.filter(line => aTRIds.includes(line.TrRefNum) || line.TrType === "Unallocated Insurance Monies"
        //     || line.TrRefNum === ""); // TODO - Remove this once TRIds are migrated.
        // }

        return aFilteredClearingOP;
    }

    /**
     * @description - This function clears the claim payables.
     * It fetches the clearing data, removes payment transactions, and checks if the data is valid.
     * It then calls the Util function to clear the payables and returns the response.
     * @param {Object} req - The request object containing clearing data
     * @returns {Promise} - A promise that resolves with the clearing response
     * @throws {Error} - Throws an error if any issue occurs
     */
    clearClaimPayables = async (req) => {

        let aClearingData = req.data.clearingdata;
        let aClearingDataWithoutPaymentTransactions = aClearingData.filter(
          (x) =>
            !["Payment", "Bank Charge", "OVER PAYMENT", "Unallocated Insurance Monies"].includes(
              x.TRANSACTION_TYPE
            )
        );
        if (aClearingDataWithoutPaymentTransactions.length === 0) {
          req.reject(400, "Select a valid transaction to Clear");
        }
        try {
          return await this.Util.clearPayables(req, constants.ClearingTypes.ClaimPayables, aClearingData);
        } catch (error) {
          req.reject(500, error);
        }
  
    }



}
module.exports = { ClaimsHandler };
