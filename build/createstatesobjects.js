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
        en: "Commands",
        ru: "\u041A\u043E\u043C\u0430\u043D\u0434\u044B",
        pt: "Comandos",
        nl: "Commando's",
        fr: "Commandes",
        it: "Comandi",
        es: "Comandos",
        pl: "Polecenia",
        uk: "\u041A\u043E\u043C\u0430\u043D\u0434\u0438",
        "zh-cn": "\u547D\u4EE4"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("action.snooze", {
    type: "state",
    common: {
      name: {
        de: "Alarm pausieren",
        en: "Pause alarm",
        ru: "\u041F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u0438\u0433\u043D\u0430\u043B \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
        pt: "Pausar alarme",
        nl: "Pauzeer alarm",
        fr: "Pause alarme",
        it: "Metti in pausa l'allarme",
        es: "Alarma de pausa",
        pl: "Wstrzymaj alarm",
        uk: "\u041F\u0440\u0438\u0437\u0443\u043F\u0438\u043D\u0438\u0442\u0438 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        "zh-cn": "\u6682\u505C\u95F9\u949F"
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
        de: "Alarm stoppen",
        en: "Stop alarm",
        ru: "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u0438\u0433\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044E",
        pt: "Alarme de parada",
        nl: "Stop alarm",
        fr: "Alarme d'arr\xEAt",
        it: "Interrompere l'allarme",
        es: "Alarma de parada",
        pl: "Zatrzymaj alarm",
        uk: "\u0417\u0443\u043F\u0438\u043D\u0438\u0442\u0438 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        "zh-cn": "\u505C\u6B62\u8B66\u62A5"
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
        en: "Configuration",
        ru: "\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F",
        pt: "Configura\xE7\xE3o",
        nl: "Configuratie",
        fr: "Configuration",
        it: "Configurazione",
        es: "Configuraci\xF3n",
        pl: "Konfiguracja",
        uk: "\u041A\u043E\u043D\u0444\u0456\u0433\u0443\u0440\u0430\u0446\u0456\u044F",
        "zh-cn": "\u914D\u7F6E"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("config.enabled", {
    type: "state",
    common: {
      name: {
        de: "Alarm aktiviert",
        en: "Alarm enabled",
        ru: "\u0421\u0438\u0433\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430",
        pt: "Alarme ativado",
        nl: "Alarm ingeschakeld",
        fr: "Alarme activ\xE9e",
        it: "Allarme attivato",
        es: "Alarma activada",
        pl: "Alarm w\u0142\u0105czony",
        uk: "\u0421\u0438\u0433\u043D\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u044F \u0432\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u0430",
        "zh-cn": "\u8B66\u62A5\u5DF2\u542F\u7528"
      },
      type: "boolean",
      role: "switch.enable",
      read: true,
      write: true,
      def: false
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("config.preAlarmMinutes", {
    type: "state",
    common: {
      name: {
        de: "Voralarmzeit in Minuten",
        en: "Pre-alarm time in minutes",
        ru: "\u0412\u0440\u0435\u043C\u044F \u0434\u043E \u0441\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u043D\u0438\u044F \u0441\u0438\u0433\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0432 \u043C\u0438\u043D\u0443\u0442\u0430\u0445",
        pt: "Tempo de pr\xE9-alarme em minutos",
        nl: "Vooralarmtijd in minuten",
        fr: "Temps de pr\xE9-alarme en minutes",
        it: "Tempo di preavviso in minuti",
        es: "Tiempo de prealarma en minutos",
        pl: "Czas przed alarmem w minutach",
        uk: "\u0427\u0430\u0441 \u043F\u0435\u0440\u0435\u0434\u0442\u0440\u0438\u0432\u043E\u0433\u0438 \u0432 \u0445\u0432\u0438\u043B\u0438\u043D\u0430\u0445",
        "zh-cn": "\u9884\u8B66\u65F6\u95F4\uFF08\u5206\u949F\uFF09"
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
        de: "N\xE4chsten Alarm ignorieren",
        en: "Ignore next alarm",
        ru: "\u0418\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        pt: "Ignore o pr\xF3ximo alarme",
        nl: "Negeer het volgende alarm",
        fr: "Ignorer la prochaine alarme",
        it: "Ignora il prossimo allarme",
        es: "Ignorar la siguiente alarma",
        pl: "Zignoruj nast\u0119pny alarm",
        uk: "\u0406\u0433\u043D\u043E\u0440\u0443\u0432\u0430\u0442\u0438 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        "zh-cn": "\u5FFD\u7565\u4E0B\u4E00\u4E2A\u8B66\u62A5"
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
        en: "Snooze time in minutes",
        ru: "\u0412\u0440\u0435\u043C\u044F \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430 \u0432 \u043C\u0438\u043D\u0443\u0442\u0430\u0445",
        pt: "Tempo de soneca em minutos",
        nl: "Slaaptijd in minuten",
        fr: "Dur\xE9e de la fonction snooze en minutes",
        it: "Tempo di posticipo in minuti",
        es: "Tiempo de repetici\xF3n en minutos",
        pl: "Czas drzemki w minutach",
        uk: "\u0427\u0430\u0441 \u0432\u0456\u0434\u043A\u043B\u0430\u0434\u0435\u043D\u043D\u044F \u0443 \u0445\u0432\u0438\u043B\u0438\u043D\u0430\u0445",
        "zh-cn": "\u8D2A\u7761\u65F6\u95F4\uFF08\u5206\u949F\uFF09"
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
        en: "Runtime values",
        ru: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F",
        pt: "Valores de tempo de execu\xE7\xE3o",
        nl: "Runtime-waarden",
        fr: "Valeurs d'ex\xE9cution",
        it: "Valori di runtime",
        es: "Valores de tiempo de ejecuci\xF3n",
        pl: "Warto\u015Bci czasu wykonania",
        uk: "\u0417\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u043F\u0456\u0434 \u0447\u0430\u0441 \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043D\u044F",
        "zh-cn": "\u8FD0\u884C\u65F6\u503C"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("runtime.countdownAlarm", {
    type: "state",
    common: {
      name: {
        de: "Countdown bis zum Alarm",
        en: "Countdown to alarm",
        ru: "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0434\u043E \u0441\u0438\u0433\u043D\u0430\u043B\u0430 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
        pt: "Contagem regressiva para o alarme",
        nl: "Aftellen tot alarm",
        fr: "Compte \xE0 rebours avant l'alarme",
        it: "Conto alla rovescia per la sveglia",
        es: "Cuenta regresiva para la alarma",
        pl: "Odliczanie do alarmu",
        uk: "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0434\u043E \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u8B66\u62A5\u5012\u8BA1\u65F6"
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
  await adapter.setObjectNotExistsAsync("runtime.countdownAlarmText", {
    type: "state",
    common: {
      name: {
        en: "Formatted countdown to the alarm",
        de: "Formatierter Countdown bis zum Alarm",
        ru: "\u0424\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0434\u043E \u0441\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u043D\u0438\u044F \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        pt: "Contagem regressiva formatada para o alarme",
        nl: "Opmaak aftelling tot het alarm",
        fr: "Compte \xE0 rebours format\xE9 jusqu'\xE0 l'alarme",
        it: "Conto alla rovescia formattato per la sveglia",
        es: "Cuenta regresiva formateada para la alarma",
        pl: "Sformatowane odliczanie do alarmu",
        uk: "\u0424\u043E\u0440\u043C\u0430\u0442\u043E\u0432\u0430\u043D\u0438\u0439 \u0437\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0434\u043E \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u95F9\u949F\u5012\u8BA1\u65F6\uFF08\u5DF2\u683C\u5F0F\u5316\uFF09"
      },
      type: "string",
      role: "text",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("runtime.active", {
    type: "state",
    common: {
      name: {
        de: "Alarm ist aktiv",
        en: "Alarm is active",
        ru: "\u0421\u0438\u0433\u043D\u0430\u043B \u0442\u0440\u0435\u0432\u043E\u0433\u0438 \u0430\u043A\u0442\u0438\u0432\u0435\u043D",
        pt: "Alarme ativo",
        nl: "Alarm is actief",
        fr: "L'alarme est activ\xE9e.",
        it: "L'allarme \xE8 attivo",
        es: "La alarma est\xE1 activa.",
        pl: "Alarm jest aktywny",
        uk: "\u0421\u0438\u0433\u043D\u0430\u043B\u0456\u0437\u0430\u0446\u0456\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u0430",
        "zh-cn": "\u8B66\u62A5\u5DF2\u6FC0\u6D3B"
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
        de: "Countdown bis zum Voralarm",
        en: "Countdown to pre-alarm",
        ru: "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0434\u043E \u043D\u0430\u0447\u0430\u043B\u0430 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
        pt: "Contagem regressiva para o pr\xE9-alarme",
        nl: "Aftellen tot het pre-alarm",
        fr: "Compte \xE0 rebours avant la pr\xE9-alarme",
        it: "Conto alla rovescia per la pre-allarme",
        es: "Cuenta regresiva para la prealarma",
        pl: "Odliczanie do alarmu wst\u0119pnego",
        uk: "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0434\u043E \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u044C\u043E\u0433\u043E \u0441\u0438\u0433\u043D\u0430\u043B\u0443 \u0442\u0440\u0438\u0432\u043E\u0433\u0438",
        "zh-cn": "\u9884\u8B66\u5012\u8BA1\u65F6"
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
  await adapter.setObjectNotExistsAsync("runtime.countdownPreAlarmText", {
    type: "state",
    common: {
      name: {
        en: "Formatted countdown to the pre-alarm",
        de: "Formatierter Countdown bis zum Voralarm",
        ru: "\u0424\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0434\u043E \u0441\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u043D\u0438\u044F \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u0438\u0433\u043D\u0430\u043B\u0430 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
        pt: "Contagem regressiva formatada para o pr\xE9-alarme",
        nl: "Geformatteerde aftelling naar het vooralarm",
        fr: "Compte \xE0 rebours format\xE9 avant la pr\xE9-alarme",
        it: "Conto alla rovescia formattato per il preallarme",
        es: "Cuenta regresiva formateada para la prealarma",
        pl: "Sformatowane odliczanie do alarmu wst\u0119pnego",
        uk: "\u0424\u043E\u0440\u043C\u0430\u0442\u043E\u0432\u0430\u043D\u0438\u0439 \u0437\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0434\u043E \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u044C\u043E\u0433\u043E \u0441\u0438\u0433\u043D\u0430\u043B\u0443 \u0442\u0440\u0438\u0432\u043E\u0433\u0438",
        "zh-cn": "\u683C\u5F0F\u5316\u7684\u9884\u8B66\u5012\u8BA1\u65F6"
      },
      type: "string",
      role: "text",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("runtime.countdownSnooze", {
    type: "state",
    common: {
      name: {
        de: "Countdown bis zum Ende der Schlummerzeit",
        en: "Countdown to end snooze time",
        ru: "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0434\u043E \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043E\u0442\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u043D\u0438\u044F \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430.",
        pt: "Contagem regressiva para o fim do tempo soneca",
        nl: "Aftellen tot het einde van de snooze-tijd",
        fr: "Compte \xE0 rebours avant la fin de la fonction snooze",
        it: "Conto alla rovescia per la fine della funzione snooze",
        es: "Cuenta regresiva para que termine la hora de posponer la alarma.",
        pl: "Odliczanie do zako\u0144czenia drzemki",
        uk: "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0434\u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u044F \u0447\u0430\u0441\u0443 \u0432\u0456\u0434\u043A\u043B\u0430\u0434\u0435\u043D\u043D\u044F \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u7ED3\u675F\u8D2A\u7761\u5012\u8BA1\u65F6"
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
  await adapter.setObjectNotExistsAsync("runtime.countdownSnoozeText", {
    type: "state",
    common: {
      name: {
        en: "Formatted countdown to the end snooze time",
        de: "Formatierter Countdown bis zum Ende der Schlummerzeit",
        ru: "\u0424\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0434\u043E \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043E\u0442\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        pt: "Contagem regressiva formatada para o fim do tempo de soneca",
        nl: "Opgemaakte aftelling tot het einde van de snooze-tijd",
        fr: "Compte \xE0 rebours format\xE9 jusqu'\xE0 la fin de la fonction snooze",
        it: "Conto alla rovescia formattato per la fine del tempo di posticipo",
        es: "Cuenta regresiva formateada hasta el final del tiempo de posposici\xF3n",
        pl: "Sformatowane odliczanie do ko\u0144ca drzemki",
        uk: "\u0424\u043E\u0440\u043C\u0430\u0442\u043E\u0432\u0430\u043D\u0438\u0439 \u0437\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0434\u043E \u043A\u0456\u043D\u0446\u044F \u0447\u0430\u0441\u0443 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u043D\u044F \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u683C\u5F0F\u5316\u7684\u5348\u7761\u7ED3\u675F\u5012\u8BA1\u65F6"
      },
      type: "string",
      role: "text",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("runtime.nextAlarm", {
    type: "state",
    common: {
      name: {
        de: "N\xE4chster Alarm",
        en: "Next alarm",
        ru: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        pt: "Pr\xF3ximo alarme",
        nl: "Volgende alarm",
        fr: "Prochaine alarme",
        it: "Prossimo allarme",
        es: "Siguiente alarma",
        pl: "Nast\u0119pny alarm",
        uk: "\u041D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        "zh-cn": "\u4E0B\u4E00\u4E2A\u95F9\u949F"
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
        en: "Next pre-alarm",
        ru: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u0440\u0435\u0432\u043E\u0433\u0430",
        pt: "Pr\xF3ximo pr\xE9-alarme",
        nl: "Volgende vooralarm",
        fr: "Prochaine pr\xE9-alarme",
        it: "Prossimo preallarme",
        es: "Siguiente prealarma",
        pl: "Nast\u0119pny alarm wst\u0119pny",
        uk: "\u041D\u0430\u0441\u0442\u0443\u043F\u043D\u0438\u0439 \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u0441\u0438\u0433\u043D\u0430\u043B \u0442\u0440\u0438\u0432\u043E\u0433\u0438",
        "zh-cn": "\u4E0B\u4E00\u6B21\u9884\u8B66"
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
        de: "Schlummern bis",
        en: "Snooze until",
        ru: "\u041E\u0442\u043B\u043E\u0436\u0438\u0442\u0435 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A \u0434\u043E",
        pt: "Adorme\xE7a at\xE9",
        nl: "Snooze tot",
        fr: "Faire la grasse matin\xE9e jusqu'\xE0",
        it: "Rimanda fino a",
        es: "Posponer hasta",
        pl: "Drzemka do",
        uk: "\u0412\u0456\u0434\u043A\u043B\u0430\u0441\u0442\u0438 \u0434\u043E",
        "zh-cn": "\u6253\u76F9\u76F4\u5230"
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
        en: "State",
        ru: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435",
        pt: "Estado",
        nl: "Staat",
        fr: "\xC9tat",
        it: "Stato",
        es: "Estado",
        pl: "Pa\u0144stwo",
        uk: "\u0428\u0442\u0430\u0442",
        "zh-cn": "\u72B6\u6001"
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
        de: "Helligkeit des Lichtweckers",
        en: "Light alarm clock brightness",
        ru: "\u042F\u0440\u043A\u043E\u0441\u0442\u044C \u0441\u0432\u0435\u0442\u043E\u0432\u043E\u0433\u043E \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        pt: "Brilho do despertador luminoso",
        nl: "Helderheid van de wekker",
        fr: "Luminosit\xE9 du r\xE9veil",
        it: "Luminosit\xE0 della sveglia luminosa",
        es: "Brillo del reloj despertador",
        pl: "Jasno\u015B\u0107 budzika \u015Bwietlnego",
        uk: "\u042F\u0441\u043A\u0440\u0430\u0432\u0456\u0441\u0442\u044C \u0441\u0432\u0456\u0442\u043B\u043E\u0432\u043E\u0433\u043E \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u95F9\u949F\u4EAE\u5EA6"
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
        de: "Fortschritt des Lichtweckers",
        en: "Light alarm clock progress",
        ru: "\u0421\u0432\u0435\u0442\u043E\u0432\u043E\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u0442 \u0440\u0430\u0431\u043E\u0442\u0443",
        pt: "progresso do despertador luminoso",
        nl: "Voortgang van de lichtwekker",
        fr: "progr\xE8s du r\xE9veil lumineux",
        it: "progresso della sveglia luminosa",
        es: "Progreso del reloj despertador luminoso",
        pl: "Post\u0119p budzika \u015Bwietlnego",
        uk: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441 \u0441\u0432\u0456\u0442\u043B\u043E\u0432\u043E\u0433\u043E \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u706F\u5149\u95F9\u949F\u8FDB\u5EA6"
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
        en: "Wake-up times",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F",
        pt: "Hor\xE1rios de despertar",
        nl: "Opstaantijden",
        fr: "Heures de r\xE9veil",
        it: "orari di sveglia",
        es: "Horas de despertar",
        pl: "Godziny pobudki",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F",
        "zh-cn": "\u8D77\u5E8A\u65F6\u95F4"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("schedule.monday", {
    type: "state",
    common: {
      name: {
        de: "Weckzeit am Montag",
        en: "Wake-up time on monday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F \u0432 \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A",
        pt: "Hora de acordar na segunda-feira",
        nl: "Tijd om maandag op te staan",
        fr: "Heure de r\xE9veil le lundi",
        it: "Ora di sveglia luned\xEC",
        es: "Hora de despertarse el lunes",
        pl: "Poranek pobudki",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u043F\u043E\u043D\u0435\u0434\u0456\u043B\u043E\u043A",
        "zh-cn": "\u661F\u671F\u4E00\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on tuesday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u043E\u0434\u044A\u0435\u043C\u0430 \u0432\u043E \u0432\u0442\u043E\u0440\u043D\u0438\u043A",
        pt: "Hora de acordar na ter\xE7a-feira",
        nl: "Tijd om op dinsdag op te staan",
        fr: "Heure de r\xE9veil mardi",
        it: "Ora di sveglia marted\xEC",
        es: "Hora de despertarse el martes",
        pl: "Pobudka we wtorek",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u0432\u0456\u0432\u0442\u043E\u0440\u043E\u043A",
        "zh-cn": "\u661F\u671F\u4E8C\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on wednesday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u043E\u0434\u044A\u0435\u043C\u0430 \u0432 \u0441\u0440\u0435\u0434\u0443",
        pt: "Hora de acordar na quarta-feira",
        nl: "Opstaan op woensdag",
        fr: "Heure de r\xE9veil mercredi",
        it: "Ora di sveglia il mercoled\xEC",
        es: "Hora de despertarse el mi\xE9rcoles",
        pl: "Pobudka w \u015Brod\u0119",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u0441\u0435\u0440\u0435\u0434\u0443",
        "zh-cn": "\u661F\u671F\u4E09\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on thursday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u043E\u0434\u044A\u0435\u043C\u0430 \u0432 \u0447\u0435\u0442\u0432\u0435\u0440\u0433",
        pt: "Hora de acordar na quinta-feira",
        nl: "Opstaan op donderdag",
        fr: "Heure de r\xE9veil jeudi",
        it: "Ora di sveglia gioved\xEC",
        es: "Hora de despertarse el jueves",
        pl: "Pobudka w czwartek",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u0447\u0435\u0442\u0432\u0435\u0440",
        "zh-cn": "\u661F\u671F\u56DB\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on friday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u043E\u0434\u044A\u0435\u043C\u0430 \u0432 \u043F\u044F\u0442\u043D\u0438\u0446\u0443",
        pt: "Hora de acordar na sexta-feira",
        nl: "Tijd om op vrijdag op te staan",
        fr: "Heure de r\xE9veil le vendredi",
        it: "Ora di sveglia il venerd\xEC",
        es: "Hora de despertarse el viernes",
        pl: "Pora pobudki w pi\u0105tek",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u043F'\u044F\u0442\u043D\u0438\u0446\u044E",
        "zh-cn": "\u661F\u671F\u4E94\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on saturday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u043E\u0434\u044A\u0435\u043C\u0430 \u0432 \u0441\u0443\u0431\u0431\u043E\u0442\u0443",
        pt: "Hora de acordar no s\xE1bado",
        nl: "Tijd om op zaterdag op te staan",
        fr: "Heure de r\xE9veil le samedi",
        it: "Ora di sveglia del sabato",
        es: "Hora de despertarse el s\xE1bado",
        pl: "Pora pobudki w sobot\u0119",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0432 \u0441\u0443\u0431\u043E\u0442\u0443",
        "zh-cn": "\u661F\u671F\u516D\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on sunday",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u043E\u0434\u044A\u0435\u043C\u0430 \u0432 \u0432\u043E\u0441\u043A\u0440\u0435\u0441\u0435\u043D\u044C\u0435",
        pt: "Hora de acordar no domingo",
        nl: "Tijd om op te staan op zondag",
        fr: "Heure de r\xE9veil le dimanche",
        it: "Ora di sveglia la domenica",
        es: "Hora de despertarse el domingo",
        pl: "Pora pobudki w niedziel\u0119",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0432 \u043D\u0435\u0434\u0456\u043B\u044E",
        "zh-cn": "\u661F\u671F\u5929\u7684\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on vacation",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F \u0432 \u043E\u0442\u043F\u0443\u0441\u043A\u0435",
        pt: "Hora de acordar nas f\xE9rias",
        nl: "Tijdstip van opstaan tijdens vakantie",
        fr: "L'heure du r\xE9veil en vacances",
        it: "Ora di sveglia in vacanza",
        es: "Hora de despertarse en vacaciones",
        pl: "Czas na pobudk\u0119 na wakacjach",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u0432\u0456\u0434\u043F\u0443\u0441\u0442\u0446\u0456",
        "zh-cn": "\u5047\u671F\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Wake-up time on holidays",
        ru: "\u0412\u0440\u0435\u043C\u044F \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F \u0432 \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u044B\u0435 \u0434\u043D\u0438",
        pt: "Hora de acordar nos feriados",
        nl: "Tijdstip van opstaan tijdens vakanties",
        fr: "Heure de r\xE9veil pendant les vacances",
        it: "Orario di sveglia nei giorni festivi",
        es: "Hora de despertarse en d\xEDas festivos",
        pl: "Czas pobudki w \u015Bwi\u0119ta",
        uk: "\u0427\u0430\u0441 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F \u0443 \u0441\u0432\u044F\u0442\u0430",
        "zh-cn": "\u8282\u5047\u65E5\u8D77\u5E8A\u65F6\u95F4"
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
        en: "Statistics",
        ru: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430",
        pt: "Estat\xEDsticas",
        nl: "Statistieken",
        fr: "Statistiques",
        it: "Statistiche",
        es: "Estad\xEDstica",
        pl: "Statystyka",
        uk: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430",
        "zh-cn": "\u7EDF\u8BA1\u6570\u636E"
      }
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("statistics.alarmCount", {
    type: "state",
    common: {
      name: {
        de: "Anzahl der Alarme",
        en: "Number of alarms",
        ru: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u0433\u043D\u0430\u043B\u043E\u0432 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
        pt: "N\xFAmero de alarmes",
        nl: "Aantal alarmen",
        fr: "Nombre d'alarmes",
        it: "Numero di allarmi",
        es: "N\xFAmero de alarmas",
        pl: "Liczba alarm\xF3w",
        uk: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0442\u0440\u0438\u0432\u043E\u0433",
        "zh-cn": "\u8B66\u62A5\u6570\u91CF"
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
        en: "Number of pre-alarms",
        ru: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0441\u0438\u0433\u043D\u0430\u043B\u043E\u0432 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
        pt: "N\xFAmero de pr\xE9-alarmes",
        nl: "Aantal vooralarmen",
        fr: "Nombre de pr\xE9-alarmes",
        it: "Numero di pre-allarmi",
        es: "N\xFAmero de prealarmas",
        pl: "Liczba alarm\xF3w wst\u0119pnych",
        uk: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0445 \u0442\u0440\u0438\u0432\u043E\u0433",
        "zh-cn": "\u9884\u8B66\u6B21\u6570"
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
        de: "Anzahl der Schlummerphasen",
        en: "Number of snoozes",
        ru: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043E\u0442\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u043E\u0432",
        pt: "N\xFAmero de sonecas",
        nl: "Aantal snoozes",
        fr: "Nombre de r\xE9p\xE9titions",
        it: "Numero di snooze",
        es: "N\xFAmero de siestas",
        pl: "Liczba drzemek",
        uk: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u044C \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u0430",
        "zh-cn": "\u6253\u76F9\u6B21\u6570"
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
        de: "Anzahl der Stoppaktionen",
        en: "Number of stop actions",
        ru: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u043F\u043E \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0435",
        pt: "N\xFAmero de a\xE7\xF5es de parada",
        nl: "Aantal stopacties",
        fr: "Nombre d'actions d'arr\xEAt",
        it: "Numero di azioni di arresto",
        es: "N\xFAmero de acciones de parada",
        pl: "Liczba akcji zatrzymania",
        uk: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u0437\u0443\u043F\u0438\u043D\u043E\u043A",
        "zh-cn": "\u505C\u6B62\u52A8\u4F5C\u6B21\u6570"
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
        en: "Number of errors",
        ru: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043E\u0448\u0438\u0431\u043E\u043A",
        pt: "N\xFAmero de erros",
        nl: "Aantal fouten",
        fr: "Nombre d'erreurs",
        it: "Numero di errori",
        es: "N\xFAmero de errores",
        pl: "Liczba b\u0142\u0119d\xF3w",
        uk: "\u041A\u0456\u043B\u044C\u043A\u0456\u0441\u0442\u044C \u043F\u043E\u043C\u0438\u043B\u043E\u043A",
        "zh-cn": "\u9519\u8BEF\u6570\u91CF"
      },
      type: "number",
      role: "value",
      read: true,
      write: false,
      def: 0
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("statistics.lastWakeDelay", {
    type: "state",
    common: {
      name: {
        de: "Letzte Aufwachverz\xF6gerung",
        en: "Last wake-up delay",
        ru: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F",
        pt: "\xDAltimo atraso para despertar",
        nl: "Laatste wekvertraging",
        fr: "Dernier d\xE9lai de r\xE9veil",
        it: "Ultimo ritardo di sveglia",
        es: "\xDAltimo retraso de activaci\xF3n",
        pl: "Ostatnie op\xF3\u017Anienie pobudki",
        uk: "\u041E\u0441\u0442\u0430\u043D\u043D\u044F \u0437\u0430\u0442\u0440\u0438\u043C\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F",
        "zh-cn": "\u6700\u540E\u8D77\u5E8A\u5EF6\u8FDF"
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
  await adapter.setObjectNotExistsAsync("statistics.averageWakeDelay", {
    type: "state",
    common: {
      name: {
        de: "Durchschnittliche Aufwachverz\xF6gerung",
        en: "Average wake-up delay",
        ru: "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F",
        pt: "Atraso m\xE9dio para despertar",
        nl: "Gemiddelde wekvertraging",
        fr: "D\xE9lai moyen de r\xE9veil",
        it: "Ritardo medio di risveglio",
        es: "Retraso promedio al despertar",
        pl: "\u015Arednie op\xF3\u017Anienie wybudzania",
        uk: "\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u0437\u0430\u0442\u0440\u0438\u043C\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F",
        "zh-cn": "\u5E73\u5747\u8D77\u5E8A\u5EF6\u8FDF"
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
  await adapter.setObjectNotExistsAsync("statistics.bestWakeDelay", {
    type: "state",
    common: {
      name: {
        de: "Beste Aufwachverz\xF6gerung",
        en: "Best wake-up delay",
        ru: "\u041E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F",
        pt: "Melhor atraso para despertar",
        nl: "Beste wektijd",
        fr: "Meilleur d\xE9lai de r\xE9veil",
        it: "Miglior ritardo di sveglia",
        es: "Mejor retardo de despertar",
        pl: "Najlepsze op\xF3\u017Anienie wybudzania",
        uk: "\u041D\u0430\u0439\u043A\u0440\u0430\u0449\u0430 \u0437\u0430\u0442\u0440\u0438\u043C\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F",
        "zh-cn": "\u6700\u4F73\u8D77\u5E8A\u5EF6\u8FDF"
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
  await adapter.setObjectNotExistsAsync("statistics.worstWakeDelay", {
    type: "state",
    common: {
      name: {
        de: "Schlechteste Aufwachverz\xF6gerung",
        en: "Worst wake-up delay",
        ru: "\u041D\u0430\u0438\u0445\u0443\u0434\u0448\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F",
        pt: "Pior atraso para acordar",
        nl: "Ergste wekvertraging",
        fr: "Le pire retard au r\xE9veil",
        it: "Il peggior ritardo di risveglio",
        es: "El peor retraso al despertar",
        pl: "Najgorsze op\xF3\u017Anienie wybudzania",
        uk: "\u041D\u0430\u0439\u0433\u0456\u0440\u0448\u0430 \u0437\u0430\u0442\u0440\u0438\u043C\u043A\u0430 \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F",
        "zh-cn": "\u6700\u7CDF\u7CD5\u7684\u8D77\u5E8A\u5EF6\u8FDF"
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
  await adapter.setObjectNotExistsAsync("statistics.wakeDelayHistory", {
    type: "state",
    common: {
      name: {
        de: "Verlauf der Aufwachverz\xF6gerungen",
        en: "Progression of wake-up delays",
        ru: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u0434\u0435\u0440\u0436\u0435\u043A \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u044F",
        pt: "Progress\xE3o dos atrasos no despertar",
        nl: "Verloop van de wekvertraging",
        fr: "Progression des retards au r\xE9veil",
        it: "Progressione dei ritardi di risveglio",
        es: "Progresi\xF3n de los retrasos al despertar",
        pl: "Post\u0119p op\xF3\u017Anie\u0144 wybudzania",
        uk: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0443\u0432\u0430\u043D\u043D\u044F \u0437\u0430\u0442\u0440\u0438\u043C\u043E\u043A \u043F\u0440\u043E\u0431\u0443\u0434\u0436\u0435\u043D\u043D\u044F",
        "zh-cn": "\u89C9\u9192\u5EF6\u8FDF\u7684\u8FDB\u5C55"
      },
      type: "string",
      role: "json",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("statistics.lastAlarm", {
    type: "state",
    common: {
      name: {
        de: "Letzter Alarm",
        en: "Last alarm",
        ru: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        pt: "\xDAltimo alarme",
        nl: "Laatste alarm",
        fr: "Derni\xE8re alarme",
        it: "Ultimo allarme",
        es: "\xDAltima alarma",
        pl: "Ostatni alarm",
        uk: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0431\u0443\u0434\u0438\u043B\u044C\u043D\u0438\u043A",
        "zh-cn": "\u6700\u540E\u8B66\u62A5"
      },
      type: "string",
      role: "value.time",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
  await adapter.setObjectNotExistsAsync("statistics.lastWakeup", {
    type: "state",
    common: {
      name: {
        de: "Letztes Aufstehen",
        en: "Last getting up",
        ru: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0432\u0441\u0442\u0430\u0432\u0430\u043D\u0438\u0435",
        pt: "\xDAltimo a levantar",
        nl: "Als laatste opstaan",
        fr: "Dernier lever",
        it: "Ultimo alzarsi",
        es: "Por \xFAltimo, levantarse",
        pl: "Ostatnie wstawanie",
        uk: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u043F\u0456\u0434\u0439\u043E\u043C",
        "zh-cn": "\u6700\u540E\u8D77\u5E8A"
      },
      type: "string",
      role: "value.time",
      read: true,
      write: false,
      def: ""
    },
    native: {}
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createStatesObjects
});
//# sourceMappingURL=createstatesobjects.js.map
