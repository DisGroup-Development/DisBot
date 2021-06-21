const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');

class Pause extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'pause',
            Description: 'Pauses the current playing song.',
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

        DisBot.interactionPlayer.pause(Interaction, InteractionOptions, DisBot);

    }

}

module.exports = Pause;