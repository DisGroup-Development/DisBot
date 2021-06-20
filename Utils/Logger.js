const Chalk = require('chalk');

const ConsolePrefix = `[ DisBot | ${formatDate(new Date(Date.now()))} ] :`;

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
        return console.log(`${ConsolePrefix} ${Chalk.bgGreen(Chalk.black('DEBUG'))} | ${Input}`);
    }

    error(Input) {
        return console.log(`${ConsolePrefix} ${Chalk.bgRed(Chalk.white('ERROR'))} | ${Input}`); 
    }

    log(Input) {
        return console.log(`${ConsolePrefix} ${Chalk.bgBlue(Chalk.black('LOG'))} | ${Input}`);
    }

    warn(Input) { 
        return console.log(`${ConsolePrefix} ${Chalk.bgYellow(Chalk.black('WARN'))} | ${Input}`);
    }

}

module.exports = Logger;