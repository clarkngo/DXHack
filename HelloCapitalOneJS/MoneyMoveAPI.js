const config = require('./config');
var request = require('request');
let oauthToken = null;
const clientId = config.clientId
const clientSecret = config.clientSecret;
const baseUrl = config.baseUrl;

OAUTH_ENDPOINT = "/oauth/oauth20/token";
MONEY_MOVEMENT = "/money-movement";
TRANSFER_REQUESTS = "/transfer-requests";
ACCOUNTS = "/accounts";

module.exports = {

    //Retrieves the OAuth Token using the clientId and ClientSecret
    getToken: function(callback) {
        if (oauthToken) {
            callback(null, oauthToken);
        } else {
            let url = baseUrl + OAUTH_ENDPOINT;
            request({
                url: url,
                method: 'POST',
                form: {
                    'client_id': clientId,
                    'client_secret': clientSecret,
                    'grant_type': 'client_credentials'
                }
            }, function(err, res) {
                if (err) {
                    console.log(err);
                } else {
                    var json = JSON.parse(res.body);
                    oauthToken = json.access_token;
                    callback(null, oauthToken);
                }
            });
        }
    },

    //Builds the URL for requesting all transfers with provided filters
    buildUrl: function(moneyMovementAccountReferenceId, filters, callback) {
        var esc = encodeURIComponent;
        let url = MONEY_MOVEMENT + TRANSFER_REQUESTS;
        url += '?moneyMovementAccountReferenceId=' + esc(moneyMovementAccountReferenceId) + '&';
        let query = Object.keys(filters)
            .map(k => esc(k) + '=' + esc(filters[k]))
            .join('&');
        callback(url + query);
    },

    //sends the HTTP request for MoneyMovement API
    sendRequest: function(method, requestUrl, body, callback) {
        let token = module.exports.getToken((oauthErr, oauthToken) => {
            if (oauthErr) {
                console.log("Error retrieving token");
            } else {
                let reqOptions = {
                    baseUrl: baseUrl,
                    url: requestUrl,
                    method: method,
                    headers: {
                        "Accept": "application/json;v=0",
                        "Content-Type": "application/json"
                    },
                    body: body
                };
                reqOptions.headers["Authorization"] = `Bearer ${oauthToken}`;
                request(reqOptions, function(err, response, body) {
                    if (err) {
                        console.log(`Error for Money Movement API ${requestUrl} failed with an error\n\n`, err);
                        callback(JSON.parse(err));
                    } else if (response.statusCode >= 400) {
                        console.log(`Money Movement API call for ${requestUrl} failed with invalid status code ${response.statusCode} : ${JSON.parse(body).description}\n\n`);
                        callback(JSON.parse(body));
                    } else {
                        if (body) {
                            callback(JSON.parse(body));
                        } else {
                            callback(body)
                        }
                    }
                });
            }
        });
    },

    //GET /money-movement/accounts: Retrieves all accounts and information
    getAccounts: function(callback) {
        let requestUrl = MONEY_MOVEMENT + ACCOUNTS;
        module.exports.sendRequest('GET', requestUrl, "", function(response) {
            callback(response);
        });
    },

    //POST /money-monevement/transfer-requests: Request money to be moved from one account to another
    initiateTransfer: function(transferRequest, callback) {
        let requestUrl = MONEY_MOVEMENT + TRANSFER_REQUESTS;
        let body = JSON.stringify(transferRequest);
        module.exports.sendRequest('POST', requestUrl, body, function(response) {
            callback(response);
        });
    },

    //GET /money-movement/transfer-requests/{transferRequestId}: View status/details of existing money transfer request
    getTransferRequest: function(moneyMovementAccountReferenceId, callback) {
        let requestUrl = MONEY_MOVEMENT + TRANSFER_REQUESTS + "/" + moneyMovementAccountReferenceId;
        module.exports.sendRequest('GET', requestUrl, "", function(response) {
            callback(response);
        });
    },

    //GET /money-movement/transfer-requests: View status/details of existing money transfer requests for an account with filters
    getTransferRequests: function(moneyMovementAccountReferenceId, filters, callback) {
        module.exports.buildUrl(moneyMovementAccountReferenceId, filters, function(requestUrl) {
            module.exports.sendRequest('GET', requestUrl, "", function(response) {
                callback(response);
            });
        });
    },

    //PATCH /money-movement/transfer-requests/{transferRequestId}: Update an existing money transfer request.
    updateTransferRequest: function(transferRequestId, status, callback) {
        let requestUrl = MONEY_MOVEMENT + TRANSFER_REQUESTS + "/" + transferRequestId;
        let transferRequest = {
            "transferRequestStatus": "Cancelled"
        };
        let body = JSON.stringify(transferRequest);
        module.exports.sendRequest('PATCH', requestUrl, body, function(response) {
            callback(response);
        });
    }
};
