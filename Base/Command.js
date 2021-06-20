const Path = require('path');

class BaseCommand {

    constructor(DisBot, {
        Name = null,
        Description = null,
        Aliases = new Array(),
        Usage = null,
        Enabled = true,
        clientPermissions = new Array(),
        memberPermissions = new Array(),
        enabledArgs = false,
        argsLength = null,
        Cooldown = 2000,
        Dirname = false,
        guildOnly = true,
        NSFW = false
    })

    {

        const Category = ( Dirname ? Dirname.split(Path.sep)[parseInt(Dirname.split(Path.sep).length-1, 10)] : 'Other' );
        
        this.DisBot = DisBot;
        this.Config = { Enabled, clientPermissions, memberPermissions, enabledArgs, argsLength, Cooldown, guildOnly, NSFW, Category };
        this.Help = { Name, Description, Aliases, Usage };

    }

};

module.exports = BaseCommand;