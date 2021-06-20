const BaseEvent = require('../Base/Event');

class Ready extends BaseEvent {

    constructor(DisBot) {

        super(DisBot, {
            Name: 'ready',
            Enabled: true,
            Type: 'on'
        });
        
    }

    async execute(DisBot = require('../DisBot')) {

        //DisBot.guilds.cache.get(DisBot.config.Guild.ID).commands.set([ ]);
        DisBot.interactions.forEach(Interaction => {
            ( Interaction.Config.enabledOptions ? DisBot.guilds.cache.get(DisBot.config.Guild.ID).commands.create({ name: Interaction.Help.Name, description: Interaction.Help.Description, options: Interaction.Config.Options }) : DisBot.guilds.cache.get(DisBot.config.Guild.ID).commands.create({ name: Interaction.Help.Name, description: Interaction.Help.Description }) )
        })

        var DisBotGuildSizeCount;

        DisBot.user.setStatus(DisBot.config.User.Status);

        setInterval(async function() {

            DisBotGuildSizeCount = await DisBot.utils.fetchClientGuildSize(DisBot);

            return DisBotGuildSizeCount;
            
        }, 5000);

        setInterval(function() {

            DisBot.user.setActivity(DisBot.config.User.Activity[1].Message.replace('{{guildCount}}', ( DisBotGuildSizeCount ? DisBotGuildSizeCount : '0' ) ), { type: DisBot.config.User.Activity[1].Type });
            
            setTimeout(function() {
                
                DisBot.user.setActivity(DisBot.config.User.Activity[2].Message, { type: DisBot.config.User.Activity[2].Type });

            }, 5000);

            setTimeout(function() {
                
                DisBot.user.setActivity(DisBot.config.User.Activity[3].Message.replace('{{clientName}}', DisBot.user.username), { type: DisBot.config.User.Activity[3].Type });

            }, 10000);

            setTimeout(function() {
                
                DisBot.user.setActivity(DisBot.config.User.Activity[4].Message.replace('{{clientName}}', DisBot.user.username), { type: DisBot.config.User.Activity[4].Type });

            }, 15000);

        }, 20000);

    }

}

module.exports = Ready;