/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "atom/ui/clearing/clearingapplication/model/models",
    "sap/ui/core/BusyIndicator",
    "atom/ui/clearing/clearingapplication/customControls/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "./controller/util/util"
],
    function (UIComponent, Device, models, BusyIndicator, CustomBusyIndicator, JSONModel, util) {
        "use strict";

        return UIComponent.extend("atom.ui.clearing.clearingapplication.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                BusyIndicator.show();
                // Wait for metadata to be loaded before initializing application data
                const oClearingApplicationModel = this.getModel("clearingApplicationModel");

                // Add metadata failed event handler
                oClearingApplicationModel.attachMetadataFailed(function(oEvent) {
                    BusyIndicator.hide();
                    const oParams = oEvent.getParameters();
                    sap.m.MessageBox.error(
                        "Failed to load application data. Please check your connection and try again.",
                        {
                            details: oParams.response ? oParams.response.responseText : "Unknown error",
                            actions: ["Retry", "Close"],
                            onClose: function(sAction) {
                                if (sAction === "Retry") {
                                    window.open(window.document.URL, "_self");
                                }
                            }
                        }
                    );
                });

                // Handle metadata loading
                const metadataLoaded = new Promise((resolve, reject) => {
                    if (oClearingApplicationModel.getServiceMetadata()) {
                        // Metadata is already loaded
                        resolve();
                    } else {
                        oClearingApplicationModel.attachMetadataLoaded(function() {
                            resolve();
                        });
                        
                        // Set a timeout for metadata loading
                        setTimeout(() => {
                            reject(new Error("Service metadata loading timed out"));
                        }, 15000); // Reduced timeout to 15 seconds
                    }
                });

                // Chain the promises with proper error handling
                metadataLoaded
                    .then(() => {
                        return this._initializeApplicationData();
                    })
                    .then(() => {
                        this.getRouter().initialize();
                        BusyIndicator.hide();
                    })
                    .catch((error) => {
                        BusyIndicator.hide();
                        console.error("Application initialization failed:", error);
                        sap.m.MessageBox.error(
                            "Failed to initialize application. Please try again.",
                            {
                                details: error.message || error.toString(),
                                actions: ["Retry", "Close"],
                                onClose: function(sAction) {
                                    if (sAction === "Retry") {
                                        window.open(window.document.URL, "_self");
                                        // window.history.go(0);
                                    }
                                }
                            }
                        );
                    });

                // Load the FloatingChatbot CSS
                sap.ui.require(["jquery.sap.global"], function($) {
                    var sStyleSheet = $.sap.getModulePath("atom.ui.clearing.clearingapplication", "/customControls/FloatingChatbot.css");
                    $.sap.includeStyleSheet(sStyleSheet);
                });
            },
            /**
             * This function gets all the necessary data from the backend systems to start the application.  
             * It retrieves lists of business partners, coverholders, divisions, and bank account numbers. 
             * This information is then used to populate dropdown lists and other parts of the user interface, 
             * making sure everything is ready before the user can start working. 
             * If anything goes wrong during data retrieval, an error message is shown.
             * @private
             * @returns {Promise} A promise that resolves when all data is loaded successfully, or rejects if an error occurs.
             */
            _initializeApplicationData: function() {
                return new Promise((resolve, reject) => {
                    try {
                        let oClearingApplicationModel = this.getModel("clearingApplicationModel");
                        let oLocalData = {};

                        // Create a model to store the data we'll use in the application.
                        this.setModel(new JSONModel(oLocalData), "localModel");
                        let oLocalModel = this.getModel("localModel");

                        // Create a model to store the user's selections.
                        this.setModel(new JSONModel({
                            "CompanyCode": "",
                            "EnterInsuredName": "",
                            "Payment": 0.00,
                            "BankCharge": 0.00,
                            "Currency": "",
                            "PostingDate": null,
                            "PostingDateMinDate": new Date("2001-01-01"),
                            "Division": "",
                            "ElsecoBankAccountNumber": ""
                        }), "selectionModel");

                        // Set up a filter to only get active data.
                        let oActiveFilter = new sap.ui.model.Filter("ACTIVE", sap.ui.model.FilterOperator.EQ, true);

                        // Get all the data we need from the backend.
                        Promise.all([
                            // Get a list of business partners.
                            util.getData(oClearingApplicationModel, "/BusinessPartners", { "$select": "ID,FULL_NAME" }, undefined),
                            // Get a list of coverholders.
                            util.getData(oClearingApplicationModel, "/Coverholder", { "$select": "COVERHOLDER_CODE,COVERHOLDER_NAME" }, oActiveFilter),
                            // Get a list of divisions.
                            util.getData(oClearingApplicationModel, "/Divisions", { "$select": "DIVISION_CODE,DIVISION_NAME" }, oActiveFilter),
                            // Get a list of bank account numbers.
                            util.getData(oClearingApplicationModel, "/BankAccount", {}, undefined)
                        ]).then((result) => {
                            // Put the data into the application model in a format that's easy to use.
                            oLocalData.BPList = result[0].map((line) => ({ 
                                "BP_ID": line.ID, 
                                "BP_NAME": line.FULL_NAME 
                            }));
                            oLocalData.BPListForVH = result[0].map((line) => ({ 
                                "BP_ID": line.ID, 
                                "BP_NAME": line.FULL_NAME, 
                                "selected": false 
                            }));
                            oLocalData.CompanyCodes = result[1].map((line) => ({ 
                                "CompanyCode": line.COVERHOLDER_CODE, 
                                "CompanyName": line.COVERHOLDER_NAME 
                            }));
                            oLocalData.Divisions = result[2].map((line) => ({ 
                                "DivisionCode": line.DIVISION_CODE, 
                                "DivisionName": line.DIVISION_NAME 
                            }));
                            oLocalData.BankAccountNumbers = result[3].map((line) => ({
                                "CompanyCode": line.company_code,
                                "Division": line.division,
                                "Currency": line.currency,
                                "ElsecoBankAccountNumber": line.ElsecoBankAccountNumber,
                                "Description": line.description,
                                "GLAccount": line.GLAccount,
                                "GLAccountCharges": line.GLAccountCharges,
                                "SubTransaction": line.subTransaction,
                                "GLAccountForOP": line.GLAccountForOP
                            }));
                            oLocalData.ApplicableBankAccountNumbers = {};

                            // Update the model with all data at once
                            oLocalModel.setData(oLocalData);
                            // Refresh the model so the changes are visible in the UI.
                            oLocalModel.refresh();
                            // Let the application know that the data has been loaded successfully.
                            resolve();
                        }).catch((error) => {
                            // If there's an error, show an error message.
                            reject(error);
                        });
                    } catch (error) {
                        // If there's an error, show an error message.
                        reject(error);
                    }
                });
            },

            /**
        * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
        * design mode class should be set, which influences the size appearance of some controls.
        * @public
        * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
        */
            getContentDensityClass: function () {
                if (this._sContentDensityClass === undefined) {
                    // check whether FLP has already set the content density class; do nothing in this case
                    if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
                        this._sContentDensityClass = "";
                    } else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
                        this._sContentDensityClass = "sapUiSizeCompact";
                    } else {
                        // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                        this._sContentDensityClass = "sapUiSizeCozy";
                    }
                }
                return this._sContentDensityClass;
            }

        });
    }
);