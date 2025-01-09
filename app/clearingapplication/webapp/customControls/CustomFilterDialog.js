sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/CustomListItem",
    "sap/m/Button",
    "sap/m/SearchField",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Title",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/HTML"
    // eslint-disable-next-line max-params
], function (Control, Dialog, List, CustomListItem, Button, SearchField, Toolbar, ToolbarSpacer, Title, JSONModel, Filter, FilterOperator, MessageBox, HTML) {
    "use strict";
    //library.includeStylesheet("../customControls/CustomFilterDialog.css");
    // var CustomCSS = Control.extend("atom.ui.clearing.clearingapplication.customControls.CustomCSS", {
    //     metadata: {
    //         properties: {
    //             content: {type: "string", defaultValue: ""}
    //         }
    //     },
    //     renderer: function(oRm, oControl) {
    //         oRm.write("<style>");
    //         oRm.write(oControl.getContent());
    //         oRm.write("</style>");
    //     }
    // });

    return Control.extend("atom.ui.clearing.clearingapplication.customControls.CustomFilterDialog", {
        metadata: {
            properties: {
                title: { type: "string", defaultValue: "Filter" },
                columns: { type: "object[]", defaultValue: [] },
                filterData: { type: "object", defaultValue: {} },
                _previousFilters: { type: "object", defaultValue: {} }
            },
            events: {
                filterChange: {
                    parameters: {
                        filters: { type: "object[]" }
                    }
                }
            },
            methods: {
                ResetFilters: "resetFilters"
            }
        },

        init: function () {
            this._dialog = null;
            this._columnList = null;
            this._valueDialog = null;
            this._valueTable = null;
            this._selectedFilters = {};
            this._allSelectedItems = [];
            this._previousFilters = {};

            var customCSS = `
                .customFilterDialog .sapMDialogScroll {
                    padding: 1rem;
                }
            `;

            sap.ui.getCore().getStaticAreaRef().appendChild(document.createElement("style")).textContent = customCSS;


            // Create and add custom CSS control
            // this._createAndAddCustomCSSControl();
            // this._injectCustomCSS();
        },
        // _injectCustomCSS: function() {
        //     var customCSS = `
        //     <style>
        //         .customFilterDialog .sapMDialogScroll {

        //         }
        //     </style>
        // `;
        // var divtest = '<div id="test">test<style>customFilterDialog{ }</style></div>';
        // var oCSSControl = new HTML({content: divtest});
        // oCSSControl.placeAt("content");
        // },

        // _createAndAddCustomCSSControl: function() {
        //     var customCSS = `
        //         .customFilterDialog .sapMDialogScroll {
        //             padding: 1rem;
        //         }
        //     `;

        //     var oCSSControl = new CustomCSS({content: customCSS});
        //     oCSSControl.placeAt("sap-ui-static");
        // },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                // This control doesn't need to render anything as it's using dialogs
            }
        },

        open: function () {
            if (!this._dialog) {
                this._createMainDialog();
            }
            this._initialFilters = JSON.parse(JSON.stringify(this._previousFilters));
            this._selectedFilters = JSON.parse(JSON.stringify(this._previousFilters));
            this._updateColumnList();
            this._dialog.open();
        },

        _createMainDialog: function () {
            const oButton = new sap.m.Button({
                icon: "sap-icon://navigation-right-arrow",
                type: sap.m.ButtonType.Transparent,
                press: this._onColumnPress.bind(this)
            });
            oButton.addStyleClass("sapUiTinyMarginTopBottom");
            this._columnList = new List({
                mode: "SingleSelectMaster",
                items: {
                    path: "/columns",
                    template: new CustomListItem({
                        content: new sap.m.HBox({
                            justifyContent: sap.m.FlexJustifyContent.SpaceBetween,
                            alignItems: sap.m.FlexAlignItems.Center,
                            items: [
                                new sap.m.Text({
                                    text: "{name}",
                                    wrapping: false
                                }),
                                new sap.m.HBox({
                                    items: [
                                        new sap.m.ObjectStatus({
                                            text: "{count}",
                                            inverted: true,
                                            state: "Indication15",
                                            visible: "{countVisible}"
                                        }).addStyleClass("sapUiTinyMarginTop sapUiLargeMarginEnd"),
                                        oButton
                                    ]
                                })
                            ]
                        })
                    })
                }
            }).addStyleClass("customColumnList sapUiTinyMarginTopBottom");

            this._dialog = new Dialog({
                title: this.getTitle(),
                contentWidth: "400px",
                stretch: sap.ui.Device.system.phone,
                customHeader: new Toolbar({
                    content: [
                        new Title({ text: this.getTitle() }),
                        new ToolbarSpacer(),
                        new Button({
                            text: "Reset",
                            press: this._onResetPress.bind(this)
                        })
                    ]
                }),
                content: [this._columnList],
                beginButton: new Button({
                    text: "OK",
                    press: this._onOkPress.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: this._onCancelPress.bind(this)
                })
            }).addStyleClass("customFilterDialog");

            var oModel = new JSONModel({ columns: this._getColumnsWithCount() });
            oModel.setSizeLimit(15000);
            this._dialog.setModel(oModel);
        },

        _updateColumnList: function () {
            this._dialog.getModel().setProperty("/columns", this._getColumnsWithCount());
        },

        _getColumnsWithCount: function () {
            return this.getColumns().map(column => {
                const count = this._selectedFilters[column.key] ? this._selectedFilters[column.key].length : 0;
                return {
                    key: column.key,
                    name: column.name,
                    count: count > 0 ? ` ${count} ` : "",
                    countVisible: count > 0
                };
            });
        },

        _onColumnPress: function (oEvent) {
            var oItem = oEvent.getSource().getParent().getParent();
            var oBindingContext = oItem.getBindingContext();
            var sColumnKey = oBindingContext.getProperty("key");
            var sColumnName = oBindingContext.getProperty("name");
            this._openValueDialog(sColumnKey, sColumnName);
        },

        _openValueDialog: function (sColumnKey, sColumnName) {
            this._storePreviousFilters();
            if (this._valueDialog) {
                this._valueDialog.destroy();
            }

            this._valueTable = new sap.m.Table({
                mode: sap.m.ListMode.None,
                growing: true,
                growingThreshold: 20,
                growingScrollToLoad: true,
                columns: [
                    new sap.m.Column({
                        width: "3rem",
                        header: new sap.m.CheckBox({
                            select: this._onSelectAll.bind(this)
                        })
                    }),
                    new sap.m.Column({
                        header: new sap.m.Text({ text: "Value" })
                    })
                ]
            });

            var oSearchField = new SearchField({
                liveChange: this._onValueSearch.bind(this)
            });

            this._valueDialog = new Dialog({
                title: "Filter By: " + sColumnName,
                contentWidth: "400px",
                contentHeight: "500px",
                content: [
                    new Toolbar({
                        content: [
                            oSearchField
                        ]
                    }),
                    this._valueTable
                ],
                beginButton: new Button({
                    text: "OK",
                    press: function () {
                        var oModel = this._valueDialog.getModel();
                        var aValues = oModel.getProperty("/values");
                        var aSelectedItems = aValues.filter(function (oValue) {
                            return oValue.selected;
                        });
                        this._selectedFilters[sColumnKey] = aSelectedItems.map(function (oValue) {
                            return oValue.value;
                        });
                        this._valueDialog.close();
                        this._updateColumnList();
                        this._valueDialog.getModel().setProperty("/values", this._valueDialog.getModel().getProperty("/values"));
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        this._valueDialog.close();
                    }.bind(this)
                })
            }).addStyleClass("customFilterDialog");

            this._loadFilterOptions(sColumnKey);
            this._valueDialog.open();
        },
        // Add this helper function
        _getDisplayValue(value) {
            if (typeof value === "object") {
                return value.value !== undefined ? value.value : JSON.stringify(value);
            }
            return value;
        },

        _loadFilterOptions: function (sColumnKey) {
            var oFilterData = this.getFilterData();
            var aValues = oFilterData[sColumnKey] || [];

            var oModel = new JSONModel({
                values: aValues.map(function (value) {
                    var displayValue = this._getDisplayValue(value);
                    return {
                        value: displayValue,
                        selected: this._selectedFilters[sColumnKey] && this._selectedFilters[sColumnKey].indexOf(displayValue) !== -1
                    };
                }.bind(this))
            });
            oModel.setSizeLimit(15000);
            this._valueDialog.setModel(oModel);

            this._valueTable.bindItems({
                path: "/values",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.CheckBox({
                            selected: "{selected}",
                            select: function (oEvent) {
                                var oContext = oEvent.getSource().getBindingContext();
                                var bSelected = oEvent.getParameter("selected");
                                oContext.getModel().setProperty(oContext.getPath() + "/selected", bSelected);
                                console.log(oContext.getModel().getData().values.filter(function (oValue) {
                                    return oValue.selected;
                                }));
                            }
                        }),
                        new sap.m.Text({
                            text: "{value}"
                        })
                    ]
                })
            });
        },

        _onValueSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue").toLowerCase();
            var oBinding = this._valueTable.getBinding("items");
            var aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter("value", FilterOperator.Contains, sQuery));
            }

            oBinding.filter(aFilters);
        },

        _onSelectAll: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var oModel = this._valueDialog.getModel();
            var aValues = oModel.getProperty("/values");
            aValues.forEach(function (oValue) {
                oValue.selected = bSelected;
            });
            oModel.setProperty("/values", aValues);
        },

        _onOkPress: async function () {
            var aFilters = [];
            var totalFilterCount = 0;

            const createFilter = (sColumn, columnObj) => {
                return new Filter({
                    filters: this._selectedFilters[sColumn].map(function (sValue) {
                        if (columnObj && columnObj.isDate) {
                            return new Filter(sColumn, FilterOperator.EQ, new Date(sValue));
                        } else {
                            return new Filter(sColumn, FilterOperator.EQ, sValue);
                        }
                    }),
                    and: false
                });
            };

            for (var sColumn in this._selectedFilters) {
                if (Object.hasOwn(this._selectedFilters, sColumn) && this._selectedFilters[sColumn].length > 0) {
                    totalFilterCount += this._selectedFilters[sColumn].length;
                    const sColumnName = sColumn;
                    var columnObj = this.getColumns().find(col => col.key === sColumnName);

                    (function (col, obj) {
                        aFilters.push(createFilter(col, obj));
                    })(sColumn, columnObj);
                }
            }

            if (totalFilterCount > 1000) {
                var that = this;
                MessageBox.warning(
                    "You have selected more than 1000 entries which may freeze the screen for some time.",
                    {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                that._applyFilters(aFilters);
                            }
                        }
                    }
                );
            } else {
                this._applyFilters(aFilters);
            }

            // Store the current filters as previous filters
            this._previousFilters = JSON.parse(JSON.stringify(this._selectedFilters));
        },

        _applyFilters: function (aFilters) {
            new Promise((resolve) => {
                this._dialog.attachAfterClose(() => {
                    resolve();
                });
                this._dialog.close();
            }).then(() => {
                this.fireFilterChange({ filters: aFilters });
            });
        },

        _onResetPress: function () {
            this._selectedFilters = {};
            this._updateColumnList();
            this.fireFilterChange({ filters: [] });
        },

        _onCancelPress: function () {
            this._selectedFilters = JSON.parse(JSON.stringify(this._initialFilters));
            this._updateColumnList();
            this._dialog.close();
        },

        _storePreviousFilters: function () {
            this._previousFilters = JSON.parse(JSON.stringify(this._selectedFilters));
        },

        resetFilters: function () {
            this._selectedFilters = {};
            this._previousFilters = {};
        }
    });
});

