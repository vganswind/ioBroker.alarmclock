// This file extends the AdapterConfig type from "@iobroker/types"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        /** Adapter-Konfiguration */
        interface AdapterConfig {
            /** Name der Feiertagskalender-Instance */
            holidayInstance: string;
            /** Name der public-holiday-Instance */
            publicHolidaysInstance: string;
            /** Name der Urlaubskalender-Instance */
            vacationInstance: string;
            /** Liste der Urlaubskalender-Einträge */
            vacationEvents: {
                /** Name des Termins */
                name: string;
                /** Der Termin ist aktiviert */
                enabled: boolean;
            }[];
            /** Name der Weckerkalender-Instance */
            appointmentInstance: string;
            /** Liste der Weckerkalender-Einträge */
            appointmentEvents: {
                /** Name des Termins */
                name: string;
                /** Der Termin ist aktiviert */
                enabled: boolean;
            }[];
            /** Länge der Historie der Aufwachverzögerung */
            maxWakeDelayHistory: number;
            /** Name der MQTT-Instance */
            mqttInstance: string;
            /** Name des MQTT-Topics */
            mqttTopic: string;
            /** Liste der Actions des Weckerstatus */
            actionEvents: {
                /** Der Typ des Actions */
                type: string;
                /** Die Object-ID des zu setzenden Status */
                objectId: string;
                /** Der Wert der gesetzt wird */
                value: any;
                /** Das Event ist aktiviert */
                enabled: boolean;
            }[];
            /** Liste der Actions des Lichtweckers */
            sunriseEvents: {
                /** Die Object-ID des zu setzenden Status */
                objectId: string;
                /** Der Wert für 100% */
                max: number;
                /** Fortschritt invertieren */
                invers: boolean;
                /** Das Event ist aktiviert */
                enabled: boolean;
            }[];
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
