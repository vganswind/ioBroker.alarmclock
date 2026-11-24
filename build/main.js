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
    if (!this.config.mqttTopic || this.config.mqttTopic === "") {
      this.config.mqttTopic = this.namespace;
    }
    for (let i = 0; i <= 8; i++) {
      await this.readAlarmTime(i);
    }
    this.log.debug(`Alarm states: ${JSON.stringify(this.alarmStates)}`);
    if (this.config.vacationInstance && this.config.vacationInstance !== "" && this.config.vacationEvents && this.config.vacationEvents.length > 0) {
      this.subscribeForeignStates(`${this.config.vacationInstance}.data.table`);
    }
    if (this.config.holidayInstance && this.config.holidayInstance !== "") {
      this.subscribeForeignStates(`${this.config.holidayInstance}.today.boolean`);
      this.subscribeForeignStates(`${this.config.holidayInstance}.tomorrow.boolean`);
    }
    if (this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
      this.subscribeForeignStates(`${this.config.publicHolidaysInstance}.today.isHoliday`);
      this.subscribeForeignStates(`${this.config.publicHolidaysInstance}.tomorrow.isHoliday`);
    }
    if (this.config.appointmentInstance && this.config.appointmentInstance !== "" && this.config.appointmentEvents && this.config.appointmentEvents.length > 0) {
      this.subscribeForeignStates(`${this.config.appointmentInstance}.data.table`);
    }
    if (this.config.mqttInstance && this.config.mqttInstance !== "" && this.config.mqttTopic && this.config.mqttTopic !== "") {
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
    }
    this.updateCountdownsInterval = this.setInterval(() => this.updateCountdowns(), import_constants.UPDATECOUNTDOWNSINTERVAL);
    this.updateSunriseInterval = this.setInterval(() => this.updateSunrise(), import_constants.UPDATESUNRISEINTERVAL);
    this.evaluateStateInterval = this.setInterval(() => this.evaluateState(), import_constants.EVALUATESTATEINTERVAL);
    await this.checkNewAlarmTime("onReady");
    await this.updateCountdowns();
    await this.updateSunrise(true);
    if (!this.config.maxWakeDelayHistory || this.config.maxWakeDelayHistory < 7) {
      this.config.maxWakeDelayHistory = 30;
    }
    this.log.info("Adapter is ready and running.");
  }
  /**
   * Update the countdowns.
   */
  async updateCountdowns() {
    this.log.debug("updateCountdowns()");
    const now = /* @__PURE__ */ new Date();
    const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
    if (nextAlarm && (nextAlarm == null ? void 0 : nextAlarm.val) != null && (nextAlarm == null ? void 0 : nextAlarm.val) !== "") {
      let rest = new Date(nextAlarm.val.toString()).getTime() - now.getTime();
      if (rest < 0) {
        rest = 0;
      }
      this.log.debug(`Next alarm: ${nextAlarm.val}, rest: ${Math.floor(rest / 6e4)} min`);
      await this.setState("runtime.countdownAlarm", Math.floor(rest / 6e4), true);
      this.sendToMqtt("runtime.countdownAlarm", Math.floor(rest / 6e4));
      await this.setState("runtime.countdownAlarmText", this.formatMinutes2TimeString(rest / 6e4), true);
      this.sendToMqtt("runtime.countdownAlarmText", this.formatMinutes2TimeString(rest / 6e4));
    }
    const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
    if (nextPreAlarm && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) != null && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) !== "") {
      let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
      if (rest < 0) {
        rest = 0;
      }
      this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 6e4)} min`);
      await this.setState("runtime.countdownPreAlarm", Math.floor(rest / 6e4), true);
      this.sendToMqtt("runtime.countdownPreAlarm", Math.floor(rest / 6e4));
      await this.setState("runtime.countdownPreAlarmText", this.formatMinutes2TimeString(rest / 6e4), true);
      this.sendToMqtt("runtime.countdownPreAlarmText", this.formatMinutes2TimeString(rest / 6e4));
    }
    const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
    if (snoozeUntil && (snoozeUntil == null ? void 0 : snoozeUntil.val) != null && (snoozeUntil == null ? void 0 : snoozeUntil.val) !== "") {
      let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
      if (rest < 0) {
        rest = 0;
      }
      this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 6e4)} min`);
      await this.setState("runtime.countdownSnooze", Math.floor(rest / 6e4), true);
      this.sendToMqtt("runtime.countdownSnooze", Math.floor(rest / 6e4));
      await this.setState("runtime.countdownSnoozeText", this.formatMinutes2TimeString(rest / 6e4), true);
      this.sendToMqtt("runtime.countdownSnoozeText", this.formatMinutes2TimeString(rest / 6e4));
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
    const enabledState = await this.getStateAsync("config.enabled");
    if (enabledState && enabledState.val === true) {
      const now = /* @__PURE__ */ new Date();
      const alarm = /* @__PURE__ */ new Date();
      alarm.setHours(0, 0, 0, 0);
      this.checkWeekday(alarm);
      await this.checkVacationEvents(alarm, true);
      await this.checkHolidayEvents(alarm, true);
      await this.checkPublicHolidayEvents(alarm, true);
      await this.checkAppointmentEvents(alarm);
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
      const pre = new Date(alarm);
      const preAlarmMinutes = Number(((_a = await this.getStateAsync("config.preAlarmMinutes")) == null ? void 0 : _a.val) || 0);
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
  checkWeekday(alert) {
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
  async checkVacationEvents(alert, today = true) {
    this.log.debug(`checkVacationEvents(${alert.toLocaleString()})`);
    if (this.config.vacationInstance && this.config.vacationInstance !== "" && this.config.vacationEvents && this.config.vacationEvents.length > 0) {
      for (const event of this.config.vacationEvents) {
        if (!event.name || !event.enabled) {
          continue;
        }
        let key = "events.0.today";
        if (!today) {
          key = "events.1";
        }
        const vacationState = await this.getForeignStateAsync(
          `${this.config.vacationInstance}.${key}.${event.name}`
        );
        this.log.debug(`vacation check result: ${JSON.stringify(vacationState)}`);
        if ((vacationState == null ? void 0 : vacationState.val) === true) {
          this.log.debug(`Vacation event '${event.name}' active`);
          const alarmState = await this.getStateAsync("schedule.vacation");
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
      this.log.debug("vacation check disabled");
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
  async checkPublicHolidayEvents(alert, today = true) {
    this.log.debug(`checkPublicHolidayEvents(${alert.toLocaleString()})`);
    if (this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
      let key = "today";
      if (!today) {
        key = "tomorrow";
      }
      const holidayState = await this.getForeignStateAsync(
        `${this.config.publicHolidaysInstance}.${key}.isHoliday`
      );
      this.log.debug(`holiday check result: ${JSON.stringify(holidayState)}`);
      if ((holidayState == null ? void 0 : holidayState.val) === true) {
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
  async checkAppointmentEvents(alert) {
    this.log.debug(`checkAppointmentEvents(${alert.toLocaleString()})`);
    if (this.config.appointmentInstance && this.config.appointmentInstance !== "" && this.config.appointmentEvents && this.config.appointmentEvents.length > 0) {
      const date = alert.toISOString().slice(0, 10);
      const events = await this.getForeignStateAsync(`${this.config.appointmentInstance}.data.table`);
      if (events && events.val !== "") {
        try {
          const calendarEvents = JSON.parse(events.val);
          for (const event of this.config.appointmentEvents) {
            if (!event.name || !event.enabled) {
              continue;
            }
            this.log.debug(`Appointment check: ${event.name}`);
            const eintrag = calendarEvents.find(
              (e) => e.event === event.name && e._date.startsWith(date)
            );
            if (eintrag !== void 0) {
              this.log.debug(`Appointment ${event.name} active`);
              this.calcDateWithTime(alert, new Date(eintrag._date).toTimeString().slice(0, 5));
              break;
            }
          }
        } catch (error) {
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
      this.sendToMqtt("runtime.sunriseBrightness", Math.round(progress));
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
    this.sendToMqtt(`statistics.${key}`, value + 1);
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
        await this.checkNewAlarmTime("STATE.ARMED");
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
        await this.setAlarmState(import_constants.STATE.ARMED);
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
      await this.setState("statistics.lastAlarm", (/* @__PURE__ */ new Date()).toISOString(), true);
      this.sendToMqtt("statistics.lastAlarm", (/* @__PURE__ */ new Date()).toLocaleString());
    }
    await this.incrementStat("alarmCount");
    await this.setState("runtime.active", true, true);
    this.sendToMqtt("runtime.active", true);
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
      await this.setState("statistics.lastWakeup", (/* @__PURE__ */ new Date()).toISOString(), true);
      this.sendToMqtt("statistics.lastWakeup", (/* @__PURE__ */ new Date()).toLocaleString());
      let history = [];
      const historyState = await this.getStateAsync("statistics.wakeDelayHistory");
      if (historyState == null ? void 0 : historyState.val) {
        try {
          history = JSON.parse(historyState.val.toString());
          if (!Array.isArray(history)) {
            history = [];
          }
          history = history.filter((value) => typeof value === "number" && value >= 0);
        } catch {
          history = [];
        }
      }
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
    await this.setAlarmState(import_constants.STATE.STOPPED);
  }
  /**
   * Setzten des Status des Weckers.
   *
   * @param newState Der neue Status des Weckers
   */
  async setAlarmState(newState) {
    this.log.debug(`setAlarmState(${newState})`);
    const oldState = await this.getStateAsync("runtime.state");
    if ((oldState == null ? void 0 : oldState.val) === newState) {
      return;
    }
    await this.setState("runtime.state", newState, true);
    this.sendToMqtt("runtime.state", newState);
    this.log.debug(`${oldState == null ? void 0 : oldState.val} -> ${newState}`);
    await this.handleState(newState);
  }
  /**
   * Überprüfen des Status des Weckers.
   */
  async evaluateState() {
    var _a;
    try {
      const now = Date.now();
      const state = await this.getStateAsync("runtime.state");
      const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
      const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
      const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
      const skip = ((_a = await this.getStateAsync("config.skipNext")) == null ? void 0 : _a.val) === true;
      if ((state == null ? void 0 : state.val) === import_constants.STATE.SNOOZE && (snoozeUntil == null ? void 0 : snoozeUntil.val) && now >= new Date(String(snoozeUntil.val)).getTime() && !skip) {
        await this.setAlarmState(import_constants.STATE.TRIGGERED);
        return;
      }
      if ((state == null ? void 0 : state.val) === import_constants.STATE.ARMED && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) && now >= new Date(String(nextPreAlarm.val)).getTime() && !skip) {
        await this.setAlarmState(import_constants.STATE.PREALARM);
        return;
      }
      if (((state == null ? void 0 : state.val) === import_constants.STATE.ARMED || (state == null ? void 0 : state.val) === import_constants.STATE.PREALARM) && (nextAlarm == null ? void 0 : nextAlarm.val) && now >= new Date(String(nextAlarm.val)).getTime() && !skip) {
        await this.setAlarmState(import_constants.STATE.TRIGGERED);
      }
    } catch (e) {
      console.error(e);
      await this.setAlarmState(import_constants.STATE.ERROR);
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
          this.sendToMqtt("runtime.snoozeUntil", until.toLocaleString());
          await this.incrementStat("snoozeCount");
          await this.setAlarmState(import_constants.STATE.SNOOZE);
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
    this.log.debug(`checkStateUpdateNewAlarmTime(${id}, ${JSON.stringify(state)})`);
    if (id < 0 || id > 8) {
      throw new Error(`Ung\xFCltige Alarm-ID: ${id}`);
    }
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "vacation",
      "holiday"
    ];
    if (state.ack === false) {
      this.log.debug(`New wake-up time for ${days[id]}: ${state.val}`);
      this.alarmStates[id] = this.checkValidTime((_a = state.val) == null ? void 0 : _a.toString(), this.alarmStates[id]);
      await this.setState(`schedule.${days[id]}`, this.alarmStates[id], true);
      this.sendToMqtt(`schedule.${days[id]}`, this.alarmStates[id]);
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
  async readAlarmTime(id) {
    var _a;
    this.log.debug(`readAlarmTime(${id})`);
    if (id < 0 || id > 8) {
      throw new Error(`Ung\xFCltige Alarm-ID: ${id}`);
    }
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "vacation",
      "holiday"
    ];
    const state = await this.getStateAsync(`schedule.${days[id]}`);
    if (state && state.val !== "") {
      this.alarmStates[id] = this.checkValidTime((_a = state.val) == null ? void 0 : _a.toString(), this.alarmStates[id]);
      this.sendToMqtt(`schedule.${days[id]}`, this.alarmStates[id]);
    }
  }
  /**
   * Formatieren eines Zeitwerts anhand der Minuten.
   *
   * @param min Die Minutenanzahl
   * @returns Der Formatierte Zeitwert (HH:mm)
   */
  formatMinutes2TimeString(min) {
    if (typeof min !== "number" || isNaN(min)) {
      throw new Error("Input must be a valid number.");
    }
    const sec = Math.abs(min) * 60;
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor(sec % 3600 / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  /**
   * onStateChange des AlarmClock-Adapters.
   *
   * @param id State ID
   * @param state State object
   * @returns Ob die State-ID gefunden wurde
   */
  async onAlarmClockStateChange(id, state) {
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
          await this.setState("action.snooze", false, true);
        }
        break;
      case `${this.namespace}.action.stop`:
        if (state.ack === false) {
          await this.setAlarmState(import_constants.STATE.STOPPED);
          await this.setState("action.stop", false, true);
        }
        break;
      case `${this.namespace}.config.enabled`:
        if (state.val) {
          await this.setAlarmState(import_constants.STATE.ARMED);
        } else {
          await this.setAlarmState(import_constants.STATE.DISABLED);
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
  async onHolidayStateChange(id, state) {
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
  async onPublicHolidayStateChange(id, state) {
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
  async onVacationStateChange(id, state) {
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
  async onAppointmentStateChange(id, state) {
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
  async onMqttBrokerStateChange(id, state) {
    this.log.debug(`onMqttBrokerStateChange: ${id} changed: ${state.val} (ack = ${state.ack})`);
    const key = `${this.config.mqttInstance}.${this.config.mqttTopic}`.replaceAll("/", ".");
    let found = true;
    const mqttState = {
      ...state,
      ack: false
    };
    switch (id) {
      case `${key}.action.monday`:
        await this.checkStateUpdateNewAlarmTime(0, mqttState);
        break;
      case `${key}.action.tuesday`:
        await this.checkStateUpdateNewAlarmTime(1, mqttState);
        break;
      case `${key}.action.wednesday`:
        await this.checkStateUpdateNewAlarmTime(2, mqttState);
        break;
      case `${key}.action.thursday`:
        await this.checkStateUpdateNewAlarmTime(3, mqttState);
        break;
      case `${key}.action.friday`:
        await this.checkStateUpdateNewAlarmTime(4, mqttState);
        break;
      case `${key}.action.saturday`:
        await this.checkStateUpdateNewAlarmTime(5, mqttState);
        break;
      case `${key}.action.sunday`:
        await this.checkStateUpdateNewAlarmTime(6, mqttState);
        break;
      case `${key}.action.vacation`:
        await this.checkStateUpdateNewAlarmTime(7, mqttState);
        break;
      case `${key}.action.holiday`:
        await this.checkStateUpdateNewAlarmTime(8, mqttState);
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
  sendToMqtt(key, msg) {
    this.log.debug(`sentToMqtt(${this.config.mqttTopic}.${key}, ${msg})`);
    if (this.config.mqttInstance && this.config.mqttInstance !== "") {
      this.sendTo(this.config.mqttInstance, "sendMessage2Client", {
        topic: `${this.config.mqttTopic}.${key}`.replaceAll(".", "/"),
        message: msg,
        retain: false
      });
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
      let found = false;
      if (await this.onAlarmClockStateChange(id, state)) {
        found = true;
      }
      if (!found && this.config.holidayInstance && this.config.holidayInstance !== "") {
        if (await this.onHolidayStateChange(id, state)) {
          found = true;
        }
      }
      if (!found && this.config.publicHolidaysInstance && this.config.publicHolidaysInstance !== "") {
        if (await this.onPublicHolidayStateChange(id, state)) {
          found = true;
        }
      }
      if (!found && this.config.vacationInstance && this.config.vacationInstance !== "") {
        if (await this.onVacationStateChange(id, state)) {
          found = true;
        }
      }
      if (!found && this.config.appointmentInstance && this.config.appointmentInstance !== "") {
        if (await this.onAppointmentStateChange(id, state)) {
          found = true;
        }
      }
      if (!found && this.config.mqttInstance && this.config.mqttInstance !== "") {
        if (await this.onMqttBrokerStateChange(id, state)) {
          found = true;
        }
      }
      if (!found) {
        this.log.warn(`state id not known: ${id}`);
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
