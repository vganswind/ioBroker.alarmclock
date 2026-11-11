/*
 * Created with @iobroker/create-adapter v3.1.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";

// Load your modules here, e.g.:
// import * as fs from "fs";

class Alarmclock extends utils.Adapter {
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "alarmclock",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.debug("config option1: ${this.config.option1}");
        this.log.debug("config option2: ${this.config.option2}");

        /* Create the states in the namespace of your adapter */
        await this.setObjectNotExistsAsync("action", {
            type: "channel",
            common: {
                name: {
                    de: "Befehle",
                    en: "Commands",
                },
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("action.snooze", {
            type: "state",
            common: {
                name: {
                    de: "Alarm pausieren",
                    en: "Pause alarm",
                },
                type: "boolean",
                role: "button",
                read: false,
                write: true,
                def: false,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("action.stop", {
            type: "state",
            common: {
                name: {
                    de: "Alarm beenden",
                    en: "Stop alarm",
                },
                type: "boolean",
                role: "button",
                read: false,
                write: true,
                def: false,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("config", {
            type: "channel",
            common: {
                name: {
                    de: "Konfiguration",
                    en: "Configuration",
                },
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("config.enabled", {
            type: "state",
            common: {
                name: {
                    de: "Alarm aktiviert",
                    en: "Alarm enabled",
                },
                type: "boolean",
                role: "switch.enable",
                read: true,
                write: true,
                def: true,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("config.preAlarmMinutes", {
            type: "state",
            common: {
                name: {
                    de: "Vorwarnzeit in Minuten",
                    en: "Pre-alarm time in minutes",
                },
                type: "number",
                role: "value",
                read: true,
                write: true,
                def: 20,
                unit: "minutes",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("config.skipNext", {
            type: "state",
            common: {
                name: {
                    de: "Alarm überspringen",
                    en: "Ignore alarm",
                },
                type: "boolean",
                role: "switch.enable",
                read: true,
                write: true,
                def: false,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("config.snoozeMinutes", {
            type: "state",
            common: {
                name: {
                    de: "Schlummerzeit in Minuten",
                    en: "Snooze time in minutes",
                },
                type: "number",
                role: "value",
                read: true,
                write: true,
                def: 10,
                unit: "minutes",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime", {
            type: "channel",
            common: {
                name: {
                    de: "Laufzeitwerte",
                    en: "Runtime values",
                },
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.countdownAlarm", {
            type: "state",
            common: {
                name: {
                    de: "Laufzeit bis zum Alarm",
                    en: "Countdown to alarm",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
                unit: "minutes",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.active", {
            type: "state",
            common: {
                name: {
                    de: "Alarm ist aktiv",
                    en: "Alarm is active",
                },
                type: "boolean",
                role: "indicator.activity",
                read: true,
                write: false,
                def: false,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.countdownPreAlarm", {
            type: "state",
            common: {
                name: {
                    de: "Laufzeit bis zum Voralarm",
                    en: "Countdown to pre-alarm",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
                unit: "minutes",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.countdownSnooze", {
            type: "state",
            common: {
                name: {
                    de: "Countdown bis zum Ende der Schlummerfunktion",
                    en: "Countdown to end snooze",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
                unit: "minutes",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.nextAlarm", {
            type: "state",
            common: {
                name: {
                    de: "Nächster Alarm",
                    en: "Next alarm",
                },
                type: "string",
                role: "value.time",
                read: true,
                write: false,
                def: "",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.nextPreAlarm", {
            type: "state",
            common: {
                name: {
                    de: "Nächster Voralarm",
                    en: "Next pre-alarm",
                },
                type: "string",
                role: "value.time",
                read: true,
                write: false,
                def: "",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.snoozeUntil", {
            type: "state",
            common: {
                name: {
                    de: "Snooze bis",
                    en: "Snooze until",
                },
                type: "string",
                role: "value.time",
                read: true,
                write: false,
                def: "",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.state", {
            type: "state",
            common: {
                name: {
                    de: "Zustand",
                    en: "State",
                },
                type: "string",
                role: "indicator.status",
                read: true,
                write: false,
                states: ["DISABLED", "ARMED", "PREALARM", "TRIGGERED", "SNOOZE", "STOPPED", "ERROR"],
                def: "DISABLED",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.sunriseBrightness", {
            type: "state",
            common: {
                name: {
                    de: "Sonnenlicht Helligkeit",
                    en: "Sunrise Brightness",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
                unit: "%",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.sunriseProgress", {
            type: "state",
            common: {
                name: {
                    de: "Sonnenlicht Fortschritt",
                    en: "Sunrise Progress",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
                unit: "%",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule", {
            type: "channel",
            common: {
                name: {
                    de: "Weckzeiten",
                    en: "Wake-up times",
                },
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.monday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Montag",
                    en: "Wake-up time on Monday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "06:00",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.tuesday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Dienstag",
                    en: "Wake-up time on Tuesday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "06:00",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.wednesday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Mittwoch",
                    en: "Wake-up time on Wednesday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "06:00",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.thursday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Donnerstag",
                    en: "Wake-up time on Thursday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "06:00",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.friday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Freitag",
                    en: "Wake-up time on Friday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "06:00",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.saturday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Samstag",
                    en: "Wake-up time on Saturday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "08:00",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.sunday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit am Sonntag",
                    en: "Wake-up time on Sunday",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "08:30",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.vacation", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit im Urlaub",
                    en: "Wake-up time on vacation",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "10:30",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("schedule.holiday", {
            type: "state",
            common: {
                name: {
                    de: "Weckzeit an Feiertagen",
                    en: "Wake-up time on holidays",
                },
                type: "string",
                role: "text",
                read: true,
                write: true,
                def: "09:30",
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics", {
            type: "channel",
            common: {
                name: {
                    de: "Statistiken",
                    en: "Statistics",
                },
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics.alarmCount", {
            type: "state",
            common: {
                name: {
                    de: "Anzahl der Wecker",
                    en: "Number of alarms",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics.preAlarmCount", {
            type: "state",
            common: {
                name: {
                    de: "Anzahl der Voralarme",
                    en: "Number of pre-alarms",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics.snoozeCount", {
            type: "state",
            common: {
                name: {
                    de: "Anzahl der Schlummerzeit",
                    en: "Number of snoozes",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics.stopCount", {
            type: "state",
            common: {
                name: {
                    de: "Anzahl der Stopp-Vorgänge",
                    en: "Number of stop actions",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics.errorCount", {
            type: "state",
            common: {
                name: {
                    de: "Anzahl der Fehler",
                    en: "Number of errors",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("statistics.wakeDelay", {
            type: "state",
            common: {
                name: {
                    de: "Aufwachverzögerung",
                    en: "Wake delay",
                },
                type: "number",
                role: "value",
                read: true,
                write: false,
                def: 0,
                unit: "minutes",
            },
            native: {},
        });

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        // this.subscribeStates("testVariable");
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates("lights.*");
        // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
        // this.subscribeStates("*");
        this.subscribeStates("action.snooze");
        this.subscribeStates("action.stop");
        this.subscribeStates("config.enabled");
        this.subscribeStates("config.preAlarmMinutes");
        this.subscribeStates("config.skipNext");
        this.subscribeStates("config.snoozeMinutes");
        this.subscribeStates("schedule.monday");
        this.subscribeStates("schedule.tuesday");
        this.subscribeStates("schedule.wednesday");
        this.subscribeStates("schedule.thursday");
        this.subscribeStates("schedule.friday");
        this.subscribeStates("schedule.saturday");
        this.subscribeStates("schedule.sunday");
        this.subscribeStates("schedule.vacation");
        this.subscribeStates("schedule.holiday");

        /*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
        // the variable testVariable is set to true as command (ack=false)
        await this.setState("testVariable", true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        await this.setState("testVariable", { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        await this.setState("testVariable", { val: true, ack: true, expire: 30 });

        // examples for the checkPassword/checkGroup functions
        const pwdResult = await this.checkPasswordAsync("admin", "iobroker");
        this.log.info(`check user admin pw iobroker: ${JSON.stringify(pwdResult)}`);

        const groupResult = await this.checkGroupAsync("admin", "admin");
        this.log.info(`check group user admin group admin: ${JSON.stringify(groupResult)}`);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback - Callback function
     */
    private onUnload(callback: () => void): void {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            callback();
        } catch (error) {
            this.log.error(`Error during unloading: ${(error as Error).message}`);
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    //     if (obj) {
    //         // The object was changed
    //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    //     } else {
    //         // The object was deleted
    //         this.log.info(`object ${id} deleted`);
    //     }
    // }

    /**
     * Is called if a subscribed state changes
     *
     * @param id - State ID
     * @param state - State object
     */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

            if (state.ack === false) {
                // This is a command from the user (e.g., from the UI or other adapter)
                // and should be processed by the adapter
                this.log.info(`User command received for ${id}: ${state.val}`);

                // TODO: Add your control logic here
            }
        } else {
            // The object was deleted or the state value has expired
            this.log.info(`state ${id} deleted`);
        }
    }
    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  */
    //
    // private onMessage(obj: ioBroker.Message): void {
    //     if (typeof obj === "object" && obj.message) {
    //         if (obj.command === "send") {
    //             // e.g. send email or pushover or whatever
    //             this.log.info("send command");
    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    //         }
    //     }
    // }
}
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Alarmclock(options);
} else {
    // otherwise start the instance directly
    (() => new Alarmclock())();
}
