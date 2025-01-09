const cds = require('@sap/cds');
const axios = require('axios');
const { uuid } = cds.utils;
const { ClearingStatus, TransactionsNotIncludedInClearingStatusTableUpdate } = require("../util/constants");
const xsenv = require('@sap/xsenv');
const logger = cds.log("clearingapplicationlogger");
const constants = require("./constants");

class util {

    /**
     * @description - This function executes a transaction based on the specified operation.
     * It performs an INSERT, UPDATE, or DELETE operation on the specified entity.
     * This commits the transactions within the function.
     * @param {string} operation - The type of operation to execute ('INSERT', 'UPDATE', or 'DELETE')
     * @param {string} entity - The name of the entity on which to perform the operation
     * @param {object} data - The data to be inserted, updated, or deleted
     * @param {object} condition - The condition to be used for the UPDATE or DELETE operation (optional)
     * @returns {Promise} - A promise that resolves when the transaction is complete
     */
    async executeTransaction(operation, entity, data, condition = null) {
        await cds.tx(async () => {
            if (operation === 'INSERT') {
                await INSERT.into(entity).entries(data);
            } else if (operation === 'UPDATE') {
                await UPDATE(entity).where(condition).set(data);
            } else if (operation === 'DELETE') {
                await DELETE.from(entity).where(condition);
            }
        });
        await cds.tx().commit();
    }

    /**
     * @description - This function generates a payload structure for stamp details fetched from the Capacity Management.
     * It iterates through the provided data, constructs the necessary payload,
     * and returns the structured data.
     * @param {Array} aIntRefWithStampDetails - The array containing stamp details
     * @returns {Array} - The structured payload
     */
    generateStampPayloadStructure(aIntRefWithStampDetails) {

        let aIntRefWithStamp = [];

        aIntRefWithStampDetails.forEach(line => {

            let IT_STAMP = [];

            line.STAMP_DETAILS.memberSplit.forEach(member => {

                let oMember = {

                    "ATYPE": member.AGREEMENTTYPE_KEY,
                    "MEMBER_IPT": "",//whats even this .
                    "CONTRACTUAL_AMT": member.CONTRACTUAL_AMT,
                    "ADMIN_PAYABLE": "",//whats even this 
                    "FRONTER": member.FRONTER_BPID,//map it
                    "STAMP_MEMBER_ID": member.ID,
                    "CLAIMCOLLECTEDFROM_BPID": member.CLAIMCOLLECTEDFROM_BPID || "",
                    "CONTRACTUAL_VL": member.CONTRACTUAL_VL,
                    "INT_REF": line.INTERNAL_REFERENCE_NO,
                    "MEMBER": member.MEMBER_BPID,
                    "CLAIMCOLLECTIONTYPE": member.CLAIMCOLLECTIONTYPE,
                    "OWN_VL": member.OWN_VL,
                    "AGREEMENT_ID": member.AGREEMENT_ID,
                    "PERC_UNDERWRITING": "100.0000",//take it from where ? i dont know looks like always 100 %
                    "FRONTING_AGREEMENT_ID": member.FRONTING_AGREEMENT_ID || "0",//map it 
                    "PREMIUMRECEIVER_BPID": member.PREMIUMRECIEVER_BPID || member.MEMBER_BPID || "",
                    "OWN_AMT": member.OWN_AMT,
                    "EXPOSED_AMT": member.EXPOSED_AMT,
                    "STAMP_COMMISION": member.ItsCommission.map((comm) => {
                        return {
                            "PAY_TO": comm.PAYTO_BPID,
                            "FEE": comm.COMMISSION_VALUE,
                            "ID": comm.COMMISSIONTYPE_KEY,
                            "BASIS": comm.COMMISSIONBASIS
                        };
                    }),
                    "UWAY": line.STAMP_DETAILS.stamp.POOLUWY_NAME,
                    "EXPOSED_VL": member.EXPOSED_VL,
                    "PERC_CLAIMS": "0.0000", //always 0 ? what to do with it anyway
                };
                IT_STAMP.push(oMember);
            });
            aIntRefWithStamp.push(
                {
                    INTERNAL_REFERENCE_NO: line.INTERNAL_REFERENCE_NO,
                    IT_STAMP: IT_STAMP,
                    POOL: line.STAMP_DETAILS.stamp.POOL_CD,
                    LOB_NAME: line.STAMP_DETAILS.stamp.LOB_NAME
                });

        });

        return aIntRefWithStamp;

    }

    /**
     * @description - This function generates a payload structure for premium receivables.
     * It fetches the header data from the clearing data and constructs the necessary payload.
     * @param {Array} aClearingData - The array containing clearing data
     * @param {Array} aIntRefWithStamp - The array containing stamp details
     * @returns {Object} - The structured payload
     */
    generatePremiumReceivablesPayload(aClearingData, aIntRefWithStamp) {
        // Destructure the first item for header data if the array is not empty
        const { HEADER_DATA: { POSTING_DATE, COMPANY_CODE, DIVISION, BANK_ACCOUNT_NUMBER, GL_ACCOUNT, GL_ACCOUNT_CHARGES } = {} } = aClearingData[0] || {};

        const oPayload = {
            "IM_ASYNC_MODE": "",
            "IM_HEADER_DATA": { POSTING_DATE, COMPANY_CODE, DIVISION, BANK_ACCOUNT_NUMBER, GL_ACCOUNT, GL_ACCOUNT_CHARGES },
            "IT_CLEARING_DATA": aClearingData.map(({ BUSINESS_PARTNER_NO, TRANSACTION_TYPE, BIT_REFERENCE, PREMIUM_ID, INTERNAL_REFERENCE_NO, EXTERNAL_REFERENCE_NO,
                ORIGINAL_CURRENCY, AMOUNT_CLEARED, EXPECTED_PAY_CURRENCY, ROE_REC_CURRENCY, INSTALLMENT, DUE_DATE, ENDORSEMENT_REF,
                UMR, TAX, TAX_CODE, TAX_JURISDICTION, TAX_BASE, TAX_RATE, DELTA_DUE_ROE, POLICY_NUMBER, DOCUMENT_NUMBER, ITEM_NUMBER,
                REP_ITEM, SUB_ITEM, FIXED_ROE, PAYMENT_REF, SOA_COUNT, ALLOCAMN, DOCUMENT_TYPE, HVORG, POSTING_TYPE, ORIGIN
                // PROCESS_ID
            }) => {
                const oDetails = aIntRefWithStamp.find(stamp => stamp.INTERNAL_REFERENCE_NO === INTERNAL_REFERENCE_NO) || {};
                return {
                    BUSINESS_PARTNER_NO,
                    TRANSACTION_TYPE,
                    BIT_REFERENCE,
                    PREMIUM_ID,
                    INTERNAL_REFERENCE_NO,
                    EXTERNAL_REFERENCE_NO,
                    ORIGINAL_CURRENCY,
                    AMOUNT_CLEARED,
                    EXPECTED_PAY_CURRENCY,
                    ROE_REC_CURRENCY,
                    INSTALLMENT,
                    DUE_DATE,
                    ENDORSEMENT_REF,
                    UMR,
                    TAX,
                    TAX_CODE,
                    TAX_JURISDICTION,
                    TAX_BASE,
                    TAX_RATE,
                    DELTA_DUE_ROE,
                    POLICY_NUMBER,
                    DOCUMENT_NUMBER,
                    ITEM_NUMBER,
                    REP_ITEM,
                    SUB_ITEM,
                    FIXED_ROE,
                    PAYMENT_REF,
                    SOA_COUNT,
                    ALLOCAMN,
                    DOCUMENT_TYPE,
                    HVORG,
                    POSTING_TYPE,
                    ORIGIN,
                    // PROCESS_ID, Not needed
                    "POOL": oDetails.POOL,
                    "LOB_NAME": oDetails.LOB_NAME,
                    "IT_STAMP": oDetails.IT_STAMP
                };
            })
        };

        return oPayload;
    }

    /**
     * @description - This function generates a payload structure for claim receivables.
     * It fetches the header data from the clearing data and constructs the necessary payload.
     * @param {Array} aClearingData - The array containing clearing data
     * @param {Array} aRequiredDetails - The array containing required details
     * @returns {Object} - The structured payload
     */
    generateClaimReceivablesPayload(aClearingData, aRequiredDetails) {

        // Destructure the first item for header data if the array is not empty
        const { HEADER_DATA: { POSTING_DATE, COMPANY_CODE, DIVISION, BANK_ACCOUNT_NUMBER, GL_ACCOUNT, GL_ACCOUNT_CHARGES } = {} } = aClearingData[0] || {};

        const oPayload = {
            "IM_ASYNC_MODE": "",
            "IM_HEADER_DATA": { POSTING_DATE, COMPANY_CODE, DIVISION, BANK_ACCOUNT_NUMBER, GL_ACCOUNT, GL_ACCOUNT_CHARGES },
            "IT_CLEARING_DATA": aClearingData.map(({ BUSINESS_PARTNER_NO,
                TRANSACTION_TYPE,
                BIT_REFERENCE,
                INTERNAL_REFERENCE_NO,
                EXTERNAL_REFERENCE_NO,
                ORIGINAL_CURRENCY,
                AMOUNT_CLEARED,
                EXPECTED_PAY_CURRENCY,
                ROE_REC_CURRENCY,
                DUE_DATE,
                UMR,
                UCR,
                CLAIM_REFERENCE,
                TRANSACTION_REFERENCE,
                UWAY,
                COLLECTION_TYPE,
                CONTRACT_ACCOUNT,
                MEMBERBPID,
                DOCUMENT_NUMBER,
                ITEM_NUMBER,
                REP_ITEM,
                SUB_ITEM,
                FIXED_ROE, PAYMENT_REF, ALLOCAMN, DOCUMENT_TYPE, HVORG, POSTING_TYPE, ORIGIN,
                AGREEMENT_ID, FRONTING_AGREEMENT_ID, STAMP_MEMBER_ID, AGREEMENT_TYPE
            }) => {
                let oDetails = {};
                if (DOCUMENT_TYPE === "SC" || DOCUMENT_TYPE === "RC") {
                    oDetails = aRequiredDetails.find(line => line.CLAIM_REFERENCE === CLAIM_REFERENCE
                        && line.TRANSACTION_REFERENCE === TRANSACTION_REFERENCE
                    ) || {};
                }
                else {
                    oDetails = aRequiredDetails.find(line => line.CLAIM_REFERENCE === CLAIM_REFERENCE
                        && line.TRANSACTION_REFERENCE === TRANSACTION_REFERENCE
                        && line.MEMBERBPID === MEMBERBPID) || {};
                }
                return {
                    BUSINESS_PARTNER_NO,
                    TRANSACTION_TYPE,
                    BIT_REFERENCE,
                    INTERNAL_REFERENCE_NO,
                    EXTERNAL_REFERENCE_NO,
                    ORIGINAL_CURRENCY,
                    AMOUNT_CLEARED,
                    EXPECTED_PAY_CURRENCY,
                    ROE_REC_CURRENCY,
                    DUE_DATE,
                    UMR,
                    UCR,
                    CLAIM_REFERENCE,
                    TRANSACTION_REFERENCE,
                    UWAY,
                    COLLECTION_TYPE,
                    CONTRACT_ACCOUNT,
                    MEMBERBPID,
                    DOCUMENT_NUMBER,
                    ITEM_NUMBER,
                    REP_ITEM,
                    SUB_ITEM,
                    FIXED_ROE, PAYMENT_REF, ALLOCAMN, DOCUMENT_TYPE, HVORG, POSTING_TYPE, ORIGIN,
                    AGREEMENT_ID, FRONTING_AGREEMENT_ID, STAMP_MEMBER_ID, AGREEMENT_TYPE,
                    "POOL": oDetails.POOL,
                    "LOB_NAME": oDetails.LOB_NAME,
                    "PAYEE_BP_ID": oDetails.PAYEE_BP_ID,
                    "OWN_VL": oDetails.OWN_VL,
                    "BROKER_ID": oDetails.BROKER_ID,
                    "MEMBERS": oDetails.MEMBERS
                };
            })
        };

        return oPayload; 

    }

    /**
     * @description - This function converts a date to SAP format.
     * It takes a date as input and returns a string in SAP format.
     * @param {string} date - The date to be converted
     * @returns {string} - The date in SAP format
     */
    convertDateToSAPFormat(date) {
        return `/Date(${new Date(date).getTime()})/`;

    }

    /**
     * @description - This function formats dates in an array to SAP format.
     * It iterates through the array, converts the specified date fields to SAP format,
     * and returns the formatted array.
     * @param {Array} array - The array containing the data with date fields
     * @returns {Array} - The array with formatted date fields
     */
/**
 * @description - This function formats dates in an array to SAP format.
 * It iterates through the array, converts the specified date fields to SAP format,
 * and returns the formatted array.
 * @param {Array} array - The array containing the data with date fields
 * @returns {Array} - The array with formatted date fields
 */
    formatDateToSapFormat(array) {
        return array.map(item => {
            const formattedItem = { ...item };

            // Handle each date field explicitly
            if (item.DueDate) formattedItem.DueDate = this.convertDateToSAPFormat(item.DueDate);
            if (item.Erdat) formattedItem.Erdat = this.convertDateToSAPFormat(item.Erdat);
            if (item.Aedat) formattedItem.Aedat = this.convertDateToSAPFormat(item.Aedat);
            if (item.InceptionDate) formattedItem.InceptionDate = this.convertDateToSAPFormat(item.InceptionDate);
            if (item.ExpiryDate) formattedItem.ExpiryDate = this.convertDateToSAPFormat(item.ExpiryDate);

            return formattedItem;
        });
    }

    /**
     * @description - This function converts a SAP date to an ISO string.
     * It extracts the numeric part from the SAP OData date format,
     * creates a new Date object using the extracted timestamp,
     * and returns the ISO string.
     * @param {string} sapDate - The SAP date to be converted
     * @returns {string} - The date in ISO format
     */
    convertSAPDateToISOString(sapDate) {
        // Extract the numeric part from the SAP OData date format
        const timestamp = parseInt(sapDate.match(/\/Date\((\d+)\)\//)[1], 10);

        // Create a new Date object using the extracted timestamp
        const jsDate = new Date(timestamp);

        // Convert the Date object to an ISO string
        return jsDate.toISOString();
    }

    /**
     * @description - This function formats SAP dates in an array to ISO format.
     * It iterates through the array, converts the specified SAP date fields to ISO format,
     * and returns the formatted array.
     * @param {Array} array - The array containing the data with SAP date fields
     * @returns {Array} - The array with formatted SAP date fields
     */
    formatSAPDatetoISOFormat(array) {
        return array.map(item => {
            const formattedItem = { ...item };

            if (item.DueDate) formattedItem.DueDate = this.convertSAPDateToISOString(item.DueDate);
            if (item.Erdat) formattedItem.Erdat = this.convertSAPDateToISOString(item.Erdat);
            if (item.Aedat) formattedItem.Aedat = this.convertSAPDateToISOString(item.Aedat);
            if (item.InceptionDate) formattedItem.InceptionDate = this.convertSAPDateToISOString(item.InceptionDate);
            if (item.ExpiryDate) formattedItem.ExpiryDate = this.convertSAPDateToISOString(item.ExpiryDate);

            return formattedItem;
        });
    }

    /**
     * @description - This function invokes a Lambda function with the provided payload and endpoint.
     * It sets up the API key and makes an HTTP PUT request to the specified endpoint with the payload.
     * @param {Object} payload - The payload to be sent to the Lambda function
     * @param {string} endpoint - The endpoint URL to invoke the Lambda function
     * @returns {Promise} - A promise that resolves with the Lambda function response
     * @throws {Error} - Throws an error if any issue occurs during the Lambda function invocation
     */
    async invokeLambdaFunction(payload, endpoint) {
        const apiKey = process.env.AWS_LAMBDA_API_KEY;

        try {
            const response = await axios.put(endpoint, payload, {
                headers: {
                    'x-api-key': apiKey,
                    'landscape': process.env.LANDSCAPE,
                    'Content-Type': 'application/json'
                }
            });
            return response;
        } catch (error) {
            logger.error('Error invoking Lambda function:', error.response ? error.response.data : error.message);
            throw new Error("Error invoking Lambda function");
        }
    }

    /**
     * @description - This function inserts a clearing status log which initiates the hana trigger to log the same in the ActionLogger table.
     * It iterates through the transactions, constructs the payload, and executes the transaction.
     * @param {Array} aTransactions - The array containing the transactions
     * @param {string} sClearingType - The type of clearing
     * @param {string} sStatus - The status of the clearing
     * @param {string} sUniqueClearingIdentifier - The unique identifier for the clearing
     * @param {Array} aCreatedDocuments - The array containing created documents (default: [])
     * @param {string} sAdditionalInfo - Additional information if any error occurs (default: "")
     * @returns {Promise} - A promise that resolves with the database operation result
     * @throws {Error} - Throws an error if any issue occurs during the database operation
     */
    async insertClearingStatusLog(aTransactions, sClearingType, sStatus, sUniqueClearingIdentifier, aCreatedDocuments = [], sAdditionalInfo = "") {

        let aPayload = [];
        for (const oTransaction of aTransactions) {

            const oPayload = {
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                ClearingType: sClearingType,
                ExtRef: oTransaction.EXTERNAL_REFERENCE_NO,
                IntRef: oTransaction.INTERNAL_REFERENCE_NO,
                TrType: oTransaction.TRANSACTION_TYPE,
                BitRef: oTransaction.BIT_REFERENCE,
                EndorsementRef: oTransaction.ENDORSEMENT_REF,
                PremiumId: oTransaction.PREMIUM_ID,
                PolicyNo: oTransaction.POLICY_NUMBER,
                Installment: oTransaction.INSTALLMENT,
                UCR: oTransaction.UCR,
                ClaimRef: oTransaction.CLAIM_REFERENCE,
                TrRef: oTransaction.TRANSACTION_REFERENCE,
                MemberBPID: oTransaction.MEMBERBPID,
                DocumentNo: oTransaction.DOCUMENT_NUMBER,
                ItemNo: oTransaction.ITEM_NUMBER,
                RepItem: oTransaction.REP_ITEM,
                SubItem: oTransaction.SUB_ITEM,
                AmountCleared: oTransaction.AMOUNT_CLEARED,
                RoeRecCurr: oTransaction.ROE_REC_CURRENCY,
                DeltaDueRoe: oTransaction.DELTA_DUE_ROE,
                OriginalCurrency: oTransaction.ORIGINAL_CURRENCY,
                ExpectedPayCurrency: oTransaction.EXPECTED_PAY_CURRENCY,
                Status: sStatus,
                CreatedDocuments: aCreatedDocuments,
                AdditionalInfo: sAdditionalInfo
            }

            aPayload.push(oPayload);

        }
        await this.executeTransaction('INSERT', "clearingapplicationService.ClearingStatusLog", aPayload);

    }

    /**
     * @description - This function generates the payload for the payables clearing process.
     * It validates the transactions, constructs the necessary payload, and returns the payload.
     * @param {Object} req - The request object
     * @param {Array} aTransactions - The array containing the transactions
     * @param {string} TransactionType - The type of transaction
     * @returns {Object} - The structured payload
     */
    generateRFCPayloadForPayablesClearing(req, aTransactions, TransactionType) {

        // Validate the transactions
        this.validateTransactions(req, aTransactions);

        let itemCounter = 1;
        let itemCounterCDC = 501;

        const IT_CDC = [
            {
                "item": (parseInt(itemCounterCDC)).toString().padStart(3, '0'),
                "fikey_prefix": "CG",
                "is_fkkko": {
                    "fikey": "",
                    "applk": "S",
                    "blart": "YY", // Example value
                    "herkf": "01", // Example value
                    "ernam": req.user.id, // Example value
                    "cpudt": new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
                    "cputm": new Date().toISOString().split('T')[1].split('.')[0], // Current time in HH:MM:SS format
                    "waers": aTransactions[0].EXPECTED_PAY_CURRENCY,
                    "bldat": aTransactions[0].HEADER_DATA.POSTING_DATE,
                    "budat": aTransactions[0].HEADER_DATA.POSTING_DATE,
                    "YYEXTREF": "",//transaction.EXTERNAL_REFERENCE_NO,
                    "YYUWAY": "", // Example value
                    "YYENDORSEMENTREF": "",
                    "YYINSTALLMENT": "",
                    "YYPREMIUM_ID": "",
                    "YYELSECLAIMNUM": "",
                    "YYUCR": "", // Example value
                    "YYTR_ID": "", // Example value
                    "YYINSTALLMENT_NUM": "", // Example value
                    "YYPREMIUM_TYPE": "", // Example value
                    "YYPOLICY_NUM": "",
                    "YYBANK_REF": "" // Example value
                },
                "add_info": aTransactions.map(transaction => ({
                    "opbel": transaction.DOCUMENT_NUMBER, // Example value
                    "opupw": transaction.REP_ITEM, // Example value
                    "opupk": transaction.ITEM_NUMBER,
                    "opupz": transaction.SUB_ITEM,
                    "clearing_amount": transaction.AMOUNT_CLEARED,
                    "exp_pay_currency": transaction.EXPECTED_PAY_CURRENCY,
                    "delta_due_roe": transaction.DELTA_DUE_ROE,
                    "gl_account": transaction.HEADER_DATA.GL_ACCOUNT ? transaction.HEADER_DATA.GL_ACCOUNT.toString().padStart(10, '0') : transaction.HEADER_DATA.GL_ACCOUNT,
                    "YYINTREF": transaction.INTERNAL_REFERENCE_NO,
                    "trtype": transaction.TRANSACTION_TYPE,
                    "YYENDORSEMENTREF": transaction.ENDORSEMENT_REF,
                    "paymemtref": transaction.PAYMENT_REF,
                    "ernam": req.user.id, // Example value
                    "erdate": new Date().toISOString().split('T')[0],
                    "erzet": new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, ''), // Current time in HHMMSS format
                    "businesspartnerno": transaction.BUSINESS_PARTNER_NO,
                    "soa_count": transaction.SOA_COUNT,
                    "allocamn": transaction.ALLOCAMN,
                    "original_currency": transaction.ORIGINAL_CURRENCY,
                    "YYEXTREF": transaction.EXTERNAL_REFERENCE_NO,
                    "blart": transaction.DOCUMENT_TYPE, // Example value
                    "bukrs": transaction.HEADER_DATA.COMPANY_CODE,
                    "postingtype": transaction.POSTING_TYPE,
                    "hvorg": transaction.HVORG
                }))
            }

        ];

        const IT_FICA_CREATE = aTransactions.filter(transaction => transaction.TRANSACTION_TYPE === "Bank Charge"
            || transaction.TRANSACTION_TYPE === "OVER PAYMENT").map(transaction => ({
                "item": (itemCounter++).toString().padStart(3, '0'),
                "fikey_prefix": transaction.TRANSACTION_TYPE === "Bank Charge" ? "BC" : "OP",
                "header": {
                    "fikey": "",
                    "appl_area": "S",
                    "doc_type": "YM",
                    "doc_source_key": "01",
                    "created_by": req.user.id,
                    "entry_date": "",
                    "entry_time": "",
                    "currency": transaction.TRANSACTION_TYPE === "Bank Charge" ? transaction.EXPECTED_PAY_CURRENCY : transaction.ORIGINAL_CURRENCY,
                    "doc_date": new Date().toISOString().split('T')[0],
                    "post_date": transaction.HEADER_DATA.POSTING_DATE
                },
                "bp_items": transaction.TRANSACTION_TYPE === "Bank Charge" ? [
                ] : [
                    {
                        "item": "0001",
                        "comp_code": transaction.HEADER_DATA.COMPANY_CODE,
                        "buspartner": transaction.BUSINESS_PARTNER_NO,
                        "cont_acct": transaction.CONTRACT_ACCOUNT,
                        "main_trans": "P210",
                        "sub_trans": transaction.HEADER_DATA.SUB_TRANSACTION,
                        "division": transaction.HEADER_DATA.DIVISION,
                        "g_l_acct": transaction.HEADER_DATA.GL_ACCOUNT_FOR_OP ? transaction.HEADER_DATA.GL_ACCOUNT_FOR_OP.toString().padStart(10, '0') : transaction.HEADER_DATA.GL_ACCOUNT_FOR_OP,
                        "doc_date": new Date().toISOString().split('T')[0],
                        "post_date": new Date().toISOString().split('T')[0],
                        "net_date": new Date().toISOString().split('T')[0],
                        "tran_rate": transaction.ORIGINAL_CURRENCY === transaction.EXPECTED_PAY_CURRENCY ? "0" : transaction.ROE_REC_CURRENCY,
                        "amount": -Math.abs(transaction.AMOUNT_CLEARED),
                        "pmnt_meth": "T"
                    }
                ],
                "gl_items": transaction.TRANSACTION_TYPE === "Bank Charge" ? [
                    {
                        "item": "0001",
                        "comp_code": transaction.HEADER_DATA.COMPANY_CODE,
                        "g_l_acct": transaction.HEADER_DATA.GL_ACCOUNT ? transaction.HEADER_DATA.GL_ACCOUNT.toString().padStart(10, '0') : transaction.HEADER_DATA.GL_ACCOUNT,
                        "profit_ctr": null, // Example value
                        "cost_ctr": null,
                        "amount": transaction.AMOUNT_CLEARED
                    },
                    {
                        "item": "0002",
                        "comp_code": transaction.HEADER_DATA.COMPANY_CODE,
                        "g_l_acct": transaction.HEADER_DATA.GL_ACCOUNT_CHARGES ? transaction.HEADER_DATA.GL_ACCOUNT_CHARGES.toString().padStart(10, '0') : transaction.HEADER_DATA.GL_ACCOUNT_CHARGES,
                        "profit_ctr": null, // Example value
                        "cost_ctr": null,
                        "amount": (parseFloat(transaction.AMOUNT_CLEARED) * -1).toString()
                    }
                ] : [
                    {
                        "rep_item": "000",
                        "item": "0001",
                        "sub_item": "000",
                        "comp_code": transaction.HEADER_DATA.COMPANY_CODE,
                        // "bus_partner": transaction.BUSINESS_PARTNER_NO,
                        // "division": transaction.HEADER_DATA.DIVISION,
                        // "cont_acct": transaction.CONT_ACCOUNT,
                        // "main_trans": "P210",
                        // "sub_trans": "2000",
                        "g_l_acct": transaction.HEADER_DATA.GL_ACCOUNT ? transaction.HEADER_DATA.GL_ACCOUNT.toString().padStart(10, '0') : transaction.HEADER_DATA.GL_ACCOUNT,
                        "tran_rate": transaction.ORIGINAL_CURRENCY === transaction.EXPECTED_PAY_CURRENCY ? "0" : transaction.ROE_REC_CURRENCY,
                        // "doc_date": "2024-07-02",
                        // "post_date": "2024-07-02",
                        // "net_date": "2024-07-02",
                        "amount": Math.abs(transaction.AMOUNT_CLEARED),
                        // "profit_ctr": "AV-A"
                    }
                ],
                "extension_header": transaction.TRANSACTION_TYPE === "OVER PAYMENT" ? {
                    // "doc_no": "",
                    "YYEXTREF": transaction.EXTERNAL_REFERENCE_NO,
                    // "YYUAY": "2023", // Example value
                    // "YYENDORSEMENTREF": transaction.ENDORSEMENT_REF,
                    // "YYINSTALLMENT": transaction.INSTALLMENT,
                    // "YYPREMIUM_ID": transaction.PREMIUM_ID,
                    // "YYELSCLAIMNUM": transaction.UMR,
                    // "YYUCR": "TEST UCR", // Example value
                    // "YYTR_ID": "TR-01", // Example value
                    // "YYINSTALLMENT_NUM": "01", // Example value
                    // "YYPREMIUM_TYPE": "AP", // Example value
                    // "YYPOLICY_NUM": transaction.POLICY_NUMBER,
                    // "YYBANK_REF": "TEST BANkREF" // Example value
                } : {},
                "extension_items": transaction.TRANSACTION_TYPE === "Bank Charge" ? [
                ] : [
                    {
                        //     "doc_no": "",
                        //     "rep_item": transaction.REP_ITEM,
                        "item": "0001",
                        //     "sub_item": transaction.SUB_ITEM,
                        "YYEXTREF": transaction.EXTERNAL_REFERENCE_NO,
                        "YYEXT_CURRENCY": transaction.EXPECTED_PAY_CURRENCY,
                        "YYEXT_ROE": transaction.ROE_REC_CURRENCY,
                        //     "YYMEMBER": "1100013853", // Example value
                        //     "YYFRONTER": "1100000081", // Example value
                        //     "YYCONTRACT": transaction.HEADER_DATA.GL_ACCOUNT,
                        //     "YYINTREF": transaction.INTERNAL_REFERENCE_NO,
                        //     "YYBITREF": transaction.BIT_REFERENCE,
                        //     "YYSTAMP_MEMBER_ID": "10001211", // Example value
                        //     "YYELSCLAIMNUM": transaction.UMR,
                        //     "YYINSTALLMENT_NUM": "01", // Example value
                        //     "YYAPPTAXCD": transaction.TAX_CODE,
                        //     "YYFIXED_ER": transaction.FIXED_ROE
                    }
                ]
            }));

        const oPayload = {
            "IT_CDC": IT_CDC,
            "IT_FICA_CREATE": IT_FICA_CREATE,
            "PURPOSE": TransactionType === "ClaimPayables" ? "CP" : "PP"
        }
        return oPayload;
    }

    /**
     * @description - This function validates the transactions.
     * It checks if the transactions have a valid contract account for the OVER PAYMENT type.
     * @param {Object} req - The request object
     * @param {Array} aTransactions - The array containing the transactions
     * @returns {void}
     * @throws {Error} - Throws an error if any issue occurs during the validation
     */
    validateTransactions(req, aTransactions) {
        // Validate the transactions
        const oTransaction = aTransactions.filter(transaction => transaction.TRANSACTION_TYPE === "OVER PAYMENT").find(transaction => transaction.CONTRACT_ACCOUNT && transaction.CONTRACT_ACCOUNT === "");
        if (oTransaction) {
            req.reject("Please create contract account (ROLE business producer) for BP " + oTransaction.BUSINESS_PARTNER_NO)
        }
    }

    /**
     * @description - This function clears the payables.
     * It generates the payload, logs the payload, and makes a CPI call to clear the payables.
     * @param {Object} req - The request object
     * @param {string} TransactionType - The type of transaction
     * @param {Array} aTransactions - The array containing the transactions
     * @returns {Promise} - A promise that resolves with the created documents
     * @throws {Error} - Throws an error if any issue occurs during the clearing process
     */
    async clearPayables(req, ClearingType, aTransactions) {

        const sUniqueClearingIdentifier = uuid();

        let aClearingDataInPayloadForCSTableUpdate = aTransactions.filter(line => !TransactionsNotIncludedInClearingStatusTableUpdate.includes(line.TRANSACTION_TYPE));


        // Generate Payload
        const oPayload = await this.generateRFCPayloadForPayablesClearing(req, aTransactions, ClearingType);
        if (ClearingType === "ClaimPayables") {
            const aUniqueExtAndClaimRefs = [...new Set(aClearingDataInPayloadForCSTableUpdate.map(item => item.EXTERNAL_REFERENCE_NO + '|' + item.CLAIM_REFERENCE))];
            var aLogEntries = aUniqueExtAndClaimRefs.map(extRef => ({
                ExtRef: extRef.split('|')[0],
                ClaimRef: extRef.split('|')[1],
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                ClearingType: ClearingType,
                Payload: JSON.stringify(oPayload),
                Status: constants.ClearingStatus.InProcess,
                StatusInfo: "Before CPI Call"
            }));
        }else{
            let aUniqueExtRefs = [...new Set(aClearingDataInPayloadForCSTableUpdate.map(item => item.EXTERNAL_REFERENCE_NO))];
             aLogEntries = aUniqueExtRefs.map(extRef => ({
                ExtRef: extRef,
                ClaimRef: null,
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                ClearingType: ClearingType,
                Payload: JSON.stringify(oPayload),
                Status: constants.ClearingStatus.InProcess,
                StatusInfo: "Before CPI Call"
            }));
        }

        await this.executeTransaction('INSERT', "clearingapplicationService.InterfaceLog", aLogEntries);
        const aLogEntriesUpdated = await SELECT`ID`.from("clearingapplicationService.InterfaceLog").where({
            UniqueClearingIdentifier: sUniqueClearingIdentifier
        });
        const aLogEntryIDs = aLogEntriesUpdated.map(logEntry => logEntry.ID);

        // get Connection
        try {
            let oConnection = await cds.connect.to("cpi-api");

            const oResponse = await oConnection.post("/multiple_fica_doc_create", oPayload);
            if (oResponse?.Status === "Success") {
                var aCreatedDocuments = [];
                const responseArray = Array.isArray(oResponse.Response) ? oResponse.Response : [oResponse.Response];
                responseArray.forEach(element => {  
                    aCreatedDocuments.push(Number(element.DocumentNumber));
                });
                await this.executeTransaction('UPDATE', "clearingapplicationService.InterfaceLog", { Status: constants.ClearingStatus.Success, StatusInfo: "Received Response From Lambda", Response: JSON.stringify(oResponse) }, { ID: { in: aLogEntryIDs } });
            } else {
                await this.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, ClearingType, constants.ClearingStatus.Failed, sUniqueClearingIdentifier, [], "Error Occurred In CPI");
                await this.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], ClearingType, constants.ClearingStatus.Failed);
                throw new Error("Error Occurred In CPI");
            }

            await this.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, ClearingType, constants.ClearingStatus.Success, sUniqueClearingIdentifier, aCreatedDocuments);
            await this.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], ClearingType, constants.ClearingStatus.Success);
            logger.info(oResponse);
        } catch (error) {
            await this.executeTransaction('UPDATE', "clearingapplicationService.InterfaceLog", { Status: constants.ClearingStatus.Failed, StatusInfo: "Error Occurred In CPI", Response: JSON.stringify(error) }, { ID: { in: aLogEntryIDs } });
            await this.insertClearingStatusLog(aClearingDataInPayloadForCSTableUpdate, ClearingType, constants.ClearingStatus.Failed, sUniqueClearingIdentifier, [], "Error Occurred In CPI");
            await this.createClearingLogEntries(aClearingDataInPayloadForCSTableUpdate, sUniqueClearingIdentifier, [], ClearingType, constants.ClearingStatus.Failed);
            logger.error(error);
            throw new Error("Error Occurred In CPI");
        }
        return aCreatedDocuments; 
    }

    /**
     * @description - This function fetches the destination details.
     * It reads the destination configuration, gets the XSUAA token, and fetches the destination details.
     * @param {string} destinationName - The name of the destination
     * @returns {Promise} - A promise that resolves with the destination details
     * @throws {Error} - Throws an error if any issue occurs during the fetching of destination details
     */
    // async getDestinationDetails(destinationName) {
    //     try {
    //         // Read the destination configuration
    //         const destinationService = xsenv.getServices({
    //             dest: { tag: "destination" },
    //         }).dest;
    //         const xsuaaService = xsenv.getServices({ uaa: { tag: "xsuaa" } }).uaa;

    //         // Get XSUAA token
    //         const tokenResponse = await axios({
    //             method: 'post',
    //             url: `${xsuaaService.url}/oauth/token`,
    //             headers: {
    //                 'Authorization': `Basic ${Buffer.from(`${destinationService.clientid}:${destinationService.clientsecret}`).toString('base64')}`,
    //                 'Content-Type': 'application/x-www-form-urlencoded'
    //             },
    //             data: 'grant_type=client_credentials'
    //         });

    //         const token = tokenResponse.data.access_token;

    //         // Get destination details
    //         const destinationResponse = await axios({
    //             method: 'get',
    //             url: `${destinationService.uri}/destination-configuration/v1/destinations/${destinationName}`,
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         });

    //         return destinationResponse.data;
    //     } catch (error) {
    //         logger.error('Error fetching destination details:', error);
    //         throw new Error("Error fetching destination details");
    //     }
    // }

    /**
     * @description - This function fetches the S4 destination details.
     * It fetches the destination details for the S4 destination and returns the details.
     * @returns {Promise} - A promise that resolves with the S4 destination details
     * @throws {Error} - Throws an error if any issue occurs during the fetching of S4 destination details
     */
    // async getS4DestinationDetails() {
    //     let s4DestinationDetails = {};
    //     const oDetails = await this.getDestinationDetails(process.env.S4_DESTINATION);
  
    //       if (!oDetails) {
    //         throw new Error(`Destination ${process.env.S4_DESTINATION} not found`);
    //       }
  
    //       const { URL } = oDetails.destinationConfiguration;
    //       const { type, value } = oDetails.authTokens[0];
  
    //       s4DestinationDetails = {
    //         URL,
    //         type,
    //         value
    //     }

    //     return s4DestinationDetails;
    // }

    /**
     * @description - This function fetches the S4 connection.
     * It connects to the S4 destination and returns the connection details.
     * @returns {Promise} - A promise that resolves with the S4 connection details
     * @throws {Error} - Throws an error if any issue occurs during the fetching of S4 connection details
     */
    async getS4Connection() {
        const oConnection = await cds.connect.to("s4-onprem-clearingapp-service");
        oConnection.path = "/sap/opu/odata/sap/ZCLEARINGAPPLICATIONSERVICES_SRV";
        return oConnection;
        // return await cds.connect.to({
        //     kind: "odata-v2",
        //     csrf: true,
        //     credentials: {
        //         destination: process.env.S4_DESTINATION,
        //         requestTimeout: 2000000,
        //         path: `/sap/opu/odata/sap/ZCLEARINGAPPLICATIONSERVICES_SRV`,
        //         destinationOptions: {
        //                 "selectionStrategy": "alwaysProvider",
        //                 "useCache": true,
        //                 "jwt": null
        //             }
        //     },
        // });
    }

    /**
     * @description - This function removes the previous transactions in error.
     * It removes the previous transactions in error for the specified transaction type.
     * Failed transactions remain in the database and display as errors in the UI until the user attempts to clear them again.
     * @param {string} TransactionType - The type of transaction
     * @param {Array} aTransactions - The array containing the transactions
     * @returns {Promise} - A promise that resolves with the removed transactions
     * @throws {Error} - Throws an error if any issue occurs during the removal of transactions
     */
    async RemovePreviousTransactionsInError( TransactionType, aTransactions) {

        // Validate and get table name using switch statement
        let sTableName;
        switch (TransactionType) {
            case constants.ClearingTypes.ClaimReceivables:
                sTableName = "clearingapplicationService.ClaimReceivablesPendingTransactions";
                break;
            case constants.ClearingTypes.PremiumReceivables:
                sTableName = "clearingapplicationService.PremiumReceivablesPendingTransactions";
                break;
            case "Unallocated Insurance Monies":
                sTableName = "clearingapplicationService.UIMPendingTransactions";
                break;
            default:
                throw new Error(`Invalid transaction type: ${TransactionType}`);
        }
        if (!sTableName) {
            throw new Error(`Invalid transaction type: ${TransactionType}`);
        }

        let getDeleteCondition;
        switch (TransactionType) {
            case constants.ClearingTypes.PremiumReceivables:
                getDeleteCondition = (line) => ({
                    ExtRef: line.EXTERNAL_REFERENCE_NO,
                    IntRef: line.INTERNAL_REFERENCE_NO,
                    TrType: line.TRANSACTION_TYPE,
                    BitRef: line.BIT_REFERENCE,
                    EndorsementRef: line.ENDORSEMENT_REF,
                    PolicyNo: line.POLICY_NUMBER,
                    PremiumId: line.PREMIUM_ID,
                    Installment: line.INSTALLMENT,
                    Status: constants.ClearingStatus.Failed
                });
                break;

            case constants.ClearingTypes.ClaimReceivables:
                getDeleteCondition = (line) => ({
                    ExtRef: line.EXTERNAL_REFERENCE_NO,
                    IntRef: line.INTERNAL_REFERENCE_NO,
                    TrType: line.TRANSACTION_TYPE,
                    BitRef: line.BIT_REFERENCE,
                    UCR: line.UCR,
                    ClaimRef: line.CLAIM_REFERENCE,
                    TrRef: line.TRANSACTION_REFERENCE,
                    MemberBPID: line.MEMBERBPID,
                    Status: constants.ClearingStatus.Failed
                });
                break;

            case "Unallocated Insurance Monies":
                getDeleteCondition = (line) => ({
                    DocumentNo: line.DOCUMENT_NUMBER,
                    ItemNo: line.ITEM_NUMBER,
                    RepItem: line.REP_ITEM,
                    SubItem: line.SUB_ITEM,
                    Status: constants.ClearingStatus.Failed
                });
                break;

            default:
                throw new Error(`No delete condition defined for transaction type: ${TransactionType}`);
        }

        for await (const line of aTransactions) {
            await this.executeTransaction('DELETE', sTableName,{},  getDeleteCondition(line));
        }
    }


    /**
     * Creates clearing entries from the standardized payload
     * @param {Array<ClearingPayloadInit>} aClearingData - Array of clearing data from FE
     * @param {string} sUniqueClearingIdentifier - Unique clearing identifier
     * @param {Array<ClearingPayloadInit>} aPayload - Array of clearing payload objects
     * @param {string} sClearingType - Clearing type
     * @param {string} sStatus - Clearing status
     */
    async createClearingLogEntries( aClearingData, sUniqueClearingIdentifier, aPayload, sClearingType, sStatus ) {
        try {
          
            // Main clearing log entry
            const oClearingLog = {
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                ExtRef: aClearingData[0].EXTERNAL_REFERENCE_NO,
                ClaimRef: aClearingData[0]?.CLAIM_REFERENCE,
                ClearingType: sClearingType,
                Status: sStatus,
                CreatedDocuments: ''
            };
            const aClearingLogExpanded = aClearingData.map(payload => ({
                UniqueClearingIdentifier: sUniqueClearingIdentifier,
                ExtRef: payload.EXTERNAL_REFERENCE_NO,
                IntRef: payload?.INTERNAL_REFERENCE_NO,
                ClaimRef: payload?.CLAIM_REFERENCE,
                Installment: payload?.INSTALLMENT,
                TrRef: payload?.TRANSACTION_REFERENCE,
                AmountCleared: payload.AMOUNT_CLEARED,
                OriginalCurrency: payload.ORIGINAL_CURRENCY,
                AllocAmn: payload.ALLOCAMN,
                ExpectedPayCurrency: payload.EXPECTED_PAY_CURRENCY,
                DeltaDueRoe: payload.DELTA_DUE_ROE,
                BitReference: payload.BIT_REFERENCE,
                EndorsementRef: payload?.ENDORSEMENT_REF,
                MemberBPID: payload?.MEMBERBPID
            }));

            await this.executeTransaction('INSERT', "clearingapplicationService.ClearingLogDB", oClearingLog);
            await this.executeTransaction('INSERT', "clearingapplicationService.ClearingLogExpanded", aClearingLogExpanded);

        } catch (error) {
            console.error('Error in Creating Clearing Log Entries:', error);
            throw new Error(`Failed to create Clearing Log Entries: ${error.message}`);
        }
    }

}


module.exports = { util }
