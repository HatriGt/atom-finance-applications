const cds = require("@sap/cds");

class ExternalEntityHandler {

    static _constructor(service) {
        this.service = service;  
    }

    /**
     * Get Coverholder from Masterdata Service
     * @param {*} req 
     * @returns 
     */
    coverholder = async (req) => {
      const oConnection = await cds.connect.to("masterdata-mgmt-service");
      oConnection.path = "/v2/product";
      return oConnection.tx(req).run(req.query);
    }

    /**
     * Get Divisions from Masterdata Service
     * @param {*} req 
     * @returns 
     */
    divisions = async (req) => {
      const oConnection = await cds.connect.to("masterdata-mgmt-service");
      oConnection.path = "/v2/mdm";
      return oConnection.tx(req).run(req.query);
    }


    /**
     * Get Business Partners from Masterdata CRM Service
     * @param {*} req 
     * @returns 
     */
    businessPartners = async (req) => {
      const oConnection = await cds.connect.to("masterdata-mgmt-service");
      oConnection.path = "/v2/crm";
      return oConnection.tx(req).run(req.query);
    }

    /**
     * Get Internal References with Attributes from Deal Service
     * @param {*} req 
     * @returns 
     */
    internalReferencesWithAttributes = async (req) => {
        const oConnection = await cds.connect.to("deal-mgmt-service");
          return oConnection.tx(req).run(req.query); 
    }


    /**
     * Get Bank Account from S4 
     * @param {*} req 
     * @returns 
     */
    bankAccount = async (req) => {
      try {
        const oConnection = await cds.connect.to("s4-onprem-service");
        oConnection.path = "/sap/opu/odata/sap/ZC_YEL_TB_BANK_CLEA_CDS";
        return oConnection.tx(req).run(req.query);
      } catch (error) {
        req.reject(500, "Error Occurred");
      }
    }

}

module.exports = {ExternalEntityHandler};