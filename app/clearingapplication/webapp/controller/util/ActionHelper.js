/* eslint-disable consistent-this */
sap.ui.define([
    "sap/m/MessageBox",
    "./util",
    "sap/ui/core/Fragment",
    "../../model/constants"
], function (MessageBox,
    Util,
    Fragment, Constants) {
    "use strict";

    var oClearingController = null;

    return {
        setController: function (oController) {
            if (oController.name === "Clearing") {
                oClearingController = oController.controller;
            }
        },

        clearingItemSelected: async function (oContext, that, currentSelectedItem, isRunningForBulkUpdate = false, sRoeRecCurr = "") {
            let aSelectionResult = that.getView().getModel().getData().SelectionResult,
                oModel = oContext.getModel();
            let aOneSelectedItemIndex = that.byId("idClearingTable").getSelectedIndices();
            let oOneSelectedItem = aOneSelectedItemIndex.length > 0 ? aSelectionResult[aOneSelectedItemIndex[0]] : undefined;
            if (oOneSelectedItem && oOneSelectedItem.ExpPayCurr !== currentSelectedItem.ExpPayCurr) {
                MessageBox.error(that.getResourceBundle().getText("expPayCurrDiffError"));
                return;
            }
            let oObject = oModel.getProperty(oContext.getPath());

            // Select the checkbox
            // oModel.setProperty(oContext.getPath() + "/isSelected", true, oContext);
            oObject.isSelected = true;

            if (currentSelectedItem.FixedRoe === "" && currentSelectedItem.Hvorg !== "P190" && currentSelectedItem.OrigCurr !== currentSelectedItem.ExpPayCurr) {
                // Make RoeRecCurr editable 
                // oModel.setProperty(oContext.sPath + "/isRoeRecCurrEditable", true, oContext);
                oObject.isRoeRecCurrEditable = true;
            }

            // Make AllocAmn editable
            // oModel.setProperty(oContext.sPath + "/isAllocAmnEditable", true, oContext);
            oObject.isAllocAmnEditable = true;

            // Expected Pay Amn
            //REVIEW - Commenting this as per the requirement. //TODO - Uncomment this if required.
            // if (currentSelectedItem.RoeRecCurr === currentSelectedItem.RoeTr) {
            //     oModel.setProperty(oContext.sPath + "/ExpPayAmn", currentSelectedItem.SettAmnRoeTr, oContext);
            // } else {
            //     let localAmount = await Util.convLocalCurrency(that, currentSelectedItem.Amn, currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeRecCurr);
            //     // currentSelectedItem.ExpPayAmn = localAmount;
            //     oModel.setProperty(oContext.sPath + "/ExpPayAmn", localAmount, oContext);
            // }


            // Alloc Amn
            if (Number(currentSelectedItem.AllocAmn) === 0) {
                let iAllocAmn = currentSelectedItem.Clearable === true ?
                    currentSelectedItem.ClearableAmount : currentSelectedItem.Amn;
                // oModel.setProperty(oContext.sPath + "/AllocAmn", iAllocAmn, oContext);
                oObject.AllocAmn = iAllocAmn;
            }

            // 
            // currentSelectedItem.AllocAmnSettCurr = currentSelectedItem.ExpPayAmn;
            // oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", currentSelectedItem.ExpPayAmn, oContext);
            oObject.AllocAmnSettCurr = currentSelectedItem.ExpPayAmn;


            // Delta Due Roe

            if (Number(currentSelectedItem.AllocAmn) !== 0 &&
                !(["PAYMENT", "OVER PAYMENT", "BANK CHARGE"].includes(currentSelectedItem.TrType))
                && ["CR", "PO", "EN"].includes(currentSelectedItem.Blart)) {

                if (currentSelectedItem.RoeRecCurr === currentSelectedItem.RoeTr
                    || currentSelectedItem.FixedRoe === "X" || currentSelectedItem.OrigCurr === currentSelectedItem.ExpPayCurr) {
                    // oModel.setProperty(oContext.sPath + "/DeltaDueRoe", "0.00", oContext);
                    oObject.DeltaDueRoe = "0.00";
                } else {
                    let localAmount = isRunningForBulkUpdate && currentSelectedItem.OrigCurr !== currentSelectedItem.ExpPayCurr ? sRoeRecCurr :
                        await Util.convLocalCurrency(that, currentSelectedItem.AllocAmn, currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeTr);
                    let oAmount = (parseFloat(currentSelectedItem.AllocAmnSettCurr) - parseFloat(localAmount)).toFixed(2);
                    // oModel.setProperty(oContext.sPath + "/DeltaDueRoe", oAmount, oContext);
                    oObject.DeltaDueRoe = oAmount;
                }
            }

            // Update the model
            oModel.setProperty(oContext.getPath(), oObject, oContext); 

        },

        clearingItemSelectedInBulk: async function (oContexts, that) {
            const oModel = that.getView().getModel();

            // Filter contexts to only include items that need processing
            const aContextsToBeUpdated = oContexts.filter((oContext) => {
                const item = oContext.getObject();
                return Constants.ClearingStatusValidForClearing.includes(item.ClearingStatus) && item.isSelected === false;
            }).map((line, index) => {
                return {
                    context: line,
                    contextIndex: index
                };
            });

            const aContextsToBeUpdatedForDeltaDueRoeUsingConversion = aContextsToBeUpdated.filter((line) => {
                const item = line.context.getObject();
                let iAllocAmn = item.AllocAmn;
                if (Number(iAllocAmn) === 0) {
                    iAllocAmn = item.Clearable === true ?
                        item.ClearableAmount : item.Amn;
                }
                return (item.Blart === "CR" || item.Blart === "PO" || item.Blart === "EN") && item.RoeRecCurr !== item.RoeTr
                    && item.FixedRoe !== "X" && item.OrigCurr !== item.ExpPayCurr && Number(iAllocAmn) !== 0 && item.OrigCurr !== item.ExpPayCurr;
            }).map((line) => {
                const item = line.context.getObject();
                let iAllocAmn = item.AllocAmn;
                if (Number(iAllocAmn) === 0) {
                    iAllocAmn = item.Clearable === true ?
                        item.ClearableAmount : item.Amn;
                }
                return {
                    context: line.context,
                    contextIndex: line.contextIndex,
                    payload: {
                        No: line.contextIndex,
                        ForeignAmount: iAllocAmn,
                        ForeignCurrency: item.OrigCurr,
                        LocalCurrency: item.ExpPayCurr,
                        Rate: item.RoeTr
                    }
                };
            });

            const aPayload = aContextsToBeUpdatedForDeltaDueRoeUsingConversion.map(line => line.payload);
            try {
                const oResult = aPayload.length > 0 ? await Util.convLocalCurrencyInBulk(that, aPayload) : {};

                const aDeltaDueRoesConverted = oResult?.results?.map(line => ({
                    contextIndex: line.No,
                    LocalAmount: line.LocalAmount
                })) || [];

                for (let i = 0; i < aContextsToBeUpdated.length; i++) {
                    const sRoeRecCurr = aDeltaDueRoesConverted.find(line => line.contextIndex === aContextsToBeUpdated[i].contextIndex)?.LocalAmount;
                    this.clearingItemSelected(aContextsToBeUpdated[i].context, that, aContextsToBeUpdated[i].context.getObject(), true, sRoeRecCurr);
                }

                this.calculateClearingAmnDifference(that);

                oModel.refresh(true);
            } catch (error) {
                MessageBox.error("Communication Error Occurred");
                console.error(error);
                return;
            }
        },

        clearingItemUnSelected: async function (oContext) {
            let oModel = oContext.getModel();

            let oObject = oModel.getProperty(oContext.getPath());
            // UnSelect the Checkbox
            oObject.isSelected = false;
            // Make Fields Non-Editable
            oObject.isRoeRecCurrEditable = false;
            oObject.isAllocAmnEditable = false;
            // Clear the values
            // oObject.ExpPayAmn = "0.00"; //REVIEW - //TODO - Commenting it as per the requirement. 
            oObject.AllocAmnSettCurr = "0.00";
            oObject.DeltaDueRoe = "0.00";
            oObject.AllocAmn = "0.00";
            oModel.setProperty(oContext.getPath(), oObject, oContext);
           

            // // UnSelect the Checkbox
            // oModel.setProperty(oContext.getPath() + "/isSelected", false, oContext);

            // // Clear the values
            // // oModel.setProperty(oContext.sPath + "/ExpPayAmn", "0.00", oContext); //REVIEW - //TODO - Commenting it as per the requirement. 
            // oModel.setProperty(oContext.sPath + "/AllocAmn", "0.00", oContext);
            // oModel.setProperty(oContext.sPath + "/DeltaDueRoe", "0.00", oContext);
            // oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", "0.00", oContext);

            // // Make Fields Non-Editable
            // oModel.setProperty(oContext.sPath + "/isRoeRecCurrEditable", false, oContext);
            // oModel.setProperty(oContext.sPath + "/isAllocAmnEditable", false, oContext);
        },

        calculateClearingAmnDifference: function (that) {

            const oModel = that.getView().getModel();
            const oData = oModel.getData();
            const aProcessingStatus = oData.ProcessingStatus;
            const sumMap = new Map();
            
            // Sum the AllocAmnSettCurr values for each unique combination in aSelectedSelectionResult
            for (const item of oData.SelectionResult) {
                if (!item.isSelected) {continue;}
                const key = `${item.Gpart}-${item.BpName}-${item.ExpPayCurr}`;
                sumMap.set(key, (sumMap.get(key) || 0) + Number(item.AllocAmnSettCurr));
            }
            
            // Update the AllocAmnSettCurr in aProcessingStatus with the summed values
            for (const item of aProcessingStatus) {
                const key = `${item.Gpart}-${item.BpName}-${item.CurrencyCode}`;
                const sumValue = sumMap.get(key) || 0;
                item.DifferenceAmn = sumValue.toFixed(3);
                
                if (Math.abs(Number(sumValue) ) === 0) {
                    item.StatusIcon = Constants.iconGreen;
                    item.StatusColor = Constants.colorGreen;
                } else {
                    item.StatusIcon = Constants.iconRed;
                    item.StatusColor = Constants.colorRed;
                }
            }
            oModel.setProperty("/ProcessingStatus", aProcessingStatus);
            oModel.refresh(true);
            Util.constructTotalValueTable(that);

        },

        onAllocAmnChange: async function (oContext, that) {

            let currentSelectedItem = oContext.getModel().getProperty(oContext.sPath),
                iAllocAmn = currentSelectedItem.AllocAmn,
                oModel = oContext.getModel();

                // Format it to 2 Decimal Places
                oModel.setProperty(oContext.sPath + "/AllocAmn", Number(iAllocAmn).toFixed(2), oContext);
                
            if ((currentSelectedItem.ExpPayAmn < 0 && currentSelectedItem.AllocAmn > 0)
                || (currentSelectedItem.ExpPayAmn > 0 && currentSelectedItem.AllocAmn < 0)) {
                iAllocAmn = iAllocAmn * -1;
                oModel.setProperty(oContext.sPath + "/AllocAmn", iAllocAmn, oContext);
            }

            if (Math.abs(iAllocAmn) > Math.abs(currentSelectedItem.Amn)) {
                MessageBox.error(`Enter an Amount less than or equal to ${currentSelectedItem.Amn} `);
                oModel.setProperty(oContext.sPath + "/AllocAmn", 0, oContext);
                // If Alloc Amn is reset to Zero, then reset the values of Delta Due ROE and Alloc Amn SettCurr -- New Own
                oModel.setProperty(oContext.sPath + "/DeltaDueRoe", "0.00", oContext);
                oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", "0.00", oContext);
                return;
            }

            if (currentSelectedItem.AllocAmn === currentSelectedItem.Amn && currentSelectedItem.RoeRecCurr === currentSelectedItem.RoeTr) {
                oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", currentSelectedItem.SettAmnRoeTr, oContext);
            } else {
                let localAmount = await Util.convLocalCurrency(that, currentSelectedItem.AllocAmn, currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeRecCurr);
                oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", localAmount, oContext);
            }

            // Update Delta Due ROE
            if (Number(currentSelectedItem.AllocAmn) !== 0 &&
                !(["PAYMENT", "OVER PAYMENT", "BANK CHARGE"].includes(currentSelectedItem.TrType))
                && ["CR", "PO", "EN"].includes(currentSelectedItem.Blart)) {

                if (currentSelectedItem.RoeRecCurr === currentSelectedItem.RoeTr
                    || currentSelectedItem.FixedRoe === "X" || currentSelectedItem.OrigCurr === currentSelectedItem.ExpPayCurr) {
                    oModel.setProperty(oContext.sPath + "/DeltaDueRoe", "0.00", oContext);
                    // currentSelectedItem.DeltaDueRoe = "0.00";
                } else {
                    let localAmount = await Util.convLocalCurrency(that, currentSelectedItem.AllocAmn, currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeTr);

                    // currentSelectedItem.DeltaDueRoe = currentSelectedItem.AllocAmnSettCurr - localAmount;
                    oModel.setProperty(oContext.sPath + "/DeltaDueRoe", currentSelectedItem.AllocAmnSettCurr - localAmount, oContext);
                }
            }
        },

        _proceedToClear: async function () {

            let oClearingApplicationModel = oClearingController.getOwnerComponent().getModel("clearingApplicationModel");


            this._validateBeforeClearing();

            let oPayload = this._createClearingPayload();
            try {
                let sPath;
                switch (oClearingController._ClearingType) {
                    case "PremiumReceivables":
                        sPath = "/ClearPremiumReceivables";
                        break;
                    case "PremiumPayables":
                        sPath = "/ClearPremiumPayables";
                        break;
                    case "ClaimPayables":
                        sPath = "/ClearClaimPayables";
                        break;
                }

                let oResponse = await Util.create(oClearingApplicationModel, sPath, oPayload);
                if (oResponse) {
                    if (oClearingController._ClearingType === "PremiumPayables" || oClearingController._ClearingType === "ClaimPayables") {
                        const aCreatedDocuments = oResponse.results;
                        Util.DisplayCreatedDocuments(aCreatedDocuments);
                        oClearingController.onRefreshButtonPress();
                        return;
                    }
                    let aClearingTableData = oClearingController.getView().getModel().getData().SelectionResult;
                    for (const line of aClearingTableData) {
                        if (line.isSelected) {
                            line.ClearingStatus = 0; // In Process
                            line.isSelected = false;
                        }
                    }
                    oClearingController.getView().getModel().setProperty("/SelectionResult", aClearingTableData);
                    MessageBox.information(oClearingController.getResourceBundle().getText("ClearingInProcess"));
                }
            } catch (error) {
                throw new Error(error?.message?.toString() || (typeof error === "string" ? error :  oClearingController.getResourceBundle().getText("CommError")));
            }

        },

        _validateBeforeClearing: function () {

            // Check if the processing status has currency zero before initiating clearing process
            if (this._validateProcessingStatus()) {
                // TODO: Add Validations 
            } else {
                throw new Error(oClearingController.getResourceBundle().getText("ProcessingNotValid"));
            }
        },

        tryProceedToClear: async function (oEvent) {
            try {
                await this._proceedToClear();
                oEvent.getSource().getParent().close();
            } catch (error) {
                MessageBox.error(error.message);
            }
        },

        _validateProcessingStatus: function () {

            let isProcessingStatusValid =
                oClearingController.getView().getModel().getData().ProcessingStatus.some((item) => {
                    return parseFloat(item.DifferenceAmn) === 0;
                });
            return isProcessingStatusValid;

        },

        _createClearingPayload: function () {
            let oData = oClearingController.getView().getModel().getData();
            let oSelectionParameters = oClearingController.getOwnerComponent().getModel("clearingPageModel").getData().SelectionParameters;
            let aTransactionToExclude = [];
            let aSelectedTransactionsForClearing = oData.SelectionResult.filter((item) => { return item.isSelected && !aTransactionToExclude.includes(item.TrType); });

            if (aSelectedTransactionsForClearing.length === 0) {
                throw new Error(oClearingController.getResourceBundle().getText("NoTransactionsSelected"));
            }

            let aClearingData = [], oPayload = {};

            const oBankAccountDetail = oClearingController.getOwnerComponent().getModel("clearingPageModel").getData().BankAccountNumbers.find(line =>
                line.CompanyCode === oSelectionParameters.CompanyCode && line.Division === oSelectionParameters.Division
                && line.ElsecoBankAccountNumber === oSelectionParameters.ElsecoBankAccountNumber);

            let oHeaderData = {
                COMPANY_CODE: oSelectionParameters.CompanyCode,
                DIVISION: oSelectionParameters.Division,
                POSTING_DATE: oSelectionParameters.PostingDate.substring(0, 10),
                BANK_ACCOUNT_NUMBER: oSelectionParameters.ElsecoBankAccountNumber,
                GL_ACCOUNT: oBankAccountDetail?.GLAccount,
                GL_ACCOUNT_CHARGES: oBankAccountDetail?.GLAccountCharges,
                SUB_TRANSACTION: oBankAccountDetail?.SubTransaction,
                GL_ACCOUNT_FOR_OP: oBankAccountDetail?.GLAccountForOP
            };

            
            aSelectedTransactionsForClearing.forEach((item) => {
                let oClearingData;
                
                if (oClearingController._ClearingType === "ClaimPayables") {
                    oClearingData = {
                        HEADER_DATA: oHeaderData,
                        BUSINESS_PARTNER_NO: item.Gpart,
                        TRANSACTION_TYPE: item.TrType,
                        BIT_REFERENCE: item.BitRef,
                        INTERNAL_REFERENCE_NO: item.IntRef,
                        EXTERNAL_REFERENCE_NO: item.ExtRef,
                        ORIGINAL_CURRENCY: item.OrigCurr,
                        AMOUNT_CLEARED: item.AllocAmnSettCurr,
                        EXPECTED_PAY_CURRENCY: item.ExpPayCurr,
                        ROE_REC_CURRENCY: item.RoeRecCurr,
                        DUE_DATE: item.DueDate?.toISOString()?.substring(0, 10),
                        UMR: item.Umr,
                        UCR: "",//item.Ucr,
                        CLAIM_REFERENCE: item.ClaimRef,
                        TRANSACTION_REFERENCE: item.ClaimTrRef,
                        UWAY: item.Uway,
                        COLLECTION_TYPE: "",//item.CollType,
                        CONTRACT_ACCOUNT: item.Vkont,
                        MEMBERBPID: "",//item.MemberId,
                        DOCUMENT_NUMBER: item.Opbel,
                        ITEM_NUMBER: item.Item,
                        REP_ITEM: item.RepItem,
                        SUB_ITEM: item.SubItem,
                        FIXED_ROE: item.FixedRoe,
                        PAYMENT_REF: item.Xblnr,
                        ALLOCAMN: item.AllocAmn,
                        DOCUMENT_TYPE: item.Blart,
                        HVORG: item.Hvorg,
                        POSTING_TYPE: item.PostingType,
                        DELTA_DUE_ROE: item.DeltaDueRoe,
                        ORIGIN: item.Origin
                    };
                } else {
                    // Use existing structure for other clearing types
                    oClearingData = {
                        HEADER_DATA: oHeaderData,
                        BUSINESS_PARTNER_NO: item.Gpart,
                        TRANSACTION_TYPE: item.TrType,
                        BIT_REFERENCE: item.BitRef,
                        PREMIUM_ID: item.PremiumId,
                        INTERNAL_REFERENCE_NO: item.IntRef,
                        EXTERNAL_REFERENCE_NO: item.ExtRef,
                        ORIGINAL_CURRENCY: item.OrigCurr,
                        AMOUNT_CLEARED: item.AllocAmnSettCurr,
                        EXPECTED_PAY_CURRENCY: item.ExpPayCurr,
                        ROE_REC_CURRENCY: item.RoeRecCurr,
                        DELTA_DUE_ROE: item.DeltaDueRoe,
                        INSTALLMENT: item.Installment,
                        DUE_DATE: item.DueDate?.toISOString()?.substring(0, 10),
                        ENDORSEMENT_REF: item.EndorsementRef,
                        UMR: item.Umr,
                        TAX: item.Tax === "" ? false : item.Tax,
                        TAX_CODE: item.TaxCode,
                        TAX_JURISDICTION: item.TaxJurisdiction,
                        TAX_BASE: item.TaxBase,
                        TAX_RATE: item.TaxRate === "" ? "0.00" : item.TaxRate,
                        PROCESS_ID: item.ProcessId,
                        POLICY_NUMBER: item.PolicyNum,
                        DOCUMENT_NUMBER: item.Opbel,
                        ITEM_NUMBER: item.Item,
                        REP_ITEM: item.RepItem,
                        SUB_ITEM: item.SubItem,
                        FIXED_ROE: item.FixedRoe,
                        PAYMENT_REF: item.Xblnr,
                        SOA_COUNT: item.SoaCount,
                        ALLOCAMN: item.AllocAmn,
                        DOCUMENT_TYPE: item.Blart,
                        HVORG: item.Hvorg,
                        POSTING_TYPE: item.PostingType,
                        ORIGIN: item.Origin
                    };
                }
                aClearingData.push(oClearingData);
            });

            oPayload = {
                clearingdata: aClearingData
            };
            console.log(oPayload);
            return oPayload;

        },

        getBPForExtRef: async function (oModel, aExtRef) {
            let oPayload = {
                IsPayerRequested: true,
                ExtRef: JSON.stringify(aExtRef),
                UMR: ""
            };
            let oResponse = await Util.create(oModel, "/GetPayerPayee", oPayload);

            return oResponse.GetPayerPayee.BP;
        },

        getBPForPayer: async function (oModel, aExtRef, aUMR) {

            let oFilter;
            if (aExtRef.length !== 0) {
                oFilter = new sap.ui.model.Filter("EXTERNAL_REFERENCE_NO", sap.ui.model.FilterOperator.Contains, aExtRef);
            } else {
                // Create a filter for each UMR number
                let aUMRFilters = aUMR.map(umr => new sap.ui.model.Filter("UMR_NO", sap.ui.model.FilterOperator.Contains, umr));

                // Combine filters with OR condition if there are multiple UMR numbers
                if (aUMRFilters.length > 1) {
                    oFilter = new sap.ui.model.Filter({
                        filters: aUMRFilters,
                        and: false // Use OR condition
                    });
                } else {
                    // If there's only one UMR number, use the single filter
                    oFilter = aUMRFilters[0];
                }
            }
            let oResponse = await Util.getData(oModel, "/InternalReferencesWithAttributes", { "$select": "BROKER_ID,BROKER_FULL_NAME" }, oFilter);

            function removeDuplicatesAndRename(data) {
                return data.reduce((acc, current) => {
                    // Check if the current object is already in the accumulator
                    const index = acc.findIndex(item => item.BP_ID === current.BROKER_ID && item.BP_NAME === current.BROKER_FULL_NAME);
                    if (index === -1) { // Not found, add new object with renamed properties
                        acc.push({ BP_ID: current.BROKER_ID, BP_NAME: current.BROKER_FULL_NAME });
                    }
                    return acc;
                }, []);
            }
            const aBPs = removeDuplicatesAndRename(oResponse);
            return aBPs;
        },

        preSaveSOADetails: async function () {

            let aClearingData = oClearingController.getView().getModel().getData().SelectionResult;

            let aTaxPairs = this.getUnSelectedTaxPairs(aClearingData);

            if (aTaxPairs.length !== 0) {
                this._openDialogForUnSelectedTaxPairsOnSOASave(aTaxPairs);
            } else {
                oClearingController.getView().setBusy(true);

                try {
                    await this.saveSOADetails();
                } catch (error) {
                    MessageBox.error(error.message);
                }
                oClearingController.getView().setBusy(false);
            }
        },

        saveSOADetails: async function () {

            const aClearingData = oClearingController.getView().getModel().getData().SelectionResult;
            const oClearingApplicationModel = oClearingController.getView().getModel("clearingApplicationModel");
            // let aClearingOP = await Util.getClearingOPOdataStructure(oClearingApplicationModel, aClearingData, true);
            
            if(aClearingData.find(line=> line.Clearable === true && line.SoaReference === "") )
            {
                throw new Error(oClearingController.getResourceBundle().getText("SOARefEmptyError"));
            }
            const aSOAUpdate = aClearingData.filter(line=> ( line.Clearable !== false || line.SoaReference !== "" || Number(line.ClearableAmount) !== 0)
            || ( line.Clearable === false && line.SoaReference === "" && line.SoaLineId === "" && line.IsSOAFieldsModified  ) ).map(line => {
                return {
                    No: Number(line.No),
                    SoaCount: line.SoaCount,
                    SoaReference: line.SoaReference,
                    Clearable: line.Clearable,
                    ClearableAmount: line.ClearableAmount,
                    Opbel: line.Opbel,
                    Item: line.Item,
                    RepItem: line.RepItem,
                    SubItem: line.SubItem,
                    IntRef: line.IntRef,
                    SoaLineId: line.SoaLineId,
                    SoaComments: line.SoaComments,
                    SoaId: line.SoaId,
                    OrigCurr: line.OrigCurr,
                    IsSOAFieldsModified: line.IsSOAFieldsModified
                };
            });
            let oPayload = {
                // Action: "SOAUpdateCheck",
                SOAUpdate: aSOAUpdate
                // SOAUpdateCheckResponse: {}
            };

            try {
                // var oPrecheck = await Util.create(oClearingApplicationModel, "/DeepOPSet", oPayload);
                var oResponse = await Util.create(oClearingApplicationModel, "/SOAUpdatePreCheck", oPayload);

            } catch (error) {
                throw new Error(oClearingController.getResourceBundle().getText("CommError"));
            }


            if (!oResponse) {
                throw new Error(oClearingController.getResourceBundle().getText("CommError"));
            }
            if (oResponse.isNoDataToBeSaved) {
                throw new Error(oClearingController.getResourceBundle().getText("NoDataToBeSaved"));
            }

            if (oResponse.isNewSOAAvailable) {

                let aNewSOA = oResponse.SOANew.split("~").map(x => { return { id: x }; });

                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    SOAIDs: aNewSOA
                });

                // Create an instance of the List control
                var oList = new sap.m.List({
                    items: {
                        path: "/SOAIDs",
                        template: new sap.m.StandardListItem({
                            title: "{id}"
                        })
                    }
                });

                // Create a Dialog
                var oDialog = new sap.m.Dialog({
                    title: "A new SOA Reference line will be added for the following keys:",
                    contentWidth: "550px",
                    contentHeight: "200px",
                    resizable: true,
                    draggable: true,
                    content: [oList], // Add the list to the dialog's content
                    beginButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            oDialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "Continue",
                        press: async function () {
                            oDialog.setBusy(true);
                            await this._proceedSavingSOADetails(true);
                            oDialog.setBusy(false);
                            oDialog.close();
                            oClearingController.getView().setBusy(false);
                        }.bind(this)
                    })
                });
                oDialog.setModel(oModel);
                // // To ensure the dialog is destroyed (for memory management) when it's closed
                // oDialog.attachAfterClose(function () {
                //     oDialog.destroy();
                // });

                // Open the Dialog
                oDialog.open();
                return;

            }
            if (oResponse.isSOARefEmptyError) {
                throw new Error(oClearingController.getResourceBundle().getText("SOARefEmptyError"));
            }

            if (oResponse.isAllOkToSave) {
                await this._proceedSavingSOADetails(false);
                return;
            }

        },

        _proceedSavingSOADetails: async function (isNewSOAAvailable) {
            let aClearingData = oClearingController.getView().getModel().getData().SelectionResult;
            let oClearingApplicationModel = oClearingController.getView().getModel("clearingApplicationModel");
            // let aClearingOP = await Util.getClearingOPOdataStructure(oClearingApplicationModel, aClearingData, true);
            let aSOAUpdate = aClearingData.filter(line=> ( line.Clearable !== false || line.SoaReference !== "" || Number(line.ClearableAmount) !== 0)
            || ( line.Clearable === false && line.SoaReference === "" && line.SoaLineId === "" && line.IsSOAFieldsModified  ) ).map(line => {
                return {
                    No: Number(line.No),
                    SoaCount: line.SoaCount,
                    SoaReference: line.SoaReference,
                    Clearable: line.Clearable,
                    ClearableAmount: line.ClearableAmount,
                    Opbel: line.Opbel,
                    Item: line.Item,
                    RepItem: line.RepItem,
                    SubItem: line.SubItem,
                    IntRef: line.IntRef,
                    SoaLineId: line.SoaLineId,
                    SoaComments: line.SoaComments,
                    SoaId: line.SoaId,
                    OrigCurr: line.OrigCurr,
                    IsSOAFieldsModified: line.IsSOAFieldsModified
                };
            });
            let oPayload = {
                // Action: "SOAUpdate",
                SOAUpdate: aSOAUpdate
                // SOAUpdateCheckResponse: {},
                // ClearingOP: []
            };

            try {
                // var oResponse = await Util.create(oClearingModel, "/DeepOPSet", oPayload);

                var oResponse = await Util.create(oClearingApplicationModel, "/SOAUpdate", oPayload);
                if (oResponse) {
                    let results = oResponse.results;
                    aClearingData.forEach((line) => {
                        let sSoaCount = results.find(x => Number(x.No) === Number(line.No))?.SoaCount;
                        line.SoaCount = sSoaCount;
                    }
                    );
                    oClearingController.getView().getModel().setProperty("/SelectionResult", aClearingData);
                    MessageBox.success(oClearingController.getResourceBundle().getText("SOAUpdateSuccess"));
                }

            }
            catch (error) {
                MessageBox.error(oClearingController.getResourceBundle().getText("CommError"));
                // throw new Error(oClearingController.getResourceBundle().getText("CommError"));
            }
        },



        _openDialogForUnSelectedTaxPairsOnSOASave: function (aTaxPairs) {

            const oView = oClearingController.getView();

            let oData = {
                taxPairs: aTaxPairs
            };
            if (!oClearingController._taxPairUnSelected) {
                oClearingController.Fragment.load({
                    name: "atom.ui.clearing.clearingapplication.view.fragments.TaxPairUnSelected",
                    controller: oClearingController
                }).then(function (oFragment) {
                    oClearingController._taxPairUnSelected = oFragment;
                    oClearingController._taxPairUnSelected.setModel(new sap.ui.model.json.JSONModel(oData));
                    oView.addDependent(oClearingController._taxPairUnSelected);
                    oClearingController._taxPairUnSelected.open();
                });
            } else {
                oClearingController._taxPairUnSelected.setModel(new sap.ui.model.json.JSONModel(oData));
                oClearingController._taxPairUnSelected.open();
            }

        },

        /**
         * Event handler for the "Cancel" button press.
         * This function closes the parent control (typically a dialog or popover) of the button that triggered the event.
         *
         * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
         */
        onCancelButtonPress: function (oEvent) {
            oEvent.getSource().getParent().close();
        },


        getUnSelectedTaxPairs: function (aClearingData) {

            let aTaxPairs = [];

            let oRelavantItems = aClearingData.filter((item) => (item.Clearable === true || item.SoaReference !== "" || parseFloat(item.ClearableAmount) !== 0) && (
                // TrType contains AP* or DP*             
                item.TrType.startsWith("AP") || item.TrType.startsWith("DP") || item.TrType.startsWith("RP"))
            );

            oRelavantItems.forEach((item) => {
                let oRelavantItem = aClearingData.find((line) => line.Clearable === false && line.SoaReference === "" &&
                    parseFloat(line.ClearableAmount) === 0 && line.TrType.substring(0, 2) === item.TrType.substring(0, 2) && item.IntRef === line.IntRef &&
                    item.EndorsementRef === line.EndorsementRef && item.Installment === line.Installment);
                if (!oRelavantItem) {
                    return;
                }
                let oTaxPair = {
                    IntRef: oRelavantItem.IntRef,
                    EndorsementRef: oRelavantItem.EndorsementRef,
                    TrType: oRelavantItem.TrType,
                    Installment: oRelavantItem.Installment
                };
                aTaxPairs.push(oTaxPair);
            });

            return aTaxPairs;
        },

        copySOAReference: function (sSoaReference) {
            // var sSoaReference = Element.getElementById("soaRefInput").getValue();

            let aClearingTableData = oClearingController.getView().getModel().getData()?.SelectionResult;

            for (const item of aClearingTableData) {
                const oObject = item;
                if (oObject.Clearable === true && oObject.SoaReference === "" && Constants.ClearingStatusValidForClearing.includes(oObject.ClearingStatus)) {
                    oObject.SoaReference = sSoaReference;
                }
            }

            oClearingController.getView().getModel().setProperty("/SelectionResult", aClearingTableData);
            sap.m.MessageToast.show(oClearingController.getResourceBundle().getText("SoaCopySuccess"));
            oClearingController._oCopySOARefDialog.close();
        },

        clearSOAReference: function (sSoaReference) {

            var aClearingTableData = oClearingController.getView().getModel().getData()?.SelectionResult;
            const oClearingModel = oClearingController.getView().getModel("clearingApplicationModel");

            if (!aClearingTableData.find(line => line.SoaReference === sSoaReference && Constants.ClearingStatusValidForClearing.includes(line.ClearingStatus))) {
                sap.m.MessageToast.show(oClearingController.getResourceBundle().getText("NoSOARefFound"));
                return;
            }

            MessageBox.warning(`Are you sure you want to delete Data for '${sSoaReference}' SOA Reference?`, {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: async function (sAction) {
                    if (sAction === MessageBox.Action.CANCEL) {
                        return;
                    }
                    oClearingController._oClearSOARefDialog.setBusy(true);
                    let oPayload = {
                        ClearSOATable: aClearingTableData.filter(item => item.SoaReference === sSoaReference && Constants.ClearingStatusValidForClearing.includes(item.ClearingStatus)).map(item => ({
                            Opbel: item.Opbel,
                            Opupw: item.RepItem,
                            Opupk: item.Item,
                            Opupz: item.SubItem,
                            IntRef: item.IntRef
                        }))
                    };

                    try {
                        await Util.create(oClearingModel, "/ClearSOAReference", oPayload);
                        for (const item of aClearingTableData) {
                            if (item.SoaReference === sSoaReference && Constants.ClearingStatusValidForClearing.includes(item.ClearingStatus)) {
                                item.SoaReference = "";
                                item.SoaLineId = "";
                                item.ClearableAmount = "0.00";
                                item.SoaComments = "";
                                item.Clearable = false;
                            }
                        }

                        oClearingController.getView().getModel().setProperty("/SelectionResult", aClearingTableData);
                        oClearingController._oClearSOARefDialog.close();
                        MessageBox.success(oClearingController.getResourceBundle().getText("SoaClearSuccess"));
                        oClearingController._oClearSOARefDialog.setBusy(false);

                    } catch (error) {
                        MessageBox.error(oClearingController.getResourceBundle().getText("CommError"));
                        oClearingController._oClearSOARefDialog.setBusy(false);
                    }

                }
            });




        },

        updateROE: async function (sROE) {

            let aClearingTableData = oClearingController.getView().getModel().getData().SelectionResult;

            let sRoeToBeUpdated = parseFloat(sROE).toFixed(5);
            let isRoeClearedForAnyItem = false;
            for await (const oLine of aClearingTableData) {
                if (!oLine.isSelected || oLine.OrigCurr === oLine.ExpPayCurr) {
                    continue;
                }
                oLine.RoeRecCurr = sRoeToBeUpdated;

                // Update Expected payment amount
                oLine.ExpPayAmn = "0.00";
                if (oLine.RoeRecCurr === oLine.RoeTr) {
                    oLine.ExpPayAmn = oLine.SettAmnRoeTr;
                } else {
                    oLine.ExpPayAmn = await Util.convLocalCurrency(oClearingController, oLine.Amn, oLine.OrigCurr, oLine.ExpPayCurr, oLine.RoeRecCurr);
                }

                // Update Allocate amount in settlement currency
                oLine.AllocAmnSettCurr = "0.00";
                if (oLine.RoeRecCurr === oLine.RoeTr && oLine.AllocAmn === oLine.Amn) {
                    oLine.AllocAmnSettCurr = oLine.SettAmnRoeTr;
                } else {
                    oLine.AllocAmnSettCurr = await Util.convLocalCurrency(oClearingController, oLine.AllocAmn, oLine.OrigCurr, oLine.ExpPayCurr, oLine.RoeRecCurr);
                }

                // Update Delta due ROE
                if (oLine.RoeRecCurr === oLine.RoeTr || oLine.FixedRoe === true || oLine.OrigCurr === oLine.ExpPayCurr) {
                    oLine.DeltaDueRoe = "0.00";
                } else {
                    let localAmount = "0.00";
                    if (oLine.AllocAmn === oLine.Amn) {
                        localAmount = oLine.SettAmnRoeTr;
                    } else {
                        localAmount = await Util.convLocalCurrency(oClearingController, oLine.AllocAmn, oLine.OrigCurr, oLine.ExpPayCurr, oLine.RoeTr);
                    }

                    oLine.DeltaDueRoe = (parseFloat(oLine.AllocAmnSettCurr) - parseFloat(localAmount)).toFixed(2);
                }
                isRoeClearedForAnyItem = true;
            }

            oClearingController.getView().getModel().setProperty("/SelectionResult", aClearingTableData);
            if (isRoeClearedForAnyItem) {
                sap.m.MessageBox.success(oClearingController.getResourceBundle().getText("RoeUpdateSuccess"));
            } else {
                sap.m.MessageBox.warning(oClearingController.getResourceBundle().getText("NoItemForRoeUpdate"));
            }
        },

        onRoeRecCurrInputChange: async function (oContext) {
            let currentSelectedItem = oContext.getModel().getProperty(oContext.sPath),
                oModel = oContext.getModel();

            // Format it to 5 decimal places
            oModel.setProperty(oContext.sPath + "/RoeRecCurr", Number(currentSelectedItem.RoeRecCurr).toFixed(5), oContext);

            if ((parseFloat(currentSelectedItem.RoeRecCurr) === parseFloat(currentSelectedItem.RoeTr))) {
                oModel.setProperty(oContext.sPath + "/ExpPayAmn", oModel.getProperty(oContext.sPath + "/SettAmnRoeTr"), oContext);
            }
            else {
                // Exp Pay Amount
                let localAmount = await Util.convLocalCurrency(oClearingController, currentSelectedItem.Amn,
                    currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeRecCurr);
                oModel.setProperty(oContext.sPath + "/ExpPayAmn", localAmount, oContext);

                // Allocated Amount In Settlement Currency
                //ls_alv_main-alloc_amn EQ ls_alv_main-amn AND ls_alv_main-roe_rec_curr EQ ls_alv_main-roe_tr.
                if (parseFloat(currentSelectedItem.AllocAmn) === parseFloat(currentSelectedItem.Amn) &&
                    (parseFloat(currentSelectedItem.RoeRecCurr) === parseFloat(currentSelectedItem.RoeTr))) {
                    oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", oModel.getProperty(oContext.sPath + "/SettAmnRoeTr"), oContext);
                } else {
                    let localAmount1 = await Util.convLocalCurrency(oClearingController, currentSelectedItem.AllocAmn,
                        currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeRecCurr);
                    oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", localAmount1, oContext);
                }
            }

            // Update Delta Due ROE
            if ((parseFloat(currentSelectedItem.RoeRecCurr) === parseFloat(currentSelectedItem.RoeTr)) ||
                currentSelectedItem.FixedRoe === true || (parseFloat(currentSelectedItem.ExpPayCurr) === parseFloat(currentSelectedItem.OrigCurr))) {
                oModel.setProperty(oContext.sPath + "/DeltaDueRoe", "0.00", oContext);

            } else {
                let localAmount = "0.00";
                if (parseFloat(currentSelectedItem.AllocAmn) === parseFloat(currentSelectedItem.Amn)) {
                    localAmount = currentSelectedItem.SettAmnRoeTr;
                } else {
                    localAmount = await Util.convLocalCurrency(oClearingController, currentSelectedItem.AllocAmn,
                        currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeTr);
                }
                let deltaDueRoe = parseFloat(currentSelectedItem.AllocAmnSettCurr) - parseFloat(localAmount);
                oModel.setProperty(oContext.sPath + "/DeltaDueRoe", deltaDueRoe.toFixed(2), oContext);
            }

        }
    };
}
);