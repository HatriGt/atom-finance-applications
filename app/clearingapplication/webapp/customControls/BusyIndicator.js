sap.ui.define([
"sap/ui/core/Control"
], function (Control, BusyIndicator, CustomBusyIndicator) {
    "use strict";

    return Control.extend("atom.ui.clearing.clearingapplication.customControls.BusyIndicator", {
       metadata: {
            properties: {
                size: {type: "sap.ui.core.CSSSize", defaultValue: "50px"}
            }
        },
        
        renderer: function (oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addStyle("width", oControl.getSize());
            oRm.addStyle("height", oControl.getSize());
            oRm.writeStyles();
            oRm.write(">");
            oRm.write("<img src='https://i.postimg.cc/Hx0vst4g/Busy-Indicator.gif' style='width:100%; height:100%;'/>");
            oRm.write("</div>");
        }
    });
});