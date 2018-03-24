var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();

// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
var bot = new builder.UniversalBot(connector, [
    function (session) {
      //  session.send("Welcome to the chores app.");
        builder.Prompts.text(session, "What chore do you want to assign?");
    },
    function (session, results) {
        session.dialogData.chore = results.response;
        builder.Prompts.number(session, "How much do you want to charge for this chore?");
    },
    function (session, results) {
        session.dialogData.choreCost = results.response;
        builder.Prompts.text(session, "Who do you want to do the chores?");
    },
    function (session, results) {
        session.dialogData.choreName = results.response;

        // Process request and display reservation details
        session.send(`Chore scheduled. Chore details: <br/>${session.dialogData.chore} <br/>Chore cost: ${session.dialogData.choreCost} <br/>Point person: ${session.dialogData.choreName}`);
        session.endDialog();
    }
]).set('storage', inMemoryStorage); // Register in-memory storage