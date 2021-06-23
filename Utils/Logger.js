const Chalk = require('chalk');
const Discord = require('discord.js');

const ConsolePrefix = `[ DisBot Alpha | ${formatDate(new Date(Date.now()))} ] :`;
const Wait = require('util').promisify(setTimeout);

function formatDate(CurrentDate) {

    return (formatTime(2, CurrentDate.getHours()) + ':' + formatTime(2, CurrentDate.getMinutes()) + ':' + formatTime(2, CurrentDate.getSeconds()));

}

function formatTime(Digits, CurrentTime) {

    let TimeNumber = CurrentTime;

    while(TimeNumber.toString().length < Digits) {
        TimeNumber = '0' + TimeNumber;
    }

    return TimeNumber;

}

class Logger {

    constructor(DisBot) {

        this.DisBot = DisBot;

    }

    debug(Input) {

        Wait(1000)

        const WebhookChannel = new Discord.WebhookClient(this.DisBot.config.Guild.Log.ID, this.DisBot.config.Guild.Log.Token);

        WebhookChannel.send(`\`\`\`JS\n${ConsolePrefix} DEBUG | ${Input}\`\`\``)
        return console.log(`${ConsolePrefix} ${Chalk.bgGreen(Chalk.black('DEBUG'))} | ${Input}`);

    }

    error(Input, Code = '00000000-0000-0000-0000-000000000000') {

        Wait(1000)

        const WebhookChannel = new Discord.WebhookClient(this.DisBot.config.Guild.Log.ID, this.DisBot.config.Guild.Log.Token);

        WebhookChannel.send(`\`\`\`JS\n${ConsolePrefix} ERROR | ${Input}\`\`\`\n\`\`\`Error Code : ${Code}\`\`\``)
        return console.log(`${ConsolePrefix} ${Chalk.bgRed(Chalk.white('ERROR'))} | ${Input}\n${ConsolePrefix} ${Chalk.bgRed(Chalk.white('ERROR'))} | Error Code: ${Code}`); 

    }

    log(Input) {

        Wait(1000)

        const WebhookChannel = new Discord.WebhookClient(this.DisBot.config.Guild.Log.ID, this.DisBot.config.Guild.Log.Token);

        WebhookChannel.send(`\`\`\`JS\n${ConsolePrefix} LOG | ${Input}\`\`\``)
        return console.log(`${ConsolePrefix} ${Chalk.bgBlue(Chalk.black('LOG'))} | ${Input}`);

    }

    warn(Input) { 

        Wait(1000)

        const WebhookChannel = new Discord.WebhookClient(this.DisBot.config.Guild.Log.ID, this.DisBot.config.Guild.Log.Token);

        WebhookChannel.send(`\`\`\`JS\n${ConsolePrefix} WARN | ${Input}\`\`\``)
        return console.log(`${ConsolePrefix} ${Chalk.bgYellow(Chalk.black('WARN'))} | ${Input}`);

    }

}

module.exports = Logger;