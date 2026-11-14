"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_constants = require("./constants");
var import_createstatesobjects = require("./createstatesobjects");
class Alarmclock extends utils.Adapter {
  /** Interval for updating countdowns */
  updateCountdownsInterval;
  /** Interval for updating sunrise */
  updateSunriseInterval;
  /** Interval for alert check */
  evaluateStateInterval;
  /** Array of alarm times */
  alarmStates = ["06:00", "06:00", "06:00", "06:00", "06:00", "08:00", "08:30", "10:30", "09:30"];
  /** Time of alert start */
  alarmStartTime = null;
  /**
   * Der Klassen Konstruktor.
   *
   * @param options Optionen der Klasse
   */
  constructor(options = {}) {
    super({
      ...options,
      name: "alarmclock"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration.
   */
  async onReady() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    await (0, import_createstatesobjects.createStatesObjects)(this);
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
    {
      let state;
      state = await this.getStateAsync("schedule.monday");
      if (state && state.val !== "") {
        this.alarmStates[0] = this.checkValidTime((_a = state.val) == null ? void 0 : _a.toString(), this.alarmStates[0]);
      }
      state = await this.getStateAsync("schedule.tuesday");
      if (state && state.val !== "") {
        this.alarmStates[1] = this.checkValidTime((_b = state.val) == null ? void 0 : _b.toString(), this.alarmStates[1]);
      }
      state = await this.getStateAsync("schedule.wednesday");
      if (state && state.val !== "") {
        this.alarmStates[2] = this.checkValidTime((_c = state.val) == null ? void 0 : _c.toString(), this.alarmStates[2]);
      }
      state = await this.getStateAsync("schedule.thursday");
      if (state && state.val !== "") {
        this.alarmStates[3] = this.checkValidTime((_d = state.val) == null ? void 0 : _d.toString(), this.alarmStates[3]);
      }
      state = await this.getStateAsync("schedule.friday");
      if (state && state.val !== "") {
        this.alarmStates[4] = this.checkValidTime((_e = state.val) == null ? void 0 : _e.toString(), this.alarmStates[4]);
      }
      state = await this.getStateAsync("schedule.saturday");
      if (state && state.val !== "") {
        this.alarmStates[5] = this.checkValidTime((_f = state.val) == null ? void 0 : _f.toString(), this.alarmStates[5]);
      }
      state = await this.getStateAsync("schedule.sunday");
      if (state && state.val !== "") {
        this.alarmStates[6] = this.checkValidTime((_g = state.val) == null ? void 0 : _g.toString(), this.alarmStates[6]);
      }
      state = await this.getStateAsync("schedule.vacation");
      if (state && state.val !== "") {
        this.alarmStates[7] = this.checkValidTime((_h = state.val) == null ? void 0 : _h.toString(), this.alarmStates[7]);
      }
      state = await this.getStateAsync("schedule.holiday");
      if (state && state.val !== "") {
        this.alarmStates[8] = this.checkValidTime((_i = state.val) == null ? void 0 : _i.toString(), this.alarmStates[8]);
      }
      this.log.debug(`Alarm states: ${JSON.stringify(this.alarmStates)}`);
    }
    if (this.config.vocationInstance && this.config.vocationInstance !== "" && this.config.vocationEvents && this.config.vocationEvents.length > 0) {
      this.subscribeForeignStates(`${this.config.vocationInstance}.data.table`);
    }
    if (this.config.holidayInstance && this.config.holidayInstance !== "") {
      this.subscribeForeignStates(`${this.config.holidayInstance}.today.boolean`);
      this.subscribeForeignStates(`${this.config.holidayInstance}.tomorrow.boolean`);
    }
    if (this.config.appointmentInstance && this.config.appointmentInstance !== "" && this.config.appointmentEvents && this.config.appointmentEvents.length > 0) {
      this.subscribeForeignStates(`${this.config.appointmentInstance}.data.table`);
    }
    this.updateCountdownsInterval = this.setInterval(() => this.updateCountdowns(), import_constants.UPDATECOUNTDOWNSINTERVAL);
    this.updateSunriseInterval = this.setInterval(() => this.updateSunrise(), import_constants.UPDATESUNRISEINTERVAL);
    this.evaluateStateInterval = this.setInterval(() => this.evaluateState(), import_constants.EVALUATESTATEINTERVAL);
    await this.checkNewAlarmTime("onReady");
    await this.updateCountdowns();
    await this.updateSunrise(true);
    this.log.info("Adapter is ready and running.");
  }
  /**
   * Update the countdowns.
   */
  async updateCountdowns() {
    this.log.debug("updateCountdowns()");
    const now = /* @__PURE__ */ new Date();
    const nextAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextAlarm`);
    if (nextAlarm && (nextAlarm == null ? void 0 : nextAlarm.val) != null && (nextAlarm == null ? void 0 : nextAlarm.val) !== "") {
      let rest = new Date(nextAlarm.val.toString()).getTime() - now.getTime();
      if (rest < 0) {
        rest = 0;
      }
      this.log.debug(`Next alarm: ${nextAlarm.val}, rest: ${Math.floor(rest / 6e4)} s`);
      await this.setState(`${this.namespace}.runtime.countdownAlarm`, Math.floor(rest / 6e4), true);
    }
    const nextPreAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextPreAlarm`);
    if (nextPreAlarm && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) != null && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) !== "") {
      let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
      if (rest < 0) {
        rest = 0;
      }
      this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 6e4)} s`);
      await this.setState(`${this.namespace}.runtime.countdownPreAlarm`, Math.floor(rest / 6e4), true);
    }
    const snoozeUntil = await this.getStateAsync(`${this.namespace}.runtime.snoozeUntil`);
    if (snoozeUntil && (snoozeUntil == null ? void 0 : snoozeUntil.val) != null && (snoozeUntil == null ? void 0 : snoozeUntil.val) !== "") {
      let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
      if (rest < 0) {
        rest = 0;
      }
      this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 6e4)} s`);
      await this.setState(`${this.namespace}.runtime.countdownSnooze`, Math.floor(rest / 6e4), true);
    }
  }
  /**
   * Prüfung auf korrekte Uhrzeit
   *
   * @param time Uhrzeit im Format "HH:MM"
   * @param def Standardwert, der zurückgegeben wird, wenn die Uhrzeit ungültig ist
   * @returns Die überprüfte Uhrzeit im Format "HH:MM"
   */
  checkValidTime(time, def = "06:00") {
    if (time === void 0 || time === null || time.trim() === "") {
      this.log.warn(`Uhrzeit ist leer oder undefiniert, Standardwert wird verwendet: ${def}`);
      return def;
    }
    const isValidTime = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    if (isValidTime) {
      return time;
    }
    this.log.warn(`Ung\xFCltige Uhrzeit: ${time}`);
    return def;
  }
  /**
   * Setzten einer Uhrzeit der Weckzeit.
   *
   * @param date Die Weckzeit
   * @param time Uhrzeit im Format "HH:MM"
   */
  calcDateWithTime(date, time) {
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  /**
   * Prüfen und Setzten der Zeit des Weckers.
   *
   * @param name Der Grund der Aktualisierung
   */
  async checkNewAlarmTime(name = "") {
    var _a;
    this.log.debug(`checkNewAlarmTime(${name})`);
    const enabledState = await this.getStateAsync(`${this.namespace}.config.enabled`);
    if (enabledState && enabledState.val === true) {
      const now = /* @__PURE__ */ new Date();
      const alarm = /* @__PURE__ */ new Date();
      alarm.setHours(0, 0, 0, 0);
      this.checkWeekday(alarm);
      await this.checkVacationEvents(alarm, true);
      await this.checkHolidayEvents(alarm, true);
      await this.checkAppointmentEvents(alarm);
      if (alarm < now) {
        this.log.debug("Alarm is lower then now. Running calc of tomorrow");
        alarm.setDate(alarm.getDate() + 1);
        this.checkWeekday(alarm);
        await this.checkVacationEvents(alarm, false);
        await this.checkHolidayEvents(alarm, false);
        await this.checkAppointmentEvents(alarm);
      }
      this.log.info(`Set new alarm: ${alarm.toLocaleString()}`);
      const pre = new Date(alarm);
      const preAlarmMinutes = Number(
        ((_a = await this.getStateAsync(`${this.namespace}.config.preAlarmMinutes`)) == null ? void 0 : _a.val) || 0
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
   * Setzten des Weckers nach dem Wochentag.
   *
   * @param alert Die Weckzeit
   */
  checkWeekday(alert) {
    this.log.debug(`checkWeekday(${alert.toLocaleString()})`);
    this.calcDateWithTime(alert, this.alarmStates[alert.getDay()]);
    this.log.debug(`The alert date is ${alert.toLocaleDateString()}, time: ${this.alarmStates[alert.getDay()]}`);
  }
  /**
   * Überprüfung den Urlaubskalender.
   *
   * @param alert Die Weckzeit
   * @param today Prüfung des aktuellen Tags
   */
  async checkVacationEvents(alert, today = true) {
    var _a, _b;
    this.log.debug(`checkVacationEvents(${alert.toLocaleString()})`);
    if (this.config.vocationInstance && this.config.vocationInstance !== "" && this.config.vocationEvents && this.config.vocationEvents.length > 0) {
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
        if ((vacationState == null ? void 0 : vacationState.val) === true) {
          this.log.debug(`Vacation event '${event.name}' active`);
          const alarmState = await this.getStateAsync(`${this.namespace}.schedule.vacation`);
          if (alarmState == null ? void 0 : alarmState.val) {
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
        `vocation check disabled: ical=${this.config.vocationInstance}, events=${(_b = (_a = this.config.vocationEvents) == null ? void 0 : _a.length) != null ? _b : 0}`
      );
    }
  }
  /**
   * Überprüfe den Feiertagskalender.
   *
   * @param alert Die Weckzeit
   * @param today Prüfung des aktuellen Tags
   */
  async checkHolidayEvents(alert, today = true) {
    this.log.debug(`checkHolidayEvents(${alert.toLocaleString()})`);
    if (this.config.holidayInstance && this.config.holidayInstance !== "") {
      let key = "today";
      if (!today) {
        key = "tomorrow";
      }
      const holidayState = await this.getForeignStateAsync(`${this.config.holidayInstance}.${key}.boolean`);
      this.log.debug(`holiday check result: ${JSON.stringify(holidayState)}`);
      if ((holidayState == null ? void 0 : holidayState.val) === true) {
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
  async checkAppointmentEvents(alert) {
    var _a, _b;
    this.log.debug(`checkAppointmentEvents(${alert.toLocaleString()})`);
    if (this.config.appointmentInstance && this.config.appointmentInstance !== "" && this.config.appointmentEvents && this.config.appointmentEvents.length > 0) {
      const date = alert.toISOString().slice(0, 10);
      const events = await this.getForeignStateAsync(`${this.config.appointmentInstance}.data.table`);
      if (events && events.val !== "") {
        const calendarEvents = JSON.parse(events.val);
        for (const event of this.config.appointmentEvents) {
          if (!event.name || !event.enabled) {
            continue;
          }
          this.log.debug(`Appointment check: ${event.name}`);
          const eintrag = calendarEvents.find((e) => e.event === event.name && e._date.startsWith(date));
          if (eintrag !== void 0) {
            this.log.debug(`Appointment ${event.name} active`);
            this.calcDateWithTime(alert, new Date(eintrag._date).toTimeString().slice(0, 5));
            break;
          }
        }
      }
    } else {
      this.log.info(
        `appointment check disabled: ical=${this.config.appointmentInstance}, events=${(_b = (_a = this.config.appointmentEvents) == null ? void 0 : _a.length) != null ? _b : 0}`
      );
    }
  }
  /**
   * Berechnen der Helligkeit des Lichtweckers.
   *
   * @param force Aktualisierung erzwingen
   */
  async updateSunrise(force = false) {
    this.log.debug(`updateSunrise(${force})`);
    const state = await this.getStateAsync("runtime.state");
    if ((state == null ? void 0 : state.val) !== import_constants.STATE.PREALARM && !force) {
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
      let progress = elapsed / total * 100;
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
  async incrementStat(key) {
    var _a;
    this.log.debug(`incrementStat(${key})`);
    const value = Number(((_a = await this.getStateAsync(`statistics.${key}`)) == null ? void 0 : _a.val) || 0);
    await this.setState(`statistics.${key}`, value + 1, true);
  }
  /**
   * Setzten des Status des Weckers.
   *
   * @param state Der Status des Weckers
   */
  async handleState(state) {
    switch (state) {
      case import_constants.STATE.DISABLED:
        break;
      case import_constants.STATE.ARMED:
        await this.updateCountdowns();
        break;
      case import_constants.STATE.PREALARM:
        await this.startPreAlarm();
        break;
      case import_constants.STATE.TRIGGERED:
        await this.startAlarm();
        break;
      case import_constants.STATE.SNOOZE:
        await this.updateCountdowns();
        break;
      case import_constants.STATE.STOPPED:
        await this.stopAlarm();
        this.setAlarmState(import_constants.STATE.ARMED);
        await this.updateCountdowns();
        break;
      case import_constants.STATE.ERROR:
        await this.incrementStat("errorCount");
        break;
    }
  }
  /**
   * Ausführen des Pre-Alarms.
   */
  async startPreAlarm() {
    this.log.debug("startPreAlarm()");
    await this.incrementStat("preAlarmCount");
    await this.updateSunrise(true);
    this.log.info("PREALARM");
  }
  /**
   * Ausführen des Alarms.
   */
  async startAlarm() {
    this.log.debug(`startAlarm()`);
    if (!this.alarmStartTime) {
      this.alarmStartTime = Date.now();
    }
    await this.incrementStat("alarmCount");
    await this.setState("runtime.active", true, true);
    this.log.info("ALARM");
  }
  /**
   * Stoppen des Alarms
   */
  async stopAlarm() {
    this.log.debug(`stopAlarm()`);
    await this.incrementStat("stopCount");
    if (this.alarmStartTime) {
      const wakeDelay = Math.round((Date.now() - this.alarmStartTime) / 6e4);
      await this.setState(`statistics.wakeDelay`, wakeDelay, true);
    }
    await this.setState(`runtime.active`, false, true);
    this.setAlarmState(import_constants.STATE.STOPPED);
  }
  /**
   * Setzten des Status des Weckers.
   *
   * @param newState Der neue Status des Weckers
   */
  setAlarmState(newState) {
    this.log.debug(`setAlarmState(${newState})`);
    this.getState("runtime.state", async (_err, oldState) => {
      if ((oldState == null ? void 0 : oldState.val) === newState) {
        return;
      }
      await this.setState("runtime.state", newState, true);
      this.log.debug(`${oldState == null ? void 0 : oldState.val} -> ${newState}`);
      await this.handleState(newState);
    });
  }
  /**
   * Überprüfen des Status des Weckers.
   */
  async evaluateState() {
    try {
      const now = Date.now();
      const state = await this.getStateAsync("runtime.state");
      const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
      const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
      const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
      const skip = await this.getStateAsync("action.skipNext");
      if ((state == null ? void 0 : state.val) === import_constants.STATE.SNOOZE && (snoozeUntil == null ? void 0 : snoozeUntil.val) && now >= new Date(String(snoozeUntil.val)).getTime() && !skip) {
        this.setAlarmState(import_constants.STATE.TRIGGERED);
        return;
      }
      if ((state == null ? void 0 : state.val) === import_constants.STATE.ARMED && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) && now >= new Date(String(nextPreAlarm.val)).getTime() && !skip) {
        this.setAlarmState(import_constants.STATE.PREALARM);
        return;
      }
      if (((state == null ? void 0 : state.val) === import_constants.STATE.ARMED || (state == null ? void 0 : state.val) === import_constants.STATE.PREALARM) && (nextAlarm == null ? void 0 : nextAlarm.val) && now >= new Date(String(nextAlarm.val)).getTime() && !skip) {
        this.setAlarmState(import_constants.STATE.TRIGGERED);
      }
    } catch (e) {
      console.error(e);
      this.setAlarmState(import_constants.STATE.ERROR);
    }
  }
  /**
   * Aktiviren des Schlummer-Modus.
   */
  activateSnooze() {
    this.log.debug("activateSnooze()");
    this.getState("runtime.state", (_err, state) => {
      if ((state == null ? void 0 : state.val) === import_constants.STATE.TRIGGERED || (state == null ? void 0 : state.val) === import_constants.STATE.PREALARM) {
        this.getState("config.snoozeMinutes", async (_err2, mins) => {
          const until = new Date(Date.now() + Number(mins == null ? void 0 : mins.val) * 6e4);
          await this.setState("runtime.snoozeUntil", until.toISOString(), true);
          await this.incrementStat("snoozeCount");
          this.setAlarmState(import_constants.STATE.SNOOZE);
        });
      }
    });
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param callback Callback function
   */
  onUnload(callback) {
    try {
      this.clearInterval(this.updateCountdownsInterval);
      this.clearInterval(this.updateSunriseInterval);
      this.clearInterval(this.evaluateStateInterval);
      callback();
    } catch (error) {
      this.log.error(`Error during unloading: ${error.message}`);
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
  async checkStateUpdateNewAlarmTime(id, state) {
    var _a;
    if (id < 0 && id > 8) {
      throw new Error(`Ung\xFCltige Alarm-ID: ${id}`);
    }
    let key = "";
    switch (id) {
      case 0:
        key = "monday";
        break;
      case 1:
        key = "tuesday";
        break;
      case 2:
        key = "wednesday";
        break;
      case 3:
        key = "thursday";
        break;
      case 4:
        key = "friday";
        break;
      case 5:
        key = "saturday";
        break;
      case 6:
        key = "sunday";
        break;
      case 7:
        key = "vacation";
        break;
      case 8:
        key = "holiday";
        break;
    }
    if (key === "") {
      this.log.error(`Es konnte kein Sch\xFCssel f\xFCr '${id}' gefunden werden.`);
      return;
    }
    if (state.ack === false) {
      this.log.debug(`New wake-up time for ${key}: ${state.val}`);
      this.alarmStates[id] = this.checkValidTime((_a = state.val) == null ? void 0 : _a.toString(), this.alarmStates[id]);
      await this.setState(`schedule.${key}`, {
        val: this.alarmStates[id],
        ack: true
      });
    } else {
      await this.checkNewAlarmTime(`schedule.${key}`);
    }
  }
  /**
   * Is called if a subscribed state changes.
   *
   * @param id State ID
   * @param state State object
   */
  async onStateChange(id, state) {
    if (state) {
      this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
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
            this.setAlarmState(import_constants.STATE.STOPPED);
            await this.setState("action.stop", { val: false, ack: true });
          }
          break;
        case `${this.namespace}.config.enabled`:
          if (state.val) {
            this.setAlarmState(import_constants.STATE.ARMED);
          } else {
            this.setAlarmState(import_constants.STATE.DISABLED);
          }
          await this.checkNewAlarmTime("config.enabled");
          break;
        default:
          this.log.warn(`id not known: ${id}`);
      }
    } else {
      this.log.debug(`state ${id} deleted`);
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Alarmclock(options);
} else {
  (() => new Alarmclock())();
}
//# sourceMappingURL=main.js.map
