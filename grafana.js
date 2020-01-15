import http from 'k6/http';

export function getUnixTimestamp () {
    return new Date().getTime();
}

function addBasicAuth (url, username, password) {
    const schemeId = '://';
    const schemeBeginPos = url.search(schemeId);
    const schemeEndPos = schemeBeginPos + schemeId.length;
    const basicAuth = `${username}:${password}@`;
    return url.substring(0, schemeEndPos) + basicAuth + url.substring(schemeEndPos, url.length);
}

function getApiKeyName () {
    // Grafana is picky with api key names, generate unique api key name
    const apiKeyName = 'pensum-key';
    const ts = getUnixTimestamp;
    return `${apiKeyName}-${ts}`;
}

function createApiKey (url, apiKeyName) {
    const res = http.post(`${url}/api/auth/keys`, JSON.stringify({
        'name': apiKeyName,
        'role': 'Admin',
        'secondsToLive': 120
    }), {
        headers: { 'Content-Type': 'application/json' }
    });

    const json = JSON.parse(res.body);
    return json.key;
}

function deleteApiKey (url, keyId) {
    http.del(`${url}/api/auth/keys/${keyId}`);
}

function getApiKey (url, username, password) {
    url = addBasicAuth(url, username, password);
    const res = http.get(`${url}/api/auth/keys`);
    const json = JSON.parse(res.body);

    const apiKeyName = getApiKeyName();
    let apiKey = json.find(({ name }) => name === apiKeyName);
    if (apiKey) {
        deleteApiKey(url, apiKey.id);
    }

    apiKey = createApiKey(url, apiKeyName);
    return apiKey;
}

export function getReportUrl (grafanaUrl, reportUrl, username, password, runTag, from, to, dashboardUID) {
    const apiKey = getApiKey(grafanaUrl, username, password);
    return `${reportUrl}/api/v5/report/${dashboardUID}?apitoken=${apiKey}&from=${from}&to=${to}&var-Run=${runTag}`;
}
