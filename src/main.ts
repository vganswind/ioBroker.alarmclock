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

        // Prüfen und Abonnieren des Urlaubskalender
        if (
            this.config.vocationInstance &&
            this.config.vocationInstance !== "" &&
            this.config.vocationEvents &&
            this.config.vocationEvents.length > 0
        ) {
            this.subscribeForeignStates(`${this.config.vocationInstance}.data.table`);
        }

        // Prüfen und Abonnieren des Feiertagskalender
        if (this.config.holidayInstance && this.config.holidayInstance !== "") {
            this.subscribeForeignStates(`${this.config.holidayInstance}.today.boolean`);
            this.subscribeForeignStates(`${this.config.holidayInstance}.tomorrow.boolean`);
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

        this.log.info("Adapter is ready and running.");
    }

    /**
     * Update the countdowns.
     */
    private async updateCountdowns(): Promise<void> {
        this.log.debug("updateCountdowns()");
        const now = new Date();

        const nextAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextAlarm`);
        if (nextAlarm && nextAlarm?.val != null && nextAlarm?.val !== "") {
            let rest = new Date(nextAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Next alarm: ${nextAlarm.val}, rest: ${Math.floor(rest / 60000)} s`);
            await this.setState(`${this.namespace}.runtime.countdownAlarm`, Math.floor(rest / 60000), true);
        }

        const nextPreAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextPreAlarm`);
        if (nextPreAlarm && nextPreAlarm?.val != null && nextPreAlarm?.val !== "") {
            let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 60000)} s`);
            await this.setState(`${this.namespace}.runtime.countdownPreAlarm`, Math.floor(rest / 60000), true);
        }

        const snoozeUntil = await this.getStateAsync(`${this.namespace}.runtime.snoozeUntil`);
        if (snoozeUntil && snoozeUntil?.val != null && snoozeUntil?.val !== "") {
            let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
            if (rest < 0) {
                rest = 0;
            }

            this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 60000)} s`);
            await this.setState(`${this.namespace}.runtime.countdownSnooze`, Math.floor(rest / 60000), true);
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
     * Überprüfung den Urlaubskalender.
     *
     * @param alert Die Weckzeit
     * @param today Prüfung des aktuellen Tags
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
            this.log.info(
                `appointment check disabled: ical=${this.config.appointmentInstance}, events=${this.config.appointmentEvents?.length ?? 0}`,
            );
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
    private incrementStat(key: string): void {
        this.log.debug(`incrementStat(${key})`);

        this.getState(`statistics.${key}`, async (_err, state) => {
            const value = Number(state?.val) || 0;
            await this.setState(`statistics.${key}`, value + 1, true);
        });
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
                this.setAlarmState(STATE.ARMED);
                await this.updateCountdowns();
                break;
            case STATE.ERROR:
                this.incrementStat("errorCount");
                break;
        }
    }

    /**
     * Ausführen des Pre-Alarms.
     */
    private async startPreAlarm(): Promise<void> {
        this.log.debug("startPreAlarm()");

        this.incrementStat("preAlarmCount");
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
        }

        this.incrementStat("alarmCount");
        await this.setState("runtime.active", true, true);

        this.log.info("ALARM");
    }

    /**
     * Stoppen des Alarms
     */
    private async stopAlarm(): Promise<void> {
        this.log.debug(`stopAlarm()`);

        this.incrementStat("stopCount");

        if (this.alarmStartTime) {
            const wakeDelay = Math.round((Date.now() - this.alarmStartTime) / 60000);
            await this.setState(`statistics.wakeDelay`, wakeDelay, true);
        }

        await this.setState(`runtime.active`, false, true);
        this.setAlarmState(STATE.STOPPED);
    }

    /**
     * Setzten des Status des Weckers.
     *
     * @param newState Der neue Status des Weckers
     */
    private setAlarmState(newState: string): void {
        this.log.debug(`setAlarmState(${newState})`);

        this.getState("runtime.state", async (_err, oldState) => {
            if (oldState?.val === newState) {
                return;
            }

            await this.setState("runtime.state", newState, true);

            this.log.debug(`${oldState?.val} -> ${newState}`);
            await this.handleState(newState);
        });
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

                    this.incrementStat("snoozeCount");
                    this.setAlarmState(STATE.SNOOZE);
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
     * Is called if a subscribed state changes.
     *
     * @param id State ID
     * @param state State object
     */
    private async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            // The state was changed
            this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);

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
