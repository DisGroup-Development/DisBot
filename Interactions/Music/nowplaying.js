const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class NowPlaying extends BaseInteraction {

    constructor(DisBot) {
        
        super(DisBot, {
            Name: 'nowplaying',
            Description: 'Gets information about the current song.',
            Usage: ' ',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES'],
            memberPermissions: [],
            enabledSlashCommand: true,
            enabledOptions: false,
            Options: [],
            Cooldown: 1000,
            Dirname: __dirname,
            adminGuildOnly: false,
            guildOnly: true,
            sysadminOnly: false,
            NSFW: false
        });

    }

    async execute(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID);

        var NoServerQueueEmbed = new Discord.MessageEmbed()
        .setColor(DisBot.config.Colors.Red)
        .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} There are no songs in the queue.`)

        if(!ServerQueue) return Interaction.editReply({ embeds: [ NoServerQueueEmbed ], ephemeral: true });

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be connected to a voice channel to use this command.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already i another voice channel. Join me to use this command.`)

        if(ServerQueue && Interaction.guild.me.voice.channel.id !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        const ProgressBar = await DisBot.interactionPlayer.generateProgressBar(ServerQueue);
        const SongLeftTime = ServerQueue.AudioResource.playbackDuration;

        var NowPlayingEmbed = new Discord.MessageEmbed()
            .setAuthor('Now Playing', ServerQueue.Songs[0].Requester.avatarURL())
            .setTitle(ServerQueue.Songs[0].Title)
            .setColor(DisBot.config.Colors.DisBot)
            .setDescription(`\`${ProgressBar}\` \n \n\`\`${new Date(SongLeftTime).toISOString().substr(11, 8)} / ${new Date(ServerQueue.Songs[0].Duration * 1000).toISOString().substr(11, 8)}\`\``)
            .setThumbnail(ServerQueue.Songs[0].Thumbnail)
            .setURL(ServerQueue.Songs[0].URL)

        return Interaction.editReply({ embeds: [ NowPlayingEmbed ], ephemeral: false });

    }

}

module.exports = NowPlaying;