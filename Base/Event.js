class BaseEvent {

    constructor(DisBot, {
        Name = null,
        Enabled = true,
        Type = 'on'
    })

    {

        this.DisBot = DisBot;
        this.Config = { Enabled, Type };
        this.Help = { Name };

    }

}

module.exports = BaseEvent;