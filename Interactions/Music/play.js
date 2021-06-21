const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const YouTubeDownloader = require('ytdl-core');
const YouTubeSearch = require('yt-search');

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

        const SearchKeywords = InteractionOptions.get('input').value;
        const PlaylistPattern = /^.*(list=)([^#\&\?]*).*/gi;
        const VideoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const URL = InteractionOptions.get('input').value;
        
        if(PlaylistPattern.test(URL) && !VideoPattern.test(URL)) return DisBot.interactions.get('playlist').execute(Interaction, InteractionOptions, DisBot);

        var BaseServerQueueData = { AudioResource: null, Connection: null, isLoop: false, isPlaying: false, Player: DiscordVoice.createAudioPlayer(), playerSubscription: null, Songs:[], TextChannel: Interaction.channel, VoiceChannel: MemberVoiceChannel, Volume: 100 };
        var SongInfo;

        if(VideoPattern.test(URL)) {

            try {

                const SongData = await YouTubeDownloader.getInfo(URL);

                SongInfo = { Author: SongData.videoDetails.author.name, Duration: SongData.videoDetails.lengthSeconds, Requester: DisBot.users.cache.get(Interaction.user.id), Title: SongData.videoDetails.title, Thumbnail: SongData.videoDetails.thumbnails[3].url, URL: SongData.videoDetails.video_url };

            } catch (Error) {

                return DisBot.utils.handleInteractionError(Interaction, InteractionOptions, DisBot, Error);

            }

        } else {

            try {

                var SearchForKeywordsEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.YouTube)} Searching for: \`\`${SearchKeywords}\`\``)

                Interaction.editReply({ embeds: [ SearchForKeywordsEmbed ], ephemeral: false });

                const SearchResults = await YouTubeSearch.search(SearchKeywords);
                const ResultVideos = SearchResults.videos.slice(0, 1);

                ResultVideos.forEach(ResultVideo => {

                    SongInfo = { Author: ResultVideo.author.name, Duration: ResultVideo.duration.seconds, Requester: DisBot.users.cache.get(Interaction.user.id), Title: ResultVideo.title, Thumbnail: ResultVideo.thumbnail, URL: ResultVideo.url };

                })

            } catch (Error) {

                return DisBot.utils.handleInteractionError(Interaction, InteractionOptions, DisBot, Error);

            }

        }

        if(ServerQueue) {

            var SongAddedEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Check)} Added [${SongInfo.Title}](${SongInfo.URL}) from ${SongInfo.Requester.username} to queue.`)
                .setThumbnail(SongInfo.Thumbnail)

            ServerQueue.Songs.push(SongInfo);

            return Interaction.editReply({ embeds: [ SongAddedEmbed ], ephemeral: false });

        }

        BaseServerQueueData.Songs.push(SongInfo);
        DisBot.serverQueues.set(Interaction.guildID, BaseServerQueueData);

        try {

            BaseServerQueueData.Connection = DiscordVoice.joinVoiceChannel({ adapterCreator: Interaction.guild.voiceAdapterCreator, channelId: MemberVoiceChannel.id, guildId: Interaction.guildID, selfDeaf: false, selfMute: false });
            BaseServerQueueData.playerSubscription = await BaseServerQueueData.Connection.subscribe(BaseServerQueueData.Player);

            DisBot.interactionPlayer.play(Interaction, InteractionOptions, DisBot, BaseServerQueueData.Songs[0]);

        } catch (Error) {

            await BaseServerQueueData.Connection.destroy();
            await DisBot.serverQueues.delete(Interaction.guildID);
            return DisBot.utils.handleInteractionError(Interaction, InteractionOptions, DisBot, Error);

        }


    }

}

module.exports = Play;