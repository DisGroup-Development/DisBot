const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class Stop extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'skip',
            Description: 'Skips the current song',
            Usage: '',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES'],
            memberPermissions: [],
            enabledSlashCommand: true,
            enabledOptions: true,
            Options: [{ name: 'number', description: 'The number of the song you want to skip to.', type: 'INTEGER', required: false }],
            Cooldown: 5000,
            Dirname: __dirname,
            adminGuildOnly: true,
            guildOnly: true,
            sysadminOnly: false,
            NSFW: false

        });

    }

    async execute(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../../DisBot')) {

        ( InteractionOptions.has('number') ? DisBot.interactionPlayer.skip(Interaction, InteractionOptions, DisBot) : DisBot.interactionPlayer.skip(Interaction, InteractionOptions, DisBot) )

    }

}

module.exports = Stop;