const BaseInteraction = require('../../Base/Interaction');
const Discord = require('discord.js');

class Queue extends BaseInteraction {

    constructor(DisBot) {

        super(DisBot, {

            Name: 'queue',
            Description: 'Get\'s the songs in the queue.',
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

        if(ServerQueue && MemberVoiceChannel.id !== Interaction.guild.me.voice.channel.id) return Interaction.editReply({ embeds: [ AlreadyInVoiceChannelEmbed ], ephemeral: true });

        DisBot.interactionPlayer.getQueue(Interaction, InteractionOptions, DisBot);

    }

}

module.exports = Queue;