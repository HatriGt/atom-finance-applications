const { expect } = require('../../server');
const { setupTestEnv, teardownTestEnv } = require('../../utils/test-helper');
const { POST, auth } = require('../../server');

describe("Premiumshandler", () => {
    before(async () => {
        await setupTestEnv();
    });

    after(async () => {
        await teardownTestEnv();
    });
    test("Get Premium Receivables", async () => {
        const selectionFilters = {
          CompanyCode: "DX01",
          BusinessPartners: ["1100000100"],
          ExternalReferenceNumbers: ["11000069524148304"],
          SoaReferenceNumbers: [],
          UMRNumbers: [], 
          ElsecoBankAccountNumber: "4021323893163050",
          Payment: 0,
          BankCharge: 0,
          Currency: "USD",
          PostingDate: null,
          Division: "E1"
        };
        let response = await POST("/clearingapplication/GetPremiumReceivables", {
            "SelectionFilters": JSON.stringify(selectionFilters)
        }, auth);
        console.log(response.data);
        expect(response).status(200);
    })
})

