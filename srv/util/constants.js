
/**
 * @typedef {Object} ClearingStatus
 * @property {number} InProcess - Status when clearing is in process.
 * @property {number} Success - Status when clearing is successful.
 * @property {number} Failed - Status when clearing has failed.
 * @property {number} NotApplicable - Status when clearing is not applicable.
 */

/** @type {ClearingStatus} */
const ClearingStatus = {
  InProcess: 0,
  Success: 1,
  Failed: 2,
  NotApplicable: 4
};

/**
 * @typedef {Object} ClearingTypes
 * @property {string} PremiumPayables - Clearing type for premium payables.
 * @property {string} PremiumReceivables - Clearing type for premium receivables.
 * @property {string} ClaimReceivables - Clearing type for claim receivables.
 * @property {string} ClaimPayables - Clearing type for claim payables.
 */

/** @type {ClearingTypes} */
const ClearingTypes = {
  PremiumPayables: "PremiumPayables",
  PremiumReceivables: "PremiumReceivables",
  ClaimReceivables: "ClaimReceivables",
  ClaimPayables: "ClaimPayables"
}

/**
 * @type {string[]} An array of transaction types that are not included in the clearing status table updates.
 */
const TransactionsNotIncludedInClearingStatusTableUpdate = [] //["Payment", "Bank Charge", "OVER PAYMENT"]; - As of now we track all transactions in the clearing status table


/**
 * @type {string[]} An array of transaction types that are not premium claim transactions.
 */
const NonPremiumClaimTransactions = ["Payment", "Bank Charge", "OVER PAYMENT"]; // As of now we track all transactions in the clearing status table


module.exports = { ClearingStatus, TransactionsNotIncludedInClearingStatusTableUpdate, ClearingTypes, NonPremiumClaimTransactions };