const cds = require('@sap/cds');


class ficadashboardService extends cds.ApplicationService {
    init() {

        this.on('READ', 'ficadetails', async (req) => {

            let envIndex = req.query.SELECT?.where?.findIndex(condition =>
                condition.ref && condition.ref[0].toLowerCase() === 'env'
            );
            if (envIndex === -1) {
                req.reject(400, 'Valid ENV parameter is required');
            }
            const env = req.query.SELECT?.where?.[envIndex + 2] ?? (() => {
                req.reject(400, 'ENV value not found at expected position');
                return;
            })();
            
            try {
                // Determine the destination based on ENV
                if (env && env.val === 'Prod') {
                    var oConnection = await cds.connect.to("s4-onprem-ficadashboard-service-prod");
                } else if (env && env.val === 'QA') {
                    oConnection = await cds.connect.to("s4-onprem-ficadashboard-service");
                } else {
                    // Default destination or error handling
                    req.reject(400, 'Valid ENV parameter is required');
                }

                // Remove the ENV condition from the where clause
                req.query.SELECT.where[envIndex + 2].val = '';

                return oConnection.tx(req).run(req.query);
            } catch(error) {
                req.reject(401, 'Error Occurred');
            }
        });

        this.after('READ', 'ficadetails', async (data) => {
            if (Array.isArray(data)) {
                data.forEach(item => {
                    if (item.clearingDate && item.clearingDate === '9999-12-31') { // 9999-12-31 in milliseconds
                        item.clearingDate = null;
                    }
                });
            } else if (data && typeof data === 'object') {
                if (data.clearingDate && data.clearingDate === '9999-12-31') { // 9999-12-31 in milliseconds
                    data.clearingDate = null;
                }
            }
        });




        return super.init();
    }
}
module.exports = { ficadashboardService }