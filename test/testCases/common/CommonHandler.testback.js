const { expect } = require('../../server');
const { setupTestEnv, teardownTestEnv } = require('../../utils/test-helper');
const { GET, auth } = require('../../server');

describe("CommonHandler", () => {
    before(async () => {
        await setupTestEnv();
    });

    after(async () => {
        await teardownTestEnv();
    });
    
    test("Get CoverHolder", async () => {
        let response = await GET("/v2/clearingapplication/Coverholder", auth);
        console.log(response);
        expect(response).status(200);
    })
})
