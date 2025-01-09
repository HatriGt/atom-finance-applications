/* eslint-disable no-console */
sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "../model/formatter",
    "./util/util",
    "../model/constants",
    "sap/m/MessageBox",
    "atom/ui/clearing/clearingapplication/controller/util/ActionHelper",
    "../model/mockdata"
],
    /**
     * @namespace atom.ui.clearing.clearingapplication.controller
     * @extends atom.ui.clearing.clearingapplication.controller.BaseController
     * @alias atom.ui.clearing.clearingapplication.controller.MainView
     *
     * @param {atom.ui.clearing.clearingapplication.controller.BaseController} BaseController Base controller for all controllers.
     * @param {sap.ui.model.json.JSONModel} JSONModel JSON model for data binding.
     * @param {sap.m.Token} Token Token control for representing items within a Tokenizer.
     * @param {sap.ui.core.Fragment} Fragment UI5 core fragment.
     * @param {sap.ui.model.Filter} Filter Filter for arrays.
     * @param {sap.ui.model.FilterOperator} FilterOperator Operators for filtering.
     * @param {sap.m.MessageToast} MessageToast Toast message popup.
     * @param {Object} formatter Formatter for model data.
     * @param {Object} util Utility functions.
     * @param {Object} Constants Constants.
     * @param {sap.m.MessageBox} MessageBox MessageBox control
     * @param {Object} ActionHelper Action Helper
     * @param {Object} MockData - Mock data for testing and development
     * @ui5view {atom.ui.clearing.clearingapplication.view.MainView}
     * @returns {sap.ui.core.mvc.Controller} A new MainView controller instance
     */
    function (BaseController,
        JSONModel,
        Token,
        Fragment,
        Filter,
        FilterOperator,
        MessageToast,
        formatter,
        util,
        constants,
        MessageBox,
        ActionHelper, MockData) {
        "use strict";

        return BaseController.extend("atom.ui.clearing.clearingapplication.controller.MainView", {
            formatter: formatter,
            util: util,
            onInit: async function () {
                // Load initial tab content
                this._loadTabContent("idPremiumReceivablesIconTabFilter");
            },


            _loadTabContent: function (sTabId) {

                var oIconTabFilter = this.byId(sTabId);
                var sFragmentName;

                if (sTabId === "idPremiumReceivablesIconTabFilter") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.PremiumReceivables";
                } else if (sTabId === "idClaimReceivablesIconTabFilter") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.ClaimReceivables";
                }
                else if (sTabId === "idPremiumPayablesIconTabFilter") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.PremiumPayables";
                } else if (sTabId === "idClaimPayablesIconTabFilter") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.ClaimPayables";
                }


                if (sFragmentName) {
                    sap.ui.core.Fragment.load({
                        name: sFragmentName,
                        controller: this,
                        id: "PremiumReceivables"
                    }).then(function (oFragmentContent) {
                        oIconTabFilter.addContent(oFragmentContent);
                        this._SelectedIconTab = this.byId("idIconTabBar").getSelectedKey();
                        let fnValidator = function (args) {
                            var text = args.text;
                            return new Token({ key: text, text: text });
                        };
                        sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").addValidator(fnValidator);
                        sap.ui.core.Fragment.byId(this._SelectedIconTab, "idSOAReferenceMultiInput").addValidator(fnValidator);
                        sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput").addValidator(fnValidator);
                        if (sTabId === "idClaimReceivablesIconTabFilter") {
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idClaimIDMultiInput").addValidator(fnValidator);
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idTransRefMultiInput").addValidator(fnValidator);
                        }
                    }.bind(this)).catch(function (oError) {
                        // Handle any errors that occur during fragment loading
                        console.error("Error loading fragment:", oError);
                    });
                }

            },

            onIconTabBarSelect: function (oEvent) {

                const that = this;
                var oSelectedTab = oEvent.getParameter("selectedItem");
                var oIconTabBar = this.byId("idIconTabBar");

                // Destroy the content of all tabs
                if (this._oValueHelpDialog) {
                    this._oValueHelpDialog.destroy();
                    this._oValueHelpDialog = null;
                }
                oIconTabBar.getItems().forEach(function (oItem) {
                    oItem.destroyContent();
                });

                // Clear the Selection model
                this.getView().setModel(new JSONModel(
                    {
                        "CompanyCode": "",
                        "EnterInsuredName": "",
                        "Payment": 0.00,
                        "BankCharge": 0.00,
                        "Currency": "",
                        "PostingDate": null,
                        "PostingDateMinDate": new Date("2001-01-01"),
                        "Division": "",
                        "ElsecoBankAccountNumber": ""
                    }
                ), "selectionModel");

                // Define the path to the fragment based on the selected tab
                var sFragmentName;
                if (oSelectedTab.getKey() === "PremiumReceivables") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.PremiumReceivables";
                } else if (oSelectedTab.getKey() === "ClaimReceivables") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.ClaimReceivables";
                } else if (oSelectedTab.getKey() === "PremiumPayables") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.PremiumPayables";
                } else if (oSelectedTab.getKey() === "ClaimPayables") {
                    sFragmentName = "atom.ui.clearing.clearingapplication.view.fragments.mainpage.ClaimPayables";
                }

                // Load and add the fragment content to the selected tab
                if (sFragmentName) {
                    // Load the fragment and add it to the selected tab
                    sap.ui.core.Fragment.load({
                        name: sFragmentName,
                        controller: this,
                        id: oSelectedTab.getKey()
                    }).then(function (oFragmentContent) {
                        oSelectedTab.removeAllContent(); // Remove existing content if any
                        oSelectedTab.addContent(oFragmentContent);
                        this._SelectedIconTab = this.byId("idIconTabBar").getSelectedKey();
                        const fnValidator = function (args) {
                            var text = args.text;
                            return new Token({ key: text, text: text });
                        };

                        if (["PremiumReceivables"].includes(this._SelectedIconTab)) {
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idSOAReferenceMultiInput").addValidator(fnValidator);
                        }
                        if (["PremiumReceivables", "ClaimReceivables", "PremiumPayables"].includes(this._SelectedIconTab)) {
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").addValidator(fnValidator);
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput").addValidator(fnValidator);
                        }
                        if (["PremiumPayables"].includes(this._SelectedIconTab)) {
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUWYearMultiInput").addValidator(fnValidator);
                        }
                        if (["ClaimPayables"].includes(this._SelectedIconTab)) {
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").addValidator(fnValidator);
                        }
                        if (["ClaimReceivables"].includes(this._SelectedIconTab)) {
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idClaimIDMultiInput").addValidator(fnValidator);
                            sap.ui.core.Fragment.byId(this._SelectedIconTab, "idTransRefMultiInput").addValidator(fnValidator);
                        }
                    }.bind(this)).catch(function (oError) {
                        console.error("Error loading fragment:", oError);
                    });
                }

            },

            /**
             * Handles the execution of the Execute button press event.
             * 
             * This method retrieves various tokens from input fields, validates mandatory fields, constructs a payload object,
             * and sends a GET request to the on-prem. If the request is successful, it navigates to the "RouteClearingView" route.
             * In case of an error, it displays a message toast with a communication error message.
             * 
             * @memberof atom.ui.clearing.clearingapplication.controller.MainView
             */
            onExecuteButtonPremiumReceivablesPress: async function () {

                let oSelectionModel = this.getView().getModel("selectionModel");

                // Perform input validation
                if (!window.location.href.includes("applicationstudio.cloud.sap") && !window.location.href.includes("localhos")) {
                    if (!this._validatePRBeforeExecute()) {
                        return;
                    }
                }

                // Convert the payload to Binary64 
                let oData = window.location.href.includes("applicationstudio.cloud.sap") === false && window.location.href.includes("localhos") === false ? {
                    "CompanyCode": oSelectionModel.getProperty("/CompanyCode"),
                    "BusinessPartners": oSelectionModel.getProperty("/BusinessPartners"),
                    "ExternalReferenceNumbers": oSelectionModel.getProperty("/ExternalReferenceNumbers"),
                    "SoaReferenceNumbers": oSelectionModel.getProperty("/SoaReferenceNumbers"),
                    "PolicyNumber": oSelectionModel.getProperty("/PolicyNumber"),
                    "UMRNumbers": oSelectionModel.getProperty("/UMRNumbers"),
                    "ElsecoBankAccountNumber": oSelectionModel.getProperty("/ElsecoBankAccountNumber"),
                    "InsuredName": oSelectionModel.getProperty("/InsuredName"),
                    "Payment": oSelectionModel.getProperty("/Payment"),
                    "BankCharge": oSelectionModel.getProperty("/BankCharge"),
                    "Currency": oSelectionModel.getProperty("/Currency"),
                    "PostingDate": oSelectionModel.getProperty("/PostingDate") !== null && oSelectionModel.getProperty("/PostingDate") !== undefined
                        ? oSelectionModel.getProperty("/PostingDate").split("T")[0].replace(/-/g, "") : null,
                    "Division": oSelectionModel.getProperty("/Division")
                } : MockData.SelectParametersSOA;
                // let oData = MockData.SelectParametersSOA;

                this.getView().setBusy(true);

                try {

                    let oClearingApplicationModelV4 = this.getOwnerComponent().getModel("clearingApplicationModelV4");
                    await oClearingApplicationModelV4.getMetaModel().requestData();

                    let oGetPremiumBindingContext = oClearingApplicationModelV4.bindContext("/GetPremiumReceivables(...)");

                    oGetPremiumBindingContext.setParameter("SelectionFilters", JSON.stringify(oData));
                    oGetPremiumBindingContext.execute().then(() => {
                        let result = oGetPremiumBindingContext.getBoundContext().getObject();
                        let oClearingData = {
                            SelectionParameters: oData,
                            BankAccountNumbers: this.getView().getModel("localModel").getProperty("/BankAccountNumbers"),
                            SelectionResult: result.value
                        };
                        oClearingData.SelectionResult.forEach(line => {
                            line.DueDate = util.convertToTimeStamp(line.DueDate);
                            line.InceptionDate = util.convertToTimeStamp(line.InceptionDate);
                            line.ExpiryDate = util.convertToTimeStamp(line.ExpiryDate);
                        });
                        this.getOwnerComponent().setModel(new JSONModel(oClearingData), "clearingPageModel");
                        this.getOwnerComponent().getRouter().navTo("RoutePremiumReceivablesClearingView", {}, {}, true);
                        this.getView().setBusy(false);
                    }).catch((error) => {
                        MessageBox.error(error?.message?.toString() ||
                            (typeof error === "string" ? error :
                                this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                        this.getView().setBusy(false);
                        return;
                    });
                } catch (error) {
                    MessageBox.error(error?.message?.toString() ||
                        (typeof error === "string" ? error :
                            this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                    this.getView().setBusy(false);
                    return;
                }

            },
            /**
             * Handles the execution of the Execute button press event.
             * 
             * This method retrieves various tokens from input fields, validates mandatory fields, constructs a payload object,
             * and sends a GET request to the on-prem. If the request is successful, it navigates to the "RouteClearingView" route.
             * In case of an error, it displays a message toast with a communication error message.
             * 
             * @memberof atom.ui.clearing.clearingapplication.controller.MainView
             */
            onExecuteButtonPremiumPayablesPress: async function () {

                let oSelectionModel = this.getView().getModel("selectionModel");

                // Perform input validation
                if (!window.location.href.includes("applicationstudio.cloud.sap") && !window.location.href.includes("locaalhos")) {
                    if (!this._validatePPBeforeExecute()) {
                        return;
                    }
                }

                // Convert the payload to Binary64 
                let oData = window.location.href.includes("applicationstudio.cloud.sap") === false && window.location.href.includes("locaalhos") === false ? {
                    "CompanyCode": oSelectionModel.getProperty("/CompanyCode"),
                    "BusinessPartners": oSelectionModel.getProperty("/BusinessPartners"),
                    "ExternalReferenceNumbers": oSelectionModel.getProperty("/ExternalReferenceNumbers"),
                    "SoaReferenceNumbers": oSelectionModel.getProperty("/SoaReferenceNumbers"),
                    "PolicyNumber": oSelectionModel.getProperty("/PolicyNumber"),
                    "UMRNumbers": oSelectionModel.getProperty("/UMRNumbers"),
                    "ElsecoBankAccountNumber": oSelectionModel.getProperty("/ElsecoBankAccountNumber"),
                    "InsuredName": oSelectionModel.getProperty("/InsuredName"),
                    "Payment": oSelectionModel.getProperty("/Payment"),
                    "BankCharge": oSelectionModel.getProperty("/BankCharge"),
                    "Currency": oSelectionModel.getProperty("/Currency"),
                    "PostingDate": oSelectionModel.getProperty("/PostingDate") !== null && oSelectionModel.getProperty("/PostingDate") !== undefined
                        ? oSelectionModel.getProperty("/PostingDate").split("T")[0].replace(/-/g, "") : null,
                    "Division": oSelectionModel.getProperty("/Division"),
                    "UWYears": oSelectionModel.getProperty("/UWYears"),
                    "Fronter": oSelectionModel.getProperty("/FronterID"),
                    "Members": oSelectionModel.getProperty("/MemberIDs"),
                    "PayablePostingStartDate": oSelectionModel.getProperty("/PayablePostingStartDate"),
                    "PayablePostingEndDate": oSelectionModel.getProperty("/PayablePostingEndDate")
                } : MockData.SelectParametersPP;
                // let oData = MockData.SelectParametersSOA;

                this.getView().setBusy(true);

                try {

                    let oClearingApplicationModelV4 = this.getOwnerComponent().getModel("clearingApplicationModelV4");
                    await oClearingApplicationModelV4.getMetaModel().requestData();

                    let oGetPremiumBindingContext = oClearingApplicationModelV4.bindContext("/GetPremiumPayables(...)");

                    oGetPremiumBindingContext.setParameter("SelectionFilters", JSON.stringify(oData));
                    oGetPremiumBindingContext.execute().then(() => {
                        let result = oGetPremiumBindingContext.getBoundContext().getObject();
                        let oClearingData = {
                            SelectionParameters: oData,
                            BankAccountNumbers: this.getView().getModel("localModel").getProperty("/BankAccountNumbers"),
                            SelectionResult: result.value
                        };
                        oClearingData.SelectionResult.forEach(line => {
                            line.DueDate = util.convertToTimeStamp(line.DueDate);
                            line.InceptionDate = util.convertToTimeStamp(line.InceptionDate);
                            line.ExpiryDate = util.convertToTimeStamp(line.ExpiryDate);
                        });
                        this.getOwnerComponent().setModel(new JSONModel(oClearingData), "clearingPageModel");
                        this.getOwnerComponent().getRouter().navTo("RoutePremiumPayablesClearingView", {}, {}, true);
                        this.getView().setBusy(false);
                    }).catch((error) => {
                        MessageBox.error(error?.message?.toString() ||
                            (typeof error === "string" ? error :
                                this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                        this.getView().setBusy(false);
                        return;
                    });
                } catch (error) {
                    MessageBox.error(error?.message?.toString() ||
                        (typeof error === "string" ? error :
                            this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                    this.getView().setBusy(false);
                    return;
                }

            },
            /**
             * Handles the execution of the Execute button press event.
             * 
             * This method retrieves various tokens from input fields, validates mandatory fields, constructs a payload object,
             * and sends a GET request to the on-prem. If the request is successful, it navigates to the "RouteClearingView" route.
             * In case of an error, it displays a message toast with a communication error message.
             * 
             * @memberof atom.ui.clearing.clearingapplication.controller.MainView
             */
            onExecuteButtonClaimReceivablesPress: async function () {

                let oSelectionModel = this.getView().getModel("selectionModel");

                // Perform input validation
                if (!window.location.href.includes("applicaationstudio.cloud.sap") && !window.location.href.includes("localhos")) {
                    if (!this._validateCRBeforeExecute()) {
                        return;
                    }
                }

                // Convert the payload to Binary64 
                let oData = window.location.href.includes("aapplicationstudio.cloud.sap") === false && window.location.href.includes("localhos") === false ? {
                    "CompanyCode": oSelectionModel.getProperty("/CompanyCode"),
                    "BusinessPartners": oSelectionModel.getProperty("/BusinessPartners"),
                    "ExternalReferenceNumbers": oSelectionModel.getProperty("/ExternalReferenceNumbers"),
                    "UCRNumbers": oSelectionModel.getProperty("/UMRNumbers"),
                    "ElsecoBankAccountNumber": oSelectionModel.getProperty("/ElsecoBankAccountNumber"),
                    "Payment": oSelectionModel.getProperty("/Payment"),
                    "Currency": oSelectionModel.getProperty("/Currency"),
                    "PostingDate": oSelectionModel.getProperty("/PostingDate") !== null && oSelectionModel.getProperty("/PostingDate") !== undefined
                        ? oSelectionModel.getProperty("/PostingDate").split("T")[0].replace(/-/g, "") : null,
                    "Division": oSelectionModel.getProperty("/Division"),
                    "ClaimIDs": oSelectionModel.getProperty("/ClaimIDs"),
                    "TransRefs": oSelectionModel.getProperty("/TransRefs")

                } : MockData.SelectionParametersCRWorking;//SelectionParametersCR2SAJ;//SelectionParametersCR;
                // let oData = MockData.SelectParametersSOA;

                this.getView().setBusy(true);

                try {

                    let oClearingApplicationModelV4 = this.getOwnerComponent().getModel("clearingApplicationModelV4");
                    await oClearingApplicationModelV4.getMetaModel().requestData();

                    let oGetPremiumBindingContext = oClearingApplicationModelV4.bindContext("/GetClaimReceivables(...)");

                    oGetPremiumBindingContext.setParameter("SelectionFilters", JSON.stringify(oData));
                    oGetPremiumBindingContext.execute().then(() => {
                        let result = oGetPremiumBindingContext.getBoundContext().getObject();
                        let oClearingData = {
                            SelectionParameters: oData,
                            BankAccountNumbers: this.getView().getModel("localModel").getProperty("/BankAccountNumbers"),
                            SelectionResult: result.value
                        };
                        oClearingData.SelectionResult.forEach(line => {
                            line.DueDate = util.convertToTimeStamp(line.DueDate);
                            line.PostDate = util.convertToTimeStamp(line.PostDate);
                            line.InceptionDate = util.convertToTimeStamp(line.InceptionDate);
                            line.ExpiryDate = util.convertToTimeStamp(line.ExpiryDate);
                        });
                        this.getOwnerComponent().setModel(new JSONModel(oClearingData), "clearingPageModel");
                        this.getOwnerComponent().getRouter().navTo("RouteClaimReceivablesClearingView", {}, {}, true);
                        this.getView().setBusy(false);
                    }).catch((error) => {
                        MessageBox.error(error?.message?.toString() ||
                            (typeof error === "string" ? error :
                                this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                        this.getView().setBusy(false);
                        return;
                    });
                } catch (error) {
                    MessageBox.error(error?.message?.toString() ||
                        (typeof error === "string" ? error :
                            this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                    this.getView().setBusy(false);
                    return;
                }

            },

            /**
             * Handles the execution of the Execute button press event.
             * 
             * This method retrieves various tokens from input fields, validates mandatory fields, constructs a payload object,
             * and sends a GET request to the on-prem. If the request is successful, it navigates to the "RouteClearingView" route.
             * In case of an error, it displays a message toast with a communication error message.
             * 
             * @memberof atom.ui.clearing.clearingapplication.controller.MainView
             */
            onExecuteButtonClaimPayablesPress: async function () {

                let oSelectionModel = this.getView().getModel("selectionModel");

                // Perform input validation
                if (!window.location.href.includes("applicationstudio.cloud.sap") && !window.location.href.includes("locaalhos")) {
                    if (!this._validateCPBeforeExecute()) {
                        return;
                    }
                }

                // Convert the payload to Binary64 
                let oData = window.location.href.includes("applicationstudio.cloud.sap") === false && window.location.href.includes("locaalhos") === false ? {
                    "CompanyCode": oSelectionModel.getProperty("/CompanyCode"),
                    "BusinessPartners": oSelectionModel.getProperty("/BusinessPartners"),
                    "ExternalReferenceNumbers": oSelectionModel.getProperty("/ExternalReferenceNumbers"),
                    "SoaReferenceNumbers": [], // Not required for CP
                    "PolicyNumber": "", // Not required for CP
                    "UMRNumbers": oSelectionModel.getProperty("/UMRNumbers"),
                    "ElsecoBankAccountNumber": oSelectionModel.getProperty("/ElsecoBankAccountNumber"),
                    "InsuredName": oSelectionModel.getProperty("/InsuredName"),
                    "Payment": oSelectionModel.getProperty("/Payment"),
                    "BankCharge": oSelectionModel.getProperty("/BankCharge"),
                    "Currency": oSelectionModel.getProperty("/Currency"),
                    "PostingDate": oSelectionModel.getProperty("/PostingDate") !== null && oSelectionModel.getProperty("/PostingDate") !== undefined
                        ? oSelectionModel.getProperty("/PostingDate").split("T")[0].replace(/-/g, "") : null,
                    "Division": oSelectionModel.getProperty("/Division")
                } : MockData.SelectionParametersCP;
                // let oData = MockData.SelectParametersSOA;

                this.getView().setBusy(true);

                try {

                    let oClearingApplicationModelV4 = this.getOwnerComponent().getModel("clearingApplicationModelV4");
                    await oClearingApplicationModelV4.getMetaModel().requestData();

                    let oGetPremiumBindingContext = oClearingApplicationModelV4.bindContext("/GetClaimPayables(...)");

                    oGetPremiumBindingContext.setParameter("SelectionFilters", JSON.stringify(oData));
                    oGetPremiumBindingContext.execute().then(() => {
                        let result = oGetPremiumBindingContext.getBoundContext().getObject();
                        let oClearingData = {
                            SelectionParameters: oData,
                            BankAccountNumbers: this.getView().getModel("localModel").getProperty("/BankAccountNumbers"),
                            SelectionResult: result.value
                        };
                        oClearingData.SelectionResult.forEach(line => {
                            line.DueDate = util.convertToTimeStamp(line.DueDate);
                            line.InceptionDate = util.convertToTimeStamp(line.InceptionDate);
                            line.ExpiryDate = util.convertToTimeStamp(line.ExpiryDate);
                        });
                        this.getOwnerComponent().setModel(new JSONModel(oClearingData), "clearingPageModel");
                        this.getOwnerComponent().getRouter().navTo("RouteClaimPayablesClearingView", {}, {}, true);
                        this.getView().setBusy(false);
                    }).catch((error) => {
                        MessageBox.error(error?.message?.toString() ||
                            (typeof error === "string" ? error :
                                this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                        this.getView().setBusy(false);
                        return;
                    });
                } catch (error) {
                    MessageBox.error(error?.message?.toString() ||
                        (typeof error === "string" ? error :
                            this.getView().getModel("i18n").getResourceBundle().getText("CommError")));
                    this.getView().setBusy(false);
                    return;
                }

            },

            /**
            * Validates the selection criteria before execution.
            * 
            * This function checks if all mandatory fields are filled and if valid values are entered in the amount input fields.
            * It validates the selection of Business Partners, External Reference Numbers, SOA Reference Numbers, UMR Numbers,
            * and Elseco Bank Account Number. It also checks the format and validity of payment and bank charge amounts.
            * If any mandatory field is missing or invalid values are provided, it displays an error message and halts execution.
            * 
            * @returns {boolean} Returns true if all validations pass, otherwise false.
            */
            // eslint-disable-next-line max-statements
            _validateCRBeforeExecute: function () {

                let oSelectionModel = this.getView().getModel("selectionModel");
                let aSelectedBPs = [], aSelectedExterenalReferenceNumbers = [], aSelectedUMRNumbers = [], aSelectedClaimIDs = [], aSelectedTransRefs = [];
                let bpInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput"),
                    externalReferenceNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").getTokens(),
                    umrNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput").getTokens();
                let oCompanyCodeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idCompanyCodesComboBox"),
                    claimIDItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idClaimIDMultiInput").getTokens(),
                    transRefItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idTransRefMultiInput").getTokens();

                const getInputValues = (items, aResult) => {
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        aResult.push(item.getProperty("key"));
                    }
                };

                // Check if Mandatory Fields are filled
                if (!oSelectionModel.getProperty("/CompanyCode")) {
                    oCompanyCodeInput.setValueState(sap.ui.core.ValueState.Error);
                    oCompanyCodeInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseCompanyCode"));
                    return false;
                }

                if (!bpInput.data("BP_ID")) {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText(
                        this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    return false;
                } else {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.None);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText();
                    aSelectedBPs.push(bpInput.data("BP_ID"));
                    oSelectionModel.setProperty("/BusinessPartners", aSelectedBPs);
                }

                // oSelectionModel.setProperty("/BusinessPartners", aSelectedBPs);

                getInputValues(externalReferenceNumberItems, aSelectedExterenalReferenceNumbers);
                oSelectionModel.setProperty("/ExternalReferenceNumbers", aSelectedExterenalReferenceNumbers);

                getInputValues(umrNumberItems, aSelectedUMRNumbers);
                oSelectionModel.setProperty("/UMRNumbers", aSelectedUMRNumbers);

                getInputValues(claimIDItems, aSelectedClaimIDs);
                oSelectionModel.setProperty("/ClaimIDs", aSelectedClaimIDs);

                getInputValues(transRefItems, aSelectedTransRefs);
                oSelectionModel.setProperty("/TransRefs", aSelectedTransRefs);

                if (oSelectionModel.getProperty("/Division") === "") {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    return false;
                }

                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                if (oSelectionModel.getProperty("/ElsecoBankAccountNumber") === "") {
                    oBankAccountNumberInput.setValueState(sap.ui.core.ValueState.Error);
                    oBankAccountNumberInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    return false;
                }    

                let oPostingDateInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idPostingDateInput");
                // Regular expression to check for the 'YYYY-MM-DDTHH:MM:SS' format
                var DateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
                if (!DateRegex.test(oSelectionModel.getProperty("/PostingDate"))) {
                    if (!(oSelectionModel.getProperty("/PostingDate") === null) && !(oSelectionModel.getProperty("/PostingDate") === undefined)
                    ) {
                        oPostingDateInput.setValueState(sap.ui.core.ValueState.Error);
                        oPostingDateInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterPostingDate"));
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterPostingDate"));
                        return false;
                    }
                }

                // Check if Valid Values are entered in the Amount Input Fields
                let sPaymentInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idpaymentAmountInput").getValue();

                var regex = /^\d{1,10}(\.\d{0,2})?$/; // Regex to allow up to 10 digits before the decimal and up to 2 digits after the decimal

                if (!(((sPaymentInput.match(/\./g) || []).length <= 1) && (regex.test(sPaymentInput.replace(/,/g, ""))))) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterValidAmount"));
                    return false;
                }
                return true;
            },

            /**
            * Validates the selection criteria before execution.
            * 
            * This function checks if all mandatory fields are filled and if valid values are entered in the amount input fields.
            * It validates the selection of Business Partners, External Reference Numbers, SOA Reference Numbers, UMR Numbers,
            * and Elseco Bank Account Number. It also checks the format and validity of payment and bank charge amounts.
            * If any mandatory field is missing or invalid values are provided, it displays an error message and halts execution.
            * 
            * @returns {boolean} Returns true if all validations pass, otherwise false.
            */
            // eslint-disable-next-line max-statements
            _validatePRBeforeExecute: function () {

                let oSelectionModel = this.getView().getModel("selectionModel");
                let aSelectedBPs = [], aSelectedExterenalReferenceNumbers = [], aSelectedSoaReferenceNumbers = [], aSelectedUMRNumbers = [];
                let bpInputItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").getTokens(),
                    externalReferenceNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").getTokens(),
                    soaReferenceNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idSOAReferenceMultiInput").getTokens(),
                    umrNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput").getTokens();
                let oCompanyCodeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idCompanyCodesComboBox");

                const getInputValues = (items, aResult) => {
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        aResult.push(item.getProperty("key"));
                    }
                };

                // Check if Mandatory Fields are filled
                if (!oSelectionModel.getProperty("/CompanyCode")) {
                    oCompanyCodeInput.setValueState(sap.ui.core.ValueState.Error);
                    oCompanyCodeInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseCompanyCode"));
                    return false;
                }

                getInputValues(bpInputItems, aSelectedBPs);
                if (aSelectedBPs.length === 0) {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText(
                        this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    return false;
                } else {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.None);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText("");
                }
                oSelectionModel.setProperty("/BusinessPartners", aSelectedBPs);

                getInputValues(externalReferenceNumberItems, aSelectedExterenalReferenceNumbers);

                oSelectionModel.setProperty("/ExternalReferenceNumbers", aSelectedExterenalReferenceNumbers);

                getInputValues(soaReferenceNumberItems, aSelectedSoaReferenceNumbers);
                oSelectionModel.setProperty("/SoaReferenceNumbers", aSelectedSoaReferenceNumbers);

                getInputValues(umrNumberItems, aSelectedUMRNumbers);
                oSelectionModel.setProperty("/UMRNumbers", aSelectedUMRNumbers);


                if (oSelectionModel.getProperty("/Division") === "") {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    return false;
                }

                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                if (oSelectionModel.getProperty("/ElsecoBankAccountNumber") === "") {
                    oBankAccountNumberInput.setValueState(sap.ui.core.ValueState.Error);
                    oBankAccountNumberInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    return false;
                }

                let oPostingDateInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idPostingDateInput");
                // Regular expression to check for the 'YYYY-MM-DDTHH:MM:SS' format
                var DateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
                if (!DateRegex.test(oSelectionModel.getProperty("/PostingDate"))) {
                    if (!(oSelectionModel.getProperty("/PostingDate") === null) && !(oSelectionModel.getProperty("/PostingDate") === undefined)
                    ) {
                        oPostingDateInput.setValueState(sap.ui.core.ValueState.Error);
                        oPostingDateInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterPostingDate"));
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterPostingDate"));
                        return false;
                    }
                }

                // Check if Valid Values are entered in the Amount Input Fields
                let sPaymentInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idpaymentAmountInput").getValue();
                let sBankChargeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idbankChargeAmountInput").getValue();

                var regex = /^\d{1,10}(\.\d{0,2})?$/; // Regex to allow up to 10 digits before the decimal and up to 2 digits after the decimal

                if ((!(((sPaymentInput.match(/\./g) || []).length <= 1) && (regex.test(sPaymentInput.replace(/,/g, "")))))
                    || (!(((sBankChargeInput.match(/\./g) || []).length <= 1) && (regex.test(sBankChargeInput.replace(/,/g, "")))))) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterValidAmount"));
                    return false;
                }
                return true;
            },
            /**
           * Validates the selection criteria before execution.
           * 
           * This function checks if all mandatory fields are filled and if valid values are entered in the amount input fields.
           * It validates the selection of Business Partners, External Reference Numbers, SOA Reference Numbers, UMR Numbers,
           * and Elseco Bank Account Number. It also checks the format and validity of payment and bank charge amounts.
           * If any mandatory field is missing or invalid values are provided, it displays an error message and halts execution.
           * 
           * @returns {boolean} Returns true if all validations pass, otherwise false.
           */
            // eslint-disable-next-line max-statements
            _validatePPBeforeExecute: function () {

                let oSelectionModel = this.getView().getModel("selectionModel");
                let aSelectedBPs = [], aSelectedExterenalReferenceNumbers = [], aSelectedSoaReferenceNumbers = [], aSelectedUMRNumbers = [], aSelectedUWYears = [], aSelectedMemberIDs = [];
                let bpInputItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").getTokens(),
                    externalReferenceNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").getTokens(),
                    soaReferenceNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idSOAReferenceMultiInput").getTokens(),
                    umrNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput").getTokens(),
                    uwYearItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUWYearMultiInput").getTokens(),
                    memberIdItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idMemberIDMultiInput").getTokens();
                let oCompanyCodeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idCompanyCodesComboBox");
                const getInputValues = (items, aResult) => {
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        aResult.push(item.getProperty("key"));
                    }
                };

                // Check if Mandatory Fields are filled
                if (!oSelectionModel.getProperty("/CompanyCode")) {
                    oCompanyCodeInput.setValueState(sap.ui.core.ValueState.Error);
                    oCompanyCodeInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseCompanyCode"));
                    return false;
                }

                getInputValues(bpInputItems, aSelectedBPs);
                if (aSelectedBPs.length === 0) {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText(
                        this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    return false;
                } else {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.None);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText("");
                }
                oSelectionModel.setProperty("/BusinessPartners", aSelectedBPs);

                getInputValues(externalReferenceNumberItems, aSelectedExterenalReferenceNumbers);

                oSelectionModel.setProperty("/ExternalReferenceNumbers", aSelectedExterenalReferenceNumbers);

                getInputValues(soaReferenceNumberItems, aSelectedSoaReferenceNumbers);
                oSelectionModel.setProperty("/SoaReferenceNumbers", aSelectedSoaReferenceNumbers);

                getInputValues(umrNumberItems, aSelectedUMRNumbers);
                oSelectionModel.setProperty("/UMRNumbers", aSelectedUMRNumbers);

                getInputValues(uwYearItems, aSelectedUWYears);
                oSelectionModel.setProperty("/UWYears", aSelectedUWYears);

                getInputValues(memberIdItems, aSelectedMemberIDs);
                oSelectionModel.setProperty("/MemberIDs", aSelectedMemberIDs);


                if (oSelectionModel.getProperty("/Division") === "") {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    return false;
                }

                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                if (oSelectionModel.getProperty("/ElsecoBankAccountNumber") === "") {
                    oBankAccountNumberInput.setValueState(sap.ui.core.ValueState.Error);
                    oBankAccountNumberInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    return false;
                }

                // Check if Valid Values are entered in the Amount Input Fields
                let sPaymentInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idpaymentAmountInput").getValue();
                let sBankChargeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idbankChargeAmountInput").getValue();

                var regex = /^\d{1,10}(\.\d{0,2})?$/; // Regex to allow up to 10 digits before the decimal and up to 2 digits after the decimal

                if ((!(((sPaymentInput.match(/\./g) || []).length <= 1) && (regex.test(sPaymentInput.replace(/,/g, "")))))
                    || (!(((sBankChargeInput.match(/\./g) || []).length <= 1) && (regex.test(sBankChargeInput.replace(/,/g, "")))))) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterValidAmount"));
                    return false;
                }
                
                let oFronterID = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idFronterIDInput").getValue();
                oSelectionModel.setProperty("/FronterID", oFronterID);
                return true;
            },
            /**
            * Validates the selection criteria before execution.
            * 
            * This function checks if all mandatory fields are filled and if valid values are entered in the amount input fields.
            * It validates the selection of Business Partners, External Reference Numbers, UMR Numbers,
            * and Elseco Bank Account Number. It also checks the format and validity of payment and bank charge amounts.
            * If any mandatory field is missing or invalid values are provided, it displays an error message and halts execution.
            * 
            * @returns {boolean} Returns true if all validations pass, otherwise false.
            */
            // eslint-disable-next-line max-statements
            _validateCPBeforeExecute: function () {

                let oSelectionModel = this.getView().getModel("selectionModel");
                let aSelectedBPs = [], aSelectedExterenalReferenceNumbers = [], aSelectedSoaReferenceNumbers = [], aSelectedUMRNumbers = [];
                let bpInputItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").getTokens(),
                    externalReferenceNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput").getTokens(),
                    umrNumberItems = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput").getTokens();
                let oCompanyCodeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idCompanyCodesComboBox");

                const getInputValues = (items, aResult) => {
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        aResult.push(item.getProperty("key"));
                    }
                };

                // Check if Mandatory Fields are filled
                if (!oSelectionModel.getProperty("/CompanyCode")) {
                    oCompanyCodeInput.setValueState(sap.ui.core.ValueState.Error);
                    oCompanyCodeInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseCompanyCode"));
                    return false;
                }

                getInputValues(bpInputItems, aSelectedBPs);
                if (aSelectedBPs.length === 0) {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText(
                        this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    return false;
                } else {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueState(sap.ui.core.ValueState.None);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput").setValueStateText("");
                }
                oSelectionModel.setProperty("/BusinessPartners", aSelectedBPs);

                getInputValues(externalReferenceNumberItems, aSelectedExterenalReferenceNumbers);

                oSelectionModel.setProperty("/ExternalReferenceNumbers", aSelectedExterenalReferenceNumbers);


                oSelectionModel.setProperty("/SoaReferenceNumbers", []);

                getInputValues(umrNumberItems, aSelectedUMRNumbers);
                oSelectionModel.setProperty("/UMRNumbers", aSelectedUMRNumbers);


                if (oSelectionModel.getProperty("/Division") === "") {
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueState(sap.ui.core.ValueState.Error);
                    sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox").setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("chooseDivision"));
                    return false;
                }

                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                if (oSelectionModel.getProperty("/ElsecoBankAccountNumber") === "") {
                    oBankAccountNumberInput.setValueState(sap.ui.core.ValueState.Error);
                    oBankAccountNumberInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("selectBankAcc"));
                    return false;
                }

                let oPostingDateInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idPostingDateInput");
                // Regular expression to check for the 'YYYY-MM-DDTHH:MM:SS' format
                var DateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
                if (!DateRegex.test(oSelectionModel.getProperty("/PostingDate"))) {
                    if (!(oSelectionModel.getProperty("/PostingDate") === null) && !(oSelectionModel.getProperty("/PostingDate") === undefined)
                    ) {
                        oPostingDateInput.setValueState(sap.ui.core.ValueState.Error);
                        oPostingDateInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterPostingDate"));
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterPostingDate"));
                        return false;
                    }
                }

                // Check if Valid Values are entered in the Amount Input Fields
                let sPaymentInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idpaymentAmountInput").getValue();
                let sBankChargeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idbankChargeAmountInput").getValue();

                var regex = /^\d{1,10}(\.\d{0,2})?$/; // Regex to allow up to 10 digits before the decimal and up to 2 digits after the decimal

                if ((!(((sPaymentInput.match(/\./g) || []).length <= 1) && (regex.test(sPaymentInput.replace(/,/g, "")))))
                    || (!(((sBankChargeInput.match(/\./g) || []).length <= 1) && (regex.test(sBankChargeInput.replace(/,/g, "")))))) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("enterValidAmount"));
                    return false;
                }
                return true;
            },

            /**
             * Event handler for live changes to a currency input field.
             * This function validates the input against a currency format, allowing up to 15 digits before the decimal
             * point and up to 2 digits after the decimal point. If the input is not in a valid currency format,
             * a message toast is displayed to the user, and the input field is reset to "0".
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the live change event
             */
            onInputCurrencyLiveChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();
                var regex = /^\d{1,10}(\.\d{0,2})?$/; // Regex to allow up to 10 digits before the decimal and up to 2 digits after the decimal

                if (((sValue.match(/\./g) || []).length <= 1) && (regex.test(sValue.replace(/,/g, "")))) {
                    // If the value is a valid currency format, remove error state
                    oInput.setValueState("None");
                } else {
                    // If the value is not a valid currency format, set the input to error state
                    oInput.setValueState("Error");
                    oInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("invalidCurrency"));
                }
            },

            /**
             * Handles the selection change event of the bank account numbers ComboBox.
             * 
             * This method updates the currency input field based on the selected bank account number. If no bank account number
             * is selected, it sets the currency input to "0.00", displays an error message, and sets the value state of the bank
             * account number input to "Error". If a bank account number is selected, it retrieves the corresponding currency from
             * the local model and updates the currency input field accordingly. It also resets the value state of the bank account
             * number input to "None".
             * @param {sap.ui.base.Event} oEvent The event object containing the selection change information.
             */
            onApplicableBankAccountNumbersComboBoxSelectionChange: function (oEvent) {
                var selectedBankAccountNumber = oEvent.getParameter("selectedItem")?.getKey();
                let oCurrencyInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "CurrencyInputID");
                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                if (!selectedBankAccountNumber) {
                    oCurrencyInput.setValue("0.00");
                    oBankAccountNumberInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    oBankAccountNumberInput.setValueState("Error");
                    return;
                }
                oBankAccountNumberInput.setValueState("None");
                let aBankAccountNumbers = this.getView().getModel("localModel").getProperty("/BankAccountNumbers");

                let aSelectedBankAccount = aBankAccountNumbers.filter((bankAccount) => {
                    return bankAccount.ElsecoBankAccountNumber === selectedBankAccountNumber;
                });
                oCurrencyInput.setValue(aSelectedBankAccount[0].Currency);
            },

            /**
             * Handles the change event of the company code ComboBox.
             * 
             * This method updates the state and value of related input fields based on the selected company code.
             * If no company code is selected, it disables the division input, sets an error message, and sets the value state
             * of the company code input to "Error". If a company code is selected, it resets the value state of the company code
             * input to "None", clears the values of the bank account number and currency inputs, disables the bank account number
             * input, and enables the division input.
             * @param {sap.ui.base.Event} oEvent The event object containing the change information.
             */
            onCompanyCodesComboBoxSelectionChange: function (oEvent) {
                let selectedCompanyCode = oEvent.getParameter("selectedItem")?.getKey();
                let oDivision = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox");
                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                let oCurrencyInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "CurrencyInputID");
                let oCompanyCodeInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idCompanyCodesComboBox");
                oDivision.setSelectedKey("");
                if (!selectedCompanyCode) {
                    // oDivision.setValue("");
                    oDivision.setEnabled(false);
                    oCompanyCodeInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    oCompanyCodeInput.setValueState(sap.ui.core.ValueState.Error);
                    return;
                }
                oCompanyCodeInput.setValueState(sap.ui.core.ValueState.None);
                oBankAccountNumberInput.setValue("");
                oCurrencyInput.setValue("");
                oBankAccountNumberInput.setEnabled(false);
                oDivision.setValue("");
                oDivision.setEnabled(true);
            },
            /**
             * Handles the selection change event of the division ComboBox.
             * 
             * This method updates the bank account number and currency input fields based on the selected division.
             * If no division is selected, it sets an error message, sets the value state of the division input to "Error",
             * and clears the applicable bank account numbers in the local model. If a division is selected, it resets the
             * value state of the division input to "None" and filters the bank account numbers based on the selected division
             * and company code, updating the local model with the applicable bank account numbers.
             * @param {sap.ui.base.Event} oEvent The event object containing the selection change information.
             */
            onDivisionsComboBoxSelectionChange: function (oEvent) {
                let selectedDivision = oEvent.getParameter("selectedItem")?.getKey();
                let oBankAccountNumberInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idApplicableBankAccountNumbersComboBox");
                let oCurrencyInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "CurrencyInputID");
                let oDivisionInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idDivisionsComboBox");

                oBankAccountNumberInput.setSelectedKey("");
                oCurrencyInput.setValue("");
                if (!selectedDivision) {
                    oDivisionInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("enterAtleastOneValue"));
                    oDivisionInput.setValueState(sap.ui.core.ValueState.Error);
                    this.getView().getModel("localModel").setProperty("/ApplicableBankAccountNumbers", {});
                    return;
                }
                oDivisionInput.setValueState(sap.ui.core.ValueState.None);
                let sSelectedCompanyCode = this.getView().getModel("selectionModel").getProperty("/CompanyCode");
                let aBankAccountNumbers = this.getView().getModel("localModel").getProperty("/BankAccountNumbers");
                let aApplicableBankAccountNumbers = aBankAccountNumbers.filter((bankAccount) => {
                    return bankAccount.Division === selectedDivision && bankAccount.CompanyCode === sSelectedCompanyCode;
                });
                this.getView().getModel("localModel").setProperty("/ApplicableBankAccountNumbers", aApplicableBankAccountNumbers);

            },

            /**
             * Handles updates to the tokens within a MultiInput control.
             * 
             * This method is triggered when tokens are added or removed from a MultiInput control. It filters out any removed
             * tokens from the current set of tokens based on their keys. If, after removal, no tokens remain, it sets the
             * MultiInput control to an error state with a message prompting the user to enter at least one value. If there is
             * at least one token remaining, it removes the error state from the MultiInput control.
             * @param {sap.ui.base.Event} oEvent The event object containing information about the updated tokens.
             * @param {any} pB - pB
             * @param {String} sInputName - The name of the MultiInput control that was called from the update.
             */
            onMultiInputTokenUpdate: async function (oEvent, pB, sInputName) {
                var oMultiInput = oEvent.getSource();
                var aTokens = oMultiInput.getTokens();
                var aRemovedKeys = util.getTokenValues(oEvent.getParameter("removedTokens"));
                let aBPList = this.getView().getModel("localModel").getProperty("/BPList");
                const oBPInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput"),
                    oUMRInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idUMRMultiInput"),
                    oExtRefInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idExternalReferenceNumberMultiInput");

                if (aRemovedKeys.length > 0) {
                    aTokens = aTokens.filter((token) => {
                        return !aRemovedKeys.includes(token.getKey());
                    });
                }

                // Check if at least one token is present
                if (aTokens.length === 0 && !["UMR", "ExtRef", "MemberID","UCR", "claimId","transRef"].includes(sInputName)) {
                    // Set the MultiInput control to error state
                    oMultiInput.setValueState(sap.ui.core.ValueState.Error);
                    oMultiInput.setValueStateText("Please enter at least one value.");
                } else if (aTokens.length > 0) {
                    // If there is at least one token, remove the error state
                    oMultiInput.setValueState(sap.ui.core.ValueState.None);
                    oMultiInput.setValueStateText("");

                    // Set the BP based on ExtRef and UMR
                    if (sInputName === "ExtRef" || sInputName === "UMR") {
                        let aExtRefTokens = oExtRefInput.getTokens(),
                            aUMRTokens = oUMRInput.getTokens();
                        try {
                            this.getView().setBusy(true);
                            var aBP = await ActionHelper.getBPForPayer(this.getView().getModel("clearingApplicationModel"), util.getTokenValues(aExtRefTokens), util.getTokenValues(aUMRTokens));
                            this.getView().setBusy(false);
                        } catch (error) {
                            MessageBox.error("Error Occurred While Fetching the BP for the selected ExtRef and UMR");
                            this.getView().setBusy(false);
                            return;
                        }
                        if (aBP.length > 0) {
                            oBPInput.destroyTokens(); // TODO check if the existing BPs Selected needs to be cleared even when the BP fetched for the extRef and UMR is empty
                            for (const BP_ID of aBP) {
                                let oBP = aBPList.find((x) => x.BP_ID === BP_ID.BP_ID);
                                // eslint-disable-next-line max-depth
                                if (oBP?.BP_ID) {
                                    let oToken = new Token({
                                        key: oBP.BP_ID,
                                        text: oBP.BP_NAME
                                    });
                                    oBPInput.addToken(oToken);
                                }
                            }
                        }


                    }
                }

            },

            /**
             * Handles the value help request for the Business Partner multi-input field.
             * Opens a dialog that allows users to search and select one or multiple business partners
             * depending on the currently selected tab. For Claim Receivables tab, only single selection
             * is allowed, while other tabs support multiple selections.
             * 
             * The dialog displays a list of business partners with search functionality.
             * Previously selected business partners are pre-selected in the dialog.
             * For single select mode, the current business partner ID is retrieved from the input's data.
             * For multi select mode, all tokens in the input are used to pre-select items.
             * 
             * @param {sap.ui.base.Event} oEvent The event object containing information about the value help request
             */
            onMultiInputBusinessPartnerValueHelpRequest: function(oEvent) {
                const oView = this.getView();
                const bSingleSelect = this._SelectedIconTab === "ClaimReceivables";
                // Get the source MultiInput that triggered the event
                const oSourceInput = oEvent.getSource();
                const sSourceId = oSourceInput.getId().split("--")[1]; // Get the ID without fragment prefix
                
                if (!this._oBPSearchDialog) {
                    Fragment.load({
                        name: "atom.ui.clearing.clearingapplication.view.fragments.BPSearchVH",
                        controller: this
                    }).then((oDialog) => {
                        this._oBPSearchDialog = oDialog;
                        oView.addDependent(this._oBPSearchDialog);
                        
                        // Store the source input ID for use in confirm handler
                        this._oBPSearchDialog.data("sourceInputId", sSourceId);
                        
                        // Set single/multi select based on tab
                        const oList = this._oBPSearchDialog.getContent()[0];
                        oList.setMode(bSingleSelect ? "SingleSelect" : "MultiSelect");
                        
                        // Clear search field
                        const oSearchField = this._oBPSearchDialog.getSubHeader().getContent()[0];
                        oSearchField.setValue("");
                        
                        // Get current selections and mark them in the list
                        const oInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, sSourceId);
                        if (bSingleSelect) {
                            const sBPId = oInput.data("BP_ID");
                            if (sBPId) {
                                const aItems = oList.getItems();
                                const oItem = aItems.find(item => {
                                    const oContext = item.getBindingContext("clearingApplicationModel");
                                    return oContext && oContext.getObject().ID === sBPId;
                                });
                                if (oItem) {
                                    oItem.setSelected(true);
                                }
                            }
                        } else {
                            const aTokens = oInput.getTokens() || [];
                            const aItems = oList.getItems();
                            aTokens.forEach(oToken => {
                                const oItem = aItems.find(item => {
                                    const oContext = item.getBindingContext("clearingApplicationModel");
                                    return oContext && oContext.getObject().ID === oToken.getKey();
                                });
                                if (oItem) {
                                    oItem.setSelected(true);
                                }
                            });
                        }
                        
                        this._oBPSearchDialog.open();
                    });
                } else {
                    // Store the source input ID for use in confirm handler
                    this._oBPSearchDialog.data("sourceInputId", sSourceId);
                    
                    const oList = this._oBPSearchDialog.getContent()[0];
                    oList.setMode(bSingleSelect ? "SingleSelect" : "MultiSelect");
                    
                    // Clear search field
                    const oSearchField = this._oBPSearchDialog.getSubHeader().getContent()[0];
                    oSearchField.setValue("");
                    // Refresh the list binding to get latest data
                    oList.getBinding("items").filter();
                    
                    
                    // Clear previous selections
                    oList.removeSelections(true);
                    
                    // Get current selections and mark them in the list
                    const oInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, sSourceId);
                    if (bSingleSelect) {
                        const sBPId = oInput.data("BP_ID");
                        if (sBPId) {
                            const aItems = oList.getItems();
                            const oItem = aItems.find(item => {
                                const oContext = item.getBindingContext("clearingApplicationModel");
                                return oContext && oContext.getObject().ID === sBPId;
                            });
                            if (oItem) {
                                oItem.setSelected(true);
                            }
                        }
                    } else {
                        const aTokens = oInput.getTokens() || [];
                        const aItems = oList.getItems();
                        aTokens.forEach(oToken => {
                            const oItem = aItems.find(item => {
                                const oContext = item.getBindingContext("clearingApplicationModel");
                                return oContext && oContext.getObject().ID === oToken.getKey();
                            });
                            if (oItem) {
                                oItem.setSelected(true);
                            }
                        });
                    }
                    
                    this._oBPSearchDialog.open();
                }
            },

            /**
             * Handles the search event in the Business Partner value help dialog.
             * Filters the list of business partners based on the search value entered by the user.
             * The search is case-insensitive and matches against both the business partner ID and full name.
             * After filtering, it maintains any existing selections in the list.
             * 
             * @param {sap.ui.base.Event} oEvent The search event object containing the search value
             */
            onSearchFieldBPSearchVHLiveChange: function(oEvent) {
                const sValue = oEvent.getParameter("newValue").toLowerCase();
                const oList = this._oBPSearchDialog.getContent()[0];
                
                // Store current selections before applying filter
                const aSelectedContexts = oList.getSelectedItems().map(item => {
                    const oContext = item.getBindingContext("clearingApplicationModel");
                    return oContext ? oContext.getObject() : null;
                }).filter(Boolean);
                
                const oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, sValue),
                        new sap.ui.model.Filter({
                            path: "FULL_NAME",
                            operator: sap.ui.model.FilterOperator.Contains,
                            value1: sValue,
                            caseSensitive: false
                        })
                    ],
                    and: false
                });
                
                // After binding is updated, restore all selections
                oList.getBinding("items").attachEventOnce("dataReceived", () => {
                    const aItems = oList.getItems();
                    
                    // First restore previous search selections
                    aSelectedContexts.forEach(selectedObj => {
                        const oItem = aItems.find(item => {
                            const oContext = item.getBindingContext("clearingApplicationModel");
                            return oContext && oContext.getObject().ID === selectedObj.ID;
                        });
                        if (oItem) {
                            oItem.setSelected(true);
                        }
                    });
                    
                    // Then restore original MultiInput selections
                    const oInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, this._oBPSearchDialog.data("sourceInputId"));
                    if (!this._SelectedIconTab === "ClaimReceivables") {
                        const aTokens = oInput.getTokens() || [];
                        aTokens.forEach(oToken => {
                            const oItem = aItems.find(item => {
                                const oContext = item.getBindingContext("clearingApplicationModel");
                                return oContext && oContext.getObject().ID === oToken.getKey();
                            });
                            if (oItem) {
                                oItem.setSelected(true);
                            }
                        });
                    }
                });
                
                oList.getBinding("items").filter(oFilter);
            },

            /**
             * Handles the confirmation event in the Business Partner value help dialog.
             * For ClaimReceivables tab, handles single selection by setting the selected business partner.
             * For other tabs, handles multi-selection by adding new tokens for selected business partners.
             * Maintains existing selections and prevents duplicate entries.
             * 
             * @param {sap.ui.base.Event} oEvent The confirmation event object
             */
            onSelectButtonBPSearchVHPress: function(oEvent) {
                // Get the source input ID that opened the dialog
                const sSourceId = this._oBPSearchDialog.data("sourceInputId");
                const oInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, sSourceId);
                const oList = this._oBPSearchDialog.getContent()[0];
                const aSelectedItems = oList.getSelectedItems();
                
                if (this._SelectedIconTab === "ClaimReceivables") {
                    // Single selection for ClaimReceivables
                    if (aSelectedItems.length > 0) {
                        const oSelectedItem = aSelectedItems[0];
                        const oContext = oSelectedItem.getBindingContext("clearingApplicationModel");
                        const oData = oContext.getObject();
                        
                        oInput.setValue(oData.FULL_NAME);
                        oInput.data("BP_ID", oData.ID);
                        this.getView().getModel("selectionModel").setProperty("/BusinessPartners", [oData.ID]);
                        this.getView().getModel("selectionModel").setProperty("/BusinessPartnerName", oData.FULL_NAME);
                    }
                } else {
                    // Multi selection for other tabs
                    const aExistingTokens = oInput.getTokens() || [];
                    const existingKeys = new Set(aExistingTokens.map(token => token.getKey()));
                    
                    // Only add new tokens that don't already exist
                    aSelectedItems.forEach((oItem) => {
                        const oContext = oItem.getBindingContext("clearingApplicationModel");
                        const oData = oContext.getObject();
                        
                        if (!existingKeys.has(oData.ID)) {
                            oInput.addToken(new sap.m.Token({
                                key: oData.ID,
                                text: oData.FULL_NAME
                            }));
                        }
                    });
                }
                
                this._oBPSearchDialog.close();
            },

            /**
             * Handles the close event of the Business Partner value help dialog.
             * Closes the Business Partner search dialog.
             */
            onCancelButtonBPSearchVHPress: function() {
                this._oBPSearchDialog.close();
            },

            /**
             * Handles the selection of a suggestion item in the Business Partner MultiInput control.
             * 
             * For ClaimReceivables tab, it handles single selection by setting the selected business partner
             * directly in the input field and model. For other tabs, it handles multi-selection by adding
             * the selected business partner as a new token if it doesn't already exist.
             * 
             * @param {sap.ui.base.Event} oEvent The suggestion item selection event
             */
            onMultiInputBusinessPartnerSuggestionItemSelected: function(oEvent) {
                const oItem = oEvent.getParameter("selectedItem");
                if (!oItem) return;
                
                if (this._SelectedIconTab === "ClaimReceivables") {
                    // Single selection handling for ClaimReceivables
                    const oInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, "idBusinessPartnerMultiInput");
                    oInput.setValue(oItem.getText());
                    oInput.data("BP_ID", oItem.getKey());  // Store BP_ID in input's data
                    this.getView().getModel("selectionModel").setProperty("/BusinessPartners", [oItem.getKey()]);
                    this.getView().getModel("selectionModel").setProperty("/BusinessPartnerName", oItem.getText());
                    return;
                }

                // Get the source MultiInput that triggered the event
                const oSourceInput = oEvent.getSource();
                const sSourceId = oSourceInput.getId().split("--")[1]; // Get the ID without fragment prefix
                
                // Multi-select handling for other tabs
                const oMultiInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, sSourceId);
                if (!oMultiInput) {
                    return;
                }
                
                // Check if token already exists
                const aTokens = oMultiInput.getTokens() || [];
                const bTokenExists = aTokens.some(token => token.getKey() === oItem.getKey());
                
                if (!bTokenExists) {
                    oMultiInput.addToken(new sap.m.Token({
                        key: oItem.getKey(),
                        text: oItem.getText()
                    }));
                    
                    // Update selection in value help dialog if it exists
                    if (this._oBPSearchDialog) {
                        const oList = this._oBPSearchDialog.getContent()[0];
                        const aItems = oList.getItems();
                        const oListItem = aItems.find(item => {
                            const oContext = item.getBindingContext("clearingApplicationModel");
                            return oContext && oContext.getObject().ID === oItem.getKey();
                        });
                        if (oListItem) {
                            oListItem.setSelected(true);
                        }
                    }
                }
                oMultiInput.setValue("");
            },

            /**
             * Handles the token update event in the Business Partner MultiInput control.
             * Updates the selection in the value help dialog when tokens are removed.
             * 
             * @param {sap.ui.base.Event} oEvent The token update event
             */
            onMultiInputBusinessPartnerTokenUpdate: function(oEvent) {
                // Get the source MultiInput that triggered the event
                const oSourceInput = oEvent.getSource();
                const sSourceId = oSourceInput.getId().split("--")[1]; // Get the ID without fragment prefix
                
                const oMultiInput = sap.ui.core.Fragment.byId(this._SelectedIconTab, sSourceId);
                if (!oMultiInput) {
                    return;
                }
                
                const aRemovedTokens = oEvent.getParameter("removedTokens") || [];
                
                // Update selection in value help dialog if it exists
                if (this._oBPSearchDialog) {
                    const oList = this._oBPSearchDialog.getContent()[0];
                    
                    aRemovedTokens.forEach((oToken) => {
                        const aItems = oList.getItems();
                        const oItem = aItems.find(item => {
                            const oContext = item.getBindingContext("clearingApplicationModel");
                            return oContext && oContext.getObject().ID === oToken.getKey();
                        });
                        if (oItem) {
                            oItem.setSelected(false);
                        }
                    });
                }
            },

            /**
             * Handles change event of the payable posting date range selection control.
             * Updates the selection model with formatted start and end dates.
             * 
             * @param {sap.ui.base.Event} oEvent The change event object
             */
            onDateRangeSelectionPayablePostingDateChange: function(oEvent) {
                const oDateRange = oEvent.getSource();
                const oStartDate = oDateRange.getDateValue();
                const oEndDate = oDateRange.getSecondDateValue();
                
                // Format dates to ISO string and store in model
                if (oStartDate) {
                    const sStartDate = `${oStartDate.getFullYear()}-${String(oStartDate.getMonth() + 1).padStart(2, "0")}-${String(oStartDate.getDate()).padStart(2, "0")}T00:00:00`;
                    this.getView().getModel("selectionModel").setProperty("/PayablePostingStartDate", sStartDate);
                } else {
                    this.getView().getModel("selectionModel").setProperty("/PayablePostingStartDate", null);
                }
                
                if (oEndDate) {
                    const sEndDate = `${oEndDate.getFullYear()}-${String(oEndDate.getMonth() + 1).padStart(2, "0")}-${String(oEndDate.getDate()).padStart(2, "0")}T00:00:00`;
                    this.getView().getModel("selectionModel").setProperty("/PayablePostingEndDate", sEndDate);
                } else {
                    this.getView().getModel("selectionModel").setProperty("/PayablePostingEndDate", null);
                }
            }

        });
    });
