sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "../../model/constants",
    "../../model/mockdata",
    "sap/ui/layout/form/SimpleForm",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/ComboBox",
    "sap/ui/core/ListItem",
    "sap/m/Button",
    "sap/m/MessageBox"
    //  eslint-disable-next-line max-params
], function (MessageToast,
    JSONModel,
    Constants,
    MockData,
    SimpleForm,
    Label,
    Input,
    ComboBox,
    ListItem,
    Button,
    MessageBox
) {
    "use strict";
    return {
        getTokenValues: function (items) {
            let aResult = [];
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                aResult.push(item.getProperty("key"));
            }
            return aResult;
        },

        /**
         * Sends GET Request
         * @public
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model
         * @param {string} sUrl - The URL for the request
         * @param {Object} oURLParameters - The URL parameters for the request
         * @param {sap.ui.model.Filter} [oFilter={}] - The filter for the request (optional)
         * @returns {Promise} - A Promise that resolves with the response if the request is successful, or rejects with the error if the request fails
        */
        // @ts-ignore
        getData: function (oModel, sUrl, oURLParameters = {}, oFilter = undefined) {
            return new Promise((resolve, reject) => {

                var options = {
                    urlParameters: oURLParameters,
                    success: function (response) {
                        resolve(response.results);
                    },
                    error: function (error) {
                        reject(error);
                    }
                };

                if (oFilter) {
                    options.filters = [oFilter];
                }

                oModel.read(sUrl, options);
            });

        },

        /**
         * Call Function Request
         * @public
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model
         * @param {String} sUrl - The URL for the request
         * @param {Object} oPayload - The URL parameters for the request
         * @param {String} sMethod - method for the request
         * @returns {Promise} - A Promise that resolves with the response if the request is successful, or rejects with the error if the request fails
        */
        // @ts-ignore
        callFunction: function (oModel, sUrl, oPayload = {}, sMethod) {
            return new Promise((resolve, reject) => {

                oModel.callFunction(sUrl, {
                    method: sMethod,
                    urlParameters: oPayload,
                    success: (oData) => resolve(oData),
                    error: (error) => {
                        try {
                            if (error?.responseText && JSON.parse(error?.responseText) && !!error?.responseText) {
                                reject(JSON.parse(error.responseText).error.message.value);
                            }
                        } catch (e) {
                            reject(error);
                        }
                    }
                });

            });

        },

        /**
         * Create Request
         * @public
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - The OData model
         * @param {String} sUrl - The URL for the request
         * @param {Object} oPayload - The URL parameters for the request
         * @returns {Promise} - A Promise that resolves with the response if the request is successful, or rejects with the error if the request fails
        */
        // @ts-ignore
        create: function (oModel, sUrl, oPayload = {}) {
            return new Promise((resolve, reject) => {

                oModel.create(sUrl, oPayload, {
                    success: (oData) => resolve(oData),
                    error: (error) => {
                        try {
                            if (error?.responseText && JSON.parse(error?.responseText) && !!error?.responseText) {
                                reject(JSON.parse(error.responseText).error.message.value);
                            }
                        } catch (e) {
                            reject(error);
                        }
                    }
                });

            });

        },
        /**
         * Converts a foreign currency amount to the local currency based on the provided rate.
         * This function asynchronously calls a backend service to perform the conversion.
         * 
         * @async
         * @function convLocalCurrency
         * @param {sap.ui.base.ManagedObject} that - The reference to the calling SAP UI5 control or view.
         * @param {number} foreignAmount - The amount in the foreign currency to be converted.
         * @param {string} foreignCurrency - The ISO currency code for the foreign currency.
         * @param {string} localCurrency - The ISO currency code for the local currency.
         * @param {number} rate - The conversion rate from the foreign currency to the local currency.
         * @returns {Promise<number>} A promise that resolves to the converted amount in the local currency.
         **/
        // eslint-disable-next-line consistent-this
        convLocalCurrency: async function (that, foreignAmount, foreignCurrency, localCurrency, rate) {

            let oClearingApplicationModel = that.getView().getModel("clearingApplicationModel"),

                oPayload = {
                    "ForeignAmount": foreignAmount,
                    "ForeignCurrency": foreignCurrency,
                    "LocalCurrency": localCurrency,
                    "Rate": rate
                };

            try {
                if (foreignCurrency === localCurrency) {
                    return foreignAmount;
                }

                let oResult =
                    await this.create(oClearingApplicationModel, "/ConvLocalCurrency", oPayload);

                let localAmount = oResult.ConvLocalCurrency.LocalAmount;

                localAmount = parseFloat(localAmount).toFixed(2);

                return localAmount;

            } catch (error) {
                MessageToast.show(that.getResourceBundle().getText("CommError"));
                throw new Error(that.getResourceBundle().getText("CommError"));
            }



        },
        // eslint-disable-next-line consistent-this
        convLocalCurrencyInBulk: async function (that, aPayload) {
            const oClearingApplicationModel = that.getView().getModel("clearingApplicationModel");

            try {

                return await this.create(oClearingApplicationModel, "/ConvLocalCurrencyInBulk", { Payload: aPayload });

            } catch (error) {
                MessageToast.show(that.getResourceBundle().getText("CommError"));
                throw new Error(that.getResourceBundle().getText("CommError"));
            }
        },


        validatePostingPeriod: async function (oModel, sPostingDate, sCompanyCode) {

            var offset = new Date().getTimezoneOffset() / 60;
            let oPostingDate = new Date(sPostingDate);
            let oDate = oPostingDate.setHours(
                offset * -1
            );

            let oPayload = {
                "PostingDate": oPostingDate.toISOString(), //sPostingDate + "T11:13:00",
                "CompanyCode": sCompanyCode
            };

            let isPostingPeriodValid = false;

            try {
                let result = //await this.callFunction(oModel, "/checkPostingPeriod", oPayload, "GET");

                    await this.create(oModel, "/CheckPostingPeriod", oPayload);
                isPostingPeriodValid = result;
                console.log("isPosting", isPostingPeriodValid);
            } catch (error) {
                throw new Error(error);
            }

            return isPostingPeriodValid;

        },

        checkPostingDateOnCurrentMonth: function (sPostingDate) {
            let postingDate = new Date(sPostingDate);
            let currentDate = new Date();

            if (postingDate.getMonth() === currentDate.getMonth() && postingDate.getFullYear() === currentDate.getFullYear()) {
                return true;
            } else {
                return false;
            }

        },



        getClearingOPOdataStructure: async function (oModel, aClearingData, isDateConversionNeeded) {
            var oMetaModel = oModel.getMetaModel();


            await oMetaModel.loaded();
            var oEntityType = oMetaModel.getODataEntityType("clearingapplicationService.ClearingOP");
            let aProperties = oEntityType.property.map(x => x.name);

            const aClearingOP = aClearingData.map(obj => {
                return aProperties.reduce((accumulator, propertyName) => {
                    if (Object.hasOwn(obj, propertyName)) {
                        accumulator[propertyName] = obj[propertyName];
                        if (oEntityType.property.find(o => o.name === propertyName)?.type === "Edm.Decimal") {
                            accumulator[propertyName] = obj[propertyName] + "";
                        }
                        if (isDateConversionNeeded && oEntityType.property.find(o => o.name === propertyName)?.type === "Edm.DateTime") {
                            accumulator[propertyName] = (new Date(obj[propertyName])).toISOString();
                        }
                    }
                    return accumulator;
                }, {});
            });
            return aClearingOP;
        },

        validateComboBox: function (oEvent) {

            var newval = oEvent.getParameter("newValue");
            var key = oEvent.getSource().getSelectedItem();


            if (newval !== "" && key === null) {
                oEvent.getSource().setValue("");
                oEvent.getSource().setValueState("Error");
            } else {
                oEvent.getSource().setValueState("None");
            }
        },

        getClearingOPMetadataInfo: async function (oModel, sEntitySetName) {
            var oMetaModel = oModel.getMetaModel();
            await oMetaModel.loaded();
            var oEntityType = oMetaModel.getODataEntityType(sEntitySetName);

            const _mapODataTypeToJSType = (sType) => {
                switch (sType) {
                    case "Edm.String":
                        return "string";
                    case "Edm.Boolean":
                        return "boolean";
                    case "Edm.Int16":
                    case "Edm.Int32":
                    case "Edm.Int64":
                        return "number";
                    case "Edm.Decimal":
                    case "Edm.Double":
                    case "Edm.Single":
                        return "number";
                    case "Edm.Byte":
                    case "Edm.SByte":
                        return "number";
                    case "Edm.DateTime":
                    case "Edm.DateTimeOffset":
                        return "Date";
                    case "Edm.Time":
                        return "string"; // JavaScript does not have a dedicated time type
                    case "Edm.Guid":
                        return "string"; // GUIDs are typically represented as strings in JavaScript
                    case "Edm.Binary":
                        return "ArrayBuffer"; // Binary data can be represented as ArrayBuffer in JavaScript
                    // Add more cases as needed for different OData types
                    default:
                        return "unknown";
                }
            };

            var aFields = oEntityType.property.map(function (property) {
                return {
                    Name: property.name,
                    Type: _mapODataTypeToJSType(property.type),
                    MaxLength: property.maxLength
                };
            });
            return aFields;

        },

        convertToTimeStamp: function (date) {
            if (!date) { return null; }
            const timestamp = parseInt(date.match(/\d+/)[0], 10);

            // Step 2: Create a new Date object
            return new Date(timestamp);
        },

        onConfirmFilterDialog: function (oEvent) {
            var oTable = this.getView().byId("idClearingTable");
            var oBinding = oTable.getBinding("rows"); // or "items" if you are using a List-based control
            var mParams = oEvent.getParameters();
            var aFilterGroups = {};

            // Organize filters by column
            mParams.filterItems.forEach(function (oItem) {
                var sPath = oItem.getParent().getKey();
                if (!aFilterGroups[sPath]) {
                    aFilterGroups[sPath] = [];
                }
                aFilterGroups[sPath].push(new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.EQ, Constants.dateColumns.includes(sPath) ? new Date(oItem.getKey()) : oItem.getKey()));
            });

            // Create an array of filter arrays (one array per column)
            var aFilters = Object.keys(aFilterGroups).map(function (key) {
                return new sap.ui.model.Filter(aFilterGroups[key], false); // false for OR within the same column
            });

            // Apply the combined filters to the table's binding with AND between different columns
            oBinding.filter(new sap.ui.model.Filter(aFilters, true)); // true for AND across different columns

            this.util.constructTotalValueTable(this);

            // Reset Search Filter Bar if there is any value set
            this.getView().byId("idGlobalFilterSearchField").setValue("");

        },

        constructTotalValueTable: function (oController) {
            const oView = oController.getView();
            const viewId = oView.getId();
            let aTotalValueColumns;
            if (viewId.includes("PremiumReceivables")) {
                aTotalValueColumns = Constants.totalValueColumnsForPremiumReceivables;
            } else if (viewId.includes("ClaimReceivables")) {
                aTotalValueColumns = Constants.totalValueColumnsForClaimReceivables;
            } else if (viewId.includes("PremiumPayables")) {
                aTotalValueColumns = Constants.totalValueColumnsForPremiumPayables;
            } else if (viewId.includes("ClaimPayables")) {
                aTotalValueColumns = Constants.totalValueColumnsForClaimPayables;
            } else {
                aTotalValueColumns = [];
            }

            var oClearingTable = oView.byId("idClearingTable");
            // Get the visible rows
            var aVisibleRows = oClearingTable.getBinding("rows").getContexts(0, oClearingTable.getBinding("rows").getCount());

            // Initialize an array to hold the JSON data of visible rows
            var aVisibleRowsData = [];

            // Loop through each visible row
            aVisibleRows.forEach(function (oRow) {
                // Get the binding context of the row
                var oContext = oRow;

                // Check if the context is valid
                if (oContext) {
                    // Get the JSON data of the row
                    var oRowData = oContext.getObject();

                    // Add the row data to the array
                    aVisibleRowsData.push(oRowData);
                }
            });
            let aData = aVisibleRowsData;

            let result = [];

            // Helper function to find or create a result entry for a specific currency
            function findOrCreateResultEntry(currency) {
                let entry = result.find(item => item.currency === currency);
                if (!entry) {
                    entry = { currency: currency };
                    // Initialize all totals to 0 for each column dynamically
                    aTotalValueColumns.forEach(column => {
                        entry[`${column.AmountField}Total`] = 0;
                    });
                    result.push(entry);
                }
                return entry;
            }

            // Iterate over the data and sum the amounts
            aData.forEach(dataItem => {
                aTotalValueColumns.forEach(column => {
                    let amountField = column.AmountField;
                    let currencyField = column.CurrencyField;
                    let amount = parseFloat(dataItem[amountField]) || 0;
                    let currency = dataItem[currencyField];

                    let resultEntry = findOrCreateResultEntry(currency);
                    resultEntry[`${amountField}Total`] = parseFloat((resultEntry[`${amountField}Total`] + amount).toFixed(2));
                });
            });

            // Format the result entries
            result = result.map(entry => {
                let formattedEntry = {};
                aTotalValueColumns.forEach(column => {
                    let amountField = column.AmountField;
                    let oFieldName = oController._ClearingOPMetadataInfo.find(line => line.Name === amountField)?.Label;
                    formattedEntry[`${oFieldName}`] = `${entry[`${amountField}Total`]} ${entry.currency}`;
                });
                return formattedEntry;
            });

            let oColumnsWithTotalValues = result;

            // Get the unique column names from the data
            let columnNames = new Set();
            oColumnsWithTotalValues.forEach(item => {
                Object.keys(item).forEach(key => columnNames.add(key));
            });

            // Create columns for the table
            let columns = Array.from(columnNames).map(columnName => {
                return new sap.m.Column({
                    header: new sap.m.Text({ text: columnName })
                });
            });

            // Create the table
            let oTable = new sap.ui.table.Table({
                selectionMode: sap.ui.table.SelectionMode.None,
                columns: columns.map(column => {
                    return new sap.ui.table.Column({
                        label: column.getHeader(),
                        template: new sap.m.Text({ text: "{" + column.getHeader().getText() + "}" })
                    });
                }),
                rows: "{/}",
                rowMode: new sap.ui.table.rowmodes.Fixed({
                    rowCount: 3
                })
            });

            // Set the data for the table
            let oModel = new sap.ui.model.json.JSONModel(oColumnsWithTotalValues);
            oTable.setModel(oModel);
            oTable.addStyleClass("sapUiLargeMarginBottom sapUiMediumMarginTop");
            oTable.addStyleClass("customHBoxForProcessingLayoutAndTotalValueTable");
            // Add the table to HBox
            let oHBOX = oView.byId("idTotalValuesDisplayAreaHBox");
            oHBOX.destroyItems();
            oHBOX.addItem(oTable);


            // let oSlideTile = new sap.m.SlideTile({
            //     transitionTime: 250,
            //     displayTime: 2500
            // });

            // let oGenericTile = new sap.m.GenericTile({
            //     frameType: "TwoByOne",
            //     tileContent: new sap.m.TileContent({
            //         content: oTable
            //     })
            // });

            // let oGenTileText = new sap.m.GenericTile({
            //     frameType: "TwoByOne",
            //     tileContent: new sap.m.TileContent({
            //         content: new sap.m.Text({
            //             text: "Total Value"
            //         })
            //     })
            // });


            // oSlideTile.addTile(oGenericTile);
            // oSlideTile.addTile(oGenTileText);

            // oHBOX.addItem(oSlideTile);

        },

        ApplySelectedVariantForClearingTable: function (oController, aColumnsToBeDisplayed) {
            let aColumns = [...aColumnsToBeDisplayed];
            var oTable = oController.getView().byId("idClearingTable");

            if (oTable.getSelectedIndices().length > 0) {
                sap.m.MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("delRowsBeforePerso"));
                return;
            }
            // First Delete the entry with key isSelectedID
            aColumns = aColumns.filter(obj => obj.key !== "isSelectedID");
            // Include isSelected Checkbox in the personalization state
            aColumns.unshift({ key: "isSelectedID" });
            let oColumns = aColumns.filter(line => line.key !== "null");
            aColumns = oColumns;


            oTable.getColumns().forEach(function (oColumn) {

                var sKey = oController.getView().getLocalId(oColumn.getId());
                // var sColumnWidth = oState.ColumnWidth[sKey];

                oColumn.setWidth(oController._mIntialWidth[sKey]);

                oColumn.setVisible(false);
                oColumn.setSortOrder(sap.ui.core.SortOrder.None);
            });

            aColumns.forEach(function (oProp, iIndex) {
                if (oProp.key === "No") {
                    return;
                }
                var oCol = oController.byId(oProp.key);
                if (oCol) {
                    oCol.setVisible(true);
                    oTable.removeColumn(oCol);
                    oTable.insertColumn(oCol, iIndex);
                }
            });


        },

        onCreateVariantButtonPress: async function (oEvent) {
            const sVariantName = sap.ui.getCore().byId("variantNameInput").getValue();
            const aColumnsSelectedForVariant = this._aColumnsSelectedForNewVariant;
            let oPayload = {
                VariantName: sVariantName,
                VariantFor: this._ClearingType,
                VariantFieldsAsJson: JSON.stringify(aColumnsSelectedForVariant.filter(line => line.visible === true))
            };
            oEvent.getSource().getParent().setBusy(true);
            try {
                await this.util.create(this.getOwnerComponent().getModel("clearingApplicationModel"), "/ClearingTableUserVariants", oPayload);
                MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("VariantCreated"));

                // Update the Variant Overview
                let aSavedVariants = await this.util.getData(this.getOwnerComponent().getModel("clearingApplicationModel"), "/ClearingTableUserVariants", undefined, undefined);
                this.getView().getModel().setProperty("/SavedVariants", aSavedVariants.filter(line => line.VariantFor === this._ClearingType));
                this.getView().getModel().refresh();


            } catch (error) {
                oEvent.getSource().getParent().setBusy(false);
                sap.m.MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("CommError"));
                return;
            }
            oEvent.getSource().getParent().setBusy(false);
            // Close the dialog
            this._oVariantNameDialog.close();
        },

        createAddPaymentBCDialog: async function (sDialog, oController) {
            let oDialog = sDialog === "Add Payment" ? oController._oAddPaymentDialog : oController._oAddBCDialog;

            if (!oDialog) {

                let aContent = [
                    new Label({ text: sDialog === "Add Payment" ? "Payment" : "Bank Charge" }),
                    new Input({
                        textAlign: "Right",
                        value: {
                            path: "/Payment",
                            type: "sap.ui.model.type.Float",
                            formatOptions: {
                                minFractionDigits: 2,
                                maxFractionDigits: 2,
                                minIntegerDigits: 1,
                                maxIntegerDigits: 15,
                                groupingEnabled: true,
                                groupingSeparator: ",",
                                decimalSeparator: "."
                            }
                        },
                        liveChange: oController.onLiveChangeCurrency.bind(oController),
                        change: oController.onCurrencyFieldSumbit.bind(oController)
                    })
                ];

                if (oController._ClearingType !== "ClaimReceivables") {
                    aContent.push(
                        new Label({ text: "Business Partner", required: true }),
                        new ComboBox({
                            placeholder: "Select Business Partner",
                            selectedKey: "/BusinessPartner",
                            selectedItemId: "/SelectedBPID",
                            selectionChange: function (oEvent, pB, sAction = sDialog) {
                                var oSelectedItem = oEvent.getParameter("selectedItem");
                                if (oSelectedItem) {
                                    var oModel = sAction === "Add Payment" ? oController._oAddPaymentDialog.getModel()
                                        : oController._oAddBCDialog.getModel();
                                    oModel.setProperty("/BusinessPartner", oSelectedItem.getKey());
                                    oModel.setProperty("/SelectedBPID", oSelectedItem.getId());
                                }
                            }.bind(oController),
                            showSecondaryValues: true,
                            items: {
                                path: "/BusinessPartners",
                                template: new ListItem({
                                    key: "{Gpart}",
                                    text: "{BpName}",
                                    additionalText: "{Gpart}"
                                })
                            }
                        })
                    );
                }
                oDialog = new sap.m.Dialog({
                    // id: "idAddPaymentDialog",
                    title: sDialog === "Add Payment" ? "Add Payment" : "Add Bank Charge",
                    contentHeight: "auto",
                    contentWidth: "auto",
                    content: [
                        new SimpleForm({
                            editable: true,
                            layout: "ResponsiveGridLayout",
                            labelSpanXL: 3,
                            labelSpanL: 3,
                            labelSpanM: 3,
                            adjustLabelSpan: false,
                            emptySpanXL: 4,
                            emptySpanL: 4,
                            emptySpanM: 4,
                            columnsXL: 1,
                            columnsL: 1,
                            singleContainerFullSize: false,
                            content: aContent
                        })
                    ],
                    beginButton: new Button({

                        text: sDialog === "Add Payment" ? "Add Payment" : "Add Bank Charge",
                        press: oController.onAddPaymentButtonPress.bind(oController)
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: oController.onCancelButtonPress.bind(oController)
                    })
                });

                oController.getView().addDependent(oDialog);
            }
            const oData = {
                Payment: 0.00,
                BusinessPartner: "",
                SelectedBPID: "",
                BusinessPartners: oController.getView().getModel().getProperty("/ProcessingStatus").map(oBP => ({ BpName: oBP.BpName, Gpart: oBP.Gpart }))
            };

            oDialog.setModel(new JSONModel(oData));

            if (sDialog === "Add Payment") {
                oController._oAddPaymentDialog = oDialog;
            } else {
                oController._oAddBCDialog = oDialog;
            }

            return oDialog;
        },

        DisplayCreatedDocuments: function (aCreatedDocuments) {
            // Create a JSON model for the created documents
            const aCreatedDocumentsData = aCreatedDocuments.map(oDocument => ({
                documentNumber: oDocument
            }));
            const oModel = new sap.ui.model.json.JSONModel({ CreatedDocuments: aCreatedDocumentsData });

            // Create a dialog
            const oDialog = new sap.m.Dialog({
                title: "Clearing Successfull",
                state: sap.ui.core.ValueState.Success,
                contentWidth: "25rem",
                contentHeight: "auto",
                resizable: true,
                draggable: true,
                content: [
                    new sap.m.VBox({
                        items: [
                            new sap.m.Title({
                                text: "Created Below Documents:",
                                level: "H5"
                            }).addStyleClass("sapUiSmallMargin "),
                            new sap.m.List({
                                items: {
                                    path: "/CreatedDocuments",
                                    template: new sap.m.StandardListItem({
                                        title: "{documentNumber}",
                                        icon: "sap-icon://document-text",
                                        type: "Active"
                                    })
                                },
                                noDataText: "No documents created",
                                growing: true,
                                growingThreshold: 5,
                                growingScrollToLoad: true
                            }).addStyleClass("sapUiTinyMarginTop")
                        ]
                    })
                ],
                beginButton: new sap.m.Button({
                    text: "Close",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            // Set the model to the dialog
            oDialog.setModel(oModel);

            // Open the dialog
            oDialog.open();
        },

        onClearingLogRowSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getSelectedItem().getBindingContext();
            if (oSelectedItem) {
                var sUniqueClearingIdentifier = oSelectedItem.getProperty("UniqueClearingIdentifier");
                this.util._openActionLoggerDetails.call(this, sUniqueClearingIdentifier);
            }
        },

        // _openActionLoggerDetails: function (sUniqueClearingIdentifier) {
        //     const that = this;
        //     if (!this._oActionLoggerDetailsDialog) {
        //         const oSmartTable = new sap.ui.comp.smarttable.SmartTable({
        //             entitySet: "ActionLogger",
        //             tableBindingPath: "/ActionLogger",
        //             useVariantManagement: true,
        //             useTablePersonalisation: true,
        //             header: "Action Logger Details",
        //             showRowCount: true,
        //             enableAutoBinding: true,
        //             tableType: "ResponsiveTable",
        //             class: "sapUiResponsiveContentPadding",
        //             enableAutoColumnWidth: true,
        //             enableAutoColumnWidth: true,
        //             initiallyVisibleFields: "ExtRef,ClearedOn,Status,CreatedDocuments,ErrorInfo,ChangedBy,CreatedBy,CreatedOn,ID,UniqueClearingIdentifier",
        //             beforeRebindTable: function (oBeforeRebindTableEvent) {
        //                 var oBindingParams = oBeforeRebindTableEvent.getParameter("bindingParams");
        //                 oBindingParams.filters.push(new sap.ui.model.Filter("UniqueClearingIdentifier", sap.ui.model.FilterOperator.EQ, sUniqueClearingIdentifier));

        //                 // Hide UCR, ClaimRef, and TrRef columns for PremiumReceivables & PremiumPayables
        //                 // Hide EndorsementRef, Installment columns for ClaimReceivables & ClaimPayables
        //                 if (that._ClearingType === "PremiumReceivables" || that._ClearingType === "PremiumPayables") {
        //                     const oTable = oBeforeRebindTableEvent.getSource().getTable();
        //                     oTable.getColumns().forEach(function (oColumn) {
        //                         console.log("Inside");
        //                         const sColumnId = oColumn.getId();
        //                         if (sColumnId.includes("UCR") || sColumnId.includes("ClaimRef") || sColumnId.includes("TrRef")
        //                             || sColumnId.includes("MemberBPID")) {
        //                             oColumn.setVisible(false);
        //                         }
        //                     });
        //                 } else if (that._ClearingType === "ClaimReceivables" || that._ClearingType === "ClaimPayables") {
        //                     const oTable = oBeforeRebindTableEvent.getSource().getTable();
        //                     oTable.getColumns().forEach(function (oColumn) {
        //                         const sColumnId = oColumn.getId();
        //                         if (sColumnId.includes("EndorsementRef") || sColumnId.includes("Installment")
        //                             || sColumnId.includes("PolicyNo") || sColumnId.includes("PremiumId")) {
        //                             oColumn.setVisible(false);
        //                         }
        //                     });
        //                 }

        //             },
        //             initialise: function (oInitialiseEvent) {
        //                 const oTable = oInitialiseEvent.getSource().getTable();
        //                 oTable.setFixedColumnCount(3); // Fix ExtRef, ClearedOn and Status columns
        //                 oTable.setSelectionMode(sap.ui.table.SelectionMode.None);
        //                 oTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Auto);
        //                 oTable.setMinAutoRowCount(3);
        //                 oTable.setSticky(["ColumnHeaders"]);

        //                 // Customize column widths and appearance
        //                 oTable.getColumns().forEach(function(oColumn) {
        //                     const sColumnId = oColumn.getId();
        //                     if (sColumnId.includes("ExtRef")) {
        //                         oColumn.setWidth("180px");
        //                         oColumn.setLabel(new sap.m.Label({
        //                             text: "External Reference",
        //                             design: "Bold"
        //                         }));
        //                         // Move ExtRef column to first position
        //                         oTable.removeColumn(oColumn);
        //                         oTable.insertColumn(oColumn, 0);
        //                     } else if (sColumnId.includes("ClearedOn")) {
        //                         oColumn.setWidth("120px");
        //                         oColumn.setLabel(new sap.m.Label({
        //                             text: "Cleared On",
        //                             design: "Bold"
        //                         }));
        //                         // Move ClearedOn column to second position
        //                         oTable.removeColumn(oColumn);
        //                         oTable.insertColumn(oColumn, 1);
        //                     } else if (sColumnId.includes("Status")) {
        //                         oColumn.setWidth("120px");
        //                         oColumn.setLabel(new sap.m.Label({
        //                             text: "Status",
        //                             design: "Bold"
        //                         }));
        //                         // Move Status column to third position
        //                         oTable.removeColumn(oColumn);
        //                         oTable.insertColumn(oColumn, 2);
                                
        //                         // Update the template to use MessageStrip
        //                         const oTemplate = new sap.m.MessageStrip({
        //                             text: "{Status}",
        //                             type: {
        //                                 path: "Status",
        //                                 formatter: function(sStatus) {
        //                                     switch(sStatus) {
        //                                         case "Success": return "Success";
        //                                         case "Failed": return "Error";
        //                                         case "InProcess": return "Warning";
        //                                         default: return "Information";
        //                                     }
        //                                 }
        //                             },
        //                             showIcon: true,
        //                             showCloseButton: false,
        //                             enableFormattedText: false,
        //                             class: "sapUiTinyMarginBeginEnd"
        //                         }).addStyleClass("sapUiSizeCompact");
        //                         oColumn.setTemplate(oTemplate);
        //                     } else if (sColumnId.includes("ClearingType")) {
        //                         oColumn.setVisible(false);
        //                     }
        //                 });
        //             },
        //             customToolbar: new sap.m.Toolbar({
        //                 content: [
        //                     new sap.m.Button({
        //                         text: "View Payload",
        //                         icon: "sap-icon://message-popup",
        //                         type: sap.m.ButtonType.Ghost,
        //                         press: function(oEvent) {
        //                             this.util.viewClearingInterfacePayload(this, oEvent, sUniqueClearingIdentifier);
        //                         }.bind(this)
        //                     })
        //                 ]
        //             })
        //         });
        //         oSmartTable.setModel(this.getView().getModel("clearingApplicationModel"));

        //         this._oActionLoggerDetailsDialog = new sap.m.Dialog({
        //             title: "Action Logger Details",
        //             contentWidth: "80%",
        //             contentHeight: "60%",
        //             resizable: true,
        //             draggable: true,
        //             content: [
        //                 oSmartTable
        //             ],
        //             buttons: [
        //                 new sap.m.Button({
        //                     text: "Back",
        //                     press: function () {
        //                         this._oActionLoggerDetailsDialog.close();
        //                         if (this._oActionLoggerDialog) {
        //                             this._oActionLoggerDialog.open();
        //                         }
        //                     }.bind(this)
        //                 }),
        //                 new sap.m.Button({
        //                     text: "Close",
        //                     press: function () {
        //                         this._oActionLoggerDetailsDialog.close();
        //                     }.bind(this)
        //                 })
        //             ],
        //             afterClose: function () {
        //                 if (this._oActionLoggerDetailsDialog) {
        //                     this._oActionLoggerDetailsDialog.destroy();
        //                     this._oActionLoggerDetailsDialog = null;
        //                 }
        //             }.bind(this)
        //         });

        //         this.getView().addDependent(this._oActionLoggerDetailsDialog);
        //     }

        //     this._oActionLoggerDetailsDialog.open();
        // },
        /**
         * Event handler for Column Postion Change
         * @param {sap.ui.base.Event} oEvent - The event object containing details about the change event
         */
        onClearingTableColumnMove: function (oEvent) {
            const oTable = this.byId("idClearingTable");
            const oAffectedColumn = oEvent.getParameter("column");
            var iNewPos = oEvent.getParameter("newPos");
            var sKey = this._getKey(oAffectedColumn);
            oEvent.preventDefault();

            sap.m.p13n.Engine.getInstance().retrieveState(oTable).then(function (oState) {

                var oCol = oState.Columns.find(function (oColumn) {
                    return oColumn.key === sKey;
                }) || { key: sKey };
                oCol.position = iNewPos;

                sap.m.p13n.Engine.getInstance().applyState(oTable, { Columns: [oCol] });
            });
        },

        /**
         * Event handler for Column Resize
         * @param {sap.ui.base.Event} oEvent - The event object containing details about the resize event
         */
        onClearingTableColumnResize: function (oEvent) {
            var oColumn = oEvent.getParameter("column");
            var sWidth = oEvent.getParameter("width");
            var oTable = this.byId("idClearingTable");

            var oColumnState = {};
            oColumnState[this._getKey(oColumn)] = sWidth;

            sap.m.p13n.Engine.getInstance().applyState(oTable, {
                ColumnWidth: oColumnState
            });
        },

        /**
         * This function is used to close the dialog when the cancel button is pressed.
         * @param {sap.ui.base.Event} oEvent - The event object provided by the UI5 framework.
         */
        onCancelButtonPress: function (oEvent) {
            oEvent.getSource().getParent().close();
        },

        /**
         * Asynchronously handles search queries from a global search field and applies the search term as a filter to the clearing 
         * table. The function constructs a global filter based on the search query. If the query is not empty, it creates a filter 
         * for each string property defined in `_ClearingOPMetadataInfo`, using the search term. These filters are combined into 
         * a single global filter, which is then applied by calling the `_filter` method.
         *
         * @async
         * @function onGlobalFilterSearchFieldClearingTableSearch
         * @param {sap.ui.base.Event} oEvent - The event object provided by the UI5 framework, containing the search query.
         */
        onGlobalFilterSearchFieldClearingTableSearch: async function (oEvent) {

            const sQuery = oEvent.getParameter("query");
            this._oGlobalFilter = null;
            if (sQuery) {
                let aFilter = [];
                this._ClearingOPMetadataInfo.forEach((oProperty) => {
                    if (oProperty.Type === "string") { aFilter.push(new sap.ui.model.Filter(oProperty.Name, sap.ui.model.FilterOperator.Contains, sQuery)); }
                });

                this._oGlobalFilter = new sap.ui.model.Filter(aFilter, false);
            }

            this._filter();
        },

        onTableClearingTableColumnMove: function (oEvt) {
            const oTable = this.byId("idClearingTable");
            const oAffectedColumn = oEvt.getParameter("column");
            const iNewPos = oEvt.getParameter("newPos");
            const sKey = this._getKey(oAffectedColumn);
            oEvt.preventDefault();

            sap.m.p13n.Engine.getInstance().retrieveState(oTable).then(function (oState) {

                const oCol = oState.Columns.find(function (oColumn) {
                    return oColumn.key === sKey;
                }) || {
                    key: sKey
                };
                oCol.position = iNewPos;

                sap.m.p13n.Engine.getInstance().applyState(oTable, {
                    Columns: [oCol]
                });
            });
        },

        onVariantsButtonPress: async function (oEvent) {
            var oView = this.getView();
            // Load the fragment if it hasn't been loaded yet
            if (!this._oUserVariantsDialog) {
                sap.ui.core.Fragment.load({
                    id: `VariantsOverviewDialog${this._ClearingType}`,
                    name: "atom.ui.clearing.clearingapplication.view.fragments.clearingpage.ClearingTableUserVariantsDialog",
                    controller: this
                }).then(function (oDialog) {
                    // Connect dialog to the root view of this component (models, lifecycle)
                    oView.addDependent(oDialog);
                    this._oUserVariantsDialog = oDialog;
                    this._oUserVariantsDialog.setModel(oView.getModel());
                    this._oUserVariantsDialog.open();
                }.bind(this));
            } else {
                this._oUserVariantsDialog.setModel(oView.getModel());
                this._oUserVariantsDialog.open();
            }

        },

        onCloseButtonVariantDialogPress: function () {
            this._oUserVariantsDialog.close();
        },

        onSwitchDefaultSwitchForVariantChange: function (oEvent) {
            var oTable =
                sap.ui.core.Fragment.byId(`VariantsOverviewDialog${this._ClearingType}`, "idSavedVariantsUserTable");

            const oAlteredSwitchRow = oEvent.getSource().getBindingContext().getObject();

            if (oAlteredSwitchRow.isDefault) {
                // remove others from isDefault
                oTable.getItems().forEach(item => {
                    let oCurrentRow = item.getBindingContext().getObject();
                    if (oCurrentRow
                        !== oAlteredSwitchRow) {
                        oCurrentRow.isDefault = false;
                    }
                });
            }
        },

        onUpdateVariantsButtonVariantDialogPress: async function (oEvent) {
            let aSavedVariants = this.getView().getModel().getProperty("/SavedVariants");
            if (aSavedVariants.length > 0) {
                aSavedVariants.forEach(variant => {
                    delete variant.__metadata;
                });
                oEvent.getSource().getParent().setBusy(true);
                try {
                    await this.util.create(this.getOwnerComponent().getModel("clearingApplicationModel"), "/UpdateUserVariants", { UserVariants: aSavedVariants });
                    this.getView().getModel().refresh();
                    MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("UpdateVariants"));
                } catch (error) {
                    MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("CommError"));
                }
                oEvent.getSource().getParent().setBusy(false);
            } else {
                MessageToast.show("No Variants to Update");
            }
        },

        onAddNewVariantButtonPress: async function (oEvent) {

            const oPopup = sap.ui.core.Fragment.byId(`VariantsOverviewDialog${this._ClearingType}`, "idVariantPersonalizationPopup");
            if (!this._bIsPersonalizationPopupSelectionOpen) {
                this.util._setInitialDataForPersonalizationPopup.call(this);
                this._bIsPersonalizationPopupSelectionOpen = true;
            }

            oPopup.open(oEvent.getSource());

        },

        _setInitialDataForPersonalizationPopup: function () {

            const oSelectionPanel = sap.ui.core.Fragment.byId(`VariantsOverviewDialog${this._ClearingType}`, "idPersonalizationPopupSelectionPanel");

            oSelectionPanel.setP13nData(this._ColumnSettingForClearingTable);
        },

        onPopupVariantPersonalizationClose: function (oEvent) {
            this._aColumnsSelectedForNewVariant = sap.ui.core.Fragment.byId(`VariantsOverviewDialog${this._ClearingType}`, "idPersonalizationPopupSelectionPanel").getP13nData();

            // Close Popup and open dialog to make user to enter name for variant
            this._bIsPersonalizationPopupSelectionOpen = false;

            // Create and open the variant name dialog
            if (!this._oVariantNameDialog) {
                this._oVariantNameDialog = new sap.m.Dialog({
                    id: "variantNameDialog",
                    title: "Enter Variant Name",
                    type: sap.m.DialogType.Message,
                    content: [
                        new sap.m.VBox({
                            items: [
                                new sap.m.Label({ text: "Variant Name" }),
                                new sap.m.Input({ id: "variantNameInput" })
                            ]
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Create Variant",
                        press: this.util.onCreateVariantButtonPress.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this._oVariantNameDialog.close();
                        }.bind(this)
                    }),
                    afterClose: function () {
                        if (this._oVariantNameDialog) {
                            this._oVariantNameDialog.destroy();
                            this._oVariantNameDialog = null;
                        }
                    }.bind(this)
                });
                this.getView().addDependent(this._oVariantNameDialog);
            }

            this._oVariantNameDialog.open();
        },


        onFiltersButtonPress: function (oEvent) {
            var oFilterDialog = this.byId("idCustomFilterDialog");
            oFilterDialog.open();
        },

        onApplyVariantButtonPress: function (oEvent) {

            let oSelectedVariant = sap.ui.core.Fragment.byId(`VariantsOverviewDialog${this._ClearingType}`, "idSavedVariantsUserTable")?.getSelectedContexts()[0]?.getObject();
            if (!oSelectedVariant) {
                MessageToast.show("Select a Variant to Apply");
                return;
            }
            let aColumns = JSON.parse(oSelectedVariant.VariantFieldsAsJson).filter(line => line.visible === true);
            this.util.ApplySelectedVariantForClearingTable(this, aColumns);
            oEvent.getSource().getParent().close();

        },


        onCustomFilterDialogFilterChange: function (oEvent) {
            const oFilter = oEvent.getParameter("filters");
            const oTable = this.byId("idClearingTable");
            oTable.setBusy(true);
            oTable.getBinding("rows").filter(oFilter);
            // check if the zero cleared rows button is pressed
            if (this._bHideZeroClearedRows) {
                this.util.onHideZeroClearedRowsButtonPress.call(this, oEvent);
            }
            oTable.setBusy(false);
        },
        onHideZeroClearedRowsButtonPress: function (oEvent) {
            var oBinding = this.byId("idClearingTable").getBinding("rows");
            var aFilters = oBinding.aFilters || [];
            var oNewFilter = new sap.ui.model.Filter("Amn", sap.ui.model.FilterOperator.NE, 0);
            aFilters.push(oNewFilter);
            oBinding.filter(aFilters);
            if (this._bHideZeroClearedRows) {
                this._bHideZeroClearedRows = false;
            } else {
                this._bHideZeroClearedRows = true;
            }
            MessageToast.show("Hidden the Zero/Cleared Rows");
        },

        onButtonSelectedRowsBringToTopPress: function (oEvent) {
            const oTable = this.byId("idClearingTable");
            const oModel = oTable.getModel();
            const aData = oModel.getProperty("/SelectionResult");

            const selectedItems = aData.filter(item => item.isSelected);
            const unselectedItems = aData.filter(item => !item.isSelected);

            oModel.setProperty("/SelectionResult", [...selectedItems, ...unselectedItems]);
        },

        _showPayloadViewer: function(oControl, oPayload) {
            if (!this._oPayloadViewer) {
                sap.ui.core.Fragment.load({
                    id: "idPayloadViewer",
                    name: "atom.ui.clearing.clearingapplication.view.fragments.clearingpage.PayloadViewer",
                    controller: this
                }).then(function (oFragmentContent) {
                    this._oPayloadViewer = oFragmentContent;
                    this.getView().addDependent(this._oPayloadViewer);
                    const oCodeEditor = sap.ui.core.Fragment.byId("idPayloadViewer", "idPayloadCodeEditor");
                    oCodeEditor.setValue(JSON.stringify(oPayload, null, 2));
                    
                    // Configure popover behavior
                    this._oPayloadViewer.setModal(true);
                    this._oPayloadViewer.setPlacement(sap.m.PlacementType.Auto);
                    this._oPayloadViewer.attachAfterOpen(function() {
                        jQuery.sap.delayedCall(0, this, function() {
                            this._oPayloadViewer.focus();
                        });
                    }.bind(this));
                    
                    // Open the popover
                    this._oPayloadViewer.openBy(oControl);
                }.bind(this));
            }
            else {
                const oCodeEditor = sap.ui.core.Fragment.byId("idPayloadViewer", "idPayloadCodeEditor");
                oCodeEditor.setValue(JSON.stringify(oPayload, null, 2));
                
                // Configure popover behavior
                this._oPayloadViewer.setModal(true);
                this._oPayloadViewer.setPlacement(sap.m.PlacementType.Auto);
                
                // Open the popover
                this._oPayloadViewer.openBy(oControl);
            }
        },

        onDisplayLogsButtonPress: function (oEvent) {
            const oDisplayLogControl = oEvent.getSource();
            const that = this;
            const sClearingType = this._ClearingType;
            if (!this._oClearingLogDialog) {
                // Create FilterBar
                const oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                    useToolbar: false,
                    showGoOnFB: false,
                    filterChange: function(oEvent) {
                        that.util._applyClearingLogFilters.call(that);
                    },
                    filterGroupItems: [
                        new sap.ui.comp.filterbar.FilterGroupItem({
                            name: "daterange",
                            label: "Cleared On",
                            groupName: "Group1",
                            visibleInFilterBar: true,
                            control: new sap.m.DateRangeSelection( {
                                dateValue: "{filterModel>/clearedStart}",
                                secondDateValue: "{filterModel>/clearedEnd}",
                                change: function() {
                                    that.util._applyClearingLogFilters.call(that);
                                }
                            })
                        }),
                        new sap.ui.comp.filterbar.FilterGroupItem({
                            name: "ExternalReference",
                            label: "External Reference",
                            groupName: "Group1",
                            visibleInFilterBar: true,
                            control: new sap.m.Input( {
                                value: "{filterModel>/externalReference}",
                                submit: function() {
                                    that.util._applyClearingLogFilters.call(that);
                                }
                            })
                        }),
                        new sap.ui.comp.filterbar.FilterGroupItem({
                            name: "Status",
                            label: "Status",
                            groupName: "Group1",
                            visibleInFilterBar: true,
                            control: new sap.m.MultiComboBox( {
                                items: {
                                    path: "filterModel>/statuses",
                                    template: new sap.ui.core.Item({
                                        key: "{filterModel>key}",
                                        text: "{filterModel>text}"
                                    })
                                },
                                selectedKeys: "{filterModel>/selectedStatuses}",
                                selectionChange: function() {
                                    that.util._applyClearingLogFilters.call(that);
                                }
                            })
                        })
                    ]
                });

                // Create Table
                const oTable = new sap.m.Table({
                    inset: false,
                    mode: sap.m.ListMode.None,
                    growing: true,
                    growingScrollToLoad: true,
                    growingThreshold: 10,
                    fixedLayout: true,
                    headerToolbar: new sap.m.OverflowToolbar({
                        content: [
                            new sap.m.ToolbarSpacer(),
                            new sap.m.Button({
                                text: "Refresh",
                                icon: "sap-icon://refresh",
                                type: sap.m.ButtonType.Ghost,
                                press: function() {
                                    oTable.setBusy(true);
                                    oTable.getBinding("items").refresh();
                                    oTable.setBusy(false);
                                }
                            })
                        ]
                    }),
                    columns: [
                        new sap.m.Column({ header: new sap.m.Text({ text: "External Reference" }) }),
                        new sap.m.Column({ header: new sap.m.Text({ text: "Cleared On" }) }),
                        new sap.m.Column({ 
                            width: "130px",
                            header: new sap.m.Text({ text: "Status" }) 
                        }),
                        new sap.m.Column({ header: new sap.m.Text({ text: "Created Documents" }) }),
                        new sap.m.Column({ header: new sap.m.Text({ text: "Error Info" }) }),
                        new sap.m.Column({ header: new sap.m.Text({ text: "Cleared By" }) }),
                        new sap.m.Column({ 
                            width: "70px",
                            hAlign: sap.ui.core.TextAlign.Center,
                            header: new sap.m.Text({ text: "Payload" }) 
                        })
                    ]
                });

                // Set binding for table items
                oTable.bindAggregation("items", {
                    path: "/ClearingLog",
                    sorter: new sap.ui.model.Sorter("ClearedOn", true),
                    filters: [new sap.ui.model.Filter("ClearingType", sap.ui.model.FilterOperator.EQ, this._ClearingType)],
                    template: new sap.m.ColumnListItem({
                        type: sap.m.ListType.Navigation,
                        press: function(oEvent) {
                            const oContext = oEvent.getSource().getBindingContext();
                            that.util._showExpandedClearingLog.call(that, oContext);
                        },
                        cells: [
                            new sap.m.Text({ text: "{ExtRef}" }),
                            new sap.m.Text({ 
                                text: {
                                    path: "ClearedOn",
                                    formatter: function(date) {
                                        return date ? new Date(date).toLocaleString() : "";
                                    }
                                }
                            }),
                            new sap.m.ObjectStatus({
                                text: "{Status}",
                                state: {
                                    path: "Status",
                                    formatter: function(sStatus) {
                                        switch(sStatus) {
                                            case "Success": return sap.ui.core.ValueState.Success;
                                            case "Failed": return sap.ui.core.ValueState.Error;
                                            case "InProcess": return sap.ui.core.ValueState.Warning;
                                            default: return sap.ui.core.ValueState.None;
                                        }
                                    }
                                }
                            }),
                            new sap.m.Text({ text: "{CreatedDocuments}" }),
                            new sap.m.Text({ text: "{ErrorInfo}" }),
                            new sap.m.Text({ text: "{createdBy}" }),
                            new sap.m.MenuButton({
                                icon: "sap-icon://download",
                                type: "Transparent",
                                menu: new sap.m.Menu({
                                    items: [
                                        new sap.m.MenuItem({
                                            text: "Payload",
                                            press: function(oEvent) {
                                                const oContext = oEvent.getSource().getBindingContext();
                                                that.util._showInterfaceLogPayload.call(that, oContext, "Payload", oDisplayLogControl);
                                            }
                                        }),
                                        new sap.m.MenuItem({
                                            text: "Response",
                                            press: function(oEvent) {
                                                const oContext = oEvent.getSource().getBindingContext();
                                                that.util._showInterfaceLogPayload.call(that, oContext, "Response", oDisplayLogControl);
                                            }
                                        })
                                    ]
                                })
                            })
                        ]
                    })
                });

                this._oLogTable = oTable;

                // Create Dialog
                this._oClearingLogDialog = new sap.m.Dialog({
                    title: "Clearing Logs",
                    contentWidth: "80%",
                    contentHeight: "50%",
                    resizable: true,
                    draggable: true,
                    content: [
                        new sap.m.VBox({
                            items: [
                                oFilterBar,
                                oTable
                            ]
                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Close",
                        press: function() {
                            this._oClearingLogDialog.close();
                        }.bind(this)
                    })
                });

                // Initialize filter model
                const oFilterModel = new sap.ui.model.json.JSONModel({
                    clearedStart: null,
                    clearedEnd: null,
                    externalReference: "",
                    selectedStatuses: [],
                    statuses: [
                        { key: "Success", text: "Success" },
                        { key: "Failed", text: "Failed" },
                        { key: "InProcess", text: "In Process" }
                    ]
                });
                this._oClearingLogDialog.setModel(oFilterModel, "filterModel");

                // Set the OData model
                oTable.setModel(this.getView().getModel("clearingApplicationModel"));

                this.getView().addDependent(this._oClearingLogDialog);
            }

            this._oClearingLogDialog.open();
        },

        _applyClearingLogFilters: function() {
            const oTable = this._oLogTable;
            const oDialog = this._oClearingLogDialog;
            if (!oDialog) {
                return;
            }
            const oFilterModel = oDialog.getModel("filterModel");
            if (!oFilterModel) {
                return;
            }
            const oFilterData = oFilterModel.getData();
            
            const aFilters = [];

            // Add ClearingType filter
            aFilters.push(new sap.ui.model.Filter("ClearingType", sap.ui.model.FilterOperator.EQ, this._ClearingType));

            // Date Range Filter
            if (oFilterData.clearedStart && oFilterData.clearedEnd) {
                aFilters.push(new sap.ui.model.Filter("ClearedOn", sap.ui.model.FilterOperator.BT, 
                    oFilterData.clearedStart, oFilterData.clearedEnd));
            }

            // External Reference Filter
            if (oFilterData.externalReference) {
                aFilters.push(new sap.ui.model.Filter("ExtRef", sap.ui.model.FilterOperator.Contains, 
                    oFilterData.externalReference));
            }

            // Status Filter
            if (oFilterData.selectedStatuses && oFilterData.selectedStatuses.length > 0) {
                const aStatusFilters = oFilterData.selectedStatuses.map(status => 
                    new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, status));
                aFilters.push(new sap.ui.model.Filter(aStatusFilters, false)); // false = OR
            }

            // Apply filters
            const oBinding = oTable.getBinding("items");
            if (oBinding) {
                oBinding.filter(new sap.ui.model.Filter(aFilters, true));
            }
        },

        _showExpandedClearingLog: function(oContext) {
            const that = this;
            if (!this._oExpandedClearingLogDialog) {
                const oTable = new sap.ui.table.Table({
                    selectionMode: sap.ui.table.SelectionMode.None,
                    visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
                    minAutoRowCount: 3,
                    showHeader: false,
                    columns: [
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "External Reference", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{ExtRef}" }),
                            width: "180px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Internal Reference", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{IntRef}" }),
                            width: "180px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Installment", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{Installment}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Claim ID", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{ClaimRef}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Transaction ID", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{TrRef}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Amount Cleared", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{AmountCleared}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Original Currency", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{OriginalCurrency}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Allocated Amount", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{AllocAmn}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Expected Pay Currency", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{ExpectedPayCurrency}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Delta Due Roe", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{DeltaDueRoe}" }),
                            width: "150px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Bit Reference", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{BitReference}" }),
                            width: "180px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Endorsement Reference", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{EndorsementRef}" }),
                            width: "180px"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Member BPID", design: sap.m.LabelDesign.Bold }),
                            template: new sap.m.Text({ text: "{MemberBPID}" }),
                            width: "150px"
                        })
                    ]
                });

                // Set the model
                oTable.setModel(this.getView().getModel("clearingApplicationModel"));

                // Bind the table to the expanded entity
                oTable.bindRows({
                    path: `/ClearingLog(guid'${oContext.getProperty("ID")}')/ItsClearingLogExpanded`,
                    parameters: {
                        operationMode: "Server"
                    }
                });

                this._oExpandedClearingLogDialog = new sap.m.Dialog({
                    // title: "Expanded Clearing Log Details",
                    contentWidth: "50%",
                    contentHeight: "30%",
                    resizable: true,
                    draggable: true,
                    content: [
                        oTable
                    ],
                    beginButton: new sap.m.Button({
                        text: "Close",
                        press: function() {
                            this._oExpandedClearingLogDialog.close();
                        }.bind(this)
                    }),
                    afterClose: function() {
                        if (this._oExpandedClearingLogDialog) {
                            this._oExpandedClearingLogDialog.destroy();
                            this._oExpandedClearingLogDialog = null;
                        }
                    }.bind(this)
                });

                this.getView().addDependent(this._oExpandedClearingLogDialog);
            }

            this._oExpandedClearingLogDialog.open();
        },

        _showInterfaceLogPayload: function(oContext, sType, oDisplayLogControl) {
            const that = this;
            const sUniqueClearingIdentifier = oContext.getProperty("ID");
            const oModel = this.getView().getModel("clearingApplicationModel");

            // Fetch the interface log data using the association
            oModel.read(`/ClearingLogDB(guid'${sUniqueClearingIdentifier}')/ItsInterfaceLog`, {
                success: function(oData) {
                    if (oData) {
                        let sContent;
                        try {
                            if (sType === "Payload") {
                                sContent = JSON.parse(oData.Payload);
                            } else {
                                sContent = JSON.parse(oData.Response);
                            }
                            that.util._showPayloadViewer.call(that, oDisplayLogControl, sContent);
                        } catch (error) {
                            MessageBox.error("Error parsing " + sType + " data");
                        }
                    } else {
                        MessageBox.error("No " + sType + " data found");
                    }
                },
                error: function() {
                    MessageBox.error("Error fetching " + sType + " data");
                }
            });
        },

        onCancelClearingButtonPress: function(oEvent) {
            // Enable the Execute Clearing button
            this._executeClearingButton.setEnabled(true);
            oEvent.getSource().getParent().close();
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
        onProceedClearingButtonPress: async function (oEvent) {
            debugger
            let oView = this.getView();
            let oModel = oView.getModel("clearingApplicationModel");

            let oButton = oEvent.getSource();
            let oParent = oButton.getParent();
            let oFragModelData = oParent.getModel().getData();
            let sCompanyCode = oFragModelData.CompanyCode;
            let sPostingDate = oFragModelData.PostingDate;

            if (!sPostingDate) {
                MessageToast.show(oView.getModel("i18n").getResourceBundle().getText("PostingDateNotValid"));
                return;
            }

            // Pre-processing logic: Disable button before processing
            oParent.setBusy(true);
            oButton.setEnabled(false);

            try {
                let isPostingPeriodOpen = await this.util.validatePostingPeriod(oModel, sPostingDate, sCompanyCode);
                if (!isPostingPeriodOpen.CheckPostingPeriod) {
                    MessageToast.show(oView.getModel("i18n").getResourceBundle().getText("PostingDateNotOpen"));
                    return;
                }

                if (!this.util.checkPostingDateOnCurrentMonth(sPostingDate.substring(0, 10))) {
                    MessageBox.warning(oView.getModel("i18n").getResourceBundle().getText("PostingDateInOtherMonth"), {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: async (sAction) => {

                            if (sAction === MessageBox.Action.OK) {
                                await this.ActionHelper.tryProceedToClear(oEvent);
                            }
                            oParent.setBusy(false);
                            oButton.setEnabled(true);
                            this._executeClearingButton.setEnabled(true);
                        }
                    });
                } else {
                    await this.ActionHelper.tryProceedToClear(oEvent);
                }
            } catch (error) {
                MessageToast.show(oView.getModel("i18n").getResourceBundle().getText("CommError"));
            } finally {
                // Post-processing logic: Ensure button is enabled after processing (regardless of success/failure)
                oParent.setBusy(false);
                oButton.setEnabled(true);
                this._executeClearingButton.setEnabled(true);
            }

        },

        IsClearingAmnDifferenceZero (oView) {
            const oModel = oView.getModel();
            const oData = oModel.getData();
            const aSelectionResult = oData.SelectionResult;

            // Group by Gpart, BpName, and ExpPayCurr
            const groupedData = aSelectionResult.reduce((acc, item) => {
                if (!item.isSelected) {return acc;}
                const key = `${item.Gpart}-${item.BpName}-${item.ExpPayCurr}`;
                acc[key] = acc[key] || { sum: 0 };
                acc[key].sum += parseFloat(item.AllocAmnSettCurr) || 0; // Handle potential NaN
                return acc;
            }, {});

            // Check if all sums are zero
            return Object.values(groupedData).every(item => item.sum === 0);
        }
        
    };  
});