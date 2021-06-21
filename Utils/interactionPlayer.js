const Discord = require('discord.js');
const DiscordVoice = require('@discordjs/voice');
const YouTubeDownloader = require('ytdl-core');

class InteractionPlayer {

    constructor(DisBot) {

        this.DisBot = DisBot;
        
    }

    async play(Interaction = new Discord.CommandInteraction(), InteractionOptions = new Discord.CommandInteraction().options, DisBot = require('../DisBot'), CurrentSong) {

        const InteractionGuildID = Interaction.guildID;
        const ServerQueue = await DisBot.serverQueues.get(InteractionGuildID);

        if(!ServerQueue.Songs[0]) {

            setTimeout(function() {
                
                if(ServerQueue.playerSubscription.player && Interaction.guild.me.voice.channel) return;
    
                var LeftVoiceChannelEmbed = new Discord.MessageEmbed()
                    .setColor(DisBot.config.Colors.DisBot)
                    .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Disconnect)} I left the voice channel, because the queue was empty.`)
    
                const VoiceConnection = DiscordVoice.getVoiceConnection(InteractionGuildID);

                VoiceConnection.destroy();

                ServerQueue.TextChannel.send({ embeds: [ LeftVoiceChannelEmbed ] });
    
            }, 60000);
    
            var QueueEmptyEmbed = new Discord.MessageEmbed()
                .setColor(DisBot.config.Colors.DisBot)
                .setDescription(`${DisBot.emojis.cache.get(DisBot.config.Emojis.Info)} The queue is now empty.`)
    
            ServerQueue.TextChannel.send({ embeds: [ QueueEmptyEmbed ] });
            return DisBot.serverQueues.delete(InteractionGuildID);

        }

        var AudioResource = DiscordVoice.createAudioResource(YouTubeDownloader(ServerQueue.Songs[0].URL, { filter: 'audioonly', highWaterMark: 1 << 25 }), { inlineVolume: true });

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
        ServerQueue.TextChannel.send({ embeds: [ NowPlayingEmbed ] });

        ServerQueue.playerSubscription.player.on(DiscordVoice.AudioPlayerStatus.Idle, () => {

            if(ServerQueue.isLoop) {

                var LastPlayedSong = ServerQueue.Songs.shift();

                ServerQueue.Songs.push(LastPlayedSong);

                this.play(Interaction, InteractionOptions, DisBot, ServerQueue.Songs[0]);

            } else {

                ServerQueue.Volume = 100;
                
                ServerQueue.Songs.shift();

                this.play(Interaction, InteractionOptions, DisBot, ServerQueue.Songs[0]);

            }

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

        if(Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_CHANNELS) || Interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) {

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

}

module.exports = InteractionPlayer;