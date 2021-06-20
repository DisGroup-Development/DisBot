const Path = require('path');

class BaseInteraction {

    constructor(DisBot, {
        Name = null,
        Description = null,
        Usage = null,
        Enabled = true,
        clientPermissions = new Array(),
        memberPermissions = new Array(),
        enabledSlashCommand = true,
        enabledOptions = false,
        Options = null,
        Cooldown = 2000,
        Dirname = false,
        adminGuildOnly = false,
        guildOnly = false,
        sysadminOnly = true,
        NSFW = false
    })

    {

        const Category = ( Dirname ? Dirname.split(Path.sep)[parseInt(Dirname.split(Path.sep).length-1, 10)] : 'Other' );
        
        this.DisBot = DisBot;
        this.Config = { Enabled, clientPermissions, memberPermissions, enabledSlashCommand, enabledOptions, Options, Cooldown, adminGuildOnly, guildOnly, sysadminOnly, NSFW, Category };
        this.Help = { Name, Description, Usage };

    }

};

module.exports = BaseInteraction;