const DisBotClient = require('./Base/DisBot');

var DisBot = new DisBotClient();

const DisBotInit = async () => {

    const CommandDirectory = await DisBot.readDirectory('./Commands/');

    DisBot.logger.debug(`Loading ${CommandDirectory.length} command categorys...`);

    CommandDirectory.forEach(async CommandCategoryDirectory => {
        
        var Commands = (await DisBot.readDirectory(`./Commands/${CommandCategoryDirectory}/`)).filter(Command => Command.split('.').pop() === 'js');

        Commands.forEach(Command => {

            DisBot.utils.loadCommand(Command, `./Commands/${CommandCategoryDirectory}`, DisBot);

        });

    });

    const InteractionDirectory = await DisBot.readDirectory('./Interactions/');

    DisBot.logger.debug(`Loading ${InteractionDirectory.length} interaction categorys...`);

    InteractionDirectory.forEach(async InteractionCategoryDirectory => {
        
        var Interactions = (await DisBot.readDirectory(`./Interactions/${InteractionCategoryDirectory}/`)).filter(Interaction => Interaction.split('.').pop() === 'js');

        Interactions.forEach(Interaction => {

            DisBot.utils.loadInteraction(Interaction, `./Interactions/${InteractionCategoryDirectory}`, DisBot);

        });

    });

    const EventDirectory = await DisBot.readDirectory('./Events/');

    DisBot.logger.debug(`Loading ${EventDirectory.length} events...`);

    EventDirectory.forEach(EventFile => {

        var EventData = new (require(`./Events/${EventFile}`))(DisBot);
        var EventName = EventFile.split('.')[0];

        if(!EventData.Config.Enabled) return;

        ( EventData.Config.Once ? DisBot.once(EventName, (...args) => EventData.execute(DisBot, ...args)) : DisBot.on(EventName, (...args) => EventData.execute(DisBot, ...args)));

        DisBot.logger.debug(`Loaded event ${EventName}`)

        delete require.cache[require.resolve(`./Events/${EventFile}`)];

    });


    DisBot.login(DisBot.config.Application.Bot.Token);

}

DisBotInit();

module.exports = DisBot;