const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class Volume extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'volume',
            Description: 'Sets the volume of the current song.',
            Usage: '',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES'],
            memberPermissions: [],
            enabledSlashCommand: true,
            enabledOptions: true,
            Options: [{ name: 'volume', description: 'The new volume.', type: 'INTEGER', required: false }],
            Cooldown: 5000,
            Dirname: __dirname,
            adminGuildOnly: true,
            guildOnly: true,
            sysadminOnly: false,
            NSFW: false

        });

    }

    async execute(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../../DisBot')) {

        DisBot.interactionPlayer.setVolume(Interaction, InteractionOptions, DisBot);

    }

}

module.exports = Volume;