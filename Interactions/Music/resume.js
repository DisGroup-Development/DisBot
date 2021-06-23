const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class Resume extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'resume',
            Description: 'Resumes the current playing song.',
            Usage: '',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES', 'SPEAK'],
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

        DisBot.interactionPlayer.resume(Interaction, InteractionOptions, DisBot);

    }

}

module.exports = Resume;