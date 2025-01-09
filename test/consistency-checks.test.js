let {
    GET, auth, expect
} = require("./server");


describe("Basic consistency tests", () => {
    test("Metadata retrieval", async () => {
        let metadata = await GET("/clearingapplication/$metadata", auth);
        expect(metadata).status(200);
       
    });
});
