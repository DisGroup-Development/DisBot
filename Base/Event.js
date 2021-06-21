class BaseEvent {

    constructor(DisBot, {
        Name = null,
        Enabled = true,
        Once = false,
    })

    {

        this.DisBot = DisBot;
        this.Config = { Enabled, Once };
        this.Help = { Name };

    }

}

module.exports = BaseEvent;