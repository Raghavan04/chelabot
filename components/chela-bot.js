'use strict';

var _ = require('lodash');
var jsonfile = require('jsonfile');
var path = require('path');
var TelegramBot = require('node-telegram-bot');
var u = require('./app-utils');
var uuid = require('node-uuid');

var COMMAND_START = 'start';
var COMMAND_NEXT = 'next';
var COMMANDS = [COMMAND_START, COMMAND_NEXT];

/**
 * Executes a bot command.
 * @param {Object} options
 * @param {Object} options.bot - Bot instance
 * @param {Number} options.chatId - Chat identifier
 * @param {Object} options.command - Command
 * @param {Function} callback
 */
function executeCommand(options, callback) {
    var commandName = options.command.name;
    //console.log('commandName:', commandName);

    if(!commandName || COMMANDS.indexOf(commandName) < 0) {
        if(_.isFunction(callback)) callback(new Error('Invalid command: ' + commandName));
        return;
    }

    /**
     * Handles Telegram Bot API callback.
     * @param {Object} res
     */
    function callbackHandler(res) {
        //console.log('res:', res);
        if(_.isFunction(callback)) callback();
    }

    var commandOptions = _.pick(options, ['bot', 'chatId']);
    switch(commandName) {
        case COMMAND_START:
            executeCommandStart(commandOptions, callbackHandler);
            break;
        case COMMAND_NEXT:
            executeCommandNext(commandOptions, callbackHandler);
            break;
    }
}

function executeCommandNext(options, callback) {
    var bot = options.bot;
    var chatId = options.chatId;

    bot.sendChatAction({
        chat_id: chatId,
        action: 'typing'
    });

    // TODO: Implement this. For now send a message with a random UUID
    bot.sendMessage({
        chat_id: chatId,
        text: uuid.v4(),
        disable_web_page_preview: true
    }, callback);
}

function executeCommandStart(options, callback) {
    // TODO: Implement this. For now do anything
    if(_.isFunction(callback)) callback();
}

/**
 * Parses command.
 * @param {Object} message
 * @returns {Object}
 */
function parseCommand(message) {
    var messageText = message.text;
    if(!messageText) return undefined;
    var messageTextFields = messageText.split(' ', 2);
    var commandName = messageTextFields[0].replace(/^\//, '').split('@')[0];
    var commandArguments = messageTextFields.length <= 1 ? undefined : messageTextFields[1].split(' ');
    return {
        name: commandName,
        args: commandArguments
    };
}

/**
 * Initializes the bot.
 * @param {Function} callback
 */
exports.init = function(callback) {
    var secretJsonFilePath = [path.resolve('.'), 'secret.json'].join(path.sep);
    //console.log('secretJsonFilePath:', secretJsonFilePath);
    jsonfile.readFile(secretJsonFilePath, function(err, jsonData) {
        if(err) {
            if(_.isFunction(callback)) callback(err);
            return;
        }

        var bot = new TelegramBot({
            token: jsonData.telegramBotToken
        });

        bot.on('message', function(message) {
            //console.log('message:', u.stringify(message));
            if(!message) return;

            var commandObj = parseCommand(message);
            if(!commandObj) return;
            executeCommand({
                bot: bot,
                chatId: message.chat.id,
                command: commandObj
            }, function(err) {
                if(err) return console.error(err);
                //console.log(commandObj.name + ' command has been executed successfully...');
            });
        });

        bot.start();

        if(_.isFunction(callback)) callback();
    });
};
