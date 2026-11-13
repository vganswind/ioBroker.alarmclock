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
const UPDATECOUNTDOWNSINTERVAL = 3e4;
const UPDATESUNRISEINTERVAL = 3e4;
const EVALUATESTATEINTERVAL = 1e4;
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
  ERROR: "ERROR"
};
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
    this.log.debug("config option1: ${this.config.option1}");
    this.log.debug("config option2: ${this.config.option2}");
    await this.setObjectNotExistsAsync("action", {
      type: "channel",
      common: {
        name: {
          de: "Befehle",
          en: "Commands"
        }
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("action.snooze", {
      type: "state",
      common: {
        name: {
          de: "Alarm pausieren",
          en: "Pause alarm"
        },
        type: "boolean",
        role: "button",
        read: false,
        write: true,
        def: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("action.stop", {
      type: "state",
      common: {
        name: {
          de: "Alarm beenden",
          en: "Stop alarm"
        },
        type: "boolean",
        role: "button",
        read: false,
        write: true,
        def: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("config", {
      type: "channel",
      common: {
        name: {
          de: "Konfiguration",
          en: "Configuration"
        }
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("config.enabled", {
      type: "state",
      common: {
        name: {
          de: "Alarm aktiviert",
          en: "Alarm enabled"
        },
        type: "boolean",
        role: "switch.enable",
        read: true,
        write: true,
        def: true
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("config.preAlarmMinutes", {
      type: "state",
      common: {
        name: {
          de: "Vorwarnzeit in Minuten",
          en: "Pre-alarm time in minutes"
        },
        type: "number",
        role: "value",
        read: true,
        write: true,
        def: 20,
        unit: "minutes"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("config.skipNext", {
      type: "state",
      common: {
        name: {
          de: "Alarm \xFCberspringen",
          en: "Ignore alarm"
        },
        type: "boolean",
        role: "switch.enable",
        read: true,
        write: true,
        def: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("config.snoozeMinutes", {
      type: "state",
      common: {
        name: {
          de: "Schlummerzeit in Minuten",
          en: "Snooze time in minutes"
        },
        type: "number",
        role: "value",
        read: true,
        write: true,
        def: 10,
        unit: "minutes"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime", {
      type: "channel",
      common: {
        name: {
          de: "Laufzeitwerte",
          en: "Runtime values"
        }
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.countdownAlarm", {
      type: "state",
      common: {
        name: {
          de: "Laufzeit bis zum Alarm",
          en: "Countdown to alarm"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0,
        unit: "minutes"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.active", {
      type: "state",
      common: {
        name: {
          de: "Alarm ist aktiv",
          en: "Alarm is active"
        },
        type: "boolean",
        role: "indicator.activity",
        read: true,
        write: false,
        def: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.countdownPreAlarm", {
      type: "state",
      common: {
        name: {
          de: "Laufzeit bis zum Voralarm",
          en: "Countdown to pre-alarm"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0,
        unit: "minutes"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.countdownSnooze", {
      type: "state",
      common: {
        name: {
          de: "Countdown bis zum Ende der Schlummerfunktion",
          en: "Countdown to end snooze"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0,
        unit: "minutes"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.nextAlarm", {
      type: "state",
      common: {
        name: {
          de: "N\xE4chster Alarm",
          en: "Next alarm"
        },
        type: "string",
        role: "value.time",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.nextPreAlarm", {
      type: "state",
      common: {
        name: {
          de: "N\xE4chster Voralarm",
          en: "Next pre-alarm"
        },
        type: "string",
        role: "value.time",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.snoozeUntil", {
      type: "state",
      common: {
        name: {
          de: "Snooze bis",
          en: "Snooze until"
        },
        type: "string",
        role: "value.time",
        read: true,
        write: false,
        def: ""
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.state", {
      type: "state",
      common: {
        name: {
          de: "Zustand",
          en: "State"
        },
        type: "string",
        role: "indicator.status",
        read: true,
        write: false,
        states: Object.values(STATE),
        def: STATE.DISABLED
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.sunriseBrightness", {
      type: "state",
      common: {
        name: {
          de: "Lichtwecker Helligkeit",
          en: "Light alarm clock brightness"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0,
        unit: "%"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("runtime.sunriseProgress", {
      type: "state",
      common: {
        name: {
          de: "Lichtwecker Fortschritt",
          en: "Light alarm clock progress"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0,
        unit: "%"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule", {
      type: "channel",
      common: {
        name: {
          de: "Weckzeiten",
          en: "Wake-up times"
        }
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.monday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Montag",
          en: "Wake-up time on Monday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "06:00"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.tuesday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Dienstag",
          en: "Wake-up time on Tuesday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "06:00"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.wednesday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Mittwoch",
          en: "Wake-up time on Wednesday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "06:00"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.thursday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Donnerstag",
          en: "Wake-up time on Thursday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "06:00"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.friday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Freitag",
          en: "Wake-up time on Friday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "06:00"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.saturday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Samstag",
          en: "Wake-up time on Saturday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "08:00"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.sunday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit am Sonntag",
          en: "Wake-up time on Sunday"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "08:30"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.vacation", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit im Urlaub",
          en: "Wake-up time on vacation"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "10:30"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("schedule.holiday", {
      type: "state",
      common: {
        name: {
          de: "Weckzeit an Feiertagen",
          en: "Wake-up time on holidays"
        },
        type: "string",
        role: "text",
        read: true,
        write: true,
        def: "09:30"
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics", {
      type: "channel",
      common: {
        name: {
          de: "Statistiken",
          en: "Statistics"
        }
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics.alarmCount", {
      type: "state",
      common: {
        name: {
          de: "Anzahl der Wecker",
          en: "Number of alarms"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics.preAlarmCount", {
      type: "state",
      common: {
        name: {
          de: "Anzahl der Voralarme",
          en: "Number of pre-alarms"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics.snoozeCount", {
      type: "state",
      common: {
        name: {
          de: "Anzahl der Schlummerzeit",
          en: "Number of snoozes"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics.stopCount", {
      type: "state",
      common: {
        name: {
          de: "Anzahl der Stopp-Vorg\xE4nge",
          en: "Number of stop actions"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics.errorCount", {
      type: "state",
      common: {
        name: {
          de: "Anzahl der Fehler",
          en: "Number of errors"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("statistics.wakeDelay", {
      type: "state",
      common: {
        name: {
          de: "Aufwachverz\xF6gerung",
          en: "Wake delay"
        },
        type: "number",
        role: "value",
        read: true,
        write: false,
        def: 0,
        unit: "minutes"
      },
      native: {}
    });
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
    await this.setState("testVariable", true);
    await this.setState("testVariable", { val: true, ack: true });
    await this.setState("testVariable", { val: true, ack: true, expire: 30 });
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
  async updateCountdowns() {
    this.log.debug("Updating countdowns...");
    const now = /* @__PURE__ */ new Date();
    const nextAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextAlarm`);
    if (nextAlarm && (nextAlarm == null ? void 0 : nextAlarm.val) != null && (nextAlarm == null ? void 0 : nextAlarm.val) !== "") {
      let rest = new Date(nextAlarm.val.toString()).getTime() - now.getTime();
      if (rest < 0) rest = 0;
      this.log.debug(`Next alarm: ${nextAlarm.val}, rest: ${Math.floor(rest / 6e4)} s`);
      this.setState(`${this.namespace}.runtime.countdownAlarm`, Math.floor(rest / 6e4), true);
    }
    const nextPreAlarm = await this.getStateAsync(`${this.namespace}.runtime.nextPreAlarm`);
    if (nextPreAlarm && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) != null && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) !== "") {
      let rest = new Date(nextPreAlarm.val.toString()).getTime() - now.getTime();
      if (rest < 0) rest = 0;
      this.log.debug(`Next pre-alarm: ${nextPreAlarm.val}, rest: ${Math.floor(rest / 6e4)} s`);
      this.setState(`${this.namespace}.runtime.countdownPreAlarm`, Math.floor(rest / 6e4), true);
    }
    const snoozeUntil = await this.getStateAsync(`${this.namespace}.runtime.snoozeUntil`);
    if (snoozeUntil && (snoozeUntil == null ? void 0 : snoozeUntil.val) != null && (snoozeUntil == null ? void 0 : snoozeUntil.val) !== "") {
      let rest = new Date(snoozeUntil.val.toString()).getTime() - now.getTime();
      if (rest < 0) rest = 0;
      this.log.debug(`Snooze until: ${snoozeUntil.val}, rest: ${Math.floor(rest / 6e4)} s`);
      this.setState(`${this.namespace}.runtime.countdownSnooze`, Math.floor(rest / 6e4), true);
    }
  }
  /**
   * Prüfung auf korrekte Uhrzeit
   *
   * @param time - Uhrzeit im Format "HH:MM"
   * @param def - Standardwert, der zurückgegeben wird, wenn die Uhrzeit ungültig ist
   */
  checkValidTime(time, def = "06:00") {
    this.log.debug(`checkValidTime: ${time}`);
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
   * Prüfen und Setzten er Zeit des Weckers.
   *
   * @param [name=""] Der Grund der Aktualisierung
   */
  async checkNewAlarmTime(name = "") {
    var _a;
    this.log.debug(`checkNewAlarmTime(${name})`);
    const enabledState = await this.getStateAsync(`${this.namespace}.config.enabled`);
    if (enabledState && enabledState.val === true) {
      const now = /* @__PURE__ */ new Date();
      const alarm = /* @__PURE__ */ new Date();
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
        ((_a = await this.getStateAsync(`${this.namespace}.config.preAlarmMinutes`)) == null ? void 0 : _a.val) || 0
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
  async checkWeekday(alert) {
    this.log.debug(`checkWeekday(${alert.toLocaleString()})`);
    let key = "unknown";
    switch (alert.getDay()) {
      case 0:
        key = "schedule.sunday";
        break;
      case 1:
        key = "schedule.monday";
        break;
      case 2:
        key = "schedule.tuesday";
        break;
      case 3:
        key = "schedule.wednesday";
        break;
      case 4:
        key = "schedule.thursday";
        break;
      case 5:
        key = "schedule.friday";
        break;
      case 6:
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
   * @param [today=true] Prüfung des aktuellen Tags
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
   * Überprüfung den Weckerkalender
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
   * @param force Aktualisirung erzwingen
   */
  async updateSunrise(force = false) {
    this.log.debug(`updateSunrise(${force})`);
    const state = await this.getStateAsync("runtime.state");
    if ((state == null ? void 0 : state.val) !== STATE.PREALARM && !force) {
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
      this.setState("runtime.sunriseProgress", progress, true);
      this.setState("runtime.sunriseBrightness", Math.round(progress), true);
    }
  }
  /**
   * Erhöhe den Zählerwert.
   *
   * @param key Der Name des Wertes
   */
  incrementStat(key) {
    this.log.debug(`incrementStat(${key})`);
    this.getState(`statistics.${key}`, (_err, state) => {
      const value = Number(state == null ? void 0 : state.val) || 0;
      this.setState(`statistics.${key}`, value + 1, true);
    });
  }
  handleState(state) {
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
  startPreAlarm() {
    this.log.debug("startPreAlarm()");
    this.incrementStat("preAlarmCount");
    this.updateSunrise(true);
    this.log.info("PREALARM");
  }
  startAlarm() {
    this.log.debug(`startAlarm()`);
    if (!this.alarmStartTime) {
      this.alarmStartTime = Date.now();
    }
    this.incrementStat("alarmCount");
    this.setState("runtime.active", true, true);
    this.log.info("ALARM");
  }
  stopAlarm() {
    this.log.debug(`stopAlarm()`);
    this.incrementStat("stopCount");
    if (this.alarmStartTime) {
      const wakeDelay = Math.round((Date.now() - this.alarmStartTime) / 6e4);
      this.setState(`statistics.wakeDelay`, wakeDelay, true);
    }
    this.setState(`runtime.active`, false, true);
    this.setAlarmState(STATE.STOPPED);
  }
  setAlarmState(newState) {
    this.log.debug(`setAlarmState(${newState})`);
    this.getState("runtime.state", (_err, oldState) => {
      if ((oldState == null ? void 0 : oldState.val) === newState) {
        return;
      }
      this.setState("runtime.state", newState, true);
      this.log.debug(`${oldState == null ? void 0 : oldState.val} -> ${newState}`);
      this.handleState(newState);
    });
  }
  async evaluateState() {
    try {
      const now = Date.now();
      const state = await this.getStateAsync("runtime.state");
      const nextAlarm = await this.getStateAsync("runtime.nextAlarm");
      const nextPreAlarm = await this.getStateAsync("runtime.nextPreAlarm");
      const snoozeUntil = await this.getStateAsync("runtime.snoozeUntil");
      const skip = await this.getStateAsync("action.skipNext");
      if ((state == null ? void 0 : state.val) === STATE.SNOOZE && (snoozeUntil == null ? void 0 : snoozeUntil.val) && now >= new Date(String(snoozeUntil.val)).getTime() && !skip) {
        this.setAlarmState(STATE.TRIGGERED);
        return;
      }
      if ((state == null ? void 0 : state.val) === STATE.ARMED && (nextPreAlarm == null ? void 0 : nextPreAlarm.val) && now >= new Date(String(nextPreAlarm.val)).getTime() && !skip) {
        this.setAlarmState(STATE.PREALARM);
        return;
      }
      if (((state == null ? void 0 : state.val) === STATE.ARMED || (state == null ? void 0 : state.val) === STATE.PREALARM) && (nextAlarm == null ? void 0 : nextAlarm.val) && now >= new Date(String(nextAlarm.val)).getTime() && !skip) {
        this.setAlarmState(STATE.TRIGGERED);
      }
    } catch (e) {
      console.error(e);
      this.setAlarmState(STATE.ERROR);
    }
  }
  activateSnooze() {
    this.log.debug("activateSnooze()");
    this.getState("runtime.state", (_err, state) => {
      if ((state == null ? void 0 : state.val) === STATE.TRIGGERED || (state == null ? void 0 : state.val) === STATE.PREALARM) {
        this.getState("config.snoozeMinutes", (_err2, mins) => {
          const until = new Date(Date.now() + Number(mins == null ? void 0 : mins.val) * 6e4);
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
  async onStateChange(id, state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (state) {
      this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
      if (state.ack === false) {
        this.log.info(`User command received for ${id}: ${state.val}`);
      }
      switch (id) {
        case `${this.namespace}.schedule.monday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Monday: ${state.val}`);
            await this.setState("schedule.monday", {
              val: this.checkValidTime((_a = state.val) == null ? void 0 : _a.toString(), this.alarmStates[0]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.monday");
          }
          break;
        case `${this.namespace}.schedule.tuesday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Tuesday: ${state.val}`);
            await this.setState("schedule.tuesday", {
              val: this.checkValidTime((_b = state.val) == null ? void 0 : _b.toString(), this.alarmStates[1]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.tuesday");
          }
          break;
        case `${this.namespace}.schedule.wednesday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Wednesday: ${state.val}`);
            await this.setState("schedule.wednesday", {
              val: this.checkValidTime((_c = state.val) == null ? void 0 : _c.toString(), this.alarmStates[2]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.wednesday");
          }
          break;
        case `${this.namespace}.schedule.thursday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Thursday: ${state.val}`);
            await this.setState("schedule.thursday", {
              val: this.checkValidTime((_d = state.val) == null ? void 0 : _d.toString(), this.alarmStates[3]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.thursday");
          }
          break;
        case `${this.namespace}.schedule.friday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Friday: ${state.val}`);
            await this.setState("schedule.friday", {
              val: this.checkValidTime((_e = state.val) == null ? void 0 : _e.toString(), this.alarmStates[4]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.friday");
          }
          break;
        case `${this.namespace}.schedule.saturday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Saturday: ${state.val}`);
            await this.setState("schedule.saturday", {
              val: this.checkValidTime((_f = state.val) == null ? void 0 : _f.toString(), this.alarmStates[5]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.saturday");
          }
          break;
        case `${this.namespace}.schedule.sunday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Sunday: ${state.val}`);
            await this.setState("schedule.sunday", {
              val: this.checkValidTime((_g = state.val) == null ? void 0 : _g.toString(), this.alarmStates[6]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.sunday");
          }
          break;
        case `${this.namespace}.schedule.vacation`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Vacation: ${state.val}`);
            await this.setState("schedule.vacation", {
              val: this.checkValidTime((_h = state.val) == null ? void 0 : _h.toString(), this.alarmStates[7]),
              ack: true
            });
          } else {
            await this.checkNewAlarmTime("schedule.vacation");
          }
          break;
        case `${this.namespace}.schedule.holiday`:
          if (state.ack === false) {
            this.log.debug(`New wake-up time for Holiday: ${state.val}`);
            await this.setState("schedule.holiday", {
              val: this.checkValidTime((_i = state.val) == null ? void 0 : _i.toString(), this.alarmStates[8]),
              ack: true
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
  module.exports = (options) => new Alarmclock(options);
} else {
  (() => new Alarmclock())();
}
//# sourceMappingURL=main.js.map
