const cds = require('@sap/cds');
const logger = cds.log("clearingapplicationlogger");



class Connection {

    async getCapacityConnection(sServiceName) {
        if (sServiceName === "CapacityCheckService") {
            if (this.capacityCheckConnection === null || this.capacityCheckConnection === undefined) {
                this.capacityCheckConnection = await cds.connect.to('capacity-mgmt-service');
                this.capacityCheckConnection.path = "/v2/capacitycheck-srv";
            }
            return this.capacityCheckConnection;
        } else if (sServiceName === "CapacityService") {
            if (this.capacityConnection === null || this.capacityConnection === undefined) {
                this.capacityConnection = await cds.connect.to('capacity-mgmt-service');
                this.capacityConnection.path = "/v2/capacity-new-srv";
            }
            return this.capacityConnection;
        }
    }

}


class CapacityMgmntInterface {

    async getManyStampDetails(stampIds) {
        try{
        const conn = new Connection();
        const capacityConn = await conn.getCapacityConnection("CapacityCheckService");

        const stampDetails = await capacityConn.send({
            method: "POST",
            path: "getManyStampDetails",
            data: stampIds
        })
        return stampDetails;
        } catch (error) {
            logger.error("Error fetching stamp details:", error);
            if (error.reason.status === 404) {
                throw new Error("Capacity Service Not Available");
            }
            throw new Error("Error fetching stamp details");
        }
    }

    async getStampWithAdditionalDetails(aStampIds) {
        try{
        if (aStampIds.length === 0) {
            return [];
        }
        const conn = new Connection();
        const capacityConn = await conn.getCapacityConnection("CapacityService");
        const stampDetails = await capacityConn.run(SELECT.from("Stamps", (stmp) => {
            stmp.ID,
                stmp.STAMP_NAME,
                stmp.ItsPoolUWY((pluwy) => {
                    pluwy.UWYEAR,
                        pluwy.POOLUWY_NAME,
                        pluwy.INCEPTION,
                        pluwy.EXPIRYDATE,
                        pluwy.ItsPool((pool) => {
                            pool.POOL_NAME,
                                pool.POOL_CD,
                                pool.ItsLob((lob) => {
                                    lob.LOB_NAME
                                })
                        })
                });
        }).where({ ID: { in: aStampIds } }));

        const flattenedStampDetails = stampDetails.map(stamp => ({
            ID: stamp.ID,
            STAMP_NAME: stamp?.STAMP_NAME,
            UWYEAR: stamp?.ItsPoolUWY?.UWYEAR,
            POOLUWY_NAME: stamp?.ItsPoolUWY?.POOLUWY_NAME,
            INCEPTION: stamp?.ItsPoolUWY?.INCEPTION,
            EXPIRYDATE: stamp?.ItsPoolUWY?.EXPIRYDATE,
            POOL_NAME: stamp?.ItsPoolUWY?.ItsPool?.POOL_NAME,
            POOL_CD: stamp?.ItsPoolUWY?.ItsPool?.POOL_CD,
            LOB_NAME: stamp?.ItsPoolUWY?.ItsPool?.ItsLob?.LOB_NAME
        }));

        return flattenedStampDetails;
        } catch (error) {
            logger.error("Error fetching stamp details:", error);
            if (error.reason.status === 404) {
                throw new Error("Capacity Service Not Available");
            }
            throw new Error("Error fetching stamp details");
        }
    }
}


module.exports = { CapacityMgmntInterface }