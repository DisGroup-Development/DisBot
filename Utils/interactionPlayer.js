const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const YouTubeDownloader = require('ytdl-core');

class InteractionPlayer {

    constructor(DisBot) {

        this.DisBot = DisBot;
        
    }

    async generateQueueEmbeds(DisBot = require('../DisBot'), ServerQueue) {

        var QueueEmbeds = [];
        var SongsPerPage = 10;
    
        for(let CurrentSongQueueNumber = 0; CurrentSongQueueNumber < ServerQueue.Songs.length; CurrentSongQueueNumber += 10) {
    
            var CurrentSongs = ServerQueue.Songs.slice(CurrentSongQueueNumber, SongsPerPage);
    
            SongsPerPage += 10;
    
            var SongInfo = CurrentSongs.map((Song) => `${++CurrentSongQueueNumber}. ${Song.Title}`).join('\n')
    
            var QueueEmbed = new Discord.MessageEmbed()
                .setAuthor('Server Queue', ServerQueue.TextChannel?.guild.iconURL())
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`\`\`\`md\n${SongInfo}\`\`\`` + `\n **Playing** : ${ServerQueue.isPlaying === true ? `${DisBot.emojis.cache.get(DisBot.config.Emojis.Check)}` : `${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)}`} **Loop** : ${ServerQueue.isLoop === true ? `${DisBot.emojis.cache.get(DisBot.config.Emojis.Check)}` : `${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)}`}`)
    
            QueueEmbeds.push(QueueEmbed);
    
        }
    
        return QueueEmbeds;

    }

    async generateProgressBar(ServerQueue) {

        const Line = '▬';
        const Slider = '🔘';
    
        const DispatcherTime = (ServerQueue.AudioResource.playbackDuration / 1000 ) / ServerQueue.Songs[0].Duration;
        const BarProgess = Math.round(40 * DispatcherTime);
        const EmptyBarProgress = Math.round(40 - BarProgess);
        const BarProgessText = Line.repeat(BarProgess).replace(/.$/, Slider);
        const EmptyBarProgressText = Line.repeat(EmptyBarProgress);
        const ProgressBar = BarProgessText + EmptyBarProgressText;
    
        return ProgressBar;

    }

    async getQueue(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot')) {

        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID);

        var CurrentEmbedPage = 0;
        var QueueEmbeds = await this.generateQueueEmbeds(DisBot, ServerQueue);

        var QueueButtons = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomID('backButton')
                    .setEmoji(DisBot.emojis.cache.get(DisBot.config.Emojis.Replay))
                    .setStyle('SECONDARY'),
                new Discord.MessageButton()
                    .setCustomID('stopButton')
                    .setEmoji(DisBot.emojis.cache.get(DisBot.config.Emojis.Stop))
                    .setStyle('SECONDARY'),
                new Discord.MessageButton()
                    .setCustomID('forwardButton')
                    .setEmoji(DisBot.emojis.cache.get(DisBot.config.Emojis.Skip))
                    .setStyle('SECONDARY')
            )

        Interaction.editReply({ components: [ QueueButtons ], embeds: [ QueueEmbeds[CurrentEmbedPage] ], ephemeral: false });

        const InteractionMessage = await Interaction.fetchReply();
        const MessageComponentInteractionCollectorFilter = CustomInteraction => CustomInteraction.customID === 'backButton' || CustomInteraction.customID === 'stopButton' || CustomInteraction.customID === 'forwardButton';
        const MessageComponentInteractionCollector = InteractionMessage.createMessageComponentInteractionCollector(MessageComponentInteractionCollectorFilter, { time: 10000 });

        MessageComponentInteractionCollector.on('collect', async CollectorInteraction => {

            CollectorInteraction.defer();
            await CollectorInteraction.deleteReply();

            if(CollectorInteraction.customID === 'backButton') {

                if(CurrentEmbedPage !== 0) {
        
                    --CurrentEmbedPage;

                    Interaction.editReply({ components: [ QueueButtons ], embeds: [ QueueEmbeds[CurrentEmbedPage + 1 ] ], ephemeral: false });

                } else {

                    Interaction.editReply({ components: [ QueueButtons ], embeds: [ QueueEmbeds[CurrentEmbedPage] ], ephemeral: false });

                }

            } else {

                if(CollectorInteraction.customID === 'stopButton') {

                    Interaction.editReply({ components: [], embeds: [ QueueEmbeds[CurrentEmbedPage] ] });
                    MessageComponentInteractionCollector.stop();

                } else {

                    if(CollectorInteraction.customID === 'forwardButton') {

                        if(CurrentEmbedPage < QueueEmbeds.length - 1) {

                            CurrentEmbedPage++;
        
                            Interaction.editReply({ components: [ QueueButtons ], embeds: [ QueueEmbeds[CurrentEmbedPage + 1 ] ], ephemeral: false });
        
                        } else {

                            Interaction.editReply({ components: [ QueueButtons ], embeds: [ QueueEmbeds[CurrentEmbedPage] ], ephemeral: false });

                        }
        
                    }

                }

            }

        });

        MessageComponentInteractionCollector.on('end', async CollectedInteractions => {

            return Interaction.editReply({ components: [], embeds: [ QueueEmbeds[CurrentEmbedPage] ] });

        });


    }

    async play(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot'), CurrentSong) {

        const InteractionGuildID = Interaction.guildID;
        const ServerQueue = await DisBot.serverQueues.get(InteractionGuildID);

        if(!ServerQueue) return;

        if(!CurrentSong) {

            setTimeout(async function() {

                if(ServerQueue.isPlaying && Interaction.guild.me.voice.channel) return;
    
                var LeftVoiceChannelEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Disconnect)} I left the voice channel, because the queue was too long empty.`)
    
                const VoiceConnection = DiscordVoice.getVoiceConnection(InteractionGuildID);

                if(VoiceConnection) VoiceConnection.destroy();

                if(!ServerQueue.TextChannel?.deleted) ServerQueue.TextChannel.send({ embeds: [ LeftVoiceChannelEmbed ] })

                return DisBot.serverQueues.delete(InteractionGuildID);
    
            }, 60000);
    
            var QueueEmptyEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Info)} The queue is now empty.`)
    
            if(!ServerQueue.TextChannel?.deleted) return ServerQueue.TextChannel.send({ embeds: [ QueueEmptyEmbed ] });

        }

        var AudioResource = DiscordVoice.createAudioResource(YouTubeDownloader(ServerQueue.Songs[0].URL, { filter: 'audioonly', format: 'mp3',highWaterMark: 1 << 25, quality: 'highestaudio' }), { inlineVolume: true });

        ServerQueue.AudioResource = AudioResource;
        ServerQueue.Connection.on(DiscordVoice.VoiceConnectionStatus.Disconnected, () => { DisBot.serverQueues.delete(InteractionGuildID) });

        var NowPlayingEmbed = new Discord.MessageEmbed()
            .setAuthor(ServerQueue.Songs[0].Requester.username, ServerQueue.Songs[0].Requester.avatarURL())
            .setTitle(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Notes)} ** ${ServerQueue.Songs[0].Title} **`)
            .setColor(DisBot.config.Colors.DisBot)
            .setImage(ServerQueue.Songs[0].Thumbnail)
            .setURL(ServerQueue.Songs[0].URL)

        ServerQueue.playerSubscription.player.play(AudioResource);
        
        AudioResource.volume.setVolumeLogarithmic(ServerQueue.Volume / 100);

        ServerQueue.isPlaying = true;
        if(!ServerQueue.TextChannel?.deleted) ServerQueue.TextChannel.send({ embeds: [ NowPlayingEmbed ] });

        ServerQueue.playerSubscription.player.on(DiscordVoice.AudioPlayerStatus.Idle, () => {

            if(ServerQueue.isLoop) {

                var LastPlayedSong = ServerQueue.Songs.shift();

                ServerQueue.Songs.push(LastPlayedSong);

                this.play(Interaction, InteractionOptions, DisBot, ServerQueue.Songs[0]);

            } else {

                ServerQueue.isPlaying = false;
                ServerQueue.Volume = 100;
                
                ServerQueue.Songs.shift();

                this.play(Interaction, InteractionOptions, DisBot, ServerQueue.Songs[0]);

            }

        });

        ServerQueue.Player.on('error', (Error) => {

            ServerQueue.Connection.destroy();
            DisBot.serverQueues.delete(Interaction.guildID);
            return DisBot.utils.handleInteractionError(Interaction, InteractionOptions, DisBot, Error);

        });

    }

    async pause(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID)

        var NoServerQueueEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} There is no song in the queue you can pause.`)

        if(!ServerQueue) return Interaction.editReply({ embeds: [ NoServerQueueEmbed ], ephemeral: true });

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be connected to a voice channel to use this command.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already i another voice channel. Join me to use this command.`)

        if(ServerQueue && Interaction.guild.me.voice.channel.id !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        var AlreadyPausedEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} The queue is already paused.`)

        if(!ServerQueue.isPlaying) return Interaction.editReply({ embeds: [ AlreadyPausedEmbed ], ephemeral: true });

        const MemberVoiceChannelConnectedMemberCount = await MemberVoiceChannel.members.filter(Member => !Member.user.bot).size;

        if(MemberVoiceChannelConnectedMemberCount > 1) {

            if(Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) {

                var PausedEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Music paused.`)

                await ServerQueue.playerSubscription.player.pause();
                ServerQueue.isPlaying = false;
                return Interaction.editReply({ embeds: [ PausedEmbed ], ephemeral: false });

            } else {

                const MemberVoiceChannelMustVotesCount = Math.floor(MemberVoiceChannelConnectedMemberCount/2+1);

                var InteractToPauseEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Click the button to pause the music. (\`\`0 / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                    
                var PauseButton = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomID('pauseMusicButton')
                            .setEmoji(DisBot.emojis.cache.get(DisBot.config.Emojis.Pause))
                            .setLabel('Pause')
                            .setStyle('PRIMARY')
                    )

                Interaction.editReply({ components: [ PauseButton ], embeds: [ InteractToPauseEmbed ], ephemeral: false });

                const InteractionMessage = await Interaction.fetchReply();
                const MessageComponentInteractionCollectorFilter = CustomInteraction => CustomInteraction.customID === 'pauseMusicButton';
                const MessageComponentInteractionCollector = InteractionMessage.createMessageComponentInteractionCollector(MessageComponentInteractionCollectorFilter, { time: 30000 });

                var UserClickedButton = new Map();

                MessageComponentInteractionCollector.on('collect', async CollectorInteraction => {

                    if(UserClickedButton.has(CollectorInteraction.user.id)) return;

                    UserClickedButton.set(CollectorInteraction.user.id, 'clickedButton');

                    var MemberVoiceChannelHaveVotedCount = MemberVoiceChannelMustVotesCount - MemberVoiceChannelMustVotesCount + 1;

                    if(MemberVoiceChannelHaveVotedCount >= MemberVoiceChannelMustVotesCount) {

                        InteractToPauseEmbed.setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Click the button to pause the music. (\`\`${MemberVoiceChannelHaveVotedCount} / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                        Interaction.editReply({ components: [], embeds: [ InteractToPauseEmbed ], ephemeral: false });

                        var PausedEmbed = new Discord.MessageEmbed()
                            .setColor(DisBot.config.Colors.DisBot)
                            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Music paused.`)

                        await ServerQueue.playerSubscription.player.pause();
                        ServerQueue.isPlaying = false;
                        await Interaction.followUp({ embeds: [ PausedEmbed ], ephemeral: false });
                        return MessageComponentInteractionCollector.stop();

                    } else {

                        InteractToPauseEmbed.setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Click the button to pause the music. (\`\`${MemberVoiceChannelHaveVotedCount} / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                        Interaction.editReply({ embeds: [ InteractToPauseEmbed ], ephemeral: false });

                    }

                });

            }

        } else {

            var PausedEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Music paused.`)

            await ServerQueue.playerSubscription.player.pause();;
            ServerQueue.isPlaying = false;
            return Interaction.editReply({ embeds: [ PausedEmbed ], ephemeral: false });

        }

    }

    async resume(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID)

        var NoServerQueueEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} There is no song in the queue you can resume.`)

        if(!ServerQueue) return Interaction.editReply({ embeds: [ NoServerQueueEmbed ], ephemeral: true });

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be connected to a voice channel to use this command.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already i another voice channel. Join me to use this command.`)

        if(ServerQueue && Interaction.guild.me.voice.channel.id !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        var AlreadyResumedEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} The queue is already resumed.`)

        if(ServerQueue.isPlaying === true) return Interaction.editReply({ embeds: [ AlreadyResumedEmbed ], ephemeral: true });

        const MemberVoiceChannelConnectedMemberCount = await MemberVoiceChannel.members.filter(Member => !Member.user.bot).size;

        if(MemberVoiceChannelConnectedMemberCount > 1) {

            if(Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) {

                var ResumedEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Resume)} Music resumed.`)

                await ServerQueue.playerSubscription.player.unpause();
                ServerQueue.isPlaying = true;
                return Interaction.editReply({ embeds: [ ResumedEmbed ], ephemeral: false });

            } else {

                const MemberVoiceChannelMustVotesCount = Math.floor(MemberVoiceChannelConnectedMemberCount/2+1);

                var InteractToResumeEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Pause)} Click the button to resume the music. (\`\`0 / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                    
                var ResumeButton = new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomID('resumeMusicButton')
                            .setEmoji(DisBot.emojis.cache.get(DisBot.config.Emojis.Resume))
                            .setLabel('Resume')
                            .setStyle('PRIMARY')
                    )

                Interaction.editReply({ components: [ ResumeButton ], embeds: [ InteractToResumeEmbed ], ephemeral: false });

                const InteractionMessage = await Interaction.fetchReply();
                const MessageComponentInteractionCollectorFilter = CustomInteraction => CustomInteraction.customID === 'resumeMusicButton';
                const MessageComponentInteractionCollector = InteractionMessage.createMessageComponentInteractionCollector(MessageComponentInteractionCollectorFilter, { time: 30000 });

                var UserClickedButton = new Map();

                MessageComponentInteractionCollector.on('collect', async CollectorInteraction => {

                    if(UserClickedButton.has(CollectorInteraction.user.id)) return;

                    UserClickedButton.set(CollectorInteraction.user.id, 'clickedButton');

                    var MemberVoiceChannelHaveVotedCount = MemberVoiceChannelMustVotesCount - MemberVoiceChannelMustVotesCount + 1;

                    if(MemberVoiceChannelHaveVotedCount >= MemberVoiceChannelMustVotesCount) {

                        InteractToResumeEmbed.setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Resume)} Click the button to resume the music. (\`\`${MemberVoiceChannelHaveVotedCount} / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                        Interaction.editReply({ components: [], embeds: [ InteractToResumeEmbed ], ephemeral: false });

                        var ResumedEmbed = new Discord.MessageEmbed()
                            .setColor(DisBot.config.Colors.DisBot)
                            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Resume)} Music resumed.`)

                        await ServerQueue.playerSubscription.player.unpause();
                        ServerQueue.isPlaying = true;
                        await Interaction.followUp({ embeds: [ ResumedEmbed ], ephemeral: false });
                        return MessageComponentInteractionCollector.stop();

                    } else {

                        InteractToResumeEmbed.setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Resume)} Click the button to resume the music. (\`\`${MemberVoiceChannelHaveVotedCount} / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                        Interaction.editReply({ embeds: [ InteractToResumeEmbed ], ephemeral: false });

                    }

                });

            }

        } else {

            var ResumedEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Resume)} Music resumed.`)

            await ServerQueue.playerSubscription.player.unpause();
            ServerQueue.isPlaying = true;
            return Interaction.editReply({ embeds: [ ResumedEmbed ], ephemeral: false });

        }

    }

    async setVolume(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID)

        var NoServerQueueEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} There is no song in the queue where you can select the volume.`)

        if(!ServerQueue) return Interaction.editReply({ embeds: [ NoServerQueueEmbed ], ephemeral: true });

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be connected to a voice channel to use this command.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already i another voice channel. Join me to use this command.`)

        if(ServerQueue && Interaction.guild.me.voice.channel.id !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        var CurrentVolumeEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.DisBot)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.VoiceChannel)} The current server volume is \`${ServerQueue.Volume}\`.`)

        if(!InteractionOptions.has('volume')) return Interaction.editReply({ embeds: [ CurrentVolumeEmbed ], ephemeral: true });

        var WrongVolumeNumberEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} The volume only can be between 1 and 200.`)

        if(InteractionOptions.get('volume').value > 200 || InteractionOptions.get('volume').value < 1) return Interaction.editReply({ embeds: [ WrongVolumeNumberEmbed ], ephemeral: true });

        if(Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || Interaction.member.permissions.has(Discord.Permissions.FLAGS.MOVE_MEMBERS)) {

            var ChangedVolumeEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.VoiceChannel)} Volume changed to \`${InteractionOptions.get('volume').value}\`.`)

            ServerQueue.Volume = InteractionOptions.get('volume').value;
            await ServerQueue.AudioResource.volume.setVolumeLogarithmic(InteractionOptions.get('volume').value / 100);
            return Interaction.editReply({ embeds: [ ChangedVolumeEmbed ], ephemeral: false });

        } else {

            if(Interaction.user.id === ServerQueue.Songs[0].Requester.id) {
                    
                var ChangedVolumeEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.VoiceChannel)} Volume changed to \`${InteractionOptions.get('volume').value}\`.`)

                ServerQueue.Volume = InteractionOptions.get('volume').value;
                await ServerQueue.AudioResource.volume.setVolumeLogarithmic(InteractionOptions.get('volume').value / 100);
                return Interaction.editReply({ embeds: [ ChangedVolumeEmbed ], ephemeral: false });

            } else {

                var CannotModifyVolumeEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.Red)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You can only change the server volume of you are the song requester or a moderator.`)

                return Interaction.editReply({ embeds: [ CannotModifyVolumeEmbed ], ephemeral: true });

            }

        }

    }

    async skip(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID)

        var NoServerQueueEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} There is no song in the queue you can skip.`)

        if(!ServerQueue) return Interaction.editReply({ embeds: [ NoServerQueueEmbed ], ephemeral: true });

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be connected to a voice channel to use this command.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already i another voice channel. Join me to use this command.`)

        if(ServerQueue && Interaction.guild.me.voice.channel.id !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        const MemberVoiceChannelConnectedMemberCount = await MemberVoiceChannel.members.filter(Member => !Member.user.bot).size;

        if(MemberVoiceChannelConnectedMemberCount > 1) {

            if(Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) {

                var SkippedEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Song skipped.`)

                await ServerQueue.playerSubscription.player.stop();
                ServerQueue.isPlaying = false;
                return Interaction.editReply({ embeds: [ SkippedEmbed ], ephemeral: false });

            } else {

                if(Interaction.user.id === ServerQueue.Songs[0].Requester.id) {
                    
                    var SkippedEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Song skipped.`)

                    await ServerQueue.playerSubscription.player.stop();
                    ServerQueue.isPlaying = false;
                    return Interaction.editReply({ embeds: [ SkippedEmbed ], ephemeral: false });

                } else {

                    const MemberVoiceChannelMustVotesCount = Math.floor(MemberVoiceChannelConnectedMemberCount/2+1);

                    var InteractToSkipEmbed = new Discord.MessageEmbed()
                        .setColor(DisBot.config.Colors.DisBot)
                        .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Click the button to skip the song. (\`\`0 / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                        
                    var SkipButton = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomID('skipMusicButton')
                                .setEmoji(DisBot.emojis.cache.get(DisBot.config.Emojis.Skip))
                                .setLabel('Skip')
                                .setStyle('PRIMARY')
                        )
        
                    Interaction.editReply({ components: [ SkipButton ], embeds: [ InteractToSkipEmbed ], ephemeral: false });
        
                    const InteractionMessage = await Interaction.fetchReply();
                    const MessageComponentInteractionCollectorFilter = CustomInteraction => CustomInteraction.customID === 'skipMusicButton';
                    const MessageComponentInteractionCollector = InteractionMessage.createMessageComponentInteractionCollector(MessageComponentInteractionCollectorFilter, { time: 30000 });
        
                    var UserClickedButton = new Map();
        
                    MessageComponentInteractionCollector.on('collect', async CollectorInteraction => {
        
                        if(UserClickedButton.has(CollectorInteraction.user.id)) return;
        
                        UserClickedButton.set(CollectorInteraction.user.id, 'clickedButton');
        
                        var MemberVoiceChannelHaveVotedCount = MemberVoiceChannelMustVotesCount - MemberVoiceChannelMustVotesCount + 1;
        
                        if(MemberVoiceChannelHaveVotedCount >= MemberVoiceChannelMustVotesCount) {
        
                            InteractToSkipEmbed.setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Click the button to skip the song. (\`\`${MemberVoiceChannelHaveVotedCount} / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                            Interaction.editReply({ components: [], embeds: [ InteractToSkipEmbed ], ephemeral: false });
        
                            var SkippedEmbed = new Discord.MessageEmbed()
                                .setColor(DisBot.config.Colors.DisBot)
                                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Music skipped.`)
        
                            await ServerQueue.playerSubscription.player.stop();
                            ServerQueue.isPlaying = false;
                            await Interaction.followUp({ embeds: [ SkippedEmbed ], ephemeral: false });
                            return MessageComponentInteractionCollector.stop();
        
                        } else {
        
                            InteractToSkipEmbed.setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Click the button to skip the song. (\`\`${MemberVoiceChannelHaveVotedCount} / ${MemberVoiceChannelMustVotesCount}\`\`)`)
                            Interaction.editReply({ embeds: [ InteractToSkipEmbed ], ephemeral: false });
        
                        }
        
                    });

                }

            }

        } else {

            var SkippedEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Skip)} Song skipped.`)

            await ServerQueue.playerSubscription.player.stop();
            ServerQueue.isPlaying = false;
            return Interaction.editReply({ embeds: [ SkippedEmbed ], ephemeral: false });

        }

    }

    async stop(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot')) {

        const MemberVoiceChannel = Interaction.member.voice.channel;
        const ServerQueue = await DisBot.serverQueues.get(Interaction.guildID)

        var NoServerQueueEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} There is no song in the queue which you can stop.`)

        if(!ServerQueue) return Interaction.editReply({ embeds: [ NoServerQueueEmbed ], ephemeral: true });

        var NoMemberVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You must be connected to a voice channel to use this command.`)

        if(!MemberVoiceChannel) return Interaction.editReply({ embeds: [ NoMemberVoiceChannelEmbed ], ephemeral: true });

        var AlreadyInVoiceChannelEmbed = new Discord.MessageEmbed()
            .setColor(DisBot.config.Colors.Red)
            .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} I'm already i another voice channel. Join me to use this command.`)

        if(ServerQueue && Interaction.guild.me.voice.channel.id !== MemberVoiceChannel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        if(Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || Interaction.member.permissions.has(Discord.Permissions.FLAGS.MOVE_MEMBERS)) {

            var StoppedMusicEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Stop)} Stopped the music.`)

            await Interaction.editReply({ embeds: [ StoppedMusicEmbed ], ephemeral: false });

            const VoiceConnection = DiscordVoice.getVoiceConnection(Interaction.guildID);

            ServerQueue.playerSubscription.player.stop();
            VoiceConnection.destroy();

            if(ServerQueue) DisBot.serverQueues.delete(Interaction.guildID);

            var LeftVoiceChannelEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Disconnect)} Left voice channel.`)

            return Interaction.followUp({ embeds: [ LeftVoiceChannelEmbed ], ephemeral: false });
            
            
        } else {

            var CannotModifyVolumeEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.Red)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Cross)} You can only stop the song if you are a moderator.`)

            return Interaction.editReply({ embeds: [ CannotModifyVolumeEmbed ], ephemeral: true });

        }

    }

}

module.exports = InteractionPlayer;