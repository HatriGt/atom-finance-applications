/* eslint-disable no-console */
sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "../model/formatter",
    "./util/util",
    "./util/ActionHelper",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/model/Sorter",
    "sap/m/table/ColumnWidthController",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/mockdata",
    "sap/ui/core/routing/History",
    "sap/ui/core/Element",
    "sap/m/Dialog",
    "sap/ui/core/library",
    "sap/ui/core/Core",
    "./util/VariantManagementHelper",
    "../model/constants"
],

    /**
     * MainView Controller
     * 
     * This controller extends the BaseController and is responsible for handling
     * the view logic for the MainView of the Clearing Application. It includes
     * functionality for model manipulation, message display, sorting, grouping,
     * and selection within the table, as well as handling various UI actions.
     * 
     * @extends BaseController
     * @param {*} BaseController - BaseController
     * @param {sap.ui.model.json.JSONModel} JSONModel - JSON Model used for data binding
     * @param {sap.m.MessageToast} MessageToast - MessageToast for showing brief messages
     * @param {any} formatter - Utility object with formatter functions
     * @param {any} util - Utility object with general utility functions
     * @param {any} ActionHelper - Utility object for handling actions
     * @param {sap.m.p13n.Engine} Engine - Personalization engine for table configuration
     * @param {sap.m.p13n.SelectionController} SelectionController - Controller for selection personalization
     * @param {sap.m.p13n.SortController} SortController - Controller for sorting personalization
     * @param {sap.m.p13n.GroupController} GroupController - Controller for grouping personalization
     * @param {sap.m.p13n.MetadataHelper} MetadataHelper - Helper for metadata operations
     * @param {sap.ui.model.Sorter} Sorter - Utility for sorting model data
    //  * @param {sap.ui.core.Lib} CoreLibrary - Core library for UI5 framework
     * @param {sap.m.table.ColumnWidthController} ColumnWidthController - Controller for managing table column widths
     * @param {sap.m.MessageBox} MessageBox - Utility for showing alert dialogs
     * @param {sap.ui.core.Fragment} Fragment - Utility for handling UI fragments
     * @param {Object} mockdata - Mock data for testing and development
     * @param {sap.ui.core.routing.History} History - Utility for handling routing history
     * @param {sap.ui.core.Element} Element - Utility for handling routing history
     * @param {sap.m.Dialog} Dialog - Dialog Control
     * @param {sap.ui.core.Lib} CoreLibrary - Core library for UI5 framework
     * @param {sap.ui.core} Core - Core library for UI5 framework
     * @param {any} VariantManagementHelper - Utility object with general VariantManagementHelper functions
     * @param {Object} Constants - Constants for the Clearing Application
     * @returns {sap.ui.core.mvc.Controller} A new MainView controller instance
     */
    // eslint-disable-next-line max-params
    function (BaseController,
        JSONModel,
        MessageToast,
        formatter,
        util,
        ActionHelper,
        Engine,
        SelectionController,
        SortController,
        GroupController,
        MetadataHelper,
        Sorter,
        ColumnWidthController,
        MessageBox,
        Fragment,
        mockdata,
        History,
        Element,
        Dialog,
        library,
        Core,
        VariantManagementHelper,
        Constants
    ) {
        "use strict";

        return BaseController.extend("atom.ui.clearing.clearingapplication.controller.PremiumPayablesClearing", {
            formatter: formatter,
            util: util,
            Fragment: Fragment,
            Constants: Constants,
            ActionHelper: ActionHelper,
            onInit: function () {
                this._initDisplayData();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RoutePremiumPayablesClearingView").attachPatternMatched(this._onRouteMatched, this);
            },

            _initDisplayData: async function () {
                this.getView().setBusy(true);
                let oClearingModel = this.getOwnerComponent().getModel("clearingPageModel");
                this._ClearingType = "PremiumPayables";


                if ((!oClearingModel) || !(oClearingModel && oClearingModel.getData() !== null)) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("IssueOccurred"));
                    this.onPageNavButtonPress();
                }
                let oClearingData = oClearingModel.getData();
                // this.getOwnerComponent().setModel(new JSONModel(oClearingData),"clearingPageModel");
                oClearingData.SelectionResult.forEach((line) => {
                    line.isSelected = false;
                    line.isRoeRecCurrEditable = false;
                    line.isAllocAmnEditable = false;
                });
                let oData = {
                    "SelectionResult": //MockData.SelectionResult
                        oClearingData.SelectionResult
                };

                let aProcessingStatus = oData.SelectionResult.reduce(function (accumulator, item) {
                    // Create a unique key for each combination of Gpart, BpName, and OrigCurr
                    let uniqueKey = item.Gpart + "|" + item.BpName + "|" + item.ExpPayCurr;

                    // If this unique key hasn't been processed yet, add the item to the accumulator
                    if (!accumulator.tempKeys[uniqueKey]) {
                        accumulator.tempKeys[uniqueKey] = true; // Mark this key as processed
                        accumulator.uniqueItems.push({
                            StatusIcon: Constants.iconRed,
                            StatusColor: Constants.colorRed,
                            Gpart: item.Gpart,
                            BpName: item.BpName,
                            CurrencyCode: item.ExpPayCurr,
                            DifferenceAmn: "0.00"
                        });
                    }

                    return accumulator;
                }, { tempKeys: {}, uniqueItems: [] }).uniqueItems; // Extract the unique items array

                oData.ProcessingStatus = aProcessingStatus;

                this.getView().setModel(new JSONModel(oData));

                this.getView().setModel(new JSONModel({
                    globalFilter: "",
                    availabilityFilterOn: false,
                    cellFilterOn: false
                }), "ui");

                this.getView().byId("idClearingTable").setThreshold(oClearingData.SelectionResult.length);
                this._oGlobalFilter = null;
                this._oPriceFilter = null;

                ActionHelper.setController({ name: "Clearing", controller: this });


                // Get Saved Variants - Both user specific and public
                let aSavedVariants = await util.getData(this.getOwnerComponent().getModel("clearingApplicationModel"), "/ClearingTableUserVariants", undefined, undefined);
                aSavedVariants = aSavedVariants.filter(line => line.VariantFor === this._ClearingType);
                oData.SavedVariants = aSavedVariants;

                this._ClearingOPMetadataInfo = await util.getClearingOPMetadataInfo(this.getOwnerComponent().getModel("clearingApplicationModel"), "clearingapplicationService.ClearingOP");

                // Below has MetadataInfo Dependency
                this._registerForP13n();
                let VariantFieldToApply = aSavedVariants.length > 0 && aSavedVariants.find(line => line.isDefault === true) ?
                    JSON.parse(aSavedVariants.find(line => line.isDefault === true).VariantFieldsAsJson)
                    : this._ClearingOPMetadataInfo.map(line => { return { key: line.Name }; });

                if (aSavedVariants.length > 0 && aSavedVariants.find(line => line.isDefault === true)) {
                    util.ApplySelectedVariantForClearingTable(this, VariantFieldToApply);
                }
                this.getView().setBusy(false);
                util.constructTotalValueTable(this);
                this.byId("idCustomFilterDialog").resetFilters();
                this._constructFilterForClearingTable();
            },

            /**
             * Event handler for navigating back.
             * Navigate back in the browser history
             * @public
             */
            onPageNavButtonPress: function () {
                // const oHistory = History.getInstance();
                // const sPreviousHash = oHistory.getPreviousHash();

                // if (sPreviousHash !== undefined) {
                //     window.history.go(-1);
                // } else {
                    const oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("RouteMainView", {}, {}, true);
                // }
            },

            /**
             * Event handler for when an object is matched in the router.
             * This function is typically called when the route pattern matches the current hash.
             *
             * @private
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the route matched
             */
            _onRouteMatched: function (oEvent) {
                this._initDisplayData();
            },

            /**
             * Event handler for the selection of a checkbox within a transaction item row.
             * This function handles the selection state change of a checkbox and performs
             * actions based on whether the checkbox is selected or deselected. It sets the
             * table to busy state while processing the selection change, and invokes helper
             * functions to perform the necessary actions.
             *
             * @async
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the checkbox selection
             */
            onCheckBoxTransactionItemSelect: async function (oEvent) {
                let oTable = this.getView().byId("idClearingTable");
                oTable.setBusy(true);

                let
                    oContext = oEvent.getSource().getBindingContext(),
                    sPath = oContext.getPath(),
                    oModel = oContext.getModel();

                const that = this;

                let oItem = oModel.getProperty(sPath);

                if (oEvent.getParameter("selected")) {
                    await ActionHelper.clearingItemSelected(oContext, that, oItem);

                } else {
                    await ActionHelper.clearingItemUnSelected(oContext);
                }

                ActionHelper.calculateClearingAmnDifference(that);
                oTable.setBusy(false);
            },

            /**
             * Event handler for setting a filter on the clearing table.
             * This function is called when a filter is applied to the clearing table.
             * It resets the selection of all transaction items by invoking the
             * `onButtonUnSelectAllPress` method.
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the filter event
             */
            onTableClearingTableFilter: function (oEvent) {
                // Reset all Transactions Selected
                this.onButtonUnSelectAllPress(oEvent);
                // var sValue = oEvent.getParameter("value") //value
                // var sColumn = oEvent.getParameter("column").getId();
                // ;
                // oEvent.preventDefault();
            },

            /**
             * Event handler for the "Unselect All" button press.
             * This function asynchronously unselects all items in the "idClearingTable" by iterating
             * over each context and invoking the `clearingItemUnSelected` method from the ActionHelper.
             * After all items are deselected, it calls `calculateClearingAmnDifference` to update
             * any relevant calculations or UI elements.
             *
             * @async
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             */
            onButtonUnSelectAllPress: async function (oEvent) {
                const that = this;
                const oClearingTable = this.byId("idClearingTable");
                const oContexts = oClearingTable.getBinding().getContexts(0, oClearingTable.getBinding().getCount());
                oContexts.forEach((oContext) => {
                    const oObject = oContext.getObject();
                    if (Constants.ClearingStatusValidForClearing.includes(oObject.ClearingStatus) && oObject.isSelected === true) {
                        ActionHelper.clearingItemUnSelected(oContext);
                    }
                });

                ActionHelper.calculateClearingAmnDifference(that);

            },

            /**
             * Event handler for the "Select All" button press.
             * This function asynchronously Selects all items in the "idClearingTable" by iterating
             * over each context and invoking the `clearingItemUnSelected` method from the ActionHelper.
             * After all items are deselected, it calls `calculateClearingAmnDifference` to update
             * any relevant calculations or UI elements.
             *
             * @async
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             */
            onButtonSelectAllPress: async function (oEvent) {
                const oClearingTable = this.byId("idClearingTable");
                const oContexts = oClearingTable.getBinding().getContexts(0, oClearingTable.getBinding().getCount());
                const that = this;
                try {
                    this.byId("idClearingTable").setBusy(true);
                    await ActionHelper.clearingItemSelectedInBulk(oContexts, that);
                } catch (error) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("CommError"));
                }
                ActionHelper.calculateClearingAmnDifference(that);
                this.byId("idClearingTable").setBusy(false);
            },

            /**
             * Event handler for changes in the allocation amount.
             * This function is called asynchronously when the allocation amount is changed by the user.
             * It updates the context with the new allocation amount and recalculates the clearing amount difference
             * using helper functions from the ActionHelper module.
             *
             * @async
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the change event
             */
            onAllocAmnChange: async function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();

                const that = this;

                await ActionHelper.onAllocAmnChange(oContext, that);
                await ActionHelper.calculateClearingAmnDifference(that);


                // let oContext = oEvent.getSource().get
            },


            /**
             * This function registers the P13n Personalisation.
             * @private
             */
            _registerForP13n: function () {
                var oTable = this.byId("idClearingTable");

                let aColumns = oTable.getColumns();
                let aColumnsWithWidth = [];
                let aClearingOPMetadataInfo = this._ClearingOPMetadataInfo;
                let aColumnData = aColumns.map(function (column) {
                    let oLabel = column.getLabel();
                    let oTemplate = column.getTemplate();
                    let sPath = "";

                    if (oTemplate.getBindingInfo("text")) {
                        sPath = oTemplate.getBindingInfo("text").parts[0].path;
                    } else if (oTemplate.getBindingInfo("value")) {
                        sPath = oTemplate.getBindingInfo("value").parts[0].path;
                    }

                    var fullId = column.getId();
                    var simpleId = fullId.split("--").pop(); // assuming the ID format is 'prefix--simpleId'
                    aColumnsWithWidth.push(
                        {
                            key: simpleId,
                            width: column.getWidth() !== "" ? column.getWidth() : "7rem"
                        }
                    );

                    // Update Column Label in Metadata helper
                    aClearingOPMetadataInfo = aClearingOPMetadataInfo.map(obj => {
                        if (obj.Name === sPath) {
                            // Clone the object and modify the property
                            return { ...obj, Label: oLabel.getText() };
                        } else {
                            // No modification needed, return the original object
                            return obj;
                        }
                    });

                    return {
                        key: simpleId,
                        label: simpleId === "isSelectedID" ? "Is Selected" : oLabel.getText(),
                        path: simpleId === "isSelectedID" ? "isSelected" : sPath
                    };
                });
                this._ColumnSettingForClearingTable = aColumnData;
                this._oMetadataHelper = new MetadataHelper(aColumnData);
                this._mIntialWidth = aColumnsWithWidth.reduce((accumulator, current) => {
                    accumulator[current.key] = current.width;
                    return accumulator;
                }, {});
                Engine.getInstance().register(oTable, {
                    helper: this._oMetadataHelper,
                    controller: {
                        Columns: new SelectionController({
                            targetAggregation: "columns",
                            control: oTable
                        }),
                        Sorter: new SortController({
                            control: oTable
                        }),
                        Groups: new GroupController({
                            control: oTable
                        }),
                        ColumnWidth: new ColumnWidthController({
                            control: oTable
                        })
                    }
                });

                Engine.getInstance().attachStateChange(this._handleStateChange.bind(this));

                // Update Metadata Helper with columns 
                this._ClearingOPMetadataInfo = aClearingOPMetadataInfo;
            },
            /**
             * Event handler for Personalisation Dialog Button Press.
             * This function is called when the Personalisation Dialog Button Pressed.
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             */
            onButtonOpenPersoDialogPress: function (oEvent) {
                var oTable = this.byId("idClearingTable");

                Engine.getInstance().show(oTable, ["Columns"], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oEvent.getSource()
                });
            },

            /**
             * Event handler for Column Header Item Press.
             * @async
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the change event
             */
            onColumnHeaderItemPress: function (oEvent) {
                var oTable = this.byId("idClearingTable");
                var sPanel = oEvent.getSource().getIcon().indexOf("sort") >= 0 ? "Sorter" : "Columns";

                Engine.getInstance().show(oTable, [sPanel], {
                    contentHeight: "35rem",
                    contentWidth: "32rem",
                    source: oTable
                });
            },


            /**
             * Event handler for Sorting set on Personalisation Dialog.
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the change event
             */
            onSort: function (oEvent) {
                var oTable = this.byId("idClearingTable");
                var sAffectedProperty = this._getKey(oEvent.getParameter("column"));
                var sSortOrder = oEvent.getParameter("sortOrder");

                //Apply the state programatically on sorting through the column menu
                //1) Retrieve the current personalization state
                Engine.getInstance().retrieveState(oTable).then(function (oState) {

                    //2) Modify the existing personalization state --> clear all sorters before
                    oState.Sorter.forEach(function (oSorter) {
                        oSorter.sorted = false;
                    });
                    oState.Sorter.push({
                        key: sAffectedProperty,
                        descending: sSortOrder === sap.ui.core.SortOrder.Descending
                    });

                    //3) Apply the modified personalization state to persist it in the VariantManagement
                    Engine.getInstance().applyState(oTable, oState);
                });
            },

            /**
             * Event handler
             * @private
             * @param {sap.ui.base.Event} oControl - 
             * @returns {String} - The key of the column
             */
            _getKey: function (oControl) {
                return this.getView().getLocalId(oControl.getId());
            },

            /**
             * Event handler
             * @private
             * @param {sap.ui.base.Event} oEvent - 
             */
            _handleStateChange: function (oEvent) {
                var oTable = this.byId("idClearingTable");
                var oState = oEvent.getParameter("state");
                // VariantManagementHelper.onPress(); // todo uncomment for other variant management
                if (oTable.getSelectedIndices().length > 0) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("delRowsBeforePerso"));
                    return;
                }
                // First Delete the entry with key isSelectedID
                oState.Columns = oState.Columns.filter(obj => obj.key !== "isSelectedID");
                // Include isSelected Checkbox in the personalization state
                oState.Columns.unshift({ key: "isSelectedID" });
                let oColumns = oState.Columns.filter(line => line.key !== "null");
                oState.Columns = oColumns;


                oTable.getColumns().forEach(function (oColumn) {

                    var sKey = this._getKey(oColumn);
                    var sColumnWidth = oState.ColumnWidth[sKey];

                    oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

                    oColumn.setVisible(false);
                    oColumn.setSortOrder(sap.ui.core.SortOrder.None);
                }.bind(this));

                oState.Columns.forEach(function (oProp, iIndex) {
                    var oCol = this.byId(oProp.key);
                    oCol?.setVisible(true);

                    oTable.removeColumn(oCol);
                    oTable.insertColumn(oCol, iIndex);
                }.bind(this));

                var aSorter = [];
                oState.Sorter.forEach(function (oSorter) {
                    var oColumn = this.byId(oSorter.key);
                    /** @deprecated As of version 1.120 */
                    oColumn.setSorted(true);
                    oColumn.setSortOrder(oSorter.descending ? sap.ui.core.SortOrder.Descending : sap.ui.core.SortOrder.Ascending);
                    aSorter.push(new Sorter(this._oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
                }.bind(this));
                oTable.getBinding("rows").sort(aSorter);
            },

            /**
             * Event handler for live changes to a currency input field.
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the live change event
             * @param {any} pb - a
             * @param {String} controlName - The name of the control
             */
            onLiveChangeCurrency: function (oEvent, pb, controlName) {

                if (controlName === "clearableAmountInput") {
                    let oContext = oEvent.getSource().getBindingContext(),
                        sPath = oContext.getPath(),
                        oModel = oContext.getModel();
                    // Set Modified flag
                    oModel.setProperty(sPath + "/IsSOAFieldsModified", true, oContext);
                }
            },
            /**
             * Event handler for Currency Field Submit
             * This function validates the input against a currency format, allowing up to 15 digits before the decimal
             * point and up to 2 digits after the decimal point. If the input is not in a valid currency format,
             * a message toast is displayed to the user, and the input field is reset to "0".
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the live change event
             */
            onCurrencyFieldSumbit: function (oEvent) {
                var oInput = oEvent.getSource(),
                    sValue = oInput.getValue().replace(/,/g, ""),
                    fValue = parseFloat(sValue),
                    [integerPart, decimalPart] = fValue.toString().split("."),
                    isValidInteger = integerPart.length <= 15,
                    isValidDecimal = !decimalPart || decimalPart.length <= 2,
                    roundedValue = isValidDecimal ? fValue : parseFloat(fValue.toFixed(2));

                if (!isValidInteger || isNaN(fValue)) {
                    MessageToast.show("Please enter a valid currency format.");
                    oInput.setValue("0");
                } else {
                    oInput.setValue(roundedValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }));
                }
            },

            /**
             * Event handler for checkbox selection within a list item.
             * This function updates the "ClearableAmount" property of the current item in the model
             * based on the checkbox selection state. If the checkbox is selected, the "ClearableAmount"
             * is set to the item's "Amn" value. If the checkbox is deselected, the "ClearableAmount"
             * is set to "0.00".
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the checkbox selection
             */
            onClearableChecked: function (oEvent) {

                let oContext = oEvent.getSource().getBindingContext(),
                    sPath = oContext.getPath(),
                    oModel = oContext.getModel();
                let currentItem = oModel.getProperty(sPath);

                if (oEvent.getParameter("selected")) {
                    oModel.setProperty(sPath + "/ClearableAmount", currentItem.Amn, oContext);
                } else {
                    oModel.setProperty(sPath + "/ClearableAmount", "0.00", oContext);
                }
                // Set Modified flag
                oModel.setProperty(sPath + "/IsSOAFieldsModified", true, oContext);
            },

            /**
             * Event handler for the "Clear All" button press.
             * This function iterates over all contexts bound to the "idClearingTable" and sets the "ClearableAmount"
             * to the item's "Amn" value and marks the item as clearable by setting "Clearable" to true for each
             * item that is not already marked as clearable.
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             */
            onClearAllButtonPress: function (oEvent) {
                const oClearingTable = this.byId("idClearingTable");
                const oContexts = oClearingTable.getBinding().getContexts(0, oClearingTable.getBinding().getCount());
                oContexts.forEach((oContext) => {
                    let oModel = oContext.getModel(),
                        sPath = oContext.getPath(),
                        oObject = oContext.getObject();

                    if (oObject.Clearable === true || oObject.ClearingStatus !== 4) {
                        return;
                    }
                    oModel.setProperty(sPath + "/ClearableAmount", oObject.Amn, oContext);
                    oModel.setProperty(sPath + "/Clearable", true, oContext);
                });
            },

            /**
             * Event handler for the "UnClear All" button press.
             * This function iterates over all contexts bound to the "idClearingTable" and sets the "ClearableAmount"
             * to the item's "Amn" value and marks the item as unclearable by setting "Clearable" to false for each
             * item that is already marked as clearable.
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             */

            onUnClearAllButtonPress: function (oEvent) {
                const oClearingTable = this.byId("idClearingTable");
                const oContexts = oClearingTable.getBinding().getContexts(0, oClearingTable.getBinding().getCount());
                oContexts.forEach((oContext) => {
                    let oModel = oContext.getModel(),
                        sPath = oContext.getPath();
                    if (oContext.getObject().ClearingStatus !== 4) {
                        return;
                    }
                    oModel.setProperty(sPath + "/ClearableAmount", "0.00", oContext);
                    oModel.setProperty(sPath + "/Clearable", false, oContext);
                });
            },
            /**
             * Event handler for the "Payment" button press.
             * This function loads and opens the "AddPayment" fragment if it has not been created yet.
             * If the fragment already exists, it simply opens it. When creating the fragment for the first time,
             * it initializes the fragment's model with payment data and business partner information from the
             * main view's model.
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             * @param {any} pb - a
             * @param {String} buttonName - The name of the control
             */
            onBankChargeButtonPaymentButtonPress: async function (oEvent, pb, buttonName) {

                const sButtonText = buttonName === "AddPayment" ? "Add Payment" : "Add Bank Charge";
                let oDialog = await util.createAddPaymentBCDialog(sButtonText, this);
                oDialog.getContent()[0]?.getContent()[3]?.clearSelection(); // Clear Combobox Selection
                oDialog.open();

            },

            /**
             * Event handler for the "Add Payment" button press.
             * This function collects payment information from the input fields in the payment fragment,
             * creates a new payment object with default values, and populates it with the payment data.
             * It then adds this payment object to the selection result array in the model and recalculates
             * the clearing amount difference. Finally, it closes the payment fragment.
             *
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the button press
             */
            onAddPaymentButtonPress: function (oEvent) {
                let oModel = this.getView().getModel(),
                    oClearingData = this.getOwnerComponent().getModel("clearingPageModel").getData(),
                    oDialogData = oEvent.getSource().getParent().getModel().getData(),
                    // oClearingData = MockData.SelectionParameters, //Todo remove this and use the clearing data model
                    iPayment = oDialogData.Payment,
                    aSelectionResult = oModel.getData().SelectionResult,
                    sSelectedBP = oDialogData.BusinessPartner;
                if (!sSelectedBP) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("chooseBP"));
                    return;
                }

                const that = this;

                const createDefaultObject = (obj) => {
                    return Object.keys(obj).reduce((newObj, key) => {
                        if (typeof obj[key] === "boolean") {
                            newObj[key] = false;
                        } else if (typeof obj[key] === "string") {
                            newObj[key] = "";
                        } else if (typeof obj[key] === "number") {
                            newObj[key] = 0;
                        } else {
                            newObj[key] = null;
                        }
                        return newObj;
                    }, {});
                };


                let oData = oModel.getData();
                let sAmountInNegative = iPayment, //* -1, For Premium Payables Consider as it as
                    sAmount = sAmountInNegative.toFixed(2);
                let oPaymentBCToBeAdded = createDefaultObject(oData.SelectionResult[0]);
                // @ts-ignore
                oPaymentBCToBeAdded.BpName = this.getView().getModel().getProperty("/ProcessingStatus").find(oBP => oBP.Gpart === sSelectedBP).BpName;
                // @ts-ignore
                oPaymentBCToBeAdded.Gpart = sSelectedBP;
                // @ts-ignore
                oPaymentBCToBeAdded.Amn = sAmount;// @ts-ignore
                oPaymentBCToBeAdded.OrigCurr = oClearingData.SelectionParameters.Currency;// @ts-ignore
                oPaymentBCToBeAdded.ExpPayAmn = oPaymentBCToBeAdded.Amn;// @ts-ignore
                oPaymentBCToBeAdded.ExpPayCurr = oClearingData.SelectionParameters.Currency;// @ts-ignore
                oPaymentBCToBeAdded.AllocAmnSettCurr = oPaymentBCToBeAdded.Amn;// @ts-ignore
                oPaymentBCToBeAdded.AllocAmn = oPaymentBCToBeAdded.Amn;// @ts-ignore
                oPaymentBCToBeAdded.RoeRecCurr = 1;// @ts-ignore
                oPaymentBCToBeAdded.isAllocAmnEditable = true;// @ts-ignore
                oPaymentBCToBeAdded.isSelected = true;// @ts-ignore
                oPaymentBCToBeAdded.BookedAmount = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.ClearedAmount = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.ClearableAmount = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.FinanceCleared = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.TaxRate = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.LineSize = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.RoeTr = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.DeltaDueRoe = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.SettAmnRoeTr = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.SoaClearable = "0.00";// @ts-ignore
                oPaymentBCToBeAdded.ClearingStatus = 4;// @ts-ignore

                oPaymentBCToBeAdded.TrType = oEvent.getSource().getText().includes("Payment") ? "Payment" : "Bank Charge";// @ts-ignore


                let maxNo = aSelectionResult.reduce((max, obj) => obj.No > max ? obj.No : max, aSelectionResult[0].No);
                // Increment the max "No" by 1 to get the next available number
                // @ts-ignore
                oPaymentBCToBeAdded.No = maxNo + 1;
                aSelectionResult.push(oPaymentBCToBeAdded);
                oModel.setProperty("/SelectionResult", aSelectionResult);
                ActionHelper.calculateClearingAmnDifference(that);
                this._constructFilterForClearingTable(); // Update Filter
                oEvent.getSource().getParent().getContent()[0]?.getContent()[3]?.clearSelection(); // Clear Combobox Selection
                oEvent.getSource().getParent().close();


            },
            /**
             * Handles the press event on the clearing button. This function retrieves the clearing data from the model,
             * prepares the data for the AddPostingDate fragment, and either loads the fragment if it's not already loaded,
             * or opens the existing fragment.
             *
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when the clearing button is pressed.
             */
            onExecuteClearingButtonPress: function (oEvent) {
                const oView = this.getView();
                let oClearingData = this.getOwnerComponent().getModel("clearingPageModel").getData();
                const aClearingOP = oView.getModel().getData().SelectionResult;
                if (!aClearingOP.find(x => x.isSelected === true)) {
                    MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("NoTransactionsSelected"));
                    return;
                }
                if (
                   !aClearingOP.some(x => x.isSelected === true && Constants.PayableTransactionTypesInPremiumPayables.includes(x.TrType) )  
                   || !aClearingOP.some(x => x.isSelected === true && !Constants.PayableTransactionTypesInPremiumPayables.includes(x.TrType) ) ) {
                    MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("NoTransactionsSelectedForAction"));
                    return;
                }

                if(!util.IsClearingAmnDifferenceZero(this.getView())) {
                    MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("ClearingAmnDifferenceZero"));
                    return;
                }
                const oData = oClearingData.SelectionParameters;
                
                // Disable the button when the fragment is loaded and enable it when the fragment is closed
                this._executeClearingButton = oEvent.getSource();
                this._executeClearingButton.setEnabled(false);

                if (!this._oAddPostingDateFragment) {
                    Fragment.load({
                        name: "atom.ui.clearing.clearingapplication.view.fragments.AddPostingDate",
                        controller: this
                    }).then(function (oFragment) {
                        this._oAddPostingDateFragment = oFragment;
                        this._oAddPostingDateFragment.setModel(new JSONModel(oData));
                        oView.addDependent(this._oAddPostingDateFragment);
                        this._oAddPostingDateFragment.open();
                    }.bind(this));
                } else {
                    this._oAddPostingDateFragment.setModel(new JSONModel(oData));
                    this._oAddPostingDateFragment.open();
                }

            },

            /**
             * Asynchronously handles the press event on the proceed to clearing button. This function performs several 
             * checks before proceeding with the clearing action, including validation of the posting period and the posting 
             * date. It uses models for retrieving necessary data and displays messages based on the validation results.
             *
             * @async
             * @function onProceedClearingButtonPress
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when the proceed to clearing 
             * button is pressed. This object is used to access various UI elements and models associated with the event.
             * @returns {Promise<void>} A promise that resolves when the clearing action has been attempted, displaying appropriate messages or warnings based on the outcome of various checks.
             **/
            onProceedClearingButtonPressBak: async function (oEvent) {
                let oModel = this.getView().getModel("clearingApplicationModel"),
                    oFragModelData = oEvent.getSource().getParent().getModel().getData(),
                    sCompanyCode = oFragModelData.CompanyCode,
                    sPostingDate = oFragModelData.PostingDate;

                if (!sPostingDate) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("PostingDateNotValid"));
                    return;
                }

                oEvent.getSource().getParent().setBusy(true);

                try {
                    let isPostingPeriodOpen = await util.validatePostingPeriod(oModel, sPostingDate, sCompanyCode);
                    if (!isPostingPeriodOpen.CheckPostingPeriod) {
                        MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("PostingDateNotOpen"));
                        return;
                    }

                    if (!util.checkPostingDateOnCurrentMonth(sPostingDate.substring(0, 10))) {
                        MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("PostingDateInOtherMonth"), {
                            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: async (sAction) => {
                                if (sAction === MessageBox.Action.CANCEL) {
                                    // this.getView().setBusy(false);
                                    oEvent.getSource().getParent().setBusy(false);
                                    return;
                                }
                                await ActionHelper.tryProceedToClear(oEvent);
                                // this.getView().setBusy(false);
                                oEvent.getSource().getParent().setBusy(false);
                            }
                        });
                    } else {
                        await ActionHelper.tryProceedToClear(oEvent);
                        // this.getView().setBusy(false);
                        oEvent.getSource().getParent().setBusy(false);
                    }
                } catch (error) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("CommError"));
                    // this.getView().setBusy(false);
                    oEvent.getSource().getParent().setBusy(false);
                }
            },

            /**
             * Asynchronously handles the press event on the save SOA data button. This function initiates the pre-save processing of 
             * Statement of Account (SOA) details by calling the `preSaveSOADetails` method from the `ActionHelper`.
             *
             * @async
             * @function onSaveSOADataButtonPress
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when the save SOA data button is pressed.
             */
            onSaveSOADataButtonPress: async function (oEvent) {
                ActionHelper.preSaveSOADetails();
            },

            /**
             * Asynchronously handles the press event on the confirm to save button for tax pair. This function sets the 
             * button and the view to a busy state, attempts to save SOA details using the `ActionHelper.saveSOADetails` 
             * method, and handles any errors that may occur during the save process. After the operation, it resets the busy state and closes the parent of the event source.
             *
             * @async
             * @function onConfirmToSaveButtonTaxPairPress
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when the confirm to save 
             * button is pressed. This object is used to access the button that triggered the event and its parent view.
             */
            onConfirmToSaveButtonTaxPairPress: async function (oEvent) {
                oEvent.getSource().getParent().setBusy(true);
                try {
                    await ActionHelper.saveSOADetails();
                } catch (error) {
                    MessageBox.error(error.message);
                }
                this.getView().setBusy(false);
                // oEvent.getSource().setBusy(false);
                oEvent.getSource().getParent().setBusy(false);
                oEvent.getSource().getParent().close();
            },

            /**
             * Handles live changes to SOA (Statement of Account) input fields. This function is called whenever there is a change in the 
             * input fields of the SOA. It sets a flag in the model to indicate that the SOA fields have been modified.
             *
             * @function onSoaFieldsInputLiveChange
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when any input field related to SOA is changed.
             */
            onSoaFieldsInputLiveChange: function (oEvent) {

                let oContext = oEvent.getSource().getBindingContext(),
                    sPath = oContext.getPath(),
                    oModel = oContext.getModel();
                // Set Modified flag
                oModel.setProperty(sPath + "/IsSOAFieldsModified", true, oContext);
            },

            /**
             * Handles the button press event for unallocated amounts. This function constructs a data object with unique external 
             * references and business partners from the model. It then either loads a new fragment for adding unallocated amounts or 
             * sets the model on an existing fragment and opens it. It also attaches validation handlers to the relevant combo box 
             * elements within the fragment.
             *
             * @function onUnAllocatedAmountButtonPress
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when the unallocated amount button is pressed.
             */
            onUnAllocatedAmountButtonPress: function (oEvent) {

                const oView = this.getView();
                const aExtRefs = [...new Set(oView.getModel().getProperty("/SelectionResult").map(oExtRef => oExtRef.ExtRef))].map(oExtRef => { return { "ExtRef": oExtRef }; });

                const oData = {
                    ExtRefs: aExtRefs,
                    Amount: 0.00,
                    BusinessPartners: oView.getModel().getProperty("/ProcessingStatus").map(oBP => ({ BpName: oBP.BpName, Gpart: oBP.Gpart }))
                };
                if (!this._addUnAllocAmnFragment) {
                    Fragment.load({
                        name: "atom.ui.clearing.clearingapplication.view.fragments.AddUnAllocAmn",
                        controller: this
                    }).then(function (oFragment) {
                        this._addUnAllocAmnFragment = oFragment;
                        this._addUnAllocAmnFragment.setModel(new JSONModel(oData));
                        Element.getElementById("idExtRefsFragComboBox").attachChange(util.validateComboBox);
                        Element.getElementById("idBusinessPartnersUnAllocatedAmnFragComboBox").attachChange(util.validateComboBox);
                        oView.addDependent(this._addUnAllocAmnFragment);
                        this._addUnAllocAmnFragment.open();
                    }.bind(this));
                } else {
                    this._addUnAllocAmnFragment.setModel(new JSONModel(oData));
                    Element.getElementById("idExtRefsFragComboBox").attachChange(util.validateComboBox);
                    Element.getElementById("idBusinessPartnersUnAllocatedAmnFragComboBox").attachChange(util.validateComboBox);
                    this._addUnAllocAmnFragment.open();
                }

            },

            /**
             * Handles the button press event for adding an unallocated amount. This function collects input values from the 
             * UI, validates the selections, and creates a new transaction entry with the unallocated amount. It then updates 
             * the model with the new entry and recalculates the clearing amount difference.
             *
             * @function onAddUnAllocatedAmountButtonPress
             * @param {sap.ui.base.Event} oEvent - The event object passed by the UI5 framework when the button for adding an unallocated amount is pressed.
             */
            // eslint-disable-next-line max-statements
            onAddUnAllocatedAmountButtonPress: function (oEvent) {
                let oModel = this.getView().getModel(),
                    oClearingData = this.getOwnerComponent().getModel("clearingPageModel").getData(),
                    // oClearingData = MockData.SelectionParameters, //Todo remove this and use the clearing data model
                    iAmount = Element.getElementById("idAmountFragInput").getValue(),
                    aSelectionResult = oModel.getData().SelectionResult,
                    oSelectedBP = Element.getElementById("idBusinessPartnersUnAllocatedAmnFragComboBox").getSelectedItem()?.getBindingContext()?.getObject(),
                    oSelectedExtRef = Element.getElementById("idExtRefsFragComboBox").getSelectedItem()?.getBindingContext()?.getObject();

                if (!oSelectedBP) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("chooseBP"));
                    return;
                }

                if (!oSelectedExtRef) {
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("chooseExtRef"));
                    return;
                }


                const that = this;

                const createDefaultObject = (obj) => {
                    return Object.keys(obj).reduce((newObj, key) => {
                        if (typeof obj[key] === "boolean") {
                            newObj[key] = false;
                        } else if (typeof obj[key] === "string") {
                            newObj[key] = "";
                        } else if (typeof obj[key] === "number") {
                            newObj[key] = 0;
                        } else {
                            newObj[key] = null;
                        }
                        return newObj;
                    }, {});
                };


                let oData = oModel.getData();
                let sAmountFloat = parseFloat(iAmount.replace(/,/g, "")),
                    sAmount = sAmountFloat.toFixed(2);
                let oUnAllocatedAmountToBeAdded = createDefaultObject(oData.SelectionResult[0]);
                // @ts-ignore
                oUnAllocatedAmountToBeAdded.BpName = oSelectedBP.BpName;
                // @ts-ignore
                oUnAllocatedAmountToBeAdded.Gpart = oSelectedBP.Gpart;
                // @ts-ignore
                oUnAllocatedAmountToBeAdded.Amn = sAmount;// @ts-ignore
                oUnAllocatedAmountToBeAdded.OrigCurr = oClearingData.SelectionParameters.Currency;// @ts-ignore
                oUnAllocatedAmountToBeAdded.ActCurrRec = oClearingData.SelectionParameters.Currency;// @ts-ignore
                oUnAllocatedAmountToBeAdded.ExtRef = oSelectedExtRef.ExtRef;// @ts-ignore
                // oUnAllocatedAmountToBeAdded.ExpPayAmn = oUnAllocatedAmountToBeAdded.Amn;// @ts-ignore
                oUnAllocatedAmountToBeAdded.ExpPayCurr = oClearingData.SelectionParameters.Currency;// @ts-ignore
                oUnAllocatedAmountToBeAdded.AllocAmnSettCurr = oUnAllocatedAmountToBeAdded.Amn;// @ts-ignore
                // oUnAllocatedAmountToBeAdded.AllocAmn = oUnAllocatedAmountToBeAdded.Amn;// @ts-ignore
                oUnAllocatedAmountToBeAdded.RoeRecCurr = 1;// @ts-ignore
                oUnAllocatedAmountToBeAdded.isAllocAmnEditable = false;// @ts-ignore
                oUnAllocatedAmountToBeAdded.isSelected = false;// @ts-ignore
                oUnAllocatedAmountToBeAdded.TrType = "OVER PAYMENT";// @ts-ignore
                let oEntry = oClearingData.SelectionResult.find(line => line.ExtRef === oSelectedExtRef.ExtRef);
                // @ts-ignore
                oUnAllocatedAmountToBeAdded.InsuredName = oEntry?.InsuredName;// @ts-ignore
                oUnAllocatedAmountToBeAdded.Vkont = oEntry.Vkont;// @ts-ignore
                oUnAllocatedAmountToBeAdded.BookedAmount = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.AllocAmn = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.ClearedAmount = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.ExpPayAmn = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.ClearableAmount = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.FinanceCleared = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.TaxRate = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.LineSize = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.RoeTr = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.DeltaDueRoe = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.SettAmnRoeTr = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.SoaClearable = "0.00";// @ts-ignore
                oUnAllocatedAmountToBeAdded.ClearingStatus = 4;// @ts-ignore
                let maxNo = aSelectionResult.reduce((max, obj) => obj.No > max ? obj.No : max, aSelectionResult[0].No);
                // Increment the max "No" by 1 to get the next available number
                // @ts-ignore
                oUnAllocatedAmountToBeAdded.No = maxNo + 1;
                aSelectionResult.push(oUnAllocatedAmountToBeAdded);
                oModel.setProperty("/SelectionResult", aSelectionResult);
                ActionHelper.calculateClearingAmnDifference(that);
                this._constructFilterForClearingTable(); // Update Filter
                oEvent.getSource().getParent().close();
            },

            /**
             * Handles the press event for the "Copy SOA Ref" button. This function first checks if there are valid entries in the 
             * `SelectionResult` array that are clearable and lack an SOA reference. If no such entries exist, it displays an error 
             * message. Otherwise, it either creates a new dialog for copying the SOA reference or uses an existing one. The dialog 
             * includes an input field for the SOA reference and two buttons: "Submit" for copying the reference to selected entries, and 
             * "Cancel" for closing the dialog.
             *
             * @function onCopySOARefButtonPress
             * @param {sap.ui.base.Event} oEvent - The event object provided by the UI5 framework when the "Copy SOA Ref" button is pressed.
             */
            onCopySOARefButtonPress: function (oEvent) {

                let aClearingTableData = this.getView().getModel().getData()?.SelectionResult;

                // Check if Valid Entries Where SOA Ref needs to be copied are available. 
                if (!aClearingTableData.find((line) => line.Clearable === true && line.SoaReference === "")) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("EmptySOARef"));
                    return;
                }

                if (!this._oCopySOARefDialog) {
                    this._oCopySOARefDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Copy SOA Ref",
                        content: [
                            new sap.m.Input("soaRefInput", {
                                width: "100%",
                                placeholder: "Enter SOA Ref",
                                liveChange: function (oLiveChangeEvent) {
                                    var sText = oLiveChangeEvent.getParameter("value");
                                    this._oCopySOARefDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(this)
                            })
                        ],
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Submit",
                            enabled: false,
                            press: function () {
                                ActionHelper.copySOAReference(Element.getElementById("soaRefInput").getValue());
                            }
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                this._oCopySOARefDialog.close();
                            }.bind(this)
                        })
                    });
                }

                this._oCopySOARefDialog.open();

            },
            /**
 * Handles the press event for the "Clear SOA Ref" button. This function creates a dialog that prompts the user to enter an 
 * SOA reference to be cleared. The dialog includes an input field and two buttons: "Submit" to clear the reference and 
 * "Cancel" to close the dialog. The "Submit" button is initially disabled and is enabled when the input field contains text. 
 * The function ensures that the dialog is displayed to the user, allowing them to clear the SOA reference.
 *
 * @function onClearSOARefButtonPress
 * @param {sap.ui.base.Event} oEvent - The event object provided by the UI5 framework when the "Clear SOA Ref" button is pressed.
 */
            onClearSOARefButtonPress: function (oEvent) {


                if (!this._oClearSOARefDialog) {
                    this._oClearSOARefDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Clear SOA Ref",
                        content: [
                            new sap.m.Input("soaRefInputToClear", {
                                width: "100%",
                                placeholder: "Enter SOA Ref",
                                liveChange: function (oLiveChangeEvent) {
                                    var sText = oLiveChangeEvent.getParameter("value");
                                    this._oClearSOARefDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(this)
                            })
                        ],
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Submit",
                            enabled: false,
                            press: async function () {
                                ActionHelper.clearSOAReference(Element.getElementById("soaRefInputToClear").getValue());
                            }
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                this._oClearSOARefDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this._oClearSOARefDialog.open();


            },
            /**
             * Handles the press event for the "SOA Ref Subtotals" button. This function calculates the subtotals of clearable amounts by 
             * SOA reference and currency from the `SelectionResult` array in the model. It then creates a table displaying these 
             * subtotals and presents it in a dialog to the user. The dialog includes a "Close" button to dismiss it.
             *
             * @function onSOARefSubtotalsButtonPress
             */
            onSOARefSubtotalsButtonPress: function () {

                let aClearingTableData = this.getView().getModel().getData()?.SelectionResult;

                const totals = aClearingTableData.reduce((acc, { OrigCurr, SoaReference, ClearableAmount }) => {
                    // Use an empty string if SoaRef is undefined
                    const key = `${OrigCurr}-${SoaReference || ""}`;
                    acc[key] = (acc[key] || 0) + parseFloat(ClearableAmount);
                    return acc;
                }, {});

                const totalsArray = Object.keys(totals)
                    .map(key => {
                        const [OrigCurr, SoaReference] = key.split("-");
                        return {
                            OrigCurr,
                            SoaReference: SoaReference || "", // Ensure SoaRef is a string
                            ClearableAmount: parseFloat(totals[key]).toFixed(2)
                        };
                    })
                    .filter(item => !(item.SoaReference === "" && item.ClearableAmount === 0)); // Exclude items with empty SoaRef and zero ClearableAmount

                // Create a JSONModel with the data
                const oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({ totals: totalsArray });

                // Create an sap.m.Table
                const oTable = new sap.m.Table({
                    columns: [
                        new sap.m.Column({
                            header: new sap.m.Label({ text: "SoaReference" })
                        }),
                        new sap.m.Column({
                            header: new sap.m.Label({ text: "ClearableAmount" })
                        }),
                        new sap.m.Column({
                            header: new sap.m.Label({ text: "Currency" })
                        })
                    ]
                });

                // Bind items to the table
                oTable.bindItems({
                    path: "/totals",
                    template: new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: "{SoaReference}" }),
                            new sap.m.Text({ text: "{ClearableAmount}" }),
                            new sap.m.Text({ text: "{OrigCurr}" })
                        ]
                    })
                });

                // Create the Dialog
                const oDialog = new sap.m.Dialog({
                    title: "SOA Ref Subtotals",
                    initialFocus: "idSoaRefSubtotalsDialogClearButton",
                    contentWidth: "30%",
                    contentHeight: "200px",
                    content: [oTable],
                    beginButton: new sap.m.Button({
                        text: "Close",
                        id: "idSoaRefSubtotalsDialogClearButton",
                        press: function () {
                            oDialog.close();
                        }
                    })
                });

                // Set the model to the dialog or the table
                oDialog.setModel(oModel);

                oDialog.attachAfterClose(() => { oDialog.destroy(); });

                // Open the Dialog
                oDialog.open();

            },
            /**
             * Handles the press event for the "Update ROE" button. This function checks if any table entries are selected for the Rate 
             * of Exchange (ROE) update. If no entries are selected, it displays an informational message. Otherwise, it either creates 
             * or opens a dialog that allows the user to enter a new ROE value. The dialog includes a "Submit" button to update the ROE 
             * for the selected entries and a "Cancel" button to close the dialog without making changes.
             *
             * The "Submit" button is initially disabled and is enabled when the user enters text in the input field. Upon pressing 
             * "Submit", the function attempts to update the ROE using the `ActionHelper.updateROE` method and recalculates the clearing 
             * amount difference. If the update is successful, the dialog is closed; if an error occurs, an error message is displayed.
             *
             * @function onROEUpdateButtonPress
             */
            onROEUpdateButtonPress: function () {
                const aClearingTableData = this.getView().getModel().getData().SelectionResult;

                if (!aClearingTableData.find(line => line.isSelected === true)) {
                    MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("NoLinesSelected"));
                    return;
                }

                if (!this._oROEUpdateDialog) {
                    this._oROEUpdateDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Update ROE",
                        content: [
                            new sap.m.Input("idRoeUpdateInput", {
                                textAlign: "Right",
                                placeholder: "Enter ROE",
                                value: {
                                    path: "/Payment",
                                    type: new sap.ui.model.type.Float({
                                        minFractionDigits: 5,
                                        maxFractionDigits: 5,
                                        minIntegerDigits: 1,
                                        maxIntegerDigits: 9,
                                        groupingEnabled: true,
                                        groupingSeparator: ",",
                                        decimalSeparator: "."
                                    })
                                },
                                liveChange: function (oLiveChangeEvent) {
                                    const sText = oLiveChangeEvent.getParameter("value");
                                    const sValue = sText.replace(/,/g, "");
                                    const fValue = parseFloat(sValue);
                                    const [integerPart, decimalPart] = fValue.toString().split(".");
                                    const isValidInteger = integerPart.length <= 9;
                                    const isValidDecimal = !decimalPart || decimalPart.length <= 5; // Allow up to 5 decimal places

                                    if (!isValidInteger || isNaN(fValue) || isNaN(sValue)) {
                                        MessageToast.show("Please enter a valid currency format.");
                                        oLiveChangeEvent.getSource().setValue("0");
                                    } else {
                                        const roundedValue = isValidDecimal ? sValue : parseFloat(fValue.toFixed(5)).toString(); // Round to 5 decimal places
                                        oLiveChangeEvent.getSource().setValue(roundedValue.toLocaleString(undefined,
                                            { minimumFractionDigits: 0, maximumFractionDigits: 5 })); // Set maximum fraction digits to 5
                                    }
                                    this._oROEUpdateDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(this),
                                change: this.onCurrencyFieldSumbit.bind(this)
                            })

                        ],
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Submit",
                            enabled: false,
                            press: async function (oEvent) {
                                try {
                                    oEvent.getSource().getParent().setBusy(true);
                                    await ActionHelper.updateROE(Element.getElementById("idRoeUpdateInput").getValue());
                                    ActionHelper.calculateClearingAmnDifference(this);
                                    oEvent.getSource().getParent().setBusy(false);
                                    this._oROEUpdateDialog.close();
                                } catch (error) {
                                    oEvent.getSource().getParent().setBusy(false);
                                    MessageBox.error(error.message);
                                }
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: "Cancel",
                            press: function () {
                                this._oROEUpdateDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this._oROEUpdateDialog.open();
            },
            _filter: function () {
                var oFilter = null;

                if (this._oGlobalFilter && this._oPriceFilter) {
                    oFilter = new sap.ui.model.Filter([this._oGlobalFilter, this._oPriceFilter], true);
                } else if (this._oGlobalFilter) {
                    oFilter = this._oGlobalFilter;
                } else if (this._oPriceFilter) {
                    oFilter = this._oPriceFilter;
                }

                this.byId("idClearingTable").getBinding().filter(oFilter, "Application");
            },
           
            _constructFilterForClearingTable: function () {
                const aColumnsToBeFiltered = Constants.filterColumnsForPremiumPayables;
                let oModel = this.getView().getModel();
                let aSelectionResult = oModel.getData().SelectionResult;

                // Prepare the data structure for filterModel
                let oFilterWithValues = {};
                aColumnsToBeFiltered.forEach(sColumn => {
                    let aColumnValues = aSelectionResult.map(line => line[sColumn]);
                    let aUniqueValues = Constants.dateColumns.includes(sColumn) ? [...new Set(aColumnValues.map(timestamp => {
                        return timestamp?.toISOString().split("T")[0]; // Extract the date part in YYYY-MM-DD format
                    }))] : [...new Set(aColumnValues)]; // Remove duplicates
                    oFilterWithValues[sColumn] = aUniqueValues.map(value => ({ value: value }));
                });

                // Set columns and filter data for the custom filter dialog
                var oFilterDialog = this.byId("idCustomFilterDialog");
                oFilterDialog.setColumns(aColumnsToBeFiltered.map(line => ({
                    key: line,
                    name: line,
                    isDate: Constants.dateColumns.includes(line)
                })));
                oFilterDialog.setFilterData(oFilterWithValues);
            },

            /**
             * Event handler for changes in the roe rec curr.
             * This function is called asynchronously when the roe rec curr is changed by the user.
             * It updates the context with the new aroe rec curr and recalculates the clearing amount difference
             * using helper functions from the ActionHelper module.
             *
             * @async
             * @param {sap.ui.base.Event} oEvent - The event object containing details about the change event
             */
            onRoeRecCurrInputChange: async function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext();

                const that = this;
                let oTable = this.getView().byId("idClearingTable");
                oTable.setBusy(true);
                await ActionHelper.onRoeRecCurrInputChange(oContext);
                await ActionHelper.calculateClearingAmnDifference(that);
                oTable.setBusy(false);
            },

            onRefreshButtonPress: async function () {
                this.getView().setBusy(true);
                let aSelectionParameters = this.getOwnerComponent().getModel("clearingPageModel").getData().SelectionParameters;
                let oClearingApplicationModelV4 = this.getOwnerComponent().getModel("clearingApplicationModelV4");
                await oClearingApplicationModelV4.getMetaModel().requestData();

                let oGetPremiumBindingContext = oClearingApplicationModelV4.bindContext("/GetPremiumPayables(...)");

                oGetPremiumBindingContext.setParameter("SelectionFilters", JSON.stringify(aSelectionParameters));
                oGetPremiumBindingContext.execute().then(() => {
                    let result = oGetPremiumBindingContext.getBoundContext().getObject();
                    let oClearingData = {
                        SelectionParameters: aSelectionParameters,
                        BankAccountNumbers: this.getOwnerComponent().getModel("clearingPageModel").getProperty("/BankAccountNumbers"),
                        SelectionResult: result.value
                    };
                    oClearingData.SelectionResult.forEach(line => {
                        line.DueDate = util.convertToTimeStamp(line.DueDate);
                        line.InceptionDate = util.convertToTimeStamp(line.InceptionDate);
                        line.ExpiryDate = util.convertToTimeStamp(line.ExpiryDate);
                    });
                    this.getOwnerComponent().setModel(new JSONModel(oClearingData), "clearingPageModel");
                    this._initDisplayData();
                }).catch((error) => {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("CommError"));
                    this.getView().setBusy(false);
                    return;
                });

            },


            /* Common functions */
            onColumnResize: util.onClearingTableColumnResize,
            onColumnMove: util.onClearingTableColumnMove,
            onCancelButtonPress: util.onCancelButtonPress,
            onCancelClearingButtonPress: util.onCancelClearingButtonPress,
            onGlobalFilterSearchFieldClearingTableSearch: util.onGlobalFilterSearchFieldClearingTableSearch,
            onTableClearingTableColumnMove: util.onTableClearingTableColumnMove,
            onVariantsButtonPress: util.onVariantsButtonPress,
            onCloseButtonVariantDialogPress: util.onCloseButtonVariantDialogPress,
            onSwitchDefaultSwitchForVariantChange: util.onSwitchDefaultSwitchForVariantChange,
            onUpdateVariantsButtonVariantDialogPress: util.onUpdateVariantsButtonVariantDialogPress,
            onAddNewVariantButtonPress: util.onAddNewVariantButtonPress,
            onApplyVariantButtonPress: util.onApplyVariantButtonPress,
            onPopupVariantPersonalizationClose: util.onPopupVariantPersonalizationClose,
            onFiltersButtonPress: util.onFiltersButtonPress,
            onCustomFilterDialogFilterChange: util.onCustomFilterDialogFilterChange,
            onHideZeroClearedRowsButtonPress: util.onHideZeroClearedRowsButtonPress,
            onButtonSelectedRowsBringToTopPress: util.onButtonSelectedRowsBringToTopPress,
            onDisplayLogsButtonPress: util.onDisplayLogsButtonPress,
            onProceedClearingButtonPress: util.onProceedClearingButtonPress
        });
    });
