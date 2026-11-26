/*
 * Created with @iobroker/create-adapter v3.1.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import {
    ALARMNAMES,
    ALARMTIME,
    EVALUATESTATEINTERVAL,
    STATE,
    UPDATECOUNTDOWNSINTERVAL,
    UPDATESUNRISEINTERVAL,
} from "./constants";
import { createStatesObjects } from "./createstatesobjects";

/**
 * Die Klasse des Weckers.
 */
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

    /**
     * Der Klassen Konstruktor.
     *
     * @param options Optionen der Klasse
     */
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "alarmclock",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Create the states in the namespace of your adapter
        await createStatesObjects(this);

        // Abonnieren der States
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

        // Wecker-Vorlagen
        for (let i = 1; i <= 5; i++) {
            this.subscribeStates(`template.${i}_load`);
            this.subscribeStates(`template.${i}_save`);
        }

        // Überprüfe des mqtt-Topics
        if (!this.config.mqttTopic || this.config.mqttTopic === "") {
            this.config.mqttTopic = "alarmclock";
        }

        // Speicherung der Weckzeiten in das Array alarmStates
        for (let i = 0; i <= 8; i++) {
            await this.readAlarmTime(i);
        }
        this.log.debug(`Alarm states: ${JSON.stringify(this.alarmStates)}`);

        // Prüfen und Abonnieren des Urlaubskalender
        if (
            this.config.vacationInstance &&
            this.config.vacationInstance !== "" &&
            this.config.vacationEvents &&
            this.config.vacationEvents.length > 0
        ) {
            this.subscribeForeignStates(`${this.config.vacationInstance}.data.table`);
        }

        // Prüfen und Abonnieren des Feiertagskalender
        if (this.config.holidayInstance && this.config.holidayInstance !== "") {
            this.subscribeForeignStates(`${this.config.holidayInstance}.today.boolean`);
            this.subscribeForeignStates(`${this.config.holidayInstance}.tomorrow.boolean`);
        }

        // Prüfen und Abonnieren des public-holidays-Kalender
        if (this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
            this.subscribeForeignStates(`${this.config.publicHolidaysInstance}.today.isHoliday`);
            this.subscribeForeignStates(`${this.config.publicHolidaysInstance}.tomorrow.isHoliday`);
        }

        // Prüfen und Abonnieren des Weckerkalender
        if (
            this.config.appointmentInstance &&
            this.config.appointmentInstance !== "" &&
            this.config.appointmentEvents &&
            this.config.appointmentEvents.length > 0
        ) {
            this.subscribeForeignStates(`${this.config.appointmentInstance}.data.table`);
        }

        // Prüfen und Abonnieren von MQTT-Topics
        if (
            this.config.mqttInstance &&
            this.config.mqttInstance !== "" &&
            this.config.mqttTopic &&
            this.config.mqttTopic !== ""
        ) {
            const key = `${this.config.mqttInstance}.${this.config.mqttTopic}`.replaceAll("/", ".");
            this.subscribeForeignStates(`${key}.action.enabled`);
            this.subscribeForeignStates(`${key}.action.skipNext`);
            this.subscribeForeignStates(`${key}.action.snooze`);
            this.subscribeForeignStates(`${key}.action.stop`);
            this.subscribeForeignStates(`${key}.action.preAlarmMinutes`);
            this.subscribeForeignStates(`${key}.action.snoozeMinutes`);

            this.subscribeForeignStates(`${key}.action.monday`);
            this.subscribeForeignStates(`${key}.action.tuesday`);
            this.subscribeForeignStates(`${key}.action.wednesday`);
            this.subscribeForeignStates(`${key}.action.thursday`);
            this.subscribeForeignStates(`${key}.action.friday`);
            this.subscribeForeignStates(`${key}.action.saturday`);
            this.subscribeForeignStates(`${key}.action.sunday`);
            this.subscribeForeignStates(`${key}.action.holiday`);
            this.subscribeForeignStates(`${key}.action.vacation`);

            // Wecker-Vorlagen
            for (let i = 1; i <= 5; i++) {
                this.subscribeForeignStates(`${key}.action.template_${i}_load`);
                this.subscribeForeignStates(`${key}.action.template_${i}_save`);
            }
        }

        // Erstelle die Interval-Timer
        this.updateCountdownsInterval = this.setInterval(() => this.updateCountdowns(), UPDATECOUNTDOWNSINTERVAL);
        this.updateSunriseInterval = this.setInterval(() => this.updateSunrise(), UPDATESUNRISEINTERVAL);
        this.evaluateStateInterval = this.setInterval(() => this.evaluateState(), EVALUATESTATEINTERVAL);

        // Initialisiere die Daten des Adapters
        await this.checkNewAlarmTime("onReady");
        await this.updateCountdowns();
        await this.updateSunrise(true);

        // Überprüfe der Konfiguration der Länge der Historie der Aufwachverzögerung
        if (!this.config.maxWakeDelayHistory || this.config.maxWakeDelayHistory < 7) {
            this.config.maxWakeDelayHistory = 30;
        }

        this.log.info("Adapter is ready and running.");
    }

    /**
     * Update the countdowns.
     */
    private async updateCountdowns(): Promise<void> {
        this.log.debug("updateCountdowns()");
        const now = new Date();

        // Berechnen der Laufzeit bis zum Alarm
        const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
        if (nextAlarm && nextAlarm?.val != null && nextAlarm?.val !== "") {
            let rest = new Date(nextAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Next alarm: ${nextAlarm.val}, rest: ${Math.floor(rest / 60000)} min`);
            await this.setState("runtime.countdownAlarm", Math.floor(rest / 60000), true);
            this.sendToMqtt("runtime.countdownAlarm", Math.floor(rest / 60000));
            await this.setState("runtime.countdownAlarmText", this.formatMinutes2TimeString(rest / 60000), true);
            this.sendToMqtt("runtime.countdownAlarmText", this.formatMinutes2TimeString(rest / 60000));
        }

        // Berechnen der Laufzeit bis zum Voralarm
        const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
        if (nextPreAlarm && nextPreAlarm?.val != null && nextPreAlarm?.val !== "") {
            let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 60000)} min`);
            await this.setState("runtime.countdownPreAlarm", Math.floor(rest / 60000), true);
            this.sendToMqtt("runtime.countdownPreAlarm", Math.floor(rest / 60000));
            await this.setState("runtime.countdownPreAlarmText", this.formatMinutes2TimeString(rest / 60000), true);
            this.sendToMqtt("runtime.countdownPreAlarmText", this.formatMinutes2TimeString(rest / 60000));
        }

        // Berechnen der Laufzeit bis Ende der Schlummerfunktion
        const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
        if (snoozeUntil && snoozeUntil?.val != null && snoozeUntil?.val !== "") {
            let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 60000)} min`);
            await this.setState("runtime.countdownSnooze", Math.floor(rest / 60000), true);
            this.sendToMqtt("runtime.countdownSnooze", Math.floor(rest / 60000));
            await this.setState("runtime.countdownSnoozeText", this.formatMinutes2TimeString(rest / 60000), true);
            this.sendToMqtt("runtime.countdownSnoozeText", this.formatMinutes2TimeString(rest / 60000));
        }
    }

    /**
     * Prüfung auf korrekte Uhrzeit
     *
     * @param time Uhrzeit im Format "HH:MM"
     * @param def Standardwert, der zurückgegeben wird, wenn die Uhrzeit ungültig ist
     * @returns Die überprüfte Uhrzeit im Format "HH:MM"
     */
    private checkValidTime(time: string | undefined, def: string = "06:00"): string {
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
     * Prüfen und Setzten der Zeit des Weckers.
     *
     * @param name Der Grund der Aktualisierung
     */
    private async checkNewAlarmTime(name: string = ""): Promise<void> {
        this.log.debug(`checkNewAlarmTime(${name})`);

        const enabledState = await this.getStateAsync("config.enabled");
        if (enabledState && enabledState.val === true) {
            const now = new Date();
            const alarm = new Date();
            alarm.setHours(0, 0, 0, 0);

            this.checkWeekday(alarm);
            await this.checkVacationEvents(alarm, true);
            await this.checkHolidayEvents(alarm, true);
            await this.checkPublicHolidayEvents(alarm, true);
            await this.checkAppointmentEvents(alarm);

            // Alarm ist kleiner als Jetzt
            if (alarm < now) {
                this.log.debug("Alarm is lower then now. Running calc of tomorrow");

                alarm.setDate(alarm.getDate() + 1);

                this.checkWeekday(alarm);
                await this.checkVacationEvents(alarm, false);
                await this.checkHolidayEvents(alarm, false);
                await this.checkPublicHolidayEvents(alarm, false);
                await this.checkAppointmentEvents(alarm);
            }

            this.log.info(`Set new alarm: ${alarm.toLocaleString()}`);

            // Berechnung des Voralarms
            const pre = new Date(alarm);
            const preAlarmMinutes = Number((await this.getStateAsync("config.preAlarmMinutes"))?.val || 0);
            pre.setMinutes(pre.getMinutes() - preAlarmMinutes);

            await this.setState("runtime.nextPreAlarm", pre.toISOString(), true);
            this.sendToMqtt("runtime.nextPreAlarm", pre.toLocaleString());
            await this.setState("runtime.nextAlarm", alarm.toISOString(), true);
            this.sendToMqtt("runtime.nextAlarm", alarm.toLocaleString());
        } else {
            this.log.debug("Alarm is disabled, skipping new alarm time check.");
            await this.setState("runtime.nextPreAlarm", "", true);
            this.sendToMqtt("runtime.nextPreAlarm", "");
            await this.setState("runtime.nextAlarm", "", true);
            this.sendToMqtt("runtime.nextAlarm", "");
            await this.setState("runtime.snoozeUntil", "", true);
            this.sendToMqtt("runtime.snoozeUntil", "");
        }
    }

    /**
     * Setzten des Weckers nach dem Wochentag.
     *
     * @param alert Die Weckzeit
     */
    private checkWeekday(alert: Date): void {
        this.log.debug(`checkWeekday(${alert.toLocaleString()})`);

        const id = (alert.getDay() + 6) % 7;
        this.calcDateWithTime(alert, this.alarmStates[id]);
        this.log.debug(`The alert date is ${alert.toLocaleDateString()}, time: ${this.alarmStates[id]}`);
    }

    /**
     * Überprüfung den Urlaubskalender.
     *
     * @param alert Die Weckzeit
     * @param today Prüfung des aktuellen Tags
     */
    private async checkVacationEvents(alert: Date, today: boolean = true): Promise<void> {
        this.log.debug(`checkVacationEvents(${alert.toLocaleString()})`);

        if (
            this.config.vacationInstance &&
            this.config.vacationInstance !== "" &&
            this.config.vacationEvents &&
            this.config.vacationEvents.length > 0
        ) {
            for (const event of this.config.vacationEvents) {
                if (!event.name || !event.enabled) {
                    continue;
                }

                let key = "events.0.today";
                if (!today) {
                    key = "events.1";
                }

                // Einlesen des Event-Status
                const vacationState = await this.getForeignStateAsync(
                    `${this.config.vacationInstance}.${key}.${event.name}`,
                );
                this.log.debug(`vacation check result: ${JSON.stringify(vacationState)}`);

                if (vacationState?.val === true) {
                    this.log.debug(`Vacation event '${event.name}' active`);
                    const alarmState = await this.getStateAsync("schedule.vacation");

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
            this.log.debug("vacation check disabled");
        }
    }

    /**
     * Überprüfe den Feiertagskalender.
     *
     * @param alert Die Weckzeit
     * @param today Prüfung des aktuellen Tags
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
                const alarmState = await this.getStateAsync("schedule.holiday");

                if (alarmState && alarmState.val != null && alarmState.val !== "") {
                    this.calcDateWithTime(alert, alarmState.val.toString());
                } else {
                    this.log.warn(`No alarm time found for holiday, using default time.`);
                    this.calcDateWithTime(alert, "06:00");
                }
            }
        } else {
            this.log.debug("holiday check disabled");
        }
    }

    /**
     * Überprüfe den public-holidays-Kalender.
     *
     * @param alert Die Weckzeit
     * @param today Prüfung des aktuellen Tags
     */
    private async checkPublicHolidayEvents(alert: Date, today: boolean = true): Promise<void> {
        this.log.debug(`checkPublicHolidayEvents(${alert.toLocaleString()})`);

        if (this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
            let key = "today";
            if (!today) {
                key = "tomorrow";
            }

            const holidayState = await this.getForeignStateAsync(
                `${this.config.publicHolidaysInstance}.${key}.isHoliday`,
            );
            this.log.debug(`holiday check result: ${JSON.stringify(holidayState)}`);

            if (holidayState?.val === true) {
                this.log.debug(`Holiday is active`);
                const alarmState = await this.getStateAsync("schedule.holiday");

                if (alarmState && alarmState.val != null && alarmState.val !== "") {
                    this.calcDateWithTime(alert, alarmState.val.toString());
                } else {
                    this.log.warn(`No alarm time found for holiday, using default time.`);
                    this.calcDateWithTime(alert, "06:00");
                }
            }
        } else {
            this.log.debug("public-holidays check disabled");
        }
    }

    /**
     * Überprüfung den Weckerkalender.
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
                try {
                    const calendarEvents = JSON.parse(events.val as string);

                    if (!Array.isArray(calendarEvents)) {
                        this.log.debug(`Appointment calendar is not an array`);
                        return;
                    }

                    for (const event of this.config.appointmentEvents) {
                        if (!event.name || !event.enabled) {
                            continue;
                        }

                        this.log.debug(`Appointment check: ${event.name}`);
                        const eintrag = calendarEvents.find(
                            (e: any) => e.event === event.name && e._date.startsWith(date),
                        );
                        if (eintrag !== undefined) {
                            this.log.debug(`Appointment ${event.name} active`);
                            this.calcDateWithTime(alert, new Date(eintrag._date).toLocaleTimeString().slice(0, 5));
                            break;
                        }
                    }
                } catch (error: any) {
                    this.log.error(`Invalid appointment calendar JSON: ${error.message}`);
                }
            }
        } else {
            this.log.debug("appointment check disabled");
        }
    }

    /**
     * Berechnen der Helligkeit des Lichtweckers.
     *
     * @param force Aktualisierung erzwingen
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
            let progress = 100;
            if (total > 0) {
                progress = (elapsed / total) * 100;
            }
            progress = Math.max(0, Math.min(progress, 100));

            this.log.debug(`sunriseProgress: ${progress} %`);
            await this.setState("runtime.sunriseProgress", progress, true);
            await this.setState("runtime.sunriseBrightness", Math.round(progress), true);
            this.sendToMqtt("runtime.sunriseBrightness", Math.round(progress));

            if (this.config.sunriseEvents && this.config.sunriseEvents.length > 0) {
                this.config.sunriseEvents
                    .filter((e: any) => e.enabled === true)
                    .forEach(e => {
                        let calc = (e.max * progress) / 100;
                        if (e.invers === true) {
                            calc = e.max - calc;
                        }
                        this.log.debug(`sunriseEvents set ${e.objectId} with '${Math.round(calc)}'`);
                        this.setForeignState(e.objectId, Math.round(calc));
                    });
            }
        }
    }

    /**
     * Erhöhe den Zählerwert.
     *
     * @param key Der Name des Wertes
     */
    private async incrementStat(key: string): Promise<void> {
        this.log.debug(`incrementStat(${key})`);

        const value = Number((await this.getStateAsync(`statistics.${key}`))?.val || 0);
        await this.setState(`statistics.${key}`, value + 1, true);
        this.sendToMqtt(`statistics.${key}`, value + 1);
    }

    /**
     * Setzten des Status des Weckers.
     *
     * @param state Der Status des Weckers
     */
    private async handleState(state: string): Promise<void> {
        switch (state) {
            case STATE.DISABLED:
                break;
            case STATE.ARMED:
                await this.checkNewAlarmTime("STATE.ARMED");
                await this.updateCountdowns();
                break;
            case STATE.PREALARM:
                await this.startPreAlarm();
                break;
            case STATE.TRIGGERED:
                await this.startAlarm();
                break;
            case STATE.SNOOZE:
                await this.updateCountdowns();
                break;
            case STATE.STOPPED:
                await this.stopAlarm();
                await this.setAlarmState(STATE.ARMED);
                await this.updateCountdowns();
                break;
            case STATE.ERROR:
                await this.incrementStat("errorCount");
                break;
        }

        this.runningActionEvents(state);
    }

    /**
     * Ausführen des Pre-Alarms.
     */
    private async startPreAlarm(): Promise<void> {
        this.log.debug("startPreAlarm()");

        await this.incrementStat("preAlarmCount");
        await this.updateSunrise(true);

        this.log.info("PREALARM");
    }

    /**
     * Ausführen des Alarms.
     */
    private async startAlarm(): Promise<void> {
        this.log.debug(`startAlarm()`);

        if (!this.alarmStartTime) {
            this.alarmStartTime = Date.now();
            await this.setState("statistics.lastAlarm", new Date().toISOString(), true);
            this.sendToMqtt("statistics.lastAlarm", new Date().toLocaleString());
        }

        await this.incrementStat("alarmCount");
        await this.setState("runtime.active", true, true);
        this.sendToMqtt("runtime.active", true);

        this.log.info("ALARM");
    }

    /**
     * Stoppen des Alarms
     */
    private async stopAlarm(): Promise<void> {
        this.log.debug(`stopAlarm()`);

        await this.incrementStat("stopCount");

        if (this.alarmStartTime) {
            const wakeDelay = Math.round((Date.now() - this.alarmStartTime) / 60000);
            await this.setState("statistics.lastWakeup", new Date().toISOString(), true);
            this.sendToMqtt("statistics.lastWakeup", new Date().toLocaleString());

            let history: number[] = [];
            // Einlesen der Historie der Aufwachverzögerungen
            const historyState = await this.getStateAsync("statistics.wakeDelayHistory");
            if (historyState?.val) {
                try {
                    history = JSON.parse(historyState.val.toString());

                    if (!Array.isArray(history)) {
                        history = [];
                    }

                    history = history.filter(value => typeof value === "number" && value >= 0);
                } catch {
                    history = [];
                }
            }

            // Letzte Zeit hinzufügen und die Historie auf die Konfigurierte Länge kürzen
            history.push(wakeDelay);
            while (history.length > this.config.maxWakeDelayHistory) {
                history.shift();
            }

            const averageWakeDelay = history.reduce((a, b) => a + b, 0) / history.length;
            const bestWakeDelay = history.reduce((min, value) => Math.min(min, value), Number.MAX_SAFE_INTEGER);
            const worstWakeDelay = history.reduce((max, value) => Math.max(max, value), 0);

            await this.setState(`statistics.wakeDelayHistory`, JSON.stringify(history), true);
            await this.setState(`statistics.averageWakeDelay`, averageWakeDelay, true);
            this.sendToMqtt(`statistics.averageWakeDelay`, averageWakeDelay);
            await this.setState(`statistics.lastWakeDelay`, wakeDelay, true);
            this.sendToMqtt(`statistics.lastWakeDelay`, wakeDelay);
            await this.setState(`statistics.bestWakeDelay`, bestWakeDelay, true);
            this.sendToMqtt(`statistics.bestWakeDelay`, bestWakeDelay);
            await this.setState(`statistics.worstWakeDelay`, worstWakeDelay, true);
            this.sendToMqtt(`statistics.worstWakeDelay`, worstWakeDelay);
        }

        this.alarmStartTime = null;
        await this.setState(`runtime.active`, false, true);
        this.sendToMqtt(`runtime.active`, false);
    }

    /**
     * Setzten des Status des Weckers.
     *
     * @param newState Der neue Status des Weckers
     */
    private async setAlarmState(newState: string): Promise<void> {
        this.log.debug(`setAlarmState(${newState})`);

        const oldState = await this.getStateAsync("runtime.state");
        if (oldState?.val === newState) {
            return;
        }

        await this.setState("runtime.state", newState, true);
        this.sendToMqtt("runtime.state", newState);

        this.log.debug(`${oldState?.val} -> ${newState}`);
        await this.handleState(newState);
    }

    /**
     * Überprüfen des Status des Weckers.
     */
    private async evaluateState(): Promise<void> {
        try {
            const now = Date.now();
            const state = await this.getStateAsync("runtime.state");
            const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
            const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
            const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
            const skip = (await this.getStateAsync("config.skipNext"))?.val === true;

            // Die Schlummerzeit abgelaufen
            if (
                state?.val === STATE.SNOOZE &&
                snoozeUntil?.val &&
                now >= new Date(String(snoozeUntil.val)).getTime() &&
                !skip
            ) {
                await this.setAlarmState(STATE.TRIGGERED);
                return;
            }

            // Die Voralarmzeit ist erreicht
            if (
                state?.val === STATE.ARMED &&
                nextPreAlarm?.val &&
                now >= new Date(String(nextPreAlarm.val)).getTime() &&
                !skip
            ) {
                await this.setAlarmState(STATE.PREALARM);
                return;
            }

            // Die Alarmzeit ist erreicht
            if (
                (state?.val === STATE.ARMED || state?.val === STATE.PREALARM) &&
                nextAlarm?.val &&
                now >= new Date(String(nextAlarm.val)).getTime() &&
                !skip
            ) {
                await this.setAlarmState(STATE.TRIGGERED);
            }
        } catch (error) {
            this.log.error(`Error during evaluateState: ${(error as Error).message}`);
            await this.setAlarmState(STATE.ERROR);
        }
    }

    /**
     * Aktiviren des Schlummer-Modus.
     */
    private async activateSnooze(): Promise<void> {
        this.log.debug("activateSnooze()");

        const state = await this.getStateAsync("runtime.state");
        if (state?.val === STATE.TRIGGERED || state?.val === STATE.PREALARM) {
            const mins = await this.getStateAsync("config.snoozeMinutes");
            const minutes = Math.max(1, Number(mins?.val) || 9);
            const until = new Date(Date.now() + minutes * 60000);

            await this.setState("runtime.snoozeUntil", until.toISOString(), true);
            this.sendToMqtt("runtime.snoozeUntil", until.toLocaleString());

            await this.incrementStat("snoozeCount");
            await this.setAlarmState(STATE.SNOOZE);
        }
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback Callback function
     */
    private onUnload(callback: () => void): void {
        try {
            // Löschen der benutzten Timer
            this.clearInterval(this.updateCountdownsInterval);
            this.clearInterval(this.updateSunriseInterval);
            this.clearInterval(this.evaluateStateInterval);

            callback();
        } catch (error) {
            this.log.error(`Error during unloading: ${(error as Error).message}`);
            callback();
        }
    }

    /**
     * Hilfsfunktion zum Überprüfen der Eingabe einer neuen Weckzeit.
     *
     * @param id Id der Weckzeit, 'alarmStates[id]'
     * @param state Der ioBroker.State
     * @throws {Error} Wenn die Alarm-ID ungültig ist.
     */
    private async checkStateUpdateNewAlarmTime(id: number, state: ioBroker.State): Promise<void> {
        this.log.debug(`checkStateUpdateNewAlarmTime(${id}, ${JSON.stringify(state)})`);

        // Prüfung der Alarm-ID
        if (id < 0 || id > 8) {
            throw new Error(`Ungültige Alarm-ID: ${id}`);
        }

        if (state.ack === false) {
            this.log.debug(`New wake-up time for ${ALARMNAMES[id]}: ${state.val}`);
            this.alarmStates[id] = this.checkValidTime(state.val?.toString(), this.alarmStates[id]);
            await this.setState(`schedule.${ALARMNAMES[id]}`, this.alarmStates[id], true);
            this.sendToMqtt(`schedule.${ALARMNAMES[id]}`, this.alarmStates[id]);
        } else {
            await this.checkNewAlarmTime(`schedule.${ALARMNAMES[id]}`);
        }
    }

    /**
     * Einlesen der Weckzeiten aus den State-Objekten in den lokalen Speicher.
     *
     * @param id Id der Weckzeit, 'alarmStates[id]'
     * @throws {Error} Wenn die Alarm-ID ungültig ist.
     */
    private async readAlarmTime(id: number): Promise<void> {
        this.log.debug(`readAlarmTime(${id})`);

        // Prüfung der Alarm-ID
        if (id < 0 || id > 8) {
            throw new Error(`Ungültige Alarm-ID: ${id}`);
        }

        const state = await this.getStateAsync(`schedule.${ALARMNAMES[id]}`);
        if (state && state.val !== "") {
            this.alarmStates[id] = this.checkValidTime(state.val?.toString(), this.alarmStates[id]);
            this.sendToMqtt(`schedule.${ALARMNAMES[id]}`, this.alarmStates[id]);
        }
    }

    /**
     * Formatieren eines Zeitwerts anhand der Minuten.
     *
     * @param min Die Minutenanzahl
     * @returns Der Formatierte Zeitwert (HH:mm)
     */
    private formatMinutes2TimeString(min: number): string {
        if (typeof min !== "number" || isNaN(min)) {
            throw new Error("Input must be a valid number.");
        }

        // Calculate minutes to seconds
        const seconds = Math.abs(min) * 60;

        // Calculate hours, minutes
        const hours = Math.floor(seconds / 3600); // 1 hour = 3600 s
        const minutes = Math.floor((seconds % 3600) / 60); // 1 min = 60 s

        // Format with leading zeros
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    /**
     * onStateChange des AlarmClock-Adapters.
     *
     * @param id State ID
     * @param state State object
     * @returns Ob die State-ID gefunden wurde
     */
    private async onAlarmClockStateChange(id: string, state: ioBroker.State): Promise<boolean> {
        this.log.debug(`onAlarmClockStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
        let found = true;

        switch (id) {
            case `${this.namespace}.schedule.monday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.MONDAY, state);
                break;
            case `${this.namespace}.schedule.tuesday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.TUESDAY, state);
                break;
            case `${this.namespace}.schedule.wednesday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.WEDNESDAY, state);
                break;
            case `${this.namespace}.schedule.thursday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.THURSDAY, state);
                break;
            case `${this.namespace}.schedule.friday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.FRIDAY, state);
                break;
            case `${this.namespace}.schedule.saturday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.SATURDAY, state);
                break;
            case `${this.namespace}.schedule.sunday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.SUNDAY, state);
                break;
            case `${this.namespace}.schedule.vacation`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.VACATION, state);
                break;
            case `${this.namespace}.schedule.holiday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.HOLIDAY, state);
                break;

            case `${this.namespace}.action.snooze`:
                if (state.ack === false) {
                    await this.activateSnooze();
                    await this.setState("action.snooze", false, true);
                }
                break;
            case `${this.namespace}.action.stop`:
                if (state.ack === false) {
                    await this.setAlarmState(STATE.STOPPED);
                    await this.setState("action.stop", false, true);
                }
                break;

            case `${this.namespace}.config.enabled`:
                if (state.val) {
                    await this.setAlarmState(STATE.ARMED);
                } else {
                    await this.setAlarmState(STATE.DISABLED);
                }
                await this.checkNewAlarmTime("config.enabled");
                this.sendToMqtt("config.enabled", state.val);
                break;
            case `${this.namespace}.config.preAlarmMinutes`:
                await this.checkNewAlarmTime("config.preAlarmMinutes");
                this.sendToMqtt("config.preAlarmMinutes", state.val);
                break;
            case `${this.namespace}.config.skipNext`:
                await this.checkNewAlarmTime("config.skipNext");
                this.sendToMqtt("config.skipNext", state.val);
                break;
            case `${this.namespace}.config.snoozeMinutes`:
                await this.checkNewAlarmTime("config.snoozeMinutes");
                this.sendToMqtt("config.snoozeMinutes", state.val);
                break;

            case `${this.namespace}.template.1_load`:
                if (state.ack === false) {
                    await this.templateLoad(1);
                    await this.setState("template.1_load", false, true);
                }
                break;
            case `${this.namespace}.template.1_save`:
                if (state.ack === false) {
                    await this.templateSave(1);
                    await this.setState("template.1_save", false, true);
                }
                break;
            case `${this.namespace}.template.2_load`:
                if (state.ack === false) {
                    await this.templateLoad(2);
                    await this.setState("template.2_load", false, true);
                }
                break;
            case `${this.namespace}.template.2_save`:
                if (state.ack === false) {
                    await this.templateSave(2);
                    await this.setState("template.2_save", false, true);
                }
                break;
            case `${this.namespace}.template.3_load`:
                if (state.ack === false) {
                    await this.templateLoad(3);
                    await this.setState("template.3_load", false, true);
                }
                break;
            case `${this.namespace}.template.3_save`:
                if (state.ack === false) {
                    await this.templateSave(3);
                    await this.setState("template.3_save", false, true);
                }
                break;
            case `${this.namespace}.template.4_load`:
                if (state.ack === false) {
                    await this.templateLoad(4);
                    await this.setState("template.4_load", false, true);
                }
                break;
            case `${this.namespace}.template.4_save`:
                if (state.ack === false) {
                    await this.templateSave(4);
                    await this.setState("template.4_save", false, true);
                }
                break;
            case `${this.namespace}.template.5_load`:
                if (state.ack === false) {
                    await this.templateLoad(5);
                    await this.setState("template.5_load", false, true);
                }
                break;
            case `${this.namespace}.template.5_save`:
                if (state.ack === false) {
                    await this.templateSave(5);
                    await this.setState("template.5_save", false, true);
                }
                break;
            default:
                found = false;
        }

        return found;
    }

    /**
     * onStateChange des Feiertagskalender-Adapters.
     *
     * @param id State ID
     * @param state State object
     * @returns Ob die State-ID gefunden wurde
     */
    private async onHolidayStateChange(id: string, state: ioBroker.State): Promise<boolean> {
        this.log.debug(`onHolidayStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
        let found = true;

        switch (id) {
            case `${this.config.holidayInstance}.today.boolean`:
                await this.checkNewAlarmTime("holidayInstance.today");
                break;
            case `${this.config.holidayInstance}.tomorrow.boolean`:
                await this.checkNewAlarmTime("holidayInstance.tomorrow");
                break;

            default:
                found = false;
        }

        return found;
    }

    /**
     * onStateChange des public-holidays-Adapters.
     *
     * @param id State ID
     * @param state State object
     * @returns Ob die State-ID gefunden wurde
     */
    private async onPublicHolidayStateChange(id: string, state: ioBroker.State): Promise<boolean> {
        this.log.debug(`onPublicHolidayStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
        let found = true;

        switch (id) {
            case `${this.config.publicHolidaysInstance}.today.isHoliday`:
                await this.checkNewAlarmTime("publicHolidaysInstance.today");
                break;
            case `${this.config.publicHolidaysInstance}.tomorrow.isHoliday`:
                await this.checkNewAlarmTime("publicHolidaysInstance.tomorrow");
                break;

            default:
                found = false;
        }

        return found;
    }

    /**
     * onStateChange des Urlaubskalenders.
     *
     * @param id State ID
     * @param state State object
     * @returns Ob die State-ID gefunden wurde
     */
    private async onVacationStateChange(id: string, state: ioBroker.State): Promise<boolean> {
        this.log.debug(`onVacationStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
        let found = true;

        switch (id) {
            case `${this.config.vacationInstance}.data.table`:
                await this.checkNewAlarmTime("vacationInstance");
                break;

            default:
                found = false;
        }

        return found;
    }

    /**
     * onStateChange des Weckerkalender.
     *
     * @param id State ID
     * @param state State object
     * @returns Ob die State-ID gefunden wurde
     */
    private async onAppointmentStateChange(id: string, state: ioBroker.State): Promise<boolean> {
        this.log.debug(`onAppointmentStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
        let found = true;

        switch (id) {
            case `${this.config.appointmentInstance}.data.table`:
                await this.checkNewAlarmTime("appointmentInstance");
                break;

            default:
                found = false;
        }

        return found;
    }

    /**
     * onStateChange des MQTT-Broker.
     *
     * @param id State ID
     * @param state State object
     * @returns Ob die State-ID gefunden wurde
     */
    private async onMqttBrokerStateChange(id: string, state: ioBroker.State): Promise<boolean> {
        this.log.debug(`onMqttBrokerStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
        const key = `${this.config.mqttInstance}.${this.config.mqttTopic}`.replaceAll("/", ".");
        let found = true;

        const mqttState: ioBroker.State = {
            ...state,
            ack: false,
        };
        switch (id) {
            case `${key}.action.monday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.MONDAY, mqttState);
                break;
            case `${key}.action.tuesday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.TUESDAY, mqttState);
                break;
            case `${key}.action.wednesday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.WEDNESDAY, mqttState);
                break;
            case `${key}.action.thursday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.THURSDAY, mqttState);
                break;
            case `${key}.action.friday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.FRIDAY, mqttState);
                break;
            case `${key}.action.saturday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.SATURDAY, mqttState);
                break;
            case `${key}.action.sunday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.SUNDAY, mqttState);
                break;
            case `${key}.action.vacation`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.VACATION, mqttState);
                break;
            case `${key}.action.holiday`:
                await this.checkStateUpdateNewAlarmTime(ALARMTIME.HOLIDAY, mqttState);
                break;

            case `${key}.action.enabled`:
                await this.setState("config.enabled", state.val);
                break;
            case `${key}.action.skipNext`:
                await this.setState("config.skipNext", state.val);
                break;
            case `${key}.action.stop`:
                if (state.val) {
                    await this.setState("action.stop", true);
                    this.sendToMqtt("action.stop", false);
                }
                break;
            case `${key}.action.snooze`:
                if (state.val) {
                    await this.setState("action.snooze", true);
                    this.sendToMqtt("action.snooze", false);
                }
                break;
            case `${key}.action.preAlarmMinutes`:
                await this.setState("config.preAlarmMinutes", state.val);
                break;
            case `${key}.action.snoozeMinutes`:
                await this.setState("config.snoozeMinutes", state.val);
                break;

            case `${key}.action.template_1_load`:
                await this.templateLoad(1);
                break;
            case `${key}.action.template_1_save`:
                await this.templateSave(1);
                break;
            case `${key}.action.template_2_load`:
                await this.templateLoad(2);
                break;
            case `${key}.action.template_2_save`:
                await this.templateSave(2);
                break;
            case `${key}.action.template_3_load`:
                await this.templateLoad(3);
                break;
            case `${key}.action.template_3_save`:
                await this.templateSave(3);
                break;
            case `${key}.action.template_4_load`:
                await this.templateLoad(4);
                break;
            case `${key}.action.template_4_save`:
                await this.templateSave(4);
                break;
            case `${key}.action.template_5_load`:
                await this.templateLoad(5);
                break;
            case `${key}.action.template_5_save`:
                await this.templateSave(5);
                break;
            default:
                found = false;
        }

        return found;
    }

    /**
     * Senden eines Wertes an dem MQTT-Broker
     *
     * @param key Der Schlüssel des Topic
     * @param msg Die zu sendende Nachricht
     */
    private sendToMqtt(key: string, msg: any): void {
        this.log.debug(`sentToMqtt(${this.config.mqttTopic}.${key}, ${msg})`);

        if (this.config.mqttInstance && this.config.mqttInstance !== "") {
            this.sendTo(this.config.mqttInstance, "sendMessage2Client", {
                topic: `${this.config.mqttTopic}.${key}`.replaceAll(".", "/"),
                message: msg,
                retain: false,
            });
        }
    }

    /**
     * Ausführen der Aktionen beim Status des Weckers.
     *
     * @param action Der Status des Weckers
     */
    private runningActionEvents(action: string): void {
        this.log.debug(`runningActionEvents(${action})`);

        if (this.config.actionEvents && this.config.actionEvents.length > 0) {
            this.config.actionEvents
                .filter((e: any) => e.type === action && e.enabled === true)
                .forEach(e => {
                    this.log.debug(`action set ${e.objectId} with '${e.value}'`);
                    this.setForeignState(e.objectId, e.value);
                });
        }
    }

    /**
     * Laden einer Wecker-Vorlage.
     *
     * @param id Die Id der Vorlage
     */
    private async templateLoad(id: number): Promise<void> {
        this.log.debug(`templateLoad(${id})`);

        const data = (await this.getStateAsync(`template.${id}_data`))?.val || "";
        if (data && data !== "") {
            try {
                const json = JSON.parse(data as string);

                if (!Array.isArray(json)) {
                    this.log.error(`Der Wert der Profilvorlage ist nicht korrekt: ${json}`);
                    return;
                }

                if (json.length != 9) {
                    this.log.error(`Die Länge des Profile ist nicht korrekt: ${json.length}`);
                    return;
                }

                if (!json.every((t, _i) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) {
                    this.log.error(`Der Wert der Profilvorlage enthält fehlerhafte Daten: ${JSON.stringify(json)}`);
                    return;
                }

                for (let i = 0; i < json.length; i++) {
                    this.log.info(`item: ${i} => ${json[i]}`);
                    this.alarmStates[i] = json[i];
                    await this.setState(`schedule.${ALARMNAMES[i]}`, this.alarmStates[i], true);
                    this.sendToMqtt(`schedule.${ALARMNAMES[i]}`, this.alarmStates[i]);
                }

                await this.checkNewAlarmTime("templateLoad");
            } catch (error: any) {
                this.log.error(`Invalid template data JSON: ${error.message}`);
            }
        } else {
            this.log.error(`Der Wert der Profilvorlage ist fehlerhaft: ${data}`);
        }
    }

    /**
     * Speichern der Wecker-Vorlage.
     *
     * @param id Die Id der Vorlage
     */
    private async templateSave(id: number): Promise<void> {
        this.log.debug(`templateSave(${id})`);

        await this.setState(`template.${id}_data`, JSON.stringify(this.alarmStates), true);
        this.sendToMqtt(`template.${id}_data`, JSON.stringify(this.alarmStates));
    }

    /**
     * Is called if a subscribed state changes.
     *
     * @param id State ID
     * @param state State object
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            // The state was changed
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            let found = false;

            // Prüfen der States des Adapters
            if (await this.onAlarmClockStateChange(id, state)) {
                found = true;
            }

            // Prüfen des Feiertagskalender
            if (!found && this.config.holidayInstance && this.config.holidayInstance !== "") {
                if (await this.onHolidayStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des public-holidays-Kalender
            if (!found && this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
                if (await this.onPublicHolidayStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des Urlaubskalender
            if (!found && this.config.vacationInstance && this.config.vacationInstance !== "") {
                if (await this.onVacationStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des Weckerkalender
            if (!found && this.config.appointmentInstance && this.config.appointmentInstance !== "") {
                if (await this.onAppointmentStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des MQTT-Broker
            if (!found && this.config.mqttInstance && this.config.mqttInstance !== "") {
                if (await this.onMqttBrokerStateChange(id, state)) {
                    found = true;
                }
            }

            if (!found) {
                this.log.warn(`state id not known: ${id}`);
            }
        } else {
            // The object was deleted or the state value has expired
            this.log.debug(`state ${id} deleted`);
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Alarmclock(options);
} else {
    // otherwise start the instance directly
    (() => new Alarmclock())();
}
