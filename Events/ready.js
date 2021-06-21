const BaseEvent = require('../Base/Event');

class Ready extends BaseEvent {

    constructor(DisBot) {

        super(DisBot, {
            Name: 'ready',
            Enabled: true,
            Once: true
        });
        
    }

    async execute(DisBot = require('../DisBot')) {

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

        DisBot.logger.debug(`Logged in as ${DisBot.user.username}`);

    }

}

module.exports = Ready;