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
var createstatesobjects_exports = {};
__export(createstatesobjects_exports, {
  createStatesObjects: () => createStatesObjects
});
module.exports = __toCommonJS(createstatesobjects_exports);
var import_constants = require("./constants");
async function createStatesObjects(adapter) {
  adapter.log.info(`createStatesObjects(${adapter})`);
  await adapter.setObjectNotExistsAsync("action", {
    type: "channel",
    common: {
      name: {
        de: "Befehle",
        en: "Commands"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("action.snooze", {
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
  await adapter.setObjectNotExistsAsync("action.stop", {
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
  await adapter.setObjectNotExistsAsync("config", {
    type: "channel",
    common: {
      name: {
        de: "Konfiguration",
        en: "Configuration"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("config.enabled", {
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
  await adapter.setObjectNotExistsAsync("config.preAlarmMinutes", {
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
  await adapter.setObjectNotExistsAsync("config.skipNext", {
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
  await adapter.setObjectNotExistsAsync("config.snoozeMinutes", {
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
  await adapter.setObjectNotExistsAsync("runtime", {
    type: "channel",
    common: {
      name: {
        de: "Laufzeitwerte",
        en: "Runtime values"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("runtime.countdownAlarm", {
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
  await adapter.setObjectNotExistsAsync("runtime.active", {
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
  await adapter.setObjectNotExistsAsync("runtime.countdownPreAlarm", {
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
  await adapter.setObjectNotExistsAsync("runtime.countdownSnooze", {
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
  await adapter.setObjectNotExistsAsync("runtime.nextAlarm", {
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
  await adapter.setObjectNotExistsAsync("runtime.nextPreAlarm", {
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
  await adapter.setObjectNotExistsAsync("runtime.snoozeUntil", {
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
  await adapter.setObjectNotExistsAsync("runtime.state", {
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
      states: Object.values(import_constants.STATE),
      def: import_constants.STATE.DISABLED
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("runtime.sunriseBrightness", {
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
  await adapter.setObjectNotExistsAsync("runtime.sunriseProgress", {
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
  await adapter.setObjectNotExistsAsync("schedule", {
    type: "channel",
    common: {
      name: {
        de: "Weckzeiten",
        en: "Wake-up times"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("schedule.monday", {
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
  await adapter.setObjectNotExistsAsync("schedule.tuesday", {
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
  await adapter.setObjectNotExistsAsync("schedule.wednesday", {
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
  await adapter.setObjectNotExistsAsync("schedule.thursday", {
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
  await adapter.setObjectNotExistsAsync("schedule.friday", {
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
  await adapter.setObjectNotExistsAsync("schedule.saturday", {
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
  await adapter.setObjectNotExistsAsync("schedule.sunday", {
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
  await adapter.setObjectNotExistsAsync("schedule.vacation", {
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
  await adapter.setObjectNotExistsAsync("schedule.holiday", {
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
  await adapter.setObjectNotExistsAsync("statistics", {
    type: "channel",
    common: {
      name: {
        de: "Statistiken",
        en: "Statistics"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("statistics.alarmCount", {
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
  await adapter.setObjectNotExistsAsync("statistics.preAlarmCount", {
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
  await adapter.setObjectNotExistsAsync("statistics.snoozeCount", {
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
  await adapter.setObjectNotExistsAsync("statistics.stopCount", {
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
  await adapter.setObjectNotExistsAsync("statistics.errorCount", {
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
  await adapter.setObjectNotExistsAsync("statistics.wakeDelay", {
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
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createStatesObjects
});
//# sourceMappingURL=createstatesobjects.js.map
