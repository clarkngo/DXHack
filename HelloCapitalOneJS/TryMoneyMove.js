const CapOneAPI = require('./MoneyMoveAPI.js');

CapOneAPI.getAccounts(function(data){
    console.log(data);

});