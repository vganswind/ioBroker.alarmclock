"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");

class Alarmclock extends utils.Adapter {

    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "alarmclock",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here
        this.log.debug("Starting Adapter: " + this.namespace);
        // Reset the connection indicator during startup
        this.setState("info.connection", false, true);

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.info("config option1: " + this.config.option1);
        this.log.info("config option2: " + this.config.option2);

        this.subscribeStates("config.*");
        this.subscribeStates("snooze");
        this.subscribeStates("off");

        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync("admin", "iobroker");
        this.log.info("check user admin pw iobroker: " + result);

        result = await this.checkGroupAsync("admin", "admin");
        this.log.info("check group user admin group admin: " + result);

        this.setState("info.connection", true, true);
        await this.setStateAsync("state", { val: "initialize", ack: true });
        this.log.debug("Finish starting Adapter: " + this.namespace);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);

            this.setState("info.connection", false, true);
            callback();
        } catch (e) {
            callback();
        }
    }

    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  * @param {string} id
    //  * @param {ioBroker.Object | null | undefined} obj
    //  */
    // onObjectChange(id, obj) {
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
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            if(id == this.namespace + ".config.1_Monday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.1_Monday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.2_Tuesday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.2_Tuesday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.3_Wednesday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.3_Wednesday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.4_Thursday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.4_Thursday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.5_Friday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.5_Friday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.6_Saturday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.6_Saturday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.7_Sunday" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.7_Sunday", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else if(id == this.namespace + ".config.snoozeTime" && !state.ack) {
                if(state.val != null) {
                    if(this.checkTimeValue(state.val.toString())) {
                        this.setState(this.namespace + ".config.snoozeTime", state.val, true);
                    } else {
                        this.log.error(`${id}: ${state.val} is not a Time-Value!`);
                    }
                }
            } else {
                this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
            }
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    //     if (typeof obj === "object" && obj.message) {
    //         if (obj.command === "send") {
    //             // e.g. send email or pushover or whatever
    //             this.log.info("send command");

    //             // Send response in callback if required
    //             if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
    //         }
    //     }
    // }

    /**
     * Prüfung auf korrekte Uhrzeit
     * @param {string} time Die zu prüfende Uhrzeit
     * @returns Ob es sich um eine korrekte Uhrzeit handelt
     */
    checkTimeValue(time) {
        this.log.debug("Check time Value: " + time);

        const chk = time.match(/^(\d+):(\d+)$/);
        if(chk!=null) {
            const hour = parseInt(chk[1]);
            const min = parseInt(chk[2]);
            if(hour>=0 && hour<=23 && min>=0 && min<=59) {
                return true;
            }
        }
        return false;
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Alarmclock(options);
} else {
    // otherwise start the instance directly
    new Alarmclock();
}