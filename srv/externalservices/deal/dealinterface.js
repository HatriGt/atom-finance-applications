const cds = require('@sap/cds');
const logger = cds.log("clearingapplicationlogger");


class Connection {

    async getDealConnection() {
        if (this.dealConnection === null || this.dealConnection === undefined) {
            this.dealConnection = await cds.connect.to("deal-mgmt-service");
        }
        return this.dealConnection;
    }

}


class DealMgmntInterface {

    async getInteRefAttributes(IntRefIds) {
        try{
        if (IntRefIds.length === 0) {
            return [];
        }
        const conn = new Connection();
        const dealConn = await conn.getDealConnection();
        const IntRefs = [... new Set(IntRefIds)];
        const intRefInfo = await dealConn.read(SELECT.from('InternalReferencesWithAttributes').where({
            INTERNAL_REFERENCE_NO: { in: IntRefs }
        }));
            return intRefInfo;
        } catch (error) {
            logger.error("Error fetching internal references:", error);
            if (error.reason.status === 404) {
               throw new Error("Deal Service Not Available");
            }
            throw new Error("Error fetching internal references");
        }
    }

}


module.exports = { DealMgmntInterface }