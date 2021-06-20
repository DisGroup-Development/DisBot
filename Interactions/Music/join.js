const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');

class Join extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'join',
            Description: 'Joins in you\'re voice channel.',
            Usage: '',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES', 'CONNECT'],
            memberPermissions: [],
            enabledSlashCommand: true,
            enabledOptions: false,
            Options: null,
            Cooldown: 2500,
            Dirname: __dirname,
            adminGuildOnly: true,
            guildOnly: true,
            sysadminOnly: false,
            NSFW: false

        });

    }

    async execute(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID);

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be in a voice channel to use this command. Join a voice channel and try again.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already in another voice channel. Join me to use other music commands.`)

        if(ServerQueue) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        var SameVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already in you're voice channel. Use other music commands to play music.`)

        if(Interaction.guild.me.voice.channelID === MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ SameVoiceChannelEmbed ], ephemeral: true });

        DiscordVoice.joinVoiceChannel({ adapterCreator: Interaction.guild.voiceAdapterCreator, channelId: MemberVoiceChannel.id, guildId: Interaction.guildID, selfDeaf: false, selfMute: false });

        var JoinedVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.DisBot)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.VoiceChannel)} Joined voice channel.`)

        return Interaction.editReply({ embeds: [ JoinedVoiceChannelEmbed ], ephemeral: false });

    }

}

module.exports = Join;