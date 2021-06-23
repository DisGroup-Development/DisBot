const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class Loop extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'loop',
            Description: 'Loops the current song.',
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

        DisBot.interactionPlayer.loop(Interaction, InteractionOptions, DisBot);

    }

}

module.exports = Loop;