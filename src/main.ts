/*
 * Created with @iobroker/create-adapter v3.1.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { EVALUATESTATEINTERVAL, STATE, UPDATECOUNTDOWNSINTERVAL, UPDATESUNRISEINTERVAL } from "./constants";
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
            await this.setState(`${this.namespace}.runtime.countdownAlarm`, Math.floor(rest / 60000), true);
            await this.setState(
                `${this.namespace}.runtime.countdownAlarmText`,
                this.formatMinutes2TimeString(rest / 60000),
                true,
            );
        }

        // Berechnen der Laufzeit bis zum Voralarm
        const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
        if (nextPreAlarm && nextPreAlarm?.val != null && nextPreAlarm?.val !== "") {
            let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 60000)} min`);
            await this.setState(`${this.namespace}.runtime.countdownPreAlarm`, Math.floor(rest / 60000), true);
            await this.setState(
                `${this.namespace}.runtime.countdownPreAlarmText`,
                this.formatMinutes2TimeString(rest / 60000),
                true,
            );
        }

        // Berechnen der Laufzeit bis Ende der Schlummerfunktion
        const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
        if (snoozeUntil && snoozeUntil?.val != null && snoozeUntil?.val !== "") {
            let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 60000)} min`);
            await this.setState(`${this.namespace}.runtime.countdownSnooze`, Math.floor(rest / 60000), true);
            await this.setState(
                `${this.namespace}.runtime.countdownSnoozeText`,
                this.formatMinutes2TimeString(rest / 60000),
                true,
            );
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
            await this.setState("runtime.nextAlarm", alarm.toISOString(), true);
        } else {
            this.log.debug("Alarm is disabled, skipping new alarm time check.");
            await this.setState("runtime.nextPreAlarm", "", true);
            await this.setState("runtime.nextAlarm", "", true);
            await this.setState("runtime.snoozeUntil", "", true);
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
            let progress = (elapsed / total) * 100;

            progress = Math.max(0, Math.min(progress, 100));

            this.log.debug(`sunriseProgress: ${progress} %`);
            await this.setState("runtime.sunriseProgress", progress, true);
            await this.setState("runtime.sunriseBrightness", Math.round(progress), true);
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
        }

        await this.incrementStat("alarmCount");
        await this.setState("runtime.active", true, true);

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
            await this.setState(`statistics.lastWakeDelay`, wakeDelay, true);
            await this.setState(`statistics.bestWakeDelay`, bestWakeDelay, true);
            await this.setState(`statistics.worstWakeDelay`, worstWakeDelay, true);
        }

        this.alarmStartTime = null;
        await this.setState(`runtime.active`, false, true);
        await this.setAlarmState(STATE.STOPPED);
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
        } catch (e) {
            console.error(e);
            await this.setAlarmState(STATE.ERROR);
        }
    }

    /**
     * Aktiviren des Schlummer-Modus.
     */
    private activateSnooze(): void {
        this.log.debug("activateSnooze()");

        this.getState("runtime.state", (_err, state) => {
            if (state?.val === STATE.TRIGGERED || state?.val === STATE.PREALARM) {
                this.getState("config.snoozeMinutes", async (_err, mins) => {
                    const until = new Date(Date.now() + Number(mins?.val) * 60000);

                    await this.setState("runtime.snoozeUntil", until.toISOString(), true);

                    await this.incrementStat("snoozeCount");
                    await this.setAlarmState(STATE.SNOOZE);
                });
            }
        });
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

        // Liste der Namen der Objekte für die Weckzeit
        const days = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "vacation",
            "holiday",
        ];

        if (state.ack === false) {
            this.log.debug(`New wake-up time for ${days[id]}: ${state.val}`);
            this.alarmStates[id] = this.checkValidTime(state.val?.toString(), this.alarmStates[id]);
            await this.setState(`schedule.${days[id]}`, {
                val: this.alarmStates[id],
                ack: true,
            });
        } else {
            await this.checkNewAlarmTime(`schedule.${days[id]}`);
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

        // Liste der Namen der Objekte für die Weckzeit
        const days = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
            "vacation",
            "holiday",
        ];

        const state = await this.getStateAsync(`schedule.${days[id]}`);
        if (state && state.val !== "") {
            this.alarmStates[id] = this.checkValidTime(state.val?.toString(), this.alarmStates[id]);
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
        const sec = Math.abs(min) * 60;

        // Calculate hours, minutes
        const hours = Math.floor(sec / 3600); // 1 hour = 3600 s
        const minutes = Math.floor((sec % 3600) / 60); // 1 min = 60 s

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
                await this.checkStateUpdateNewAlarmTime(0, state);
                break;
            case `${this.namespace}.schedule.tuesday`:
                await this.checkStateUpdateNewAlarmTime(1, state);
                break;
            case `${this.namespace}.schedule.wednesday`:
                await this.checkStateUpdateNewAlarmTime(2, state);
                break;
            case `${this.namespace}.schedule.thursday`:
                await this.checkStateUpdateNewAlarmTime(3, state);
                break;
            case `${this.namespace}.schedule.friday`:
                await this.checkStateUpdateNewAlarmTime(4, state);
                break;
            case `${this.namespace}.schedule.saturday`:
                await this.checkStateUpdateNewAlarmTime(5, state);
                break;
            case `${this.namespace}.schedule.sunday`:
                await this.checkStateUpdateNewAlarmTime(6, state);
                break;
            case `${this.namespace}.schedule.vacation`:
                await this.checkStateUpdateNewAlarmTime(7, state);
                break;
            case `${this.namespace}.schedule.holiday`:
                await this.checkStateUpdateNewAlarmTime(8, state);
                break;

            case `${this.namespace}.action.snooze`:
                if (state.ack === false) {
                    this.activateSnooze();
                    await this.setState("action.snooze", { val: false, ack: true });
                }
                break;
            case `${this.namespace}.action.stop`:
                if (state.ack === false) {
                    await this.setAlarmState(STATE.STOPPED);
                    await this.setState("action.stop", { val: false, ack: true });
                }
                break;

            case `${this.namespace}.config.enabled`:
                if (state.val) {
                    await this.setAlarmState(STATE.ARMED);
                } else {
                    await this.setAlarmState(STATE.DISABLED);
                }
                await this.checkNewAlarmTime("config.enabled");
                break;
            case `${this.namespace}.config.preAlarmMinutes`:
                await this.checkNewAlarmTime("config.preAlarmMinutes");
                break;
            case `${this.namespace}.config.skipNext`:
                await this.checkNewAlarmTime("config.skipNext");
                break;
            case `${this.namespace}.config.snoozeMinutes`:
                await this.checkNewAlarmTime("config.snoozeMinutes");
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
            if (this.config.holidayInstance && this.config.holidayInstance !== "") {
                if (await this.onHolidayStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des public-holidays-Kalender
            if (this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
                if (await this.onPublicHolidayStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des Urlaubskalender
            if (this.config.vacationInstance && this.config.vacationInstance !== "") {
                if (await this.onVacationStateChange(id, state)) {
                    found = true;
                }
            }

            // Prüfen des Weckerkalender
            if (this.config.appointmentInstance && this.config.appointmentInstance !== "") {
                if (await this.onAppointmentStateChange(id, state)) {
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
