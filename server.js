
const proxy = require("@cap-js-community/odata-v2-adapter");
const cds = require('@sap/cds');
const xsenv = require("@sap/xsenv");

cds.on("bootstrap", async (app) => {
  app.use(proxy());
  app.get("/getDependencies", (req, res) => {
    console.log(req.headers);
    xsenv.loadEnv();
    const services = xsenv.getServices({
      dest: { tag: "destination" },
      conn: { tag: "connectivity" }
    });
    cds.env.mtx.dependencies = [services.dest.xsappname, services.conn.xsappname];
    let deps = cds.env.mtx.dependencies.map((m) => {
      return { "xsappname": m }
    });
    res.status(200).json(deps);
  });

});

if (!process.env.NODE_ENV === 'production') {
  const cds = require ('@sap/cds')
  const {cds_launchpad_plugin} = require('cds-launchpad-plugin');

  // Enable launchpad plugin
  cds.once('bootstrap',(app)=>{
      const handler = new cds_launchpad_plugin();
      app.use(handler.setup({theme:'sap_horizon', version: '1.99.0'}));
  });
}
module.exports = cds.server; 