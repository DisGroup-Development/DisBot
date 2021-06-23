const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class Stop extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'stop',
            Description: 'Stops the current song and left the voice channel.',
            Usage: '',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES'],
            memberPermissions: [],
            enabledSlashCommand: true,
            enabledOptions: false,
            Options: null,
            Cooldown: 5000,
            Dirname: __dirname,
            adminGuildOnly: true,
            guildOnly: true,
            sysadminOnly: false,
            NSFW: false

        });

    }

    async execute(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../../DisBot')) {

        DisBot.interactionPlayer.stop(Interaction, InteractionOptions, DisBot);

    }

}

module.exports = Stop;