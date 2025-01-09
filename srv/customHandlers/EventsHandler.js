const cds = require("@sap/cds");
const constants = require('../util/constants');
const logger = cds.log("clearingapplication-events-logger");

class EventsHandler {

  async init() {
    this.messagingFICACreateResponse = await cds.connect.to(
      "messaging-ficacreate-response"
    );
    this.setupEventListeners();
  }

  /**
   * Sets up the event listeners for the FICA Create Response
   */
  setupEventListeners() {
    this.messagingFICACreateResponse.on(
      "atom/srv/events/fica-create-response/premiumreceivables",
      this.handlePremiumReceivablesResponse.bind(this)
    );

    this.messagingFICACreateResponse.on(
      "atom/srv/events/fica-create-response/claimreceivables",
      this.handleClaimReceivablesResponse.bind(this)
    );

    this.messagingFICACreateResponse.on(
      "atom/srv/events/fica-create-response/uim",
      this.handleUIMResponse.bind(this)
    );
  }

  /**
   * Event Handler for Premium Receivables Response which updates the Premium Receivables Response
   * @param {*} msg 
   * @returns 
   */
  async handlePremiumReceivablesResponse(msg) {
    const aResponse = msg.data.response;
    const aCreatedDocuments = msg.data?.ficaDocuments || [];
    const aMessages = msg.data?.Messages || [];
    aResponse.forEach(x => {
      x.CreatedDocuments = JSON.stringify(aCreatedDocuments);
      x.AdditionalInfo = JSON.stringify(aMessages);
    });
    await this.UpdatePremiumReceivablesResponse(aResponse, msg.data.TenantId);
  }

  /**
   * Event Handler for Claim Receivables Response which updates the Claim Receivables Response
   * @param {*} msg 
   * @returns 
   */
  async handleClaimReceivablesResponse(msg) {
    const aResponse = msg.data.response;
    const aCreatedDocuments = msg.data?.ficaDocuments || [];
    const aMessages = msg.data?.Messages || [];
    aResponse.forEach(x => {
      x.CreatedDocuments = JSON.stringify(aCreatedDocuments);
      x.AdditionalInfo = JSON.stringify(aMessages);
    });
    await this.UpdateClaimReceivablesResponse(aResponse, msg.data.TenantId);
  }

  /**
   * Event Handler for UIM Response which updates the UIM Response
   * @param {*} msg 
   * @returns 
   */
  async handleUIMResponse(msg) {
    const aResponse = msg.data.response;
    const aCreatedDocuments = msg.data?.ficaDocuments || [];
    const aMessages = msg.data?.Messages || [];
    aResponse.forEach(x => {
      x.CreatedDocuments = JSON.stringify(aCreatedDocuments);
      x.AdditionalInfo = JSON.stringify(aMessages);
    });
    await this.UpdateUIMResponse(aResponse, msg.data.TenantId);
  }

  /**
   * Updates the Status in ClearingStatusLog Table and PremiumReceivablesPendingTransactions Table
   * @param {Array} aResponse 
   * @param {String} sTenantId 
   * @returns 
   */

  UpdatePremiumReceivablesResponse = async (aResponse, sTenantId) => {
    const sResponse = JSON.stringify(aResponse);

    // It Can be either Success or Failed. No Combination of Success and Failed
    let aTransactionWithFicaCreationSuccess = aResponse.filter(
      (x) => x.Status === "Success"
    );
    let aTransactionWithFicaCreationFailure = aResponse.filter(
      (x) => x.Status === "Failed" || x.Status === "Exception"
    );
    let status = constants.ClearingStatus.Success;

    await cds.tx({ tenant: sTenantId, user: cds.User.Privileged }, async () => {
      logger.info("Updating Premium Receivables Response with Tenant ID: " + sTenantId + " and Response: " + JSON.stringify(aResponse) + " and user: " + cds.User.Privileged);
      for await (const transaction of aTransactionWithFicaCreationSuccess) {
        await DELETE.from(
          "clearingapplicationService.PremiumReceivablesPendingTransactions"
        ).where({
          ExtRef: transaction.ExtRef,
          IntRef: transaction.IntRef,
          TrType: transaction.TrType,
          BitRef: transaction.BitRef,
          EndorsementRef: transaction.EndorsementRef,
          PolicyNo: transaction.PolicyNo,
          PremiumId: transaction.PremiumId,
          Installment: transaction.Installment,
        });
      }

      for await (const transaction of aTransactionWithFicaCreationFailure) {
        status = constants.ClearingStatus.Failed;
        await UPDATE(
          "clearingapplicationService.PremiumReceivablesPendingTransactions"
        )
          .set({
            Status: constants.ClearingStatus.Failed, // Failed
          })
          .where({
            ExtRef: transaction.ExtRef,
            IntRef: transaction.IntRef,
            TrType: transaction.TrType,
            BitRef: transaction.BitRef,
            EndorsementRef: transaction.EndorsementRef,
            PolicyNo: transaction.PolicyNo,
            PremiumId: transaction.PremiumId,
            Installment: transaction.Installment,
          });
      }

      // Update the Status of the Clearing Status Log for all
      await UPDATE(
        "clearingapplicationService.ClearingStatusLog"
      )
        .set({
          Status: status,
          CreatedDocuments: aResponse[0].CreatedDocuments,
          AdditionalInfo: aResponse[0].AdditionalInfo
        })
        .where({
          UniqueClearingIdentifier: aResponse[0].UniqueClearingIdentifier
        });

      // Update the Status of the InterfaceLog for all
      await UPDATE(
        "clearingapplicationService.InterfaceLog"
      )
        .set({
          Status: status,
          StatusInfo: 'Received Response From Lambda',
          Response: sResponse
        })
        .where({
          UniqueClearingIdentifier: aResponse[0].UniqueClearingIdentifier
        });

      // Update the ClearingLog
      await UPDATE(
        "clearingapplicationService.ClearingLogDB"
      )
        .set({
          Status: status,
          CreatedDocuments: aResponse[0].CreatedDocuments
        })
        .where({
          UniqueClearingIdentifier: aResponse[0].UniqueClearingIdentifier
        });
    });

  }

  /**
   * Updates the Status in ClearingStatusLog Table and ClaimReceivablesPendingTransactions Table
   * @param {Array} aResponse 
   * @param {String} sTenantId 
   * @returns 
   */
  UpdateClaimReceivablesResponse = async (aResponse, sTenantId) => {
    const sResponse = JSON.stringify(aResponse);

    // It Can be either Success or Failed. No Combination of Success and Failed
    let aTransactionWithFicaCreationSuccess = aResponse.filter(
      (x) => x.Status === "Success"
    );
    let aTransactionWithFicaCreationFailure = aResponse.filter(
      (x) => x.Status === "Failed" || x.Status === "Exception"
    );
    let status = constants.ClearingStatus.Success;

    await cds.tx({ tenant: sTenantId, user: cds.User.Privileged }, async () => {
      for await (const transaction of aTransactionWithFicaCreationSuccess) {
        await DELETE.from(
          "clearingapplicationService.ClaimReceivablesPendingTransactions"
        ).where({
          ExtRef: transaction.ExtRef,
          IntRef: transaction.IntRef,
          TrType: transaction.TrType,
          BitRef: transaction.BitRef,
          UCR: transaction.UCR,
          ClaimRef: transaction.ClaimRef,
          TrRef: transaction.TrRef,
          MemberBPID: transaction.MemberBPID
        });

      }

      for await (const transaction of aTransactionWithFicaCreationFailure) {
        status = constants.ClearingStatus.Failed;
        await UPDATE(
          "clearingapplicationService.ClaimReceivablesPendingTransactions"
        ).set({
          Status: constants.ClearingStatus.Failed, // Failed
        }).where({
          ExtRef: transaction.ExtRef,
          IntRef: transaction.IntRef,
          TrType: transaction.TrType,
          BitRef: transaction.BitRef,
          UCR: transaction.UCR,
          ClaimRef: transaction.ClaimRef,
          TrRef: transaction.TrRef,
          MemberBPID: transaction.MemberBPID
        });
      }

      // Update the Status of the Clearing Status Log for all
      await UPDATE(
        "clearingapplicationService.ClearingStatusLog"
      )
        .set({
          Status: status,
          CreatedDocuments: aResponse[0].CreatedDocuments,
          AdditionalInfo: aResponse[0].AdditionalInfo
        })
        .where({
          UniqueClearingIdentifier: aResponse[0].UniqueClearingIdentifier
        });

      // Update the Status of the InterfaceLog for all
      await UPDATE(
        "clearingapplicationService.InterfaceLog"
      )
        .set({
          Status: status,
          StatusInfo: 'Received Response From Lambda',
          Response: sResponse
        })
        .where({
          UniqueClearingIdentifier: aResponse[0].UniqueClearingIdentifier
        });

      // Update the ClearingLog
      await UPDATE(
        "clearingapplicationService.ClearingLogDB"
      )
        .set({
          Status: status,
          CreatedDocuments: aResponse[0].CreatedDocuments
        })
        .where({
          UniqueClearingIdentifier: aResponse[0].UniqueClearingIdentifier
        });
    });

  }

  /**
   * Updates the Status in UIMPendingTransactions Table
   * @param {Array} aResponse 
   * @param {String} sTenantId 
   * @returns 
   */
  UpdateUIMResponse = async (aResponse, sTenantId) => {

    let aTransactionWithFicaCreationSuccess = aResponse.filter(
      (x) => x.Status === "Success"
    );
    let aTransactionWithFicaCreationFailure = aResponse.filter(
      (x) => x.Status === "Failed" || x.Status === "Exception"
    );

    await cds.tx({ tenant: sTenantId, user: cds.User.Privileged }, async () => {

      for await (const transaction of aTransactionWithFicaCreationSuccess) {
        await DELETE.from(
          "clearingapplicationService.UIMPendingTransactions"
        ).where({
          DocumentNo: transaction.DocumentNo,
          ItemNo: transaction.ItemNo,
          RepItem: transaction.RepItem,
          SubItem: transaction.SubItem,
        });
      }

      for await (const transaction of aTransactionWithFicaCreationFailure) {
        await UPDATE(
          "clearingapplicationService.UIMPendingTransactions"
        ).set({
          Status: constants.ClearingStatus.Failed, // Failed
        }).where({
          DocumentNo: transaction.DocumentNo,
          ItemNo: transaction.ItemNo,
          RepItem: transaction.RepItem,
          SubItem: transaction.SubItem,
        });
      }
    });
  }

}

module.exports = { EventsHandler };
