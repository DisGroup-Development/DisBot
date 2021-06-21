const BaseEvent = require('../Base/Event');
const Discord = require('discord.js');

class Message extends BaseEvent {

    constructor(DisBot) {

        super(DisBot, {
            Name: 'message',
            Enabled: true,
            Once: false
        });
        
    }

    async execute(DisBot = require('../DisBot'), Message = new Discord.Message()) {

        if(Message.content === '!deploy' && Message.member.roles.cache.has('725063861887172648')) {

            DisBot.interactions.forEach(Interaction => {

                ( Interaction.Config.enabledOptions ? DisBot.guilds.cache.get(DisBot.config.Guild.ID).commands.create({ name: Interaction.Help.Name, description: Interaction.Help.Description, options: Interaction.Config.Options }) : DisBot.guilds.cache.get(DisBot.config.Guild.ID).commands.create({ name: Interaction.Help.Name, description: Interaction.Help.Description }) )

            })

        }


    }

}

module.exports = Message;