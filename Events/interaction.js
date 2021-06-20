const BaseEvent = require('../Base/Event');
const Discord = require('discord.js');

class Interaction extends BaseEvent {

    constructor(DisBot) {

        super(DisBot, {
            Name: 'interaction',
            Enabled: true,
            Type: 'on'
        });
        
    }

    async execute(DisBot = require('../DisBot'), Interaction = new Discord.CommandInteraction()) {

        if(!Interaction.isCommand()) return;

        Interaction.defer();

        const InteractionCommand = await DisBot.interactions.get(Interaction.commandName);

        if(!InteractionCommand) DisBot.application.commands.delete(Interaction.id);
        if(!InteractionCommand) return DisBot.guilds.cache.get(Interaction.guild.id).commands.delete(Interaction.id);

        if(InteractionCommand.Config.Enabled === false) return Interaction.editReply('Not enabled');

        if(InteractionCommand) return InteractionCommand.execute(Interaction, Interaction.options, DisBot);


    }

}

module.exports = Interaction;