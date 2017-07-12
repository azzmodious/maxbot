/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-luis
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var http = require('http');


var useEmulator = (process.env.NODE_ENV == 'development');

var options = {
    host: 'https://prod-03.northcentralus.logic.azure.com',
    path: '/workflows/33fab29ca76c4160bcdd59057ad346eb/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qyVMqkAqMQq_-_RicNCbWj_O_7MFhUq9PeJLMBw6A0M',
    //since we are listening on a custom port, we need to specify it by hand
    port: '443',
    //This is what changes the request to a POST request
    method: 'POST', 
    headers: {
        'Content-Type':'application/json'
    }
    };

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('greeting', (session, arg) =>{
    session.send('Whats up buddy :)');
    
})
.matches('submit ticket', (session, arg) =>{
    session.send('I will create a ticket for you. Give me a sec...');
    session.send(JSON.stringify(arg));
   
})
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}




