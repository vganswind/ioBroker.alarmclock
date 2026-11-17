import { STATE } from "./constants";

/**
 * Erstelle die State-Objekte des Adapters.
 *
 * @param adapter Der AlarmClock-Adapter
 */
export async function createStatesObjects(adapter: any): Promise<void> {
    adapter.log.info(`createStatesObjects(${adapter})`);

    await adapter.setObjectNotExistsAsync("action", {
        type: "channel",
        common: {
            name: {
                de: "Befehle",
                en: "Commands",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("action.snooze", {
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

    await adapter.setObjectNotExistsAsync("action.stop", {
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

    await adapter.setObjectNotExistsAsync("config", {
        type: "channel",
        common: {
            name: {
                de: "Konfiguration",
                en: "Configuration",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("config.enabled", {
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
            def: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("config.preAlarmMinutes", {
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

    await adapter.setObjectNotExistsAsync("config.skipNext", {
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

    await adapter.setObjectNotExistsAsync("config.snoozeMinutes", {
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

    await adapter.setObjectNotExistsAsync("runtime", {
        type: "channel",
        common: {
            name: {
                de: "Laufzeitwerte",
                en: "Runtime values",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("runtime.countdownAlarm", {
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

    await adapter.setObjectNotExistsAsync("runtime.active", {
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

    await adapter.setObjectNotExistsAsync("runtime.countdownPreAlarm", {
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

    await adapter.setObjectNotExistsAsync("runtime.countdownSnooze", {
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

    await adapter.setObjectNotExistsAsync("runtime.nextAlarm", {
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

    await adapter.setObjectNotExistsAsync("runtime.nextPreAlarm", {
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

    await adapter.setObjectNotExistsAsync("runtime.snoozeUntil", {
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

    await adapter.setObjectNotExistsAsync("runtime.state", {
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

    await adapter.setObjectNotExistsAsync("runtime.sunriseBrightness", {
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

    await adapter.setObjectNotExistsAsync("runtime.sunriseProgress", {
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

    await adapter.setObjectNotExistsAsync("schedule", {
        type: "channel",
        common: {
            name: {
                de: "Weckzeiten",
                en: "Wake-up times",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("schedule.monday", {
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

    await adapter.setObjectNotExistsAsync("schedule.tuesday", {
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

    await adapter.setObjectNotExistsAsync("schedule.wednesday", {
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

    await adapter.setObjectNotExistsAsync("schedule.thursday", {
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

    await adapter.setObjectNotExistsAsync("schedule.friday", {
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

    await adapter.setObjectNotExistsAsync("schedule.saturday", {
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

    await adapter.setObjectNotExistsAsync("schedule.sunday", {
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

    await adapter.setObjectNotExistsAsync("schedule.vacation", {
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

    await adapter.setObjectNotExistsAsync("schedule.holiday", {
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

    await adapter.setObjectNotExistsAsync("statistics", {
        type: "channel",
        common: {
            name: {
                de: "Statistiken",
                en: "Statistics",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("statistics.alarmCount", {
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

    await adapter.setObjectNotExistsAsync("statistics.preAlarmCount", {
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

    await adapter.setObjectNotExistsAsync("statistics.snoozeCount", {
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

    await adapter.setObjectNotExistsAsync("statistics.stopCount", {
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

    await adapter.setObjectNotExistsAsync("statistics.errorCount", {
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

    await adapter.setObjectNotExistsAsync("statistics.lastWakeDelay", {
        type: "state",
        common: {
            name: {
                de: "Letzte Aufwachverzögerung",
                en: "Last wake-up delay",
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

    await adapter.setObjectNotExistsAsync("statistics.averageWakeDelay", {
        type: "state",
        common: {
            name: {
                de: "Durchschnittliche Aufwachverzögerung",
                en: "Average wake-up delay",
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

    await adapter.setObjectNotExistsAsync("statistics.bestWakeDelay", {
        type: "state",
        common: {
            name: {
                de: "Beste Aufwachverzögerung",
                en: "Best wake-up delay",
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

    await adapter.setObjectNotExistsAsync("statistics.worstWakeDelay", {
        type: "state",
        common: {
            name: {
                de: "Schlechteste Aufwachverzögerung",
                en: "Worst wake-up delay",
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

    await adapter.setObjectNotExistsAsync("statistics.wakeDelayHistory", {
        type: "state",
        common: {
            name: {
                de: "Historie der Aufwachverzögerungen",
                en: "History of wake-up delays",
            },
            type: "string",
            role: "json",
            read: true,
            write: false,
            def: "",
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("statistics.lastAlarm", {
        type: "state",
        common: {
            name: {
                de: "Letzter Alarm",
                en: "Last alarm",
            },
            type: "string",
            role: "value.time",
            read: true,
            write: false,
            def: "",
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("statistics.lastWakeup", {
        type: "state",
        common: {
            name: {
                de: "Letztes Aufstehen",
                en: "Last wake-up",
            },
            type: "string",
            role: "value.time",
            read: true,
            write: false,
            def: "",
        },
        native: {},
    });
}
