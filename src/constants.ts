/** Intervall der Countdown-Updates in Millisekunden */
export const UPDATECOUNTDOWNSINTERVAL = 30000; // 30 seconds
/** Intervall des Lichtwecker-Updates in Millisekunden */
export const UPDATESUNRISEINTERVAL = 30000; // 30 seconds
/** Intervall der Weckzeitüberprüfung in Millisekunden */
export const EVALUATESTATEINTERVAL = 10000; // 10 seconds

/** Wecker-Status */
export const STATE = {
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

/** Liste der IDs der Objekte für die Weckzeit */
export const ALARMTIME = {
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
    HOLIDAY: 8,
};

/** Liste der Namen der Objekte für die Weckzeit */
export const ALARMNAMES = [
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
