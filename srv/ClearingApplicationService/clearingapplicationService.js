const cds = require("@sap/cds");
const { util } = require("../util/util");
const { CommonHandler } = require("../customHandlers/CommonHandler");
const { EventsHandler } = require("../customHandlers/EventsHandler");
const { ExternalEntityHandler } = require("../customHandlers/ExternalEntityHandler");
const { PremiumsHandler } = require("../customHandlers/PremiumsHandler");
const { ClaimsHandler } = require("../customHandlers/ClaimsHandler");



class clearingapplicationService extends cds.ApplicationService {
  async init() { 

    /**
   * To intialize global classes used in the handlers
   */
    const commonHandler = new CommonHandler(this);
    const Util = new util();
    const eventsHandler = new EventsHandler(this);
    await eventsHandler.init(); 
    const externalEntityHandler = new ExternalEntityHandler(this);
    const premiumsHandler = new PremiumsHandler(this);
    const claimsHandler = new ClaimsHandler(this);


    /**
     * To intialize global variables used in the handlers
     */
    // this.s4DestinationDetails = await Util.getS4DestinationDetails(); 
    this.s4Connection = await Util.getS4Connection();


    /**
     * Events to be Triggered
     */
    this.on("UpdatePremiumReceivablesResponse", eventsHandler.UpdatePremiumReceivablesResponse);
    this.on("UpdateClaimReceivablesResponse", eventsHandler.UpdateClaimReceivablesResponse);
    this.on("UpdateUIMResponse", eventsHandler.UpdateUIMResponse);


    /**
     * Premiums Handler
     */
    this.on("GetPremiumReceivables", premiumsHandler.getPremiumReceivables);
    this.on("ClearPremiumReceivables", premiumsHandler.clearPremiumReceivables);
    this.on("GetPremiumPayables", premiumsHandler.getPremiumPayables);
    this.on("ClearPremiumPayables", premiumsHandler.clearPremiumPayables);
    this.on("SOAUpdatePreCheck", premiumsHandler.soaUpdatePreCheck);
    this.on("SOAUpdate", premiumsHandler.soaUpdate);
    this.on("ClearSOAReference", premiumsHandler.clearSOAReference);


    /**
     * Claim Handler
     */
    this.on("GetClaimReceivables", claimsHandler.getClaimReceivables);
    this.on("ClearClaimReceivables", claimsHandler.clearClaimReceivables);
    this.on("GetClaimPayables", claimsHandler.getClaimPayables);
    this.on("ClearClaimPayables", claimsHandler.clearClaimPayables);


    /**
     * External Entities Used
     */
    this.on("READ", "Coverholder", externalEntityHandler.coverholder);
    this.on("READ", "Divisions", externalEntityHandler.divisions);
    this.on("READ", "BusinessPartners", externalEntityHandler.businessPartners);
    this.on("READ", "InternalReferencesWithAttributes", externalEntityHandler.internalReferencesWithAttributes);
    this.on("READ", "BankAccount", externalEntityHandler.bankAccount);

    
    /**
     * Common Actions Required for Application
     */
    this.on("UpdateUserVariants", commonHandler.updateUserVariants);
    this.on("GetMySapUser", commonHandler.getMySapUser);
    this.on("GetPayerPayee", commonHandler.getPayerPayee);
    this.on("ConvLocalCurrency", commonHandler.convLocalCurrency);
    this.on("ConvLocalCurrencyInBulk", commonHandler.convLocalCurrencyInBulk);
    this.on("CheckPostingPeriod", commonHandler.checkPostingPeriod);


    return super.init();
  }
}
module.exports = { clearingapplicationService };
