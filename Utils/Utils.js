const Path = require('path');

class Utils {

    constructor(DisBot) {

        this.DisBot = DisBot;

    }

    async fetchClientGuildSize(DisBot) {

        return DisBot.shard.fetchClientValues('guilds.cache.size');

    }

    loadCommand(CommandName, CommandPath, DisBot) {

        try {

            const CommandData = new (require(`../${CommandPath}${Path.sep}${CommandName}`))(DisBot);

            CommandData.Config.Location = CommandPath;

            if(CommandData.Init) CommandData.Init(DisBot);

            DisBot.commands.set(CommandData.Help.Name, CommandData);

        } catch (Error) {

            return DisBot.logger.error(`There was an error while loading command ${CommandName} : ${Error}`)

        }

    }

    loadInteraction(InteractionName, InteractionPath, DisBot) {

        try {

            const InteractionData = new (require(`../${InteractionPath}${Path.sep}${InteractionName}`))(DisBot);

            InteractionData.Config.Location = InteractionPath;

            if(InteractionData.Init) InteractionData.Init(DisBot);

            DisBot.interactions.set(InteractionData.Help.Name, InteractionData);

        } catch (Error) {

            return DisBot.logger.error(`There was an error while loading interaction ${InteractionName} : ${Error}`)

        }

    }

    
}

module.exports = Utils;