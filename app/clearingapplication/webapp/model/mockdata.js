sap.ui.define([], function () {
    "use strict";

    return {

        "SelectParametersSOA": {
            "CompanyCode": "DX01",
            "BusinessPartners": [
                "1100000100"
                // "1100000023" //BTP
            ],
            "ExternalReferenceNumbers": [
                // "11000069524145279"
                // "11000069524145097"
                // "11000069524146012", =-
                // "11000069524145972"
                //"11000069524143487", // ISSUE 
                // "11000069524145456" // New,
                "11000069524148304" // Vinny
                // "11000069524151529" // Vinny New
                // "#1100018781-00000075"
            ],
            "SoaReferenceNumbers": [],
            "UMRNumbers": [],
            "ElsecoBankAccountNumber": "4021323893163050",
            "Payment": 0,
            "BankCharge": 0,
            "Currency": "USD",
            "PostingDate": null,
            "Division": "E1"
        },
        "SelectParametersPP": {
            "CompanyCode": "DX01",
            "BusinessPartners": [
                "1100000564"
            ],
            "ExternalReferenceNumbers": [],
            "SoaReferenceNumbers": [],
            "UMRNumbers": [],
            "ElsecoBankAccountNumber": "4021323893163050",
            "Payment": 0,
            "BankCharge": 0,
            "Currency": "USD",
            "PostingDate": null,
            "Division": "E1",
            "UWYears": [],
            "Fronter": "",
            "Members": [],
            "PayablePostingStartDate": "2023-01-24T00:00:00",
            "PayablePostingEndDate": "2024-08-24T00:00:00"
        },
        "SelectParametersPP_bck": {
            "CompanyCode": "DX01",
            "BusinessPartners": [
                "1100000100"
            ],
            "ExternalReferenceNumbers": [],
            "SoaReferenceNumbers": [],
            "UMRNumbers": [],
            "ElsecoBankAccountNumber": "4021323893163050",
            "Payment": 0,
            "BankCharge": 0,
            "Currency": "USD",
            "PostingDate": null,
            "Division": "E1",
            "UWYears": [],
            "Fronter": "",
            "Members": [],
            "PayablePostingStartDate": "2024-05-24T00:00:00",
            "PayablePostingEndDate": "2024-05-24T00:00:00"
        },

        "SelectionParametersCR1": {
            "CompanyCode": "DX01", "BusinessPartners": ["1100000564"], "ExternalReferenceNumbers": [
                "11000001354070621"
            ], "UCRNumbers": [], "ElsecoBankAccountNumber": "4021323893163094", "Payment": 0, "Currency": "USD", "PostingDate": null, "Division": "E3", "ClaimIDs": [], "TransRefs": []
        },
        "SelectionParametersCR2SAJ": {
            "CompanyCode": "DX01", "BusinessPartners": ["1100000564"], "ExternalReferenceNumbers": [
                "11000069524145456"
            ], "UCRNumbers": [], "ElsecoBankAccountNumber": "4021323893163050", "Payment": 0, "Currency": "USD", "PostingDate": null, "Division": "E1", "ClaimIDs": [], "TransRefs": []
        },

        // "SelectionParametersCR":{"CompanyCode":"DX01","BusinessPartners":[
        //     // "1100000100"
        //     "1100000564"
        // ],"ExternalReferenceNumbers":[
        //     "11000069524145456"
        // ],"UCRNumbers":[],"ElsecoBankAccountNumber":"4021323893163050","Payment":0,"Currency":"USD","PostingDate":null,"Division":"E1","ClaimIDs":[],"TransRefs":[]}
        "SelectionParametersCR": {
            "CompanyCode": "DX01", "BusinessPartners": [
                // "1100000100"
                "1100000048"
            ], "ExternalReferenceNumbers": [
                "#1100018781-00000075"
            ], "UCRNumbers": [], "ElsecoBankAccountNumber": "4021323893163050", "Payment": 0, "Currency": "USD", "PostingDate": null, "Division": "E1", "ClaimIDs": [], "TransRefs": []
        },
        "SelectionParametersCRWorking": {
                "CompanyCode": "DX01",
                "BusinessPartners": ["1100000564"],
                "ExternalReferenceNumbers": [],
                "UCRNumbers": [],
                "ElsecoBankAccountNumber": "4021323893163050",
                "Payment": 0,
                "Currency": "USD",
                "PostingDate": null,
                "Division": "E1",
                "ClaimIDs": ["AV1100006447-00000247-001-H"],
                "TransRefs": []
        },
        "SelectionParametersCRBTP": {
            "CompanyCode": "DX01",
            "BusinessPartners": [
                "1100000120"
            ],
            "ExternalReferenceNumbers": [
                "#1100018781-00000075"
            ],
            "UCRNumbers": [
                "#1100018781-00000075-005-"
            ],
            "ElsecoBankAccountNumber": "4021323893163050",
            "Payment": 0,
            "Currency": "USD",
            "PostingDate": null,
            "Division": "E1",
            "ClaimIDs": [],
            "TransRefs": []
        },
        "SelectionParametersCP1": {
            "CompanyCode": "DX01",
            "BusinessPartners": [
                "1100000100"
            ],
            "ExternalReferenceNumbers": ["11000110984136296"],
            "SoaReferenceNumbers": [],
            "UMRNumbers": [],
            "ElsecoBankAccountNumber": "4021323893163050",
            "Payment": 0,
            "BankCharge": 0,
            "Currency": "USD",
            "PostingDate": null,
            "Division": "E1"
        },
        "SelectionParametersCP": {
            "CompanyCode": "DX01",
            "BusinessPartners": [
                "1100000100",
                "1100000070"
            ],
            "ExternalReferenceNumbers": ["11000069524145456"],
            "SoaReferenceNumbers": [],
            "UMRNumbers": [],
            "ElsecoBankAccountNumber": "4021323893163050",
            "Payment": 0,
            "BankCharge": 0,
            "Currency": "USD",
            "PostingDate": null,
            "Division": "E1"
        }
    }
}
);