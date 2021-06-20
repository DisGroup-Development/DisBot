const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');

class Leave extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'leave',
            Description: 'Leaves in you\'re voice channel.',
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

        const MemberVoiceChannel = Interaction.member.voice.channel;

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be in a voice channel to use this command. Join a voice channel and try again.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var NoClientVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I must be in a voice channel to leave the voice channel.`)

        if(!Interaction.guild.me.voice.channel) return Interaction.editReply({ embeds: [ NoClientVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already in another voice channel. Join me to use other music commands.`)

        if(Interaction.guild.me.voice.channelID !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        const VoiceConnection = DiscordVoice.getVoiceConnection(Interaction.guildID);

        VoiceConnection.destroy();

        var LeftVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.DisBot)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Disconnect)} Left voice channel.`)

        return Interaction.editReply({ embeds: [ LeftVoiceChannelEmbed ], ephemeral: false });

    }

}

module.exports = Leave;