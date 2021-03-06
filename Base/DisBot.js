const Discord = require('discord.js');
const InteractionPlayer = require('../Utils/interactionPlayer');
const Logger = require('../Utils/Logger');
const Util = require('../Utils/Utils');

class BaseDisBot extends Discord.Client {

    constructor() {

        super({

            allowedMentions: {
                
                parse: ['roles', 'users']

            },

            intents: [

                new Discord.Intents(Discord.Intents.ALL)

            ],

        });

        this.aliases = new Discord.Collection();
        this.commands = new Discord.Collection();
        this.events = new Discord.Collection();
        this.interactions = new Discord.Collection();

        this.serverQueues = new Discord.Collection();

        this.config = require('../config.json');

        this.interactionPlayer = new InteractionPlayer(this);
        this.logger = new Logger(this);
        this.utils = new Util(this);

        this.readDirectory = require('util').promisify(require('fs').readdir);
        

    }

}

module.exports = BaseDisBot;