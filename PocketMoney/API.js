const CapOneAPI = require('./MoneyMoveAPI.js');
let sourceAccountRefID = ""; // will store the account with the largest account balance.
let targetAccountRefID = ""; // will store the account with the smallest account balance.
const TODAY = new Date().toJSON().slice(0, 10); // quick and dirty way to get today's date formatted in yyyy-mm-dd
let accountRefBalanceDict = {};
var transferObject = {};
// get the accounts and figure out who is the biggest/smallest

let balancePromise = new Promise(function (resolve, reject) {
    CapOneAPI.getAccounts(function (response) {
        response.accounts.forEach((account) => {
            if (account.availableBalance != undefined) {
                accountRefBalanceDict[account.availableBalance] = account.moneyMovementAccountReferenceId;
            }
        });

        let keys = Object.keys(accountRefBalanceDict);
        keys.sort();
        sourceAccountRefID = accountRefBalanceDict[keys[keys.length - 1]];
        targetAccountRefID = accountRefBalanceDict[keys[0]];

        resolve([sourceAccountRefID, targetAccountRefID]);
    });;
});

balancePromise.then(() => {
    transferObject = {
        "originMoneyMovementAccountReferenceId": sourceAccountRefID,
        "destinationMoneyMovementAccountReferenceId": targetAccountRefID,
        "transferAmount": .01,
        "currencyCode": "USD",
        "transferDate": TODAY,
        "memo": "for investments",
        "transferType": "ACH",
        "frequency": "OneTime"
    };
});

function MoveTheCash(_amount) {
    transferObject.transferAmount = _amount;
    var transferPromise = new Promise(function (resolve, reject) {
        CapOneAPI.initiateTransfer(transferObject, (response) => {
            resolve(response);
        });
    });
    return (transferPromise);
}

module.exports.MoveTheCash = MoveTheCash;
