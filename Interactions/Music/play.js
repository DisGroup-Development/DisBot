const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');

class Play extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'play',
            Description: 'Plays a song i you\'re voice channel.',
            Usage: '<Input>',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
            memberPermissions: [],
            enabledSlashCommand: true,
            enabledOptions: true,
            Options: [{ name: 'input', description: 'The name or url of the song or playlist.', type: 'STRING', required: true }],
            Cooldown: 5000,
            Dirname: __dirname,
            adminGuildOnly: true,
            guildOnly: true,
            sysadminOnly: false,
            NSFW: false

        });

    }

    async execute(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../../DisBot')) {



    }

}

module.exports = Play;