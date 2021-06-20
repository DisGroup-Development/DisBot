const DisBotClient = require('./Base/DisBot');

var DisBot = new DisBotClient();

DisBot.login(DisBot.config.Application.Bot.Token)