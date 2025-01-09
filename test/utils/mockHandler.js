const getBasePath = (fullPath) => {
    return fullPath.split('?')[0];
};

const findEndpoint = (mockData, method, fullUrl) => {
    // Try exact match first
    let endpoint = mockData.find(mock => 
        mock.request.method === method && 
        mock.request.path === fullUrl
    );

    // For GET requests with query params, try base path if exact match not found
    if (!endpoint && method === 'GET' && fullUrl.includes('?')) {
        console.log('Exact match not found, trying base path...');
        const basePath = getBasePath(fullUrl);
        endpoint = mockData.find(mock => 
            mock.request.method === method && 
            mock.request.path === basePath
        );

        if (endpoint) {
            console.log(`Found matching endpoint for base path: ${basePath}`);
        }
    }

     // For POST requests, we might want to match based on the request body
     if (!endpoint && method === 'POST' && body) {
        endpoint = mockData.find(mock => 
            mock.request.method === method && 
            mock.request.path === fullUrl
        );
    }


    return endpoint;
};

module.exports = { findEndpoint };