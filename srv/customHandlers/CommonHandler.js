const cds = require("@sap/cds");
const logger = cds.log("clearingapplicationlogger")
class CommonHandler {
    constructor(service) {
        this.service = service;
    }

    /**
     * To get the SAP User ID for the logged in user
     * @param {*} req 
     * @returns SAP User ID for the logged in user
     */
    getMySapUser = async (req) => {

        try {
            const oConnection = await cds.connect.to("masterdata-mgmt-service");
            oConnection.path = "/v2/admin";

            const oResponse = await oConnection.read(SELECT.from('Users').where({ USERID: req.user.id }));
            if (oResponse.length > 0) {
                return oResponse[0].EXTERNAL_USERID ? oResponse[0].EXTERNAL_USERID : oResponse[0].USERID; // If no user found, return the logged in user id which is email id
            } else {
                return req.user.id; // If no user found, return the logged in user id which is email id
            }
        } catch (error) {
            logger.error('Error fetching SAP User:', error);
            throw new Error("Error fetching SAP User");
        }
    }

    /**
     * To update the user variants for Clearing Page Sap.ui.table
     * @param {*} req 
     * @returns 
     */
    updateUserVariants = async (req) => {
        for await (const oUserVariant of req.data.UserVariants) {
            await UPDATE`clearingapplicationService.ClearingTableUserVariants`
                .set({
                    isDefault: oUserVariant.isDefault,
                    isPublic: oUserVariant.isPublic
                })
                .where({
                    ID: oUserVariant.ID
                });
        }
        return true;
    }

    /**
     * To get the payer payee 
     * @param {*} req 
     * @returns 
     */
    getPayerPayee = async (req) => {
        try {
            const oConnection = this.service.s4Connection;

            let aPayerPayee = await oConnection.send({
                method: "GET",
                path: `getPayerPayee?IsPayerRequested=${req.data.IsPayerRequested}&ExtRef='${req.data.ExtRef}'&UMR='${req.data.UMR}'`,
            });
            let oResult = {
                BP: aPayerPayee.map((x) => x.BP_ID),
            };
            return oResult;
        } catch (error) {
            logger.error(error);
            req.reject(500, "Error Occurred");
        }
    }

    /**
     * To convert the foriegn currency to local currency. This calls function CONVERT_TO_LOCAL_CURRENCY in on-prem
     * @param {*} req 
     * @returns 
     */
    convLocalCurrency = async (req) => {
        try {
            const oConnection = this.service.s4Connection;

            let oResult = await oConnection.send({
                method: "GET",
                path: `convLocalCurrency?ForeignAmount=${req.data.ForeignAmount}m&ForeignCurrency='${req.data.ForeignCurrency}'&LocalCurrency='${req.data.LocalCurrency}'&Rate=${req.data.Rate}m`,
                headers: { "Content-Type": "Application/json" },
            });

            return oResult;
        } catch (error) {
            logger.error(error);
            req.reject(500, "Error Occurred");
        }
    }

    /**
     * To convert the foriegn currency to local currency in Bulk. This calls function CONVERT_TO_LOCAL_CURRENCY in on-prem
     * @param {*} req 
     * @returns 
     */
    convLocalCurrencyInBulk = async (req) => {
        try {
            const oConnection = this.service.s4Connection;
            oConnection.csrf = true;
            let aConvLocalCurrency = req.data.Payload.map(line => ({
                ForeignAmount: line.ForeignAmount,
                ForeignCurrency: line.ForeignCurrency,
                LocalCurrency: line.LocalCurrency,
                Rate: line.Rate
            }));
            let oPayload = {
                Action: "ConvLocalCurrency",
                ConvLocalCurrency: aConvLocalCurrency
            };
            let oResult = await oConnection.send({
                method: "POST",
                path: `DeepOPSet`,
                data: oPayload,
                headers: { "Content-Type": "Application/json" },
            });
            const safeResults = oResult.ConvLocalCurrency || [];
            return req.data.Payload.map((line) => {
                const [matchingResult] = safeResults.splice(0, 1);
                return {
                    ...line,
                    LocalAmount: matchingResult?.LocalAmount ?? null
                };
            });
        } catch (error) {
            logger.error(error);
            req.reject(500, "Error Occurred");
        }
    }

    checkPostingPeriod = async (req) => {
        try {
            const oConnection = this.service.s4Connection;

            let oResult = await oConnection.send({
                method: "GET",
                path: `checkPostingPeriod?PostingDate=datetime'${req.data.PostingDate.substring(
                    0,
                    19
                )}'&CompanyCode='${req.data.CompanyCode}'`,
                headers: { "Content-Type": "Application/json" },
            });

            return oResult.Response;
        } catch (error) {
            console.log(error);
            req.reject(500, "Error Occurred");
        }
    }

}

module.exports = { CommonHandler }