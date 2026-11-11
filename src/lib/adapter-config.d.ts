// This file extends the AdapterConfig type from "@iobroker/types"

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterConfig {
            holidayInstance: string;
            vocationInstance: string;
            vocationEvents: { name: string; enabled: boolean }[];
            appointmentInstance: string;
            appointmentEvents: { name: string; enabled: boolean }[];
            0;
        }
    }
}

// this is required so the above AdapterConfig is found by TypeScript / type checking
export {};
