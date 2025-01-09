const { startServer, stopServer } = require('../server');

const auth = {
    username: 'test',
    password: ''
};

const setupTestEnv = async () => {
    await startServer();
};

const teardownTestEnv = async () => {
    await stopServer();
};

// Helper function for making authenticated requests
const makeAuthRequest = (request) => {
    return request.auth(auth.username, auth.password);
};

module.exports = {
    setupTestEnv,
    teardownTestEnv,
    auth,
    makeAuthRequest
};