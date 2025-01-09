/* eslint-disable consistent-this */
sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "./util",
    "sap/ui/core/Fragment",
    "sap/m/library",
    "sap/m/VariantItem",
    
], function (MessageBox,MessageToast,
    Util,
    Fragment, mLibrary, VariantItem) {
    "use strict";

    var oClearingController = null;
    var SharingMode = mLibrary.SharingMode;
    var _oVM = null;


    return {
        _showMessagesMessage: function (sMessage) {
            MessageToast.show(sMessage, {
                closeOnBrowserNavigation: true
            });
        },
        _checkCurrentVariant: function () {
            var sSelectedKey = this._oVM.getSelectedKey();
            var oItem = this._oVM.getItemByKey(sSelectedKey);
            if (!oItem) {
                var sKey = this._oVM.getStandardVariantKey();
                if (sKey) {
                    this._oVM.setSelectedKey(sKey);
                }
            }
        },
        _updateItems: function (mParams) {
            if (mParams.deleted) {
                mParams.deleted.forEach(function (sKey) {
                    var oItem = this._oVM.getItemByKey(sKey);
                    if (oItem) {
                        this._oVM.removeItem(oItem);
                        oItem.destroy();
                    }
                }.bind(this));
            }

            if (mParams.hasOwnProperty("def")) {
                this._oVM.setDefaultKey(mParams.def);
            }

            this._checkCurrentVariant();
        },
        _createNewItem: function (mParams) {
            var sKey = "key_" + Date.now();

            var oItem = new VariantItem({
                key: sKey,
                title: mParams.name,
                executeOnSelect: mParams.execute,
                author: "sample",
                changeable: true,
                remove: true
            });

            if (mParams.hasOwnProperty("public") && mParams.public) {
                oItem.setSharing("Public");
            }
            if (mParams.def) {
                this._oVM.setDefaultKey(sKey);
            }

            this._oVM.addItem(oItem);

            // this._showMessagesMessage("New view '" + oItem.getTitle() + "' created with key:'" + sKey + "'.");
        },
        onPress: function() {
			this._oVM.setModified(!this._oVM.getModified());
		},
		onManage: function(event) {
			var params = event.getParameters();
			this._updateItems(params);
		},
		onSelect: function(event) {
			var params = event.getParameters();
			// var sMessage = "Selected Key: " + params.key;
			// this._showMessagesMessage(sMessage);
			this._oVM.setModified(false);
		},
		onSave: function(event) {
			var params = event.getParameters();
			if (params.overwrite) {
				var oItem = this._oVM.getItemByKey(params.key);
				this._showMessagesMessage("View '" + oItem.getTitle() +  "' updated.");
			} else {
				this._createNewItem(params);
			}

			this._oVM.setModified(false);
		},

        setVariantManagementControl: function(oVM){
            this._oVM = oVM;
        }
    };
}
);