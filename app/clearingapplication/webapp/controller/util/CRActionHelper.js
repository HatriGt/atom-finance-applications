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

        clearingItemSelected: async function (oContext, that, currentSelectedItem) {
            const aSelectionResult = that.getView().getModel().getData().SelectionResult,
                oModel = oContext.getModel();
            const aOneSelectedItemIndex = that.byId("idClearingTable").getSelectedIndices();
            const oOneSelectedItem = aOneSelectedItemIndex.length > 0 ? aSelectionResult[aOneSelectedItemIndex[0]] : undefined;
            if (oOneSelectedItem && oOneSelectedItem.ExpPayCurr !== currentSelectedItem.ExpPayCurr) {
                MessageBox.error(that.getResourceBundle().getText("expPayCurrDiffError"));

            }

            let oObject = oModel.getProperty(oContext.sPath);

            // Select the checkbox
            oObject.isSelected = true;

            // Make AllocAmn editable
            oObject.isAllocAmnEditable = true;

            // Set Exp Pay Amn as Alloc Amn Sett Currency
            oObject.AllocAmnSettCurr = currentSelectedItem.ExpPayAmn;

            // Set Amn to Alloc Amn
            oObject.AllocAmn = currentSelectedItem.Amn;

            // Update the model
            oModel.setProperty(oContext.sPath, oObject);

        },

        clearingItemUnSelected: async function (oContext) {
            const oModel = oContext.getModel();

            let oObject = oModel.getProperty(oContext.getPath());

            // UnSelect the Checkbox
            oObject.isSelected = false;

            // Clear the values
            oObject.AllocAmn = "0.00";
            oObject.AllocAmnSettCurr = "0.00";

            // Make Fields Non-Editable
            oObject.isAllocAmnEditable = false;

            oModel.setProperty(oContext.getPath(), oObject);
        },

        calculateClearingAmnDifference: function (that) {

            let oModel = that.getView().getModel(),
                oData = oModel.getData(),
                aProcessingStatus = oData.ProcessingStatus,
                sumMap = new Map();

            // Sum the AllocAmnSettCurr values for each unique combination in aSelectedSelectionResult
            oData.SelectionResult.forEach((item) => {
                if (!item.isSelected) { return; }
                let key = `${item.BpId}-${item.BpName}-${item.ExpPayCurr}`;
                if (!sumMap.has(key)) {
                    sumMap.set(key, 0);
                }
                sumMap.set(key, sumMap.get(key) + parseFloat(item.AllocAmnSettCurr));
            });

            // Update the AllocAmnSettCurr in aProcessingStatus with the summed values
            aProcessingStatus.forEach((item) => {
                let key = `${item.BpId}-${item.BpName}-${item.CurrencyCode}`;
                if (sumMap.has(key)) {
                    item.DifferenceAmn = sumMap.get(key).toFixed(3); // Assuming 3 decimal places
                } else {
                    item.DifferenceAmn = "0.00";
                }
                if (parseFloat(item.DifferenceAmn) === 0) {
                    item.StatusIcon = Constants.iconGreen;
                    item.StatusColor = Constants.colorGreen;
                } else {
                    item.StatusIcon = Constants.iconRed;
                    item.StatusColor = Constants.colorRed;
                }
            });

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
                // If Alloc Amn is reset to Zero, then reset the values of Alloc Amn SettCurr -- New Own
                oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", "0.00", oContext);
                return;
            }

            if (currentSelectedItem.AllocAmn === currentSelectedItem.Amn && currentSelectedItem.RoeRecCurr === currentSelectedItem.RoeTr) {
                oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", currentSelectedItem.SettAmnRoeTr, oContext);
            } else {
                let localAmount = await Util.convLocalCurrency(that, currentSelectedItem.AllocAmn, currentSelectedItem.OrigCurr, currentSelectedItem.ExpPayCurr, currentSelectedItem.RoeRecCurr);
                oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", localAmount, oContext);
            }

        },

        _proceedToClear: async function () {

            let oClearingApplicationModel = oClearingController.getOwnerComponent().getModel("clearingApplicationModel");


            this._validateBeforeClearing();

            let oPayload = this._createClearingPayload();
            try {

                let oResponse = await Util.create(oClearingApplicationModel, "/ClearClaimReceivables", oPayload);
                if (oResponse) {
                    console.log(oResponse);
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
                GL_ACCOUNT_CHARGES: oBankAccountDetail?.GLAccountCharges
            };


            aSelectedTransactionsForClearing.forEach((item) => {

                let oClearingData = {
                    HEADER_DATA: oHeaderData,
                    BUSINESS_PARTNER_NO: item.BpId,
                    TRANSACTION_TYPE: item.TrType,
                    BIT_REFERENCE: item.BitRef,
                    INTERNAL_REFERENCE_NO: item.IntRef,
                    EXTERNAL_REFERENCE_NO: item.ExtRef,
                    ORIGINAL_CURRENCY: item.OrigCurr,
                    AMOUNT_CLEARED: item.AllocAmnSettCurr, // AllocAmnSettCurr
                    EXPECTED_PAY_CURRENCY: item.ExpPayCurr, // Curr for AMOUNT_CLEARED
                    ROE_REC_CURRENCY: item.RoeRecCurr, // Needed ?
                    DUE_DATE: item.DueDate?.toISOString()?.substring(0, 10),
                    UMR: item.Umr,
                    UCR: item.Ucr,
                    CLAIM_REFERENCE: item.ClaimId,
                    TRANSACTION_REFERENCE: item.TrRefNum,
                    UWAY: item.Uway,
                    COLLECTION_TYPE: item.CollType,
                    CONTRACT_ACCOUNT: item.Vkont,
                    MEMBERBPID: item.MemberId,
                    DOCUMENT_NUMBER: item.Opbel,
                    ITEM_NUMBER: item.Item,
                    REP_ITEM: item.RepItem,
                    SUB_ITEM: item.SubItem,
                    FIXED_ROE: item.FixedRoe,
                    PAYMENT_REF: item.PaymentRef,
                    ALLOCAMN: item.AllocAmn,
                    DOCUMENT_TYPE: item.Blart,
                    HVORG: item.Hvorg,
                    POSTING_TYPE: item.PostingType,
                    ORIGIN: item.Origin,
                    AGREEMENT_ID: item.AgreementId,
                    FRONTING_AGREEMENT_ID: item.FrontingAgreementId,
                    STAMP_MEMBER_ID: item.StampMemberId,
                    AGREEMENT_TYPE: item.AgreementType
                };
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

            let aClearingData = oClearingController.getView().getModel().getData().SelectionResult;
            let oClearingApplicationModel = oClearingController.getView().getModel("clearingApplicationModel");
            let aClearingOP = await Util.getClearingOPOdataStructure(oClearingApplicationModel, aClearingData, true);
            let oPayload = {
                // Action: "SOAUpdateCheck",
                SOAUpdate: aClearingOP
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
            let aClearingOP = await Util.getClearingOPOdataStructure(oClearingApplicationModel, aClearingData, true);
            let oPayload = {
                // Action: "SOAUpdate",
                SOAUpdate: aClearingOP
                // SOAUpdateCheckResponse: {},
                // ClearingOP: []
            };

            try {
                // var oResponse = await Util.create(oClearingModel, "/DeepOPSet", oPayload);

                var oResponse = await Util.create(oClearingApplicationModel, "/SOAUpdate", oPayload);
                if (oResponse) {
                    let results = oResponse.results;
                    aClearingData.forEach((line) => {
                        let sSoaCount = results.find(x => x.No === line.No)?.SoaCount;
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
            const oClearingModel = oClearingController.getOwnerComponent().getModel("clearingModel");

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
                    oClearingController.getView().setBusy(true);
                    let oPayload = {
                        Action: "ClearSOATable",
                        ClearSOATable: aClearingTableData.filter(item => item.SoaReference === sSoaReference && Constants.ClearingStatusValidForClearing.includes(item.ClearingStatus)).map(item => ({
                            Opbel: item.Opbel,
                            Opupw: item.RepItem,
                            Opupk: item.Item,
                            Opupz: item.SubItem,
                            IntRef: item.IntRef
                        }))
                    };

                    try {
                        await Util.create(oClearingModel, "/DeepOPSet", oPayload);
                        for (const oObject of aClearingTableData) {
                            if (oObject.SoaReference === sSoaReference && Constants.ClearingStatusValidForClearing.includes(oObject.ClearingStatus)) {
                                oObject.SoaReference = "";
                                oObject.SoaLineId = "";
                                oObject.ClearableAmount = "0.00";
                                oObject.SoaComments = "";
                                oObject.Clearable = false;
                            }
                        }

                        oClearingController.getView().getModel().setProperty("/SelectionResult", aClearingTableData);
                        oClearingController._oClearSOARefDialog.close();
                        MessageBox.success(oClearingController.getResourceBundle().getText("SoaClearSuccess"));
                        oClearingController.getView().setBusy(false);

                    } catch (error) {
                        MessageBox.error(oClearingController.getResourceBundle().getText("CommError"));
                        oClearingController.getView().setBusy(false);
                    }

                }.bind(this)
            });




        },

        onRoeRecCurrInputChange: async function (oContext) {
            let currentSelectedItem = oContext.getModel().getProperty(oContext.sPath),
                oModel = oContext.getModel();


            MessageBox.error(`Enter an Amount less than or equal to ${currentSelectedItem.Amn} `);
            oModel.setProperty(oContext.sPath + "/AllocAmn", 0, oContext);

            if ((parseFloat(currentSelectedItem.RoeRecCurr) === parseFloat(currentSelectedItem.RoeTr))) {
                oModel.setProperty(oContext.sPath + "/ExpPayAmn", oModel.getProperty("/SettAmnRoeTr"), oContext);
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
                    oModel.setProperty(oContext.sPath + "/AllocAmnSettCurr", oModel.getProperty("/SettAmnRoeTr"), oContext);
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