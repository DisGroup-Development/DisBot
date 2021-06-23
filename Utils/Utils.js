const Discord = require('discord.js');
const Path = require('path');
const UUID = require('uuid');

class Utils {

    constructor(DisBot) {

        this.DisBot = DisBot;

    }

    async fetchClientGuildSize(DisBot) {

        return DisBot.shard.fetchClientValues('guilds.cache.size');

    }

    handleInteractionError(Interaction, InteractionOptions, DisBot, Error) {

        const ErrorCode = UUID.v4();

        var ErrorEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} An error has appeared. Please try again. \nError Code : \`${ErrorCode}\``)

        Interaction.followUp({ embeds: [ ErrorEmbed ], ephemeral: false });
        return DisBot.logger.error(Error, ErrorCode);

    }

    loadCommand(CommandName, CommandPath, DisBot) {

        try {

            const CommandData = new (require(`../${CommandPath}${Path.sep}${CommandName}`))(DisBot);

            CommandData.Config.Location = CommandPath;

            if(CommandData.Init) CommandData.Init(DisBot);

            DisBot.commands.set(CommandData.Help.Name, CommandData);

            DisBot.logger.debug(`Loaded command ${CommandData.Help.Name}`);

        } catch (Error) {

            return DisBot.logger.error(`There was an error while loading command ${CommandName} : ${Error}`);

        }

    }

    loadInteraction(InteractionName, InteractionPath, DisBot) {

        try {

            const InteractionData = new (require(`../${InteractionPath}${Path.sep}${InteractionName}`))(DisBot);

            InteractionData.Config.Location = InteractionPath;

            if(InteractionData.Init) InteractionData.Init(DisBot);

            DisBot.interactions.set(InteractionData.Help.Name, InteractionData);

            DisBot.logger.debug(`Loaded interaction ${InteractionData.Help.Name}`);

        } catch (Error) {

            return DisBot.logger.error(`There was an error while loading interaction ${InteractionName} : ${Error}`);

        }

    }

    
}

module.exports = Utils;