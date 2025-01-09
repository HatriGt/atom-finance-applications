const cds = require("@sap/cds");
const express = require('express');
const cors = require('cors');
const dealMock = require('./mock/dealMock');
const s4ServiceMock = require('./mock/s4ServiceMock');
const { findEndpoint } = require('./utils/mockHandler');
const capacityMock = require('./mock/capacityMock');
const masterdataMock = require('./mock/masterdataMock');
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);

const app = express();

app.use(cors());
app.use(express.json());

// Generic handler for all routes
app.use((req, res) => {
    const fullUrl = req.path + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
    console.log(`Incoming request: ${req.method} ${fullUrl}`);
    console.log('Request body:', req.body);

    const mockSources = [
        { data: dealMock, name: 'Deal' },
        { data: s4ServiceMock, name: 'S4' },
        { data: capacityMock, name: 'Capacity' },
        { data: masterdataMock, name: 'Masterdata' }
    ];

    for (const source of mockSources) {
        const endpoint = findEndpoint(source.data, req.method, fullUrl);
        if (endpoint) {
            console.log(`Responding with ${source.name} mock data`);
            return res.status(endpoint.response.statusCode)
                .send(JSON.parse(endpoint.response.body));
        }
    }

    console.log('No matching endpoint found');
    res.status(404).json({
        error: 'Endpoint not found',
        requestedPath: fullUrl,
        method: req.method,
        message: 'No mock data found for this endpoint'
    });
});

let server;
const startServer = () => {
    return new Promise((resolve, reject) => {
        try {
            server = app.listen(8080, () => {
                console.log('Mock server running at http://localhost:8080');
                resolve(server);
            });
        } catch (error) {
            reject(error);
        }
    });
};

const stopServer = () => {
    return new Promise((resolve) => {
        if (server) {
            server.close(() => {
                console.log('Server stopped');
                resolve();
            });
        } else {
            resolve();
        }
    });
};

// CDS test setup
const { GET, POST, expect, axios, DELETE } = cds.test("serve", '--profile', 'test', '--with-mocks');

const auth = {
    auth: {
        username: 'test',
        password: ''
    }
};

// Start server if running directly
if (require.main === module) {
    startServer();
}

// Handle shutdown
cds.on("shutdown", async () => {
    await stopServer();
});

module.exports = {
    app,
    startServer,
    stopServer,
    GET,
    POST,
    expect,
    axios,
    auth,
    DELETE
};