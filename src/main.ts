/*
 * Created with @iobroker/create-adapter v3.1.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";

/** Intervall der Countdown-Updates in Millisekunden */
const UPDATECOUNTDOWNSINTERVAL: number = 30000; // 30 seconds
/** Intervall des Lichtwecker-Updates in Millisekunden */
const UPDATESUNRISEINTERVAL: number = 30000; // 30 seconds
/** Intervall der Weckzeitüberprüfung in Millisekunden */
const EVALUATESTATEINTERVAL: number = 10000; // 10 seconds

/** Wecker-Status */
const STATE = {
    /** Wecker ist Deaktiviert */
    DISABLED: "DISABLED",
    /** Wecker Wartet */
    ARMED: "ARMED",
    /** Wecker in Pre-Alarm */
    PREALARM: "PREALARM",
    /** Wecker hat Ausgelöst */
    TRIGGERED: "TRIGGERED",
    /** Wecker in Snooze */
    SNOOZE: "SNOOZE",
    /** Wecker ist Gestoppt */
    STOPPED: "STOPPED",
    /** Fehler */
    ERROR: "ERROR",
};

// Load your modules here, e.g.:
// import * as fs from "fs";

class Alarmclock extends utils.Adapter {
    /** Interval for updating countdowns */
    private updateCountdownsInterval: ioBroker.Interval | undefined;
    /** Interval for updating sunrise */
    private updateSunriseInterval: ioBroker.Interval | undefined;
    /** Interval for alert check */
    private evaluateStateInterval: ioBroker.Interval | undefined;
    /** Array of alarm times */
    private alarmStates: string[] = ["06:00", "06:00", "06:00", "06:00", "06:00", "08:00", "08:30", "10:30", "09:30"];
    /** Time of alert start */
    private alarmStartTime: number | null = null;

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
                states: Object.values(STATE),
                def: STATE.DISABLED,
            },
            native: {},
        });

        await this.setObjectNotExistsAsync("runtime.sunriseBrightness", {
            type: "state",
            common: {
                name: {
                    de: "Lichtwecker Helligkeit",
                    en: "Light alarm clock brightness",
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
                    de: "Lichtwecker Fortschritt",
                    en: "Light alarm clock progress",
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

        // Speicherung der Weckzeiten in das Array alarmStates
        {
            let state: ioBroker.State | null | undefined;

            state = await this.getStateAsync("schedule.monday");
            if (state && state.val !== "") {
                this.alarmStates[0] = this.checkValidTime(state.val?.toString(), this.alarmStates[0]);
            }

            state = await this.getStateAsync("schedule.tuesday");
            if (state && state.val !== "") {
                this.alarmStates[1] = this.checkValidTime(state.val?.toString(), this.alarmStates[1]);
            }

            state = await this.getStateAsync("schedule.wednesday");
            if (state && state.val !== "") {
                this.alarmStates[2] = this.checkValidTime(state.val?.toString(), this.alarmStates[2]);
            }

            state = await this.getStateAsync("schedule.thursday");
            if (state && state.val !== "") {
                this.alarmStates[3] = this.checkValidTime(state.val?.toString(), this.alarmStates[3]);
            }

            state = await this.getStateAsync("schedule.friday");
            if (state && state.val !== "") {
                this.alarmStates[4] = this.checkValidTime(state.val?.toString(), this.alarmStates[4]);
            }

            state = await this.getStateAsync("schedule.saturday");
            if (state && state.val !== "") {
                this.alarmStates[5] = this.checkValidTime(state.val?.toString(), this.alarmStates[5]);
            }

            state = await this.getStateAsync("schedule.sunday");
            if (state && state.val !== "") {
                this.alarmStates[6] = this.checkValidTime(state.val?.toString(), this.alarmStates[6]);
            }

            state = await this.getStateAsync("schedule.vacation");
            if (state && state.val !== "") {
                this.alarmStates[7] = this.checkValidTime(state.val?.toString(), this.alarmStates[7]);
            }

            state = await this.getStateAsync("schedule.holiday");
            if (state && state.val !== "") {
                this.alarmStates[8] = this.checkValidTime(state.val?.toString(), this.alarmStates[8]);
            }

            this.log.debug(`Alarm states: ${JSON.stringify(this.alarmStates)}`);
        }

        // Urlaubskalender
        if (
            this.config.vocationInstance &&
            this.config.vocationInstance !== "" &&
            this.config.vocationEvents &&
            this.config.vocationEvents.length > 0
        ) {
            this.subscribeForeignStates(`${this.config.vocationInstance}.data.table`);
        }

        // Feiertagskalender
        if (this.config.holidayInstance && this.config.holidayInstance !== "") {
            this.subscribeForeignStates(`${this.config.holidayInstance}.today.boolean`);
            this.subscribeForeignStates(`${this.config.holidayInstance}.tomorrow.boolean`);
        }

        // Weckerkalender
        if (
            this.config.appointmentInstance &&
            this.config.appointmentInstance !== "" &&
            this.config.appointmentEvents &&
            this.config.appointmentEvents.length > 0
        ) {
            this.subscribeForeignStates(`${this.config.appointmentInstance}.data.table`);
        }

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

        this.updateCountdownsInterval = this.setInterval(() => this.updateCountdowns(), UPDATECOUNTDOWNSINTERVAL);
        this.updateSunriseInterval = this.setInterval(() => this.updateSunrise(), UPDATESUNRISEINTERVAL);
        this.evaluateStateInterval = this.setInterval(() => this.evaluateState(), EVALUATESTATEINTERVAL);

        await this.checkNewAlarmTime("onReady");
        await this.updateCountdowns();
        await this.updateSunrise(true);

        this.log.info("Adapter is ready and running.");
    }

    /** Update countdowns */
    private async updateCountdowns(): Promise<void> {
        this.log.debug("Updating countdowns...");
        const now = new Date();

        const nextAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextAlarm`);
        if (nextAlarm && nextAlarm?.val != null && nextAlarm?.val !== "") {
            let rest = new Date(nextAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) rest = 0;

            this.log.debug(`Next alarm: ${nextAlarm.val}, rest: ${Math.floor(rest / 60000)} s`);
            this.setState(`${this.namespace}.runtime.countdownAlarm`, Math.floor(rest / 60000), true);
        }

        const nextPreAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextPreAlarm`);
        if (nextPreAlarm && nextPreAlarm?.val != null && nextPreAlarm?.val !== "") {
            let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) rest = 0;

            this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 60000)} s`);
            this.setState(`${this.namespace}.runtime.countdownPreAlarm`, Math.floor(rest / 60000), true);
        }

        const snoozeUntil = await this.getStateAsync(`${this.namespace}.runtime.snoozeUntil`);
        if (snoozeUntil && snoozeUntil?.val != null && snoozeUntil?.val !== "") {
            let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
            if (rest < 0) rest = 0;

            this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 60000)} s`);
            this.setState(`${this.namespace}.runtime.countdownSnooze`, Math.floor(rest / 60000), true);
        }
    }

    /**
     * Prüfung auf korrekte Uhrzeit
     *
     * @param time - Uhrzeit im Format "HH:MM"
     * @param def - Standardwert, der zurückgegeben wird, wenn die Uhrzeit ungültig ist
     */
    private checkValidTime(time: string | undefined, def: string = "06:00"): string {
        this.log.debug(`checkValidTime: ${time}`);

        if (time === undefined || time === null || time.trim() === "") {
            this.log.warn(`Uhrzeit ist leer oder undefiniert, Standardwert wird verwendet: ${def}`);
            return def;
        }

        const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
        if (isValidTime) {
            return time;
        }

        this.log.warn(`Ungültige Uhrzeit: ${time}`);
        return def;
    }

    /**
     * Setzten einer Uhrzeit der Weckzeit.
     *
     * @param date Die Weckzeit
     * @param time Uhrzeit im Format "HH:MM"
     */
    private calcDateWithTime(date: Date, time: string): void {
        const [hours, minutes] = time.split(":").map(Number);
        date.setHours(hours, minutes, 0, 0);
    }

    /**
     * Prüfen und Setzten er Zeit des Weckers.
     *
     * @param [name=""] Der Grund der Aktualisierung
     */
    private async checkNewAlarmTime(name: string = ""): Promise<void> {
        this.log.debug(`checkNewAlarmTime(${name})`);

        const enabledState = await this.getStateAsync(`${this.namespace}.config.enabled`);
        if (enabledState && enabledState.val === true) {
            const now = new Date();
            const alarm = new Date();
            alarm.setHours(0, 0, 0, 0);

            await this.checkWeekday(alarm);
            await this.checkVacationEvents(alarm, true);
            await this.checkHolidayEvents(alarm, true);
            await this.checkAppointmentEvents(alarm);

            if (alarm < now) {
                this.log.debug("Alarm is lower then now. Running calc of tomorrow");

                alarm.setDate(alarm.getDate() + 1);

                await this.checkWeekday(alarm);
                await this.checkVacationEvents(alarm, false);
                await this.checkHolidayEvents(alarm, false);
                await this.checkAppointmentEvents(alarm);
            }

            this.log.info(`Set new alarm: ${alarm.toLocaleString()}`);

            const pre = new Date(alarm);
            const preAlarmMinutes = Number(
                (await this.getStateAsync(`${this.namespace}.config.preAlarmMinutes`))?.val || 0,
            );
            pre.setMinutes(pre.getMinutes() - preAlarmMinutes);

            this.setState("runtime.nextPreAlarm", pre.toISOString(), true);
            this.setState("runtime.nextAlarm", alarm.toISOString(), true);
        } else {
            this.log.debug("Alarm is disabled, skipping new alarm time check.");
            this.setState("runtime.nextPreAlarm", "", true);
            this.setState("runtime.nextAlarm", "", true);
            this.setState("runtime.snoozeUntil", "", true);
        }
    }

    /**
     * Setzten des Weckers auf die Tageszeit.
     *
     * @param alert Die Weckzeit
     */
    private async checkWeekday(alert: Date): Promise<void> {
        this.log.debug(`checkWeekday(${alert.toLocaleString()})`);

        let key = "unknown";
        // Setzten des Weckers nach dem Wochentag
        switch (alert.getDay()) {
            case 0: // Sonntag
                key = "schedule.sunday";
                break;
            case 1: // Montag
                key = "schedule.monday";
                break;
            case 2: // Dienstag
                key = "schedule.tuesday";
                break;
            case 3: // Mittwoch
                key = "schedule.wednesday";
                break;
            case 4: // Donnerstag
                key = "schedule.thursday";
                break;
            case 5: // Freitag
                key = "schedule.friday";
                break;
            case 6: // Samstag
                key = "schedule.saturday";
                break;
        }
        this.log.debug(`The alert day is ${alert.toLocaleDateString()}, key: ${key}`);

        const alarmState = await this.getStateAsync(`${this.namespace}.${key}`);
        if (alarmState && alarmState.val != null && alarmState.val !== "") {
            this.calcDateWithTime(alert, alarmState.val.toString());
        } else {
            this.log.warn(`No alarm time found for ${key}, using default time.`);
            this.calcDateWithTime(alert, "06:00");
        }
    }

    /**
     * Überprüfung den Urlaubskalender
     *
     * @param alert Die Weckzeit
     * @param [today=true] Prüfung des aktuellen Tags
     */
    private async checkVacationEvents(alert: Date, today: boolean = true): Promise<void> {
        this.log.debug(`checkVacationEvents(${alert.toLocaleString()})`);

        if (
            this.config.vocationInstance &&
            this.config.vocationInstance !== "" &&
            this.config.vocationEvents &&
            this.config.vocationEvents.length > 0
        ) {
            for (const event of this.config.vocationEvents) {
                if (!event.name || !event.enabled) {
                    continue;
                }

                let key = "events.0.today";
                if (!today) {
                    key = "events.1";
                }

                const stateId = `${this.config.vocationInstance}.${key}.${event.name}`;
                this.log.debug(`vocation check: ${stateId}`);

                const vacationState = await this.getForeignStateAsync(stateId);
                this.log.debug(`vocation check result: ${JSON.stringify(vacationState)}`);

                if (vacationState?.val === true) {
                    this.log.debug(`Vacation event '${event.name}' active`);
                    const alarmState = await this.getStateAsync(`${this.namespace}.schedule.vacation`);

                    if (alarmState?.val) {
                        this.calcDateWithTime(alert, alarmState.val.toString());
                    } else {
                        this.log.warn("No alarm time found for vacation, using default time.");
                        this.calcDateWithTime(alert, "06:00");
                    }

                    break;
                }
            }
        } else {
            this.log.info(
                `vocation check disabled: ical=${this.config.vocationInstance}, events=${this.config.vocationEvents?.length ?? 0}`,
            );
        }
    }

    /**
     * Überprüfe den Feiertagskalender.
     *
     * @param alert Die Weckzeit
     * @param [today=true] Prüfung des aktuellen Tags
     */
    private async checkHolidayEvents(alert: Date, today: boolean = true): Promise<void> {
        this.log.debug(`checkHolidayEvents(${alert.toLocaleString()})`);

        if (this.config.holidayInstance && this.config.holidayInstance !== "") {
            let key = "today";
            if (!today) {
                key = "tomorrow";
            }

            const holidayState = await this.getForeignStateAsync(`${this.config.holidayInstance}.${key}.boolean`);
            this.log.debug(`holiday check result: ${JSON.stringify(holidayState)}`);

            if (holidayState?.val === true) {
                this.log.debug(`Holiday is active`);
                const alarmState = await this.getStateAsync(`${this.namespace}.schedule.holiday`);

                if (alarmState && alarmState.val != null && alarmState.val !== "") {
                    this.calcDateWithTime(alert, alarmState.val.toString());
                } else {
                    this.log.warn(`No alarm time found for holiday, using default time.`);
                    this.calcDateWithTime(alert, "06:00");
                }
            }
        } else {
            this.log.info(`holiday check disabled: ical=${this.config.holidayInstance}`);
        }
    }

    /**
     * Überprüfung den Weckerkalender
     *
     * @param alert Die Weckzeit
     */
    private async checkAppointmentEvents(alert: Date): Promise<void> {
        this.log.debug(`checkAppointmentEvents(${alert.toLocaleString()})`);

        if (
            this.config.appointmentInstance &&
            this.config.appointmentInstance !== "" &&
            this.config.appointmentEvents &&
            this.config.appointmentEvents.length > 0
        ) {
            const date = alert.toISOString().slice(0, 10);
            const events = await this.getForeignStateAsync(`${this.config.appointmentInstance}.data.table`);

            if (events && events.val !== "") {
                const calendarEvents = JSON.parse(events.val as string);

                for (const event of this.config.appointmentEvents) {
                    if (!event.name || !event.enabled) {
                        continue;
                    }

                    this.log.debug(`Appointment check: ${event.name}`);
                    const eintrag = calendarEvents.find((e: any) => e.event === event.name && e._date.startsWith(date));
                    if (eintrag !== undefined) {
                        this.log.debug(`Appointment ${event.name} active`);
                        this.calcDateWithTime(alert, new Date(eintrag._date).toTimeString().slice(0, 5));
                        break;
                    }
                }
            }
        } else {
            this.log.info(
                `appointment check disabled: ical=${this.config.appointmentInstance}, events=${this.config.appointmentEvents?.length ?? 0}`,
            );
        }
    }

    /**
     * Berechnen der Helligkeit des Lichtweckers.
     *
     * @param force Aktualisirung erzwingen
     */
    private async updateSunrise(force = false): Promise<void> {
        this.log.debug(`updateSunrise(${force})`);

        const state = await this.getStateAsync("runtime.state");
        if (state?.val !== STATE.PREALARM && !force) {
            return;
        }

        const preAlarm = await this.getStateAsync("runtime.nextPreAlarm");
        const alarm = await this.getStateAsync("runtime.nextAlarm");

        if (!preAlarm || !alarm) {
            return;
        }
        if (preAlarm.val && alarm.val) {
            const preAlarmDate = new Date(preAlarm.val.toString());
            const alarmDate = new Date(alarm.val.toString());

            const total = alarmDate.getTime() - preAlarmDate.getTime();
            const elapsed = Date.now() - preAlarmDate.getTime();
            let progress = (elapsed / total) * 100;

            progress = Math.max(0, Math.min(progress, 100));

            this.log.debug(`sunriseProgress: ${progress} %`);
            this.setState("runtime.sunriseProgress", progress, true);
            this.setState("runtime.sunriseBrightness", Math.round(progress), true);
        }
    }

    /**
     * Erhöhe den Zählerwert.
     *
     * @param key Der Name des Wertes
     */
    private incrementStat(key: string): void {
        this.log.debug(`incrementStat(${key})`);

        this.getState(`statistics.${key}`, (_err, state) => {
            const value = Number(state?.val) || 0;
            this.setState(`statistics.${key}`, value + 1, true);
        });
    }

    private handleState(state: string): void {
        switch (state) {
            case STATE.DISABLED:
                break;
            case STATE.ARMED:
                this.updateCountdowns();
                break;
            case STATE.PREALARM:
                this.startPreAlarm();
                break;
            case STATE.TRIGGERED:
                this.startAlarm();
                break;
            case STATE.SNOOZE:
                this.updateCountdowns();
                break;
            case STATE.STOPPED:
                this.stopAlarm();
                this.setAlarmState(STATE.ARMED);
                this.updateCountdowns();
                break;
            case STATE.ERROR:
                this.incrementStat("errorCount");
                break;
        }
    }

    private startPreAlarm() {
        this.log.debug("startPreAlarm()");

        this.incrementStat("preAlarmCount");
        this.updateSunrise(true);

        this.log.info("PREALARM");
    }

    private startAlarm() {
        this.log.debug(`startAlarm()`);

        if (!this.alarmStartTime) {
            this.alarmStartTime = Date.now();
        }

        this.incrementStat("alarmCount");
        this.setState("runtime.active", true, true);

        this.log.info("ALARM");
    }

    private stopAlarm() {
        this.log.debug(`stopAlarm()`);

        this.incrementStat("stopCount");

        if (this.alarmStartTime) {
            const wakeDelay = Math.round((Date.now() - this.alarmStartTime) / 60000);
            this.setState(`statistics.wakeDelay`, wakeDelay, true);
        }

        this.setState(`runtime.active`, false, true);
        this.setAlarmState(STATE.STOPPED);
    }

    private setAlarmState(newState: string) {
        this.log.debug(`setAlarmState(${newState})`);

        this.getState("runtime.state", (_err, oldState) => {
            if (oldState?.val === newState) {
                return;
            }

            this.setState("runtime.state", newState, true);

            this.log.debug(`${oldState?.val} -> ${newState}`);
            this.handleState(newState);
        });
    }

    private async evaluateState() {
        try {
            const now = Date.now();
            const state = await this.getStateAsync("runtime.state");
            const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
            const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
            const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
            const skip = await this.getStateAsync("action.skipNext");

            if (
                state?.val === STATE.SNOOZE &&
                snoozeUntil?.val &&
                now >= new Date(String(snoozeUntil.val)).getTime() &&
                !skip
            ) {
                this.setAlarmState(STATE.TRIGGERED);
                return;
            }

            if (
                state?.val === STATE.ARMED &&
                nextPreAlarm?.val &&
                now >= new Date(String(nextPreAlarm.val)).getTime() &&
                !skip
            ) {
                this.setAlarmState(STATE.PREALARM);
                return;
            }

            if (
                (state?.val === STATE.ARMED || state?.val === STATE.PREALARM) &&
                nextAlarm?.val &&
                now >= new Date(String(nextAlarm.val)).getTime() &&
                !skip
            ) {
                this.setAlarmState(STATE.TRIGGERED);
            }
        } catch (e) {
            console.error(e);
            this.setAlarmState(STATE.ERROR);
        }
    }

    private activateSnooze() {
        this.log.debug("activateSnooze()");

        this.getState("runtime.state", (_err, state) => {
            if (state?.val === STATE.TRIGGERED || state?.val === STATE.PREALARM) {
                this.getState("config.snoozeMinutes", (_err, mins) => {
                    const until = new Date(Date.now() + Number(mins?.val) * 60000);

                    this.setState("runtime.snoozeUntil", until.toISOString(), true);

                    this.incrementStat("snoozeCount");
                    this.setAlarmState(STATE.SNOOZE);
                });
            }
        });
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
            this.clearInterval(this.updateCountdownsInterval);
            this.clearInterval(this.updateSunriseInterval);
            this.clearInterval(this.evaluateStateInterval);

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
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

            if (state.ack === false) {
                // This is a command from the user (e.g., from the UI or other adapter)
                // and should be processed by the adapter
                this.log.info(`User command received for ${id}: ${state.val}`);

                // TODO: Add your control logic here
            }
            switch (id) {
                case `${this.namespace}.schedule.monday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Monday: ${state.val}`);
                        await this.setState("schedule.monday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[0]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.monday");
                    }
                    break;
                case `${this.namespace}.schedule.tuesday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Tuesday: ${state.val}`);
                        await this.setState("schedule.tuesday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[1]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.tuesday");
                    }
                    break;
                case `${this.namespace}.schedule.wednesday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Wednesday: ${state.val}`);
                        await this.setState("schedule.wednesday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[2]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.wednesday");
                    }
                    break;
                case `${this.namespace}.schedule.thursday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Thursday: ${state.val}`);
                        await this.setState("schedule.thursday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[3]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.thursday");
                    }
                    break;
                case `${this.namespace}.schedule.friday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Friday: ${state.val}`);
                        await this.setState("schedule.friday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[4]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.friday");
                    }
                    break;
                case `${this.namespace}.schedule.saturday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Saturday: ${state.val}`);
                        await this.setState("schedule.saturday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[5]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.saturday");
                    }
                    break;
                case `${this.namespace}.schedule.sunday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Sunday: ${state.val}`);
                        await this.setState("schedule.sunday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[6]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.sunday");
                    }
                    break;
                case `${this.namespace}.schedule.vacation`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Vacation: ${state.val}`);
                        await this.setState("schedule.vacation", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[7]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.vacation");
                    }
                    break;
                case `${this.namespace}.schedule.holiday`:
                    if (state.ack === false) {
                        this.log.debug(`New wake-up time for Holiday: ${state.val}`);
                        await this.setState("schedule.holiday", {
                            val: this.checkValidTime(state.val?.toString(), this.alarmStates[8]),
                            ack: true,
                        });
                    } else {
                        await this.checkNewAlarmTime("schedule.holiday");
                    }
                    break;
                case `${this.config.vocationInstance}.data.table`:
                    await this.checkNewAlarmTime("vocationInstance");
                    break;
                case `${this.config.holidayInstance}.today.boolean`:
                    await this.checkNewAlarmTime("holidayInstance.today");
                    break;
                case `${this.config.holidayInstance}.tomorrow.boolean`:
                    await this.checkNewAlarmTime("holidayInstance.tomorrow");
                    break;
                case `${this.config.appointmentInstance}.data.table`:
                    await this.checkNewAlarmTime("appointmentInstance");
                    break;
                case `${this.namespace}.action.snooze`:
                    if (state.ack === false) {
                        this.activateSnooze();
                        await this.setState("action.snooze", { val: false, ack: true });
                    }
                    break;
                case `${this.namespace}.action.stop`:
                    if (state.ack === false) {
                        this.setAlarmState(STATE.STOPPED);
                        await this.setState("action.stop", { val: false, ack: true });
                    }
                    break;
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
