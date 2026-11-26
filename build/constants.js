"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var constants_exports = {};
__export(constants_exports, {
  ALARMNAMES: () => ALARMNAMES,
  ALARMTIME: () => ALARMTIME,
  EVALUATESTATEINTERVAL: () => EVALUATESTATEINTERVAL,
  STATE: () => STATE,
  UPDATECOUNTDOWNSINTERVAL: () => UPDATECOUNTDOWNSINTERVAL,
  UPDATESUNRISEINTERVAL: () => UPDATESUNRISEINTERVAL
});
module.exports = __toCommonJS(constants_exports);
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
const ALARMTIME = {
  /** Montag */
  MONDAY: 0,
  /** Dienstag */
  TUESDAY: 1,
  /** Mittwoch */
  WEDNESDAY: 2,
  /** Donnerstag */
  THURSDAY: 3,
  /** Freitag */
  FRIDAY: 4,
  /** Samstag */
  SATURDAY: 5,
  /** Sonntag */
  SUNDAY: 6,
  /** Urlaub */
  VACATION: 7,
  /** Feiertag */
  HOLIDAY: 8
};
const ALARMNAMES = [
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALARMNAMES,
  ALARMTIME,
  EVALUATESTATEINTERVAL,
  STATE,
  UPDATECOUNTDOWNSINTERVAL,
  UPDATESUNRISEINTERVAL
});
//# sourceMappingURL=constants.js.map
