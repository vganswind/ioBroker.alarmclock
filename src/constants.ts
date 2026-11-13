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
