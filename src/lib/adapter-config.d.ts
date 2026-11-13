// This file extends the AdapterConfig type from "@iobroker/types"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        /** Adapter-Konfiguration */
        interface AdapterConfig {
            /** Name der Feiertagskalender-Instance */
            holidayInstance: string;
            /** Name der Urlaubskalender-Instance */
            vocationInstance: string;
            /** Liste der Urlaubskalender-Einträge */
            vocationEvents: {
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
            0;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
