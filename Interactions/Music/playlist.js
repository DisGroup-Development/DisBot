const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const YouTubeAPI = require('simple-youtube-api');

var YouTubeAPIClient = new YouTubeAPI(require('../../config.json').API.YouTube.Key);

class Playlist extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'playlist',
            Description: 'Plays a complete playlist.',
            Usage: '',
            Enabled: true,
            clientPermissions: ['SEND_MESSAGES', 'CONNECT', 'SPEAK'],
            memberPermissions: [],
            enabledSlashCommand: false,
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
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID);

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be in a voice channel to use this command. Join a voice channel and try again.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already in another voice channel. Join me to use other music commands.`)

        if(ServerQueue && Interaction.guild.me.voice.channelID !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        const URL = InteractionOptions.get('input').value;

        var BaseServerQueueData = { AudioResource: null, Connection: null, isLoop: false, isPlaying: false, Player: DiscordVoice.createAudioPlayer(), playerSubscription: null, Songs:[], TextChannel: Interaction.channel, VoiceChannel: MemberVoiceChannel, Volume: 100 };
        var SongInfo;
        var PlaylistSongs;

        try {

            const PlaylistData = await YouTubeAPIClient.getPlaylist(URL);
            PlaylistSongs = await PlaylistData.getVideos(250);

        } catch (error) {

            var PlaylistNotFoundEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.Red)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} Could not found a playlist with you\'re url. Please try again.`)

            return Interaction.editReply({ embeds: [ PlaylistNotFoundEmbed ], ephemeral: true });

        }

        var SongsOfPlaylist = PlaylistSongs
            .filter(Song => Song.title !== 'Private video' || Song.title !== 'Deleted video')
            .map(Song => {
                return SongInfo = { Author: Song.channel.title, Duration: Song.durationSeconds, Requester: DisBot.users.cache.get(Interaction.user.id), Title: Song.title, Thumbnail: Song.thumbnails.high.url, URL: Song.url };               
            });

        if(ServerQueue) {

            var SongsAddedEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Check)} Added \`${SongsOfPlaylist.length}\` from ${SongInfo.Requester.username} to queue.`)
                .setThumbnail(SongsOfPlaylist[0].Thumbnail)

            ServerQueue.Songs.push(...SongsOfPlaylist);

            return Interaction.editReply({ embeds: [ SongsAddedEmbed ], ephemeral: false });

        }

        var SongsAddedEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.DisBot)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Check)} Added \`${SongsOfPlaylist.length}\` from ${SongInfo.Requester.username} to queue.`)
            .setThumbnail(SongsOfPlaylist[0].Thumbnail)

        Interaction.editReply({ embeds: [ SongsAddedEmbed ], ephemeral: false });

        BaseServerQueueData.Songs.push(...SongsOfPlaylist);
        DisBot.serverQueues.set(Interaction.guildID, BaseServerQueueData);

        try {

            BaseServerQueueData.Connection = DiscordVoice.joinVoiceChannel({ adapterCreator: Interaction.guild.voiceAdapterCreator, channelId: MemberVoiceChannel.id, guildId: Interaction.guildID, selfDeaf: false, selfMute: false });
            BaseServerQueueData.playerSubscription = await BaseServerQueueData.Connection.subscribe(BaseServerQueueData.Player);

            DisBot.interactionPlayer.play(Interaction, InteractionOptions, DisBot, BaseServerQueueData.Songs[0]);

        } catch (Error) {

            if(BaseServerQueueData.Connection) await ServerQueue.Connection.destroy();
            DisBot.serverQueues.delete(Interaction.guildID);
            return DisBot.utils.handleInteractionError(Interaction, InteractionOptions, DisBot, Error);

        }

    }

}

module.exports = Playlist;