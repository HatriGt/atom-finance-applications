sap.ui.define([
], function (
) {
    "use strict";

    return {
        pngFileFormat: ".png",
        gifFileFormat: ".gif",
        appModulePath: "atom/ui/clearing/clearingapplication",
        colorRed: "#E1390C",
        colorGreen: "#007F00",
        iconRed: "sap-icon://status-negative",
        iconGreen: "sap-icon://status-positive",
        PayableTransactionTypesInPremiumReceivables: ["Payment", "Bank Charge", "OVER PAYMENT", "Unallocated Insurance Monies"],
        PayableTransactionTypesInClaimReceivables: ["Payment", "Bank Charge", "Unallocated Insurance Monies"],
        PayableTransactionTypesInPremiumPayables: ["Payment", "Bank Charge", "Unallocated Insurance Monies"],
        PayableTransactionTypesInClaimPayables: ["Payment", "Bank Charge", "Unallocated Insurance Monies", "OVER PAYMENT"],
        clearingTypes: ["Premium Receivables", "Claim Receivables", "Premium Payables", "Claim Payables"],
        filterColumnsForPremiumReceivables: [ "ExtRef","BitRef", "TrType", "EndorsementRef", "IntRef", "Installment", "DueDate", "Opbel"],
        filterColumnsForClaimReceivables: [ "ExtRef","BitRef", "TrType", "IntRef", "DueDate", "Opbel", "ClaimId", "TrRefNum"],
        filterColumnsForPremiumPayables: ["ExtRef", "TrType", "EndorsementRef", "IntRef", "Installment", "DueDate", "Opbel"],
        filterColumnsForClaimPayables: [ "ExtRef","ClaimRef", "ClaimTrRef", "TrType", "IntRef", "DueDate", "Opbel", "BpName"],

        dateColumns: ["DueDate", "InceptionDate", "ExpiryDate"],
        totalValueColumnsForPremiumReceivables: [{
            "AmountField": "ExpPayAmn",
            "CurrencyField": "ExpPayCurr"
        },
        {
            "AmountField": "Amn",
            "CurrencyField": "OrigCurr"
        },
        {
            "AmountField": "AllocAmn",
            "CurrencyField": "OrigCurr"
        }],
        totalValueColumnsForClaimReceivables: [{
            "AmountField": "ExpPayAmn",
            "CurrencyField": "ExpPayCurr"
        },
        {
            "AmountField": "Amn",
            "CurrencyField": "OrigCurr"
        },
        {
            "AmountField": "AllocAmn",
            "CurrencyField": "OrigCurr"
        }],
        totalValueColumnsForPremiumPayables: [{
            "AmountField": "ExpPayAmn",
            "CurrencyField": "ExpPayCurr"
        },
        {
            "AmountField": "Amn",
            "CurrencyField": "OrigCurr"
        },
        {
            "AmountField": "AllocAmn",
            "CurrencyField": "OrigCurr"
        }]
        ,
        totalValueColumnsForClaimPayables: [{
            "AmountField": "ExpPayAmn",
            "CurrencyField": "ExpPayCurr"
        },
        {
            "AmountField": "Amn",
            "CurrencyField": "OrigCurr"
        },
        {
            "AmountField": "AllocAmn",
            "CurrencyField": "OrigCurr"
        }],
        ClearingStatus: {
            "Failed": "Failed",
            "InProcess": "InProcess",
            "Success": "Success"
        },

        ClearingStatusValidForClearing: [4, 2],

        ActionLoggerOverViewColumnsForPremium:["ClearedDate","ClearedTime","ExtRef","IntRef","TrType","BitRef","EndorsementRef","Installment","ClearedBy","CreatedDocuments","Status","AdditionalInfo"],
        ActionLoggerOverViewColumnsForClaim:["ClearedDate","ClearedTime","ExtRef","IntRef","TrType","BitRef","UCR","ClaimRef","TrRef","ClearedBy","CreatedDocuments","Status","AdditionalInfo"],



    };

});