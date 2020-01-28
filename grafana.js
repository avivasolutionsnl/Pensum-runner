import http from 'k6/http';
import { b64encode } from 'k6/encoding';

export function getUnixTimestamp () {
    return new Date().getTime();
}

function calcAuthorizationHeader(username, password) {
    const str = b64encode(`${username}:${password}`);
    return `Basic ${str}`;
}

function getApiKeyName () {
    // Grafana is picky with api key names, generate unique api key name
    const apiKeyName = 'pensum-key';
    const ts = getUnixTimestamp();
    return `${apiKeyName}-${ts}`;
}

function createApiKey (url, apiKeyName, auth) {
    const res = http.post(`${url}/api/auth/keys`, JSON.stringify({
        'name': apiKeyName,
        'role': 'Admin',
        'secondsToLive': 120
    }), {
        headers: { 
            'Authorization': auth,
            'Content-Type': 'application/json', 
        }
    });

    const json = JSON.parse(res.body);
    return json.key;
}

function deleteApiKey (url, keyId, auth) {
    http.del(`${url}/api/auth/keys/${keyId}`, {}, {
        headers: { 'Authorization': auth }
    });
}

export function getApiKey (url, username, password) {
    const auth = calcAuthorizationHeader(username, password);

    const res = http.get(`${url}/api/auth/keys`, { 
        headers: { 'Authorization': auth } 
    });
    const json = JSON.parse(res.body);

    const apiKeyName = getApiKeyName();
    let apiKey = json.find(({ name }) => name === apiKeyName);
    if (apiKey) {
        deleteApiKey(url, apiKey.id, auth);
    }

    apiKey = createApiKey(url, apiKeyName, auth);
    return apiKey;
}

export function getReportUrl (grafanaUrl, reportUrl, username, password, runTag, from, to, dashboardUID) {
    const apiKey = getApiKey(grafanaUrl, username, password);
    return `${reportUrl}/api/v5/report/${dashboardUID}?apitoken=${apiKey}&from=${from}&to=${to}&var-Run=${runTag}`;
}
