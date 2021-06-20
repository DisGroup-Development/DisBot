const Discord = require('discord.js');

let ConfigFile = require('./config.json');

var DisBotShardManager = new Discord.ShardingManager('./DisBot.js', { token: ConfigFile.Application.Bot.Token, totalShards: 'auto' });

DisBotShardManager.spawn();