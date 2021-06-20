const DisBotClient = require('./Base/DisBot');

var DisBot = new DisBotClient();

const DisBotInit = async () => {

    const CommandDirectory = await DisBot.readDirectory('./Commands/');

    DisBot.logger.log(`Loading ${CommandDirectory.length} command categorys...`);

    CommandDirectory.forEach(async CommandCategoryDirectory => {
        
        var Commands = (await DisBot.readDirectory(`./Commands/${CommandCategoryDirectory}/`)).filter(Command => Command.split('.').pop() === 'js');

        Commands.forEach(Command => {

            DisBot.functions.loadCommand(Command, `./Commands/${CommandCategoryDirectory}`, DisBot);

        });

    });

    const InteractionDirectory = await DisBot.readDirectory('./Interactions/');

    DisBot.logger.log(`Loading ${InteractionDirectory.length} interaction categorys...`);

    InteractionDirectory.forEach(async InteractionCategoryDirectory => {
        
        var Interactions = (await DisBot.readDirectory(`./Interactions/${InteractionCategoryDirectory}/`)).filter(Interaction => Interaction.split('.').pop() === 'js');

        Interactions.forEach(Interaction => {

            DisBot.functions.loadInteraction(Interaction, `./Interactions/${InteractionCategoryDirectory}`, DisBot);

        });

    });

    const EventDirectory = await DisBot.readDirectory('./Events/');

    DisBot.logger.log(`Loading ${EventDirectory.length} events...`);

    EventDirectory.forEach(EventFile => {

        var EventData = new (require(`./Events/${EventFile}`))(DisBot);
        var EventName = EventFile.split('.')[0];

        if(!EventData.Config.Enabled) return;

        ( EventData.Config.Type === 'on' ? DisBot.on(EventName, (...args) => EventData.execute(DisBot, ...args)) : DisBot.once(EventName, (...args) => EventData.execute(DisBot, ...args)));

        DisBot.logger.log(`Loaded event ${EventName}`)

        delete require.cache[require.resolve(`./Events/${EventFile}`)];

    });


    DisBot.login(DisBot.config.Application.Bot.Token);

}

DisBotInit();

module.exports = DisBot;