const cds = require("@sap/cds");
const logger = cds.log("clearingapplicationlogger");
const { util } = require("../util/util");
const constants = require("../util/constants");
const { uuid } = cds.utils;
const { DealMgmntInterface } = require("../externalservices/deal/dealinterface");
const { CapacityMgmntInterface } = require("../externalservices/capacity/capacityinterface");

class PremiumsHandler {

    constructor(service) {
        this.service = service;
        this.dealMgmt = new DealMgmntInterface();
        this.capacityMgmt = new CapacityMgmntInterface();
        this.Util = new util();
    }

    /**
     * @description - This function is used to get the premium receivables from S4 system.
     * It processes the received data, including checking for transactions in progress.
     * If the transaction are in process, the status is set to InProcess which will make it not editable in UI
     * The function then returns the processed premium receivables data.
     * @param {Object} req - The request object
     * @returns {Promise<Array>} - The premium receivables
     */
    getPremiumReceivables = async (req) => {

        // Initially get all the transactions which are in process
        let oTransactionsInProcess = {};
        const aTransactionsInProcess = await SELECT.from("clearingapplicationService.PremiumReceivablesPendingTransactions");
        const aUIMTransactionsInProcess = await SELECT.from("clearingapplicationService.UIMPendingTransactions");
        oTransactionsInProcess.TransactionsInProcess = aTransactionsInProcess;
        oTransactionsInProcess.UIMTransactionsInProcess = aUIMTransactionsInProcess;
        try {

            let sSelectionFiltersEncoded = encodeURIComponent(
                req.data.SelectionFilters
            );

            const oResponse = await this.service.s4Connection.send({
                method: "GET",
                path: `/getPremiumReceivables?SelectionFilters='${sSelectionFiltersEncoded}'`,
            });

            const aClearingOP = oResponse;
            const oClearingOPWithDetails = aClearingOP.length > 0 ? await this.getPROtherDetails(aClearingOP, oTransactionsInProcess) : [];
            return oClearingOPWithDetails;
        } catch (error) {
            logger.error(error);
            error.message && req.reject(500, error.message);
            req.reject(500, "Error Occurred");
        }


    }

    /**
     * @description - This function processes premium receivables data by adding additional details and checking for transactions in progress.
     * It takes the raw premium receivables data and information about transactions currently in process,
     * then enriches the data with generic details and clearing status information.
     * The function performs the following steps:
     * 1. Calls getPremiumGenericDetailsForOP to add generic details to the premium receivables.
     * 2. Checks each transaction against the list of transactions in process.
     * 3. Assigns a clearing status to each transaction based on whether it's in process or not.
     * 4. Handles both regular transactions and Unallocated Insurance Monies (UIM) transactions differently.
     * @param {Array} aClearingOP - The raw premium receivables data
     * @param {Object} oTransactionsInProcess - Object containing information about transactions currently in process
     * @returns {Array} - The premium receivables with added details and clearing status
     */
    getPROtherDetails = async (aClearingOP, oTransactionsInProcess) => {

        aClearingOP = await this.getPremiumGenericDetailsForOP(aClearingOP);

        // Check if any transactions are in clearing process 
        const results = aClearingOP.map((oClearingOP) => {
            const isUIM = oClearingOP.TrType === "Unallocated Insurance Monies";
            const transactionsInProcess = isUIM ? oTransactionsInProcess.UIMTransactionsInProcess : oTransactionsInProcess.TransactionsInProcess;
            const relatedTransaction = transactionsInProcess.find(transaction => {
                return isUIM ?
                    transaction.DocumentNo === oClearingOP.Opbel &&
                    transaction.ItemNo === oClearingOP.Item &&
                    transaction.RepItem === oClearingOP.RepItem &&
                    transaction.SubItem === oClearingOP.SubItem :
                    transaction.ExtRef === oClearingOP.ExtRef &&
                    transaction.IntRef === oClearingOP.IntRef &&
                    transaction.TrType === oClearingOP.TrType &&
                    transaction.BitRef === oClearingOP.BitRef &&
                    transaction.EndorsementRef === oClearingOP.EndorsementRef &&
                    transaction.PremiumId === oClearingOP.PremiumId &&
                    transaction.Installment === oClearingOP.Installment &&
                    transaction.PolicyNo === oClearingOP.PolicyNum;
            });
            oClearingOP.ClearingStatus = relatedTransaction ? relatedTransaction.Status : constants.ClearingStatus.NotApplicable;
            return oClearingOP;
        });

        return results;
    }

    /**
     * @description - This function fetches and adds stamp and internal reference details to the premium receivables data.
     * It retrieves necessary details from the deal management and capacity management.
     * The function performs the following steps:
     * 1. Extracts internal references from the premium receivables data.
     * 2. Retrieves detailed attributes for these internal references.
     * 3. Fetches additional details for these internal references from the capacity management system.
     * 4. Updates the premium receivables data with the fetched details.
     * @param {Array} aClearingOP - The premium receivables data
     */
    getPremiumGenericDetailsForOP = async (aClearingOP) => {
        let aInternalReferences = [...new Set(aClearingOP
            .map((x) => x.IntRef)
            .filter((line) => line !== ""))];

        // Get Necessary Details from Deal
        const aInternalReferencesWithDetails =
            await this.dealMgmt.getInteRefAttributes(aInternalReferences);

        // Get Necessary Details from Capacity
        const aIntRefWithStampDetails = aInternalReferencesWithDetails.map(
            (x) => {
                return {
                    INTERNAL_REFERENCE_NO: x.INTERNAL_REFERENCE_NO,
                    INTRISK_ID: x.INTRISK_ID,
                    STAMP_ID: x.STAMP_ID,
                };
            }
        );

        let aStampsToFetch = [...new Set(aIntRefWithStampDetails.map((x) => x.STAMP_ID))];

        const aStampsWithDetails = await this.capacityMgmt.getStampWithAdditionalDetails(aStampsToFetch);

        // Create a map for quick lookup
        const intRefDetailsMap = new Map(aInternalReferencesWithDetails.map(detail => [detail.INTERNAL_REFERENCE_NO, detail]));
        const stampDetailsMap = new Map(aStampsWithDetails.map(stamp => [stamp.ID, stamp]));

        // Update fetched data to ClearingOP
        aClearingOP.forEach((oClearingOP) => {
            const oIntRefDetail = intRefDetailsMap.get(oClearingOP.IntRef);
            if (oIntRefDetail) {
                oClearingOP.Umr = oIntRefDetail.UMR_NO ? oIntRefDetail.UMR_NO : "";
                oClearingOP.InsuredName = oIntRefDetail.INSURED_FULL_NAME ? oIntRefDetail.INSURED_FULL_NAME : "";

                const oStampDetails = stampDetailsMap.get(oIntRefDetail.STAMP_ID);
                if (oStampDetails) {
                    oClearingOP.Uway = oStampDetails.POOLUWY_NAME ? oStampDetails.POOLUWY_NAME : "";
                    oClearingOP.InceptionDate = oStampDetails.INCEPTION;
                    oClearingOP.ExpiryDate = oStampDetails.EXPIRYDATE;
                }
            }
        });

        return aClearingOP;
    }

    /**
     * @description - This function clears the premium receivables data.
     * Gets Stamp Details, Generates Payload, Adds Tenant and User Info, Logs the Data, Invokes Lambda, Updates the Log.
     * @param {Object} req - The request object
     * @returns {Boolean} - The clearing status
     */
    clearPremiumReceivables = async (req) => {
        let aClearingData = req.data.clearingdata,
            sUniqueClearingIdentifier = uuid();

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
            // get Stamp Details
            let aIntRefWithStamp = await this.getPROtherDetailsForPayload(
                aClearingDataWithoutPaymentTransactions
            );

            let oPayload = this.Util.generatePremiumReceivablesPayload(
                aClearingData,
                aIntRefWithStamp
            );

            // add tenant info
            const { tenant } = cds.context;
            oPayload.TENANT_ID = tenant;
            if(process.env.NODE_ENV === 'local'){
                oPayload.TENANT_ID = "5c60ae9d-8d13-4a0b-8ee3-c9da4c8e2129"; // Todo: Remove this line after testing
            }
            oPayload.USER_ID = req.user.id;
            oPayload.UNIQUE_CLEARING_IDENTIFIER = sUniqueClearingIdentifier;
            if(!process.env.LANDSCAPE){
                req.reject(500, "LANDSCAPE Environment variable is not set");
            }
            oPayload.LANDSCAPE = process.env.LANDSCAPE;

            let aUniqueExtRefs = [...new Set(aClearingDataWithoutPaymentTransactions.map(item => item.EXTERNAL_REFERENCE_NO))];
            let aLogEntries = aUniqueExtRefs.map(extRef => ({
                ExtRef: extRef,
                ClaimRef: null,
                ClearingType: "PremiumReceivables",
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                Payload: JSON.stringify(oPayload),
                Status: constants.ClearingStatus.InProcess,
                StatusInfo: "Before Lambda Invoke"
            }));

            let oLoggerResponse = await this.Util.executeTransaction(
                'INSERT',
                "clearingapplicationService.InterfaceLog",
                aLogEntries
            );
            const aLogEntriesUpdated = await SELECT`UniqueClearingIdentifier`.from("clearingapplicationService.InterfaceLog").where({
                UniqueClearingIdentifier: sUniqueClearingIdentifier
            });
            const aLogEntryIDs = aLogEntriesUpdated.map(logEntry => logEntry.UniqueClearingIdentifier);
            var aClearingDataInPayloadForCSTableUpdate = oPayload.IT_CLEARING_DATA.filter(line => !constants.TransactionsNotIncludedInClearingStatusTableUpdate.includes(line.TRANSACTION_TYPE));

            logger.info(oLoggerResponse);

            try {
                const lambdaResponse = await this.Util.invokeLambdaFunction(
                    oPayload,
                    process.env.AWS_LAMBDA_ENDPOINT_POLICY
                );
                if (lambdaResponse.status == 200) {

                    // Remove previous transactions in error
                    await this.Util.RemovePreviousTransactionsInError(constants.ClearingTypes.PremiumReceivables, 
                        aClearingDataWithoutPaymentTransactions);
                    if(aClearingData.filter(x => x.TRANSACTION_TYPE === "Unallocated Insurance Monies").length > 0) {
                        await this.Util.RemovePreviousTransactionsInError("Unallocated Insurance Monies", 
                            aClearingData.filter(x => x.TRANSACTION_TYPE === "Unallocated Insurance Monies"));
                    }

                    // Map data for Premium Receivables Pending Transactions
                    let aPendingTransactions = aClearingDataWithoutPaymentTransactions.map(line => ({
                        ExtRef: line.EXTERNAL_REFERENCE_NO,
                        IntRef: line.INTERNAL_REFERENCE_NO,
                        TrType: line.TRANSACTION_TYPE,
                        BitRef: line.BIT_REFERENCE,
                        EndorsementRef: line.ENDORSEMENT_REF,
                        PolicyNo: line.POLICY_NUMBER,
                        PremiumId: line.PREMIUM_ID,
                        Installment: line.INSTALLMENT,
                        Status: constants.ClearingStatus.InProcess // In Process
                    }));

                    // Map data for UIM Pending Transactions
                    let aPendingUIMTransactions = aClearingData.filter(x => x.TRANSACTION_TYPE === "Unallocated Insurance Monies").map(line => ({
                        DocumentNo: line.DOCUMENT_NUMBER,
                        ItemNo: line.ITEM_NUMBER,
                        RepItem: line.REP_ITEM,
                        SubItem: line.SUB_ITEM,
                        Status: constants.ClearingStatus.InProcess // In Process
                    }));

                    // Prepare all database operations
                    await this.Util.executeTransaction(
                        'INSERT',
                        "clearingapplicationService.PremiumReceivablesPendingTransactions",
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

                    await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.InProcess);

                    await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.InProcess, sUniqueClearingIdentifier);
                    await this.Util.executeTransaction(
                        'UPDATE',
                        "clearingapplicationService.InterfaceLog",
                        { Status: constants.ClearingStatus.Success, StatusInfo: "Received Response From Lambda" },
                        { ID: { in: aLogEntryIDs } }
                    );

                    // Execute all operations in parallel
                    // await Promise.all([insertPendingTransactions, insertUIMTransactions, insertClearingStatusLog, updateInterfaceLog]);
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
                    await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.Failed);
                    await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.Failed, sUniqueClearingIdentifier);
                    req.reject(500, sStatus);
                }
            } catch (error) {
                let sStatus =
                    "Issue Occurred While Clearing - lambda function invoke issue";
                await this.Util.executeTransaction(
                    'UPDATE',
                    "clearingapplicationService.InterfaceLog",
                    { Status: constants.ClearingStatus.Failed, StatusInfo: sStatus, Response: JSON.stringify(error) },
                    { ID: { in: aLogEntryIDs } }
                );
                await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.Failed);
                await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.Failed, sUniqueClearingIdentifier, [], sStatus);
                req.reject(500, sStatus);
            }
            return true; // Todo revert it.
        } catch (error) {
            if (aClearingDataInPayloadForCSTableUpdate?.length > 0) {
                await this.Util.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.Failed, sUniqueClearingIdentifier, [], error.message);
                await this.Util.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], constants.ClearingTypes.PremiumReceivables, constants.ClearingStatus.Failed);
            }
            req.reject(500, error);
        }
    }

    /**
     * @description - This function fetches and adds generic details to the premium receivables data.
     * It retrieves necessary details from the deal management and capacity management.
     * The function performs the following steps:
     * 1. Extracts internal references from the premium receivables data.
     * 2. Retrieves detailed attributes for these internal references.
     * 3. Fetches additional details for these internal references from the capacity management.
     * @param {Array} aClearingData - The premium receivables data
     * @returns {Array} - The premium receivables data with other details
     */
    getPROtherDetailsForPayload = async (aClearingData) => {
        let aInternalReferences = aClearingData.map(
            (x) => x.INTERNAL_REFERENCE_NO
        );
        const aInternalReferencesWithDetails =
            await this.dealMgmt.getInteRefAttributes(aInternalReferences);
        const aIntRefWithStampDetails = aInternalReferencesWithDetails.map(
            (x) => {
                return {
                    INTERNAL_REFERENCE_NO: x.INTERNAL_REFERENCE_NO,
                    INTRISK_ID: x.INTRISK_ID,
                    STAMP_ID: x.STAMP_ID,
                };
            }
        );

        let oStampsToFetch = {
            stampId: [...new Set(aIntRefWithStampDetails.map((x) => x.STAMP_ID))],
        };

        const aStampDetailsRaw = await this.capacityMgmt.getManyStampDetails(
            oStampsToFetch
        );

        if (aStampDetailsRaw.length === 0) {
            throw new Error("Stamp Details Not found");
        }

        aIntRefWithStampDetails.forEach((line) => {
            let oStampDetail = aStampDetailsRaw.find(
                (stamp) => stamp.id === line.STAMP_ID
            );
            if (!oStampDetail) {
                throw new Error("Stamp Details Not found");
            }

            line.STAMP_DETAILS = {
                STAMP_ID: line.STAMP_ID,
                memberSplit: oStampDetail.memberSplit.filter(
                    (member) => member.INTRISKCODE_ID === line.INTRISK_ID
                ),
                agreementAllocation: oStampDetail.agreementAllocation.filter(
                    (allocation) => allocation.INTRISKCODE_ID === line.INTRISK_ID
                ),
                stamp: oStampDetail.stamp,
            };
        });

        return this.Util.generateStampPayloadStructure(aIntRefWithStampDetails);
    }

    /**
     * @description - This function retrieves premium payables data from an S4 system.
     * It performs the following steps:
     * 1. Encodes the selection filters from the request.
     * 2. Configures and sends a GET request to the S4 system's OData service.
     * 3. Processes the response data, adding additional details if results are returned.
     * 4. Applies selection filters to the processed data.
     * @param {Object} req - The request object containing selection filters
     * @returns {Array} - The processed and filtered premium payables data
     * @throws {Error} - Throws an error if the S4 system request fails or data processing encounters issues
     */
    getPremiumPayables = async (req) => {
        try {
            let sSelectionFiltersEncoded = encodeURIComponent(
              req.data.SelectionFilters
            );

            const oResponse = await this.service.s4Connection.send({
                method: "GET",
                path: `/getPremiumPayables?SelectionFilters='${sSelectionFiltersEncoded}'`,
            });

            const aClearingOP = oResponse;
            let oClearingOPWithDetails = aClearingOP.length > 0 ? await this.getPPOtherDetails(aClearingOP) : [];
            oClearingOPWithDetails = this.applySelectionFiltersForPremiumPayables(req, oClearingOPWithDetails);
            return oClearingOPWithDetails;
          } catch (error) {
            logger.error(error);
            error.message && req.reject(500, error.message);
            req.reject(500, "Error Occurred");
          }

    }

    /**
     * @description - This function fetches and adds generic details to the premium payables data.
     * It retrieves necessary details from the deal management and capacity management.
     * The function performs the following steps:
     * 1. Extracts internal references from the premium payables data.
     * 2. Retrieves detailed attributes for these internal references.
     * 3. Fetches additional details for these internal references from the capacity management.
     * @param {Array} aClearingOP - The premium payables data
     * @returns {Array} - The premium payables data with other details
     */
    getPPOtherDetails = async (aClearingOP) => {
      aClearingOP = await this.getPremiumGenericDetailsForOP(aClearingOP);

      // Fetch all entries for the given ExtRef from the database in one go
      const extRefs = aClearingOP.map(o => o.ExtRef).filter(line => line !== "");
      const uniqueExtRefs = [...new Set(extRefs)]; // Ensure unique ExtRefs if needed

      const documentNosForUIM = aClearingOP.filter(line => line.TrType === "Unallocated Insurance Monies").map(line => line.Opbel);

      const allPendingCRTransactions = uniqueExtRefs.length > 0 ? await SELECT.from(
        "clearingapplicationService.PremiumPayablesPendingTransactions"
      ).where({ ExtRef: { in: uniqueExtRefs } }) : [];

      const allPendingUIMTransactions = documentNosForUIM.length > 0 ? await SELECT.from(
        "clearingapplicationService.UIMPendingTransactions"
      ).where({ DocumentNo: { in: documentNosForUIM } }) : [];

      // Map over aClearingOP and assign ClearingStatus based on the fetched results
      const results = aClearingOP.map(oClearingOP => {
        const relatedTransaction = oClearingOP.TrType !== "Unallocated Insurance Monies" ? allPendingCRTransactions.find(transaction =>
          transaction.ExtRef === oClearingOP.ExtRef &&
          transaction.IntRef === oClearingOP.IntRef &&
          transaction.TrType === oClearingOP.TrType &&
          transaction.EndorsementRef === oClearingOP.EndorsementRef &&
          transaction.PremiumId === oClearingOP.PremiumId &&
          transaction.PolicyNo === oClearingOP.PolicyNum && //REVIEW - PolicyNum or PolicyNo ?
          transaction.Installment === oClearingOP.Installment &&
          transaction.DocumentNo === oClearingOP.Opbel &&
          transaction.ItemNo === oClearingOP.Item &&
          transaction.RepItem === oClearingOP.RepItem &&
          transaction.SubItem === oClearingOP.SubItem
        ) : allPendingUIMTransactions.find(transaction =>
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
     * @description - This function applies selection filters to the premium payables data.
     * It parses the selection filters from the request, and then filters the data based on these filters.
     * The function performs the following steps:
     * 1. Parses the selection filters from the request.
     * 2. Filters the data based on the parsed filters from UI.
     * @param {Object} req - The request object containing selection filters
     * @param {Array} aClearingOP - The premium payables data
     * @returns {Array} - The filtered premium payables data
     */
    applySelectionFiltersForPremiumPayables = (req, aClearingOP) => {

        let oSelectionFilters;
        try {
          oSelectionFilters = JSON.parse(req.data.SelectionFilters);
        } catch (error) {
          console.error("Error parsing SelectionFilters:", error);
          return aClearingOP; // Return original array if parsing fails
        }
  
        const aUWayToBeIncluded = oSelectionFilters.UWYears;
  
        if (aUWayToBeIncluded && aUWayToBeIncluded.length > 0) {
          return aClearingOP.filter(
            line => aUWayToBeIncluded.includes(line.Uway) || line.TrType === "Unallocated Insurance Monies"
          );
        }
  
        return aClearingOP;
    }

    /**
     * @description - This function clears the premium payables.
     * It performs the following steps:
     * 1. Checks if there are any valid transactions to clear.
     * 2. Invokes the clearPayables method to process the clearing.
     * @param {Object} req - The request object containing clearing data
     * @returns {Promise} - A promise that resolves when the clearing is complete
     * @throws {Error} - Throws an error if no valid transactions are found or if clearing fails
     */
    clearPremiumPayables = async (req) => {

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
          return await this.Util.clearPayables(req, constants.ClearingTypes.PremiumPayables, aClearingData);
        } catch (error) {
          req.reject(500, error);
        }
    }

    /**
     * @description - This function performs a pre-check for SOA update by calling the SOAUpdateCheck method in the S4 system.
     * It formats the SOA update date, constructs a payload, and sends a request to the S4 system.
     * @param {Object} req - The request object containing SOA update data
     * @returns {Promise} - A promise that resolves with the SOA update check response
     * @throws {Error} - Throws an error if any issue occurs
     */
    soaUpdatePreCheck = async (req) => {
        try {
            const oConnection = this.service.s4Connection;
    
            let aSOAUpdate = this.Util.formatDateToSapFormat(req.data.SOAUpdate);
    
            let oPayload = {
              Action: "SOAUpdateCheck",
              UpdateSOATable: aSOAUpdate,
              SOAUpdateCheckResponse: {},
            };
    
            let oResult = await oConnection.send({
              method: "POST",
              path: `DeepOPSet`,
              data: oPayload,
              headers: { "Content-Type": "Application/json" },
            });
    
            return oResult.SOAUpdateCheckResponse;
          } catch (error) {
            logger.error(error);
            req.reject(500, "Error Occurred");
          }
    }

    /**
     * @description - This function performs an SOA update by calling the SOAUpdate method in the S4 system.
     * It formats the SOA update date, constructs a payload, and sends a request to the S4 system.
     * @param {Object} req - The request object containing SOA update data
     * @returns {Promise} - A promise that resolves with the SOA update response
     * @throws {Error} - Throws an error if any issue occurs
     */
    soaUpdate = async (req) => {
        try {
            const oConnection = this.service.s4Connection;
    
            let aSOAUpdate = this.Util.formatDateToSapFormat(req.data.SOAUpdate);
    
            let oPayload = {
              Action: "SOAUpdate",
              UpdateSOATable: aSOAUpdate,
              SOAUpdateCheckResponse: {},
              ClearingOP: [],
            };
    
            let oResult = await oConnection.send({
              method: "POST",
              path: `DeepOPSet`,
              data: oPayload,
              headers: { "Content-Type": "Application/json" },
            });
    
            let oData = this.Util.formatSAPDatetoISOFormat(oResult.UpdateSOATable);
    
            return oData;
          } catch (error) {
            logger.error(error);
            req.reject(500, "Error Occurred");
          }
    }

    /**
     * @description - This function clears the SOA reference by calling the ClearSOATable method in the S4 system.
     * It constructs a payload, and sends a request to the S4 system.
     * @param {Object} req - The request object containing SOA reference data which needs to be deleted from custom tables
     * @returns {Promise} - A promise that resolves when the SOA reference is cleared
     * @throws {Error} - Throws an error if any issue occurs
     */
    clearSOAReference = async (req) => {
        try {
            const oConnection = this.service.s4Connection;
    
            const oPayload = {
              Action: "ClearSOATable",
              ClearSOATable: req.data.ClearSOATable
            };
    
            await oConnection.send({
              method: "POST",
              path: `DeepOPSet`,
              data: oPayload,
              headers: { "Content-Type": "Application/json" },
            });
    
          } catch (error) {
            logger.error(error);
            req.reject(500, "Error Occurred");
          }
    }

}

module.exports = { PremiumsHandler };