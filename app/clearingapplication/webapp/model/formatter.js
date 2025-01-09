sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
  "use strict";
  return {
    formatCurrency: function (value) {
      // Parse the string to a float value
      var fValue = parseFloat(value);

      // Use the NumberFormat to format the value with two decimal places
      var oNumberFormat = NumberFormat.getCurrencyInstance({
        showMeasure: false,
        decimalSeparator: ".",
        groupingSeparator: ",",
        minFractionDigits: 2,
        maxFractionDigits: 2
      });

      // Return the formatted number as a string
      return oNumberFormat.format(fValue);
    },
    formatDate: function (sTimestamp) {
      if (sTimestamp) {
        // return sTimestamp.substring(0,10); // TODO remove this and use below code for deployment
        return sTimestamp.toLocaleDateString("en-GB").split("/").join(".");
      }
      return "";
    },

    setRowEditable: function (bClearingStatus, bIsAllocAmnEditable) {
      if (bClearingStatus === 0) {
        // If ClearingStatus is in process, the input is not editable
        return false;
      } else {
        // If IsClearingInProcess is false, the editability depends on isAllocAmnEditable
        return bIsAllocAmnEditable;
      }
    },

    setRowHighlighter: function (bClearingStatus, bAmn) {

      if (bClearingStatus === 0) {
        return "Warning";
      }
      if (bClearingStatus === 2) {
        return "Error";
      }
      if (bClearingStatus === 4) {
        return "None";
      }
      if (parseFloat(bAmn) === 0) {
        return "Success";
      }
      return "None";
    }
  };
});