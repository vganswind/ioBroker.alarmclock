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
                ru: "Команды",
                pt: "Comandos",
                nl: "Commando's",
                fr: "Commandes",
                it: "Comandi",
                es: "Comandos",
                pl: "Polecenia",
                uk: "Команди",
                "zh-cn": "命令",
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
                ru: "Приостановить сигнал тревоги",
                pt: "Pausar alarme",
                nl: "Pauzeer alarm",
                fr: "Pause alarme",
                it: "Metti in pausa l'allarme",
                es: "Alarma de pausa",
                pl: "Wstrzymaj alarm",
                uk: "Призупинити будильник",
                "zh-cn": "暂停闹钟",
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
                de: "Alarm stoppen",
                en: "Stop alarm",
                ru: "Остановить сигнализацию",
                pt: "Alarme de parada",
                nl: "Stop alarm",
                fr: "Alarme d'arrêt",
                it: "Interrompere l'allarme",
                es: "Alarma de parada",
                pl: "Zatrzymaj alarm",
                uk: "Зупинити будильник",
                "zh-cn": "停止警报",
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
                ru: "Конфигурация",
                pt: "Configuração",
                nl: "Configuratie",
                fr: "Configuration",
                it: "Configurazione",
                es: "Configuración",
                pl: "Konfiguracja",
                uk: "Конфігурація",
                "zh-cn": "配置",
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
                ru: "Сигнализация включена",
                pt: "Alarme ativado",
                nl: "Alarm ingeschakeld",
                fr: "Alarme activée",
                it: "Allarme attivato",
                es: "Alarma activada",
                pl: "Alarm włączony",
                uk: "Сигналізація ввімкнена",
                "zh-cn": "警报已启用",
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
                de: "Voralarmzeit in Minuten",
                en: "Pre-alarm time in minutes",
                ru: "Время до срабатывания сигнализации в минутах",
                pt: "Tempo de pré-alarme em minutos",
                nl: "Vooralarmtijd in minuten",
                fr: "Temps de pré-alarme en minutes",
                it: "Tempo di preavviso in minuti",
                es: "Tiempo de prealarma en minutos",
                pl: "Czas przed alarmem w minutach",
                uk: "Час передтривоги в хвилинах",
                "zh-cn": "预警时间（分钟）",
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
                de: "Nächsten Alarm ignorieren",
                en: "Ignore next alarm",
                ru: "Игнорировать следующий будильник",
                pt: "Ignore o próximo alarme",
                nl: "Negeer het volgende alarm",
                fr: "Ignorer la prochaine alarme",
                it: "Ignora il prossimo allarme",
                es: "Ignorar la siguiente alarma",
                pl: "Zignoruj następny alarm",
                uk: "Ігнорувати наступний будильник",
                "zh-cn": "忽略下一个警报",
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
                ru: "Время будильника в минутах",
                pt: "Tempo de soneca em minutos",
                nl: "Slaaptijd in minuten",
                fr: "Durée de la fonction snooze en minutes",
                it: "Tempo di posticipo in minuti",
                es: "Tiempo de repetición en minutos",
                pl: "Czas drzemki w minutach",
                uk: "Час відкладення у хвилинах",
                "zh-cn": "贪睡时间（分钟）",
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
                ru: "Значения времени выполнения",
                pt: "Valores de tempo de execução",
                nl: "Runtime-waarden",
                fr: "Valeurs d'exécution",
                it: "Valori di runtime",
                es: "Valores de tiempo de ejecución",
                pl: "Wartości czasu wykonania",
                uk: "Значення під час виконання",
                "zh-cn": "运行时值",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("runtime.countdownAlarm", {
        type: "state",
        common: {
            name: {
                de: "Countdown bis zum Alarm",
                en: "Countdown to alarm",
                ru: "Обратный отсчет до сигнала тревоги",
                pt: "Contagem regressiva para o alarme",
                nl: "Aftellen tot alarm",
                fr: "Compte à rebours avant l'alarme",
                it: "Conto alla rovescia per la sveglia",
                es: "Cuenta regresiva para la alarma",
                pl: "Odliczanie do alarmu",
                uk: "Зворотний відлік до будильника",
                "zh-cn": "警报倒计时",
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

    await adapter.setObjectNotExistsAsync("runtime.countdownAlarmText", {
        type: "state",
        common: {
            name: {
                en: "Formatted countdown to the alarm",
                de: "Formatierter Countdown bis zum Alarm",
                ru: "Форматированный обратный отсчет до срабатывания будильника",
                pt: "Contagem regressiva formatada para o alarme",
                nl: "Opmaak aftelling tot het alarm",
                fr: "Compte à rebours formaté jusqu'à l'alarme",
                it: "Conto alla rovescia formattato per la sveglia",
                es: "Cuenta regresiva formateada para la alarma",
                pl: "Sformatowane odliczanie do alarmu",
                uk: "Форматований зворотний відлік до будильника",
                "zh-cn": "闹钟倒计时（已格式化）",
            },
            type: "string",
            role: "text",
            read: true,
            write: false,
            def: "",
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("runtime.active", {
        type: "state",
        common: {
            name: {
                de: "Alarm ist aktiv",
                en: "Alarm is active",
                ru: "Сигнал тревоги активен",
                pt: "Alarme ativo",
                nl: "Alarm is actief",
                fr: "L'alarme est activée.",
                it: "L'allarme è attivo",
                es: "La alarma está activa.",
                pl: "Alarm jest aktywny",
                uk: "Сигналізація активна",
                "zh-cn": "警报已激活",
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
                de: "Countdown bis zum Voralarm",
                en: "Countdown to pre-alarm",
                ru: "Обратный отсчет до начала тревоги",
                pt: "Contagem regressiva para o pré-alarme",
                nl: "Aftellen tot het pre-alarm",
                fr: "Compte à rebours avant la pré-alarme",
                it: "Conto alla rovescia per la pre-allarme",
                es: "Cuenta regresiva para la prealarma",
                pl: "Odliczanie do alarmu wstępnego",
                uk: "Зворотний відлік до попереднього сигналу тривоги",
                "zh-cn": "预警倒计时",
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

    await adapter.setObjectNotExistsAsync("runtime.countdownPreAlarmText", {
        type: "state",
        common: {
            name: {
                en: "Formatted countdown to the pre-alarm",
                de: "Formatierter Countdown bis zum Voralarm",
                ru: "Форматированный обратный отсчет до срабатывания предварительного сигнала тревоги",
                pt: "Contagem regressiva formatada para o pré-alarme",
                nl: "Geformatteerde aftelling naar het vooralarm",
                fr: "Compte à rebours formaté avant la pré-alarme",
                it: "Conto alla rovescia formattato per il preallarme",
                es: "Cuenta regresiva formateada para la prealarma",
                pl: "Sformatowane odliczanie do alarmu wstępnego",
                uk: "Форматований зворотний відлік до попереднього сигналу тривоги",
                "zh-cn": "格式化的预警倒计时",
            },
            type: "string",
            role: "text",
            read: true,
            write: false,
            def: "",
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("runtime.countdownSnooze", {
        type: "state",
        common: {
            name: {
                de: "Countdown bis zum Ende der Schlummerzeit",
                en: "Countdown to end snooze time",
                ru: "Обратный отсчет до окончания времени откладывания будильника.",
                pt: "Contagem regressiva para o fim do tempo soneca",
                nl: "Aftellen tot het einde van de snooze-tijd",
                fr: "Compte à rebours avant la fin de la fonction snooze",
                it: "Conto alla rovescia per la fine della funzione snooze",
                es: "Cuenta regresiva para que termine la hora de posponer la alarma.",
                pl: "Odliczanie do zakończenia drzemki",
                uk: "Зворотний відлік до завершення часу відкладення будильника",
                "zh-cn": "结束贪睡倒计时",
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

    await adapter.setObjectNotExistsAsync("runtime.countdownSnoozeText", {
        type: "state",
        common: {
            name: {
                en: "Formatted countdown to the end snooze time",
                de: "Formatierter Countdown bis zum Ende der Schlummerzeit",
                ru: "Форматированный обратный отсчет до окончания времени отложенного будильника",
                pt: "Contagem regressiva formatada para o fim do tempo de soneca",
                nl: "Opgemaakte aftelling tot het einde van de snooze-tijd",
                fr: "Compte à rebours formaté jusqu'à la fin de la fonction snooze",
                it: "Conto alla rovescia formattato per la fine del tempo di posticipo",
                es: "Cuenta regresiva formateada hasta el final del tiempo de posposición",
                pl: "Sformatowane odliczanie do końca drzemki",
                uk: "Форматований зворотний відлік до кінця часу повторення будильника",
                "zh-cn": "格式化的午睡结束倒计时",
            },
            type: "string",
            role: "text",
            read: true,
            write: false,
            def: "",
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("runtime.nextAlarm", {
        type: "state",
        common: {
            name: {
                de: "Nächster Alarm",
                en: "Next alarm",
                ru: "Следующий будильник",
                pt: "Próximo alarme",
                nl: "Volgende alarm",
                fr: "Prochaine alarme",
                it: "Prossimo allarme",
                es: "Siguiente alarma",
                pl: "Następny alarm",
                uk: "Наступний будильник",
                "zh-cn": "下一个闹钟",
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
                ru: "Следующая предварительная тревога",
                pt: "Próximo pré-alarme",
                nl: "Volgende vooralarm",
                fr: "Prochaine pré-alarme",
                it: "Prossimo preallarme",
                es: "Siguiente prealarma",
                pl: "Następny alarm wstępny",
                uk: "Наступний попередній сигнал тривоги",
                "zh-cn": "下一次预警",
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
                de: "Schlummern bis",
                en: "Snooze until",
                ru: "Отложите будильник до",
                pt: "Adormeça até",
                nl: "Snooze tot",
                fr: "Faire la grasse matinée jusqu'à",
                it: "Rimanda fino a",
                es: "Posponer hasta",
                pl: "Drzemka do",
                uk: "Відкласти до",
                "zh-cn": "打盹直到",
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
                ru: "Состояние",
                pt: "Estado",
                nl: "Staat",
                fr: "État",
                it: "Stato",
                es: "Estado",
                pl: "Państwo",
                uk: "Штат",
                "zh-cn": "状态",
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
                de: "Helligkeit des Lichtweckers",
                en: "Light alarm clock brightness",
                ru: "Яркость светового будильника",
                pt: "Brilho do despertador luminoso",
                nl: "Helderheid van de wekker",
                fr: "Luminosité du réveil",
                it: "Luminosità della sveglia luminosa",
                es: "Brillo del reloj despertador",
                pl: "Jasność budzika świetlnego",
                uk: "Яскравість світлового будильника",
                "zh-cn": "闹钟亮度",
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
                de: "Fortschritt des Lichtweckers",
                en: "Light alarm clock progress",
                ru: "Световой будильник продолжает работу",
                pt: "progresso do despertador luminoso",
                nl: "Voortgang van de lichtwekker",
                fr: "progrès du réveil lumineux",
                it: "progresso della sveglia luminosa",
                es: "Progreso del reloj despertador luminoso",
                pl: "Postęp budzika świetlnego",
                uk: "Прогрес світлового будильника",
                "zh-cn": "灯光闹钟进度",
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
                ru: "Время пробуждения",
                pt: "Horários de despertar",
                nl: "Opstaantijden",
                fr: "Heures de réveil",
                it: "orari di sveglia",
                es: "Horas de despertar",
                pl: "Godziny pobudki",
                uk: "Час пробудження",
                "zh-cn": "起床时间",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("schedule.monday", {
        type: "state",
        common: {
            name: {
                de: "Weckzeit am Montag",
                en: "Wake-up time on monday",
                ru: "Время пробуждения в понедельник",
                pt: "Hora de acordar na segunda-feira",
                nl: "Tijd om maandag op te staan",
                fr: "Heure de réveil le lundi",
                it: "Ora di sveglia lunedì",
                es: "Hora de despertarse el lunes",
                pl: "Poranek pobudki",
                uk: "Час пробудження у понеділок",
                "zh-cn": "星期一的起床时间",
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
                en: "Wake-up time on tuesday",
                ru: "Время подъема во вторник",
                pt: "Hora de acordar na terça-feira",
                nl: "Tijd om op dinsdag op te staan",
                fr: "Heure de réveil mardi",
                it: "Ora di sveglia martedì",
                es: "Hora de despertarse el martes",
                pl: "Pobudka we wtorek",
                uk: "Час пробудження у вівторок",
                "zh-cn": "星期二的起床时间",
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
                en: "Wake-up time on wednesday",
                ru: "Время подъема в среду",
                pt: "Hora de acordar na quarta-feira",
                nl: "Opstaan op woensdag",
                fr: "Heure de réveil mercredi",
                it: "Ora di sveglia il mercoledì",
                es: "Hora de despertarse el miércoles",
                pl: "Pobudka w środę",
                uk: "Час пробудження у середу",
                "zh-cn": "星期三的起床时间",
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
                en: "Wake-up time on thursday",
                ru: "Время подъема в четверг",
                pt: "Hora de acordar na quinta-feira",
                nl: "Opstaan op donderdag",
                fr: "Heure de réveil jeudi",
                it: "Ora di sveglia giovedì",
                es: "Hora de despertarse el jueves",
                pl: "Pobudka w czwartek",
                uk: "Час пробудження у четвер",
                "zh-cn": "星期四的起床时间",
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
                en: "Wake-up time on friday",
                ru: "Время подъема в пятницу",
                pt: "Hora de acordar na sexta-feira",
                nl: "Tijd om op vrijdag op te staan",
                fr: "Heure de réveil le vendredi",
                it: "Ora di sveglia il venerdì",
                es: "Hora de despertarse el viernes",
                pl: "Pora pobudki w piątek",
                uk: "Час пробудження у п'ятницю",
                "zh-cn": "星期五的起床时间",
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
                en: "Wake-up time on saturday",
                ru: "Время подъема в субботу",
                pt: "Hora de acordar no sábado",
                nl: "Tijd om op zaterdag op te staan",
                fr: "Heure de réveil le samedi",
                it: "Ora di sveglia del sabato",
                es: "Hora de despertarse el sábado",
                pl: "Pora pobudki w sobotę",
                uk: "Час пробудження в суботу",
                "zh-cn": "星期六的起床时间",
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
                en: "Wake-up time on sunday",
                ru: "Время подъема в воскресенье",
                pt: "Hora de acordar no domingo",
                nl: "Tijd om op te staan op zondag",
                fr: "Heure de réveil le dimanche",
                it: "Ora di sveglia la domenica",
                es: "Hora de despertarse el domingo",
                pl: "Pora pobudki w niedzielę",
                uk: "Час пробудження в неділю",
                "zh-cn": "星期天的起床时间",
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
                ru: "Время пробуждения в отпуске",
                pt: "Hora de acordar nas férias",
                nl: "Tijdstip van opstaan tijdens vakantie",
                fr: "L'heure du réveil en vacances",
                it: "Ora di sveglia in vacanza",
                es: "Hora de despertarse en vacaciones",
                pl: "Czas na pobudkę na wakacjach",
                uk: "Час пробудження у відпустці",
                "zh-cn": "假期起床时间",
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
                ru: "Время пробуждения в праздничные дни",
                pt: "Hora de acordar nos feriados",
                nl: "Tijdstip van opstaan tijdens vakanties",
                fr: "Heure de réveil pendant les vacances",
                it: "Orario di sveglia nei giorni festivi",
                es: "Hora de despertarse en días festivos",
                pl: "Czas pobudki w święta",
                uk: "Час пробудження у свята",
                "zh-cn": "节假日起床时间",
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
                ru: "Статистика",
                pt: "Estatísticas",
                nl: "Statistieken",
                fr: "Statistiques",
                it: "Statistiche",
                es: "Estadística",
                pl: "Statystyka",
                uk: "Статистика",
                "zh-cn": "统计数据",
            },
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync("statistics.alarmCount", {
        type: "state",
        common: {
            name: {
                de: "Anzahl der Alarme",
                en: "Number of alarms",
                ru: "Количество сигналов тревоги",
                pt: "Número de alarmes",
                nl: "Aantal alarmen",
                fr: "Nombre d'alarmes",
                it: "Numero di allarmi",
                es: "Número de alarmas",
                pl: "Liczba alarmów",
                uk: "Кількість тривог",
                "zh-cn": "警报数量",
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
                ru: "Количество предварительных сигналов тревоги",
                pt: "Número de pré-alarmes",
                nl: "Aantal vooralarmen",
                fr: "Nombre de pré-alarmes",
                it: "Numero di pre-allarmi",
                es: "Número de prealarmas",
                pl: "Liczba alarmów wstępnych",
                uk: "Кількість попередніх тривог",
                "zh-cn": "预警次数",
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
                de: "Anzahl der Schlummerphasen",
                en: "Number of snoozes",
                ru: "Количество отложенных будильников",
                pt: "Número de sonecas",
                nl: "Aantal snoozes",
                fr: "Nombre de répétitions",
                it: "Numero di snooze",
                es: "Número de siestas",
                pl: "Liczba drzemek",
                uk: "Кількість повторень будильника",
                "zh-cn": "打盹次数",
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
                de: "Anzahl der Stoppaktionen",
                en: "Number of stop actions",
                ru: "Количество действий по остановке",
                pt: "Número de ações de parada",
                nl: "Aantal stopacties",
                fr: "Nombre d'actions d'arrêt",
                it: "Numero di azioni di arresto",
                es: "Número de acciones de parada",
                pl: "Liczba akcji zatrzymania",
                uk: "Кількість зупинок",
                "zh-cn": "停止动作次数",
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
                ru: "Количество ошибок",
                pt: "Número de erros",
                nl: "Aantal fouten",
                fr: "Nombre d'erreurs",
                it: "Numero di errori",
                es: "Número de errores",
                pl: "Liczba błędów",
                uk: "Кількість помилок",
                "zh-cn": "错误数量",
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
                ru: "Последняя задержка пробуждения",
                pt: "Último atraso para despertar",
                nl: "Laatste wekvertraging",
                fr: "Dernier délai de réveil",
                it: "Ultimo ritardo di sveglia",
                es: "Último retraso de activación",
                pl: "Ostatnie opóźnienie pobudki",
                uk: "Остання затримка пробудження",
                "zh-cn": "最后起床延迟",
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
                ru: "Средняя задержка пробуждения",
                pt: "Atraso médio para despertar",
                nl: "Gemiddelde wekvertraging",
                fr: "Délai moyen de réveil",
                it: "Ritardo medio di risveglio",
                es: "Retraso promedio al despertar",
                pl: "Średnie opóźnienie wybudzania",
                uk: "Середня затримка пробудження",
                "zh-cn": "平均起床延迟",
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
                ru: "Оптимальная задержка пробуждения",
                pt: "Melhor atraso para despertar",
                nl: "Beste wektijd",
                fr: "Meilleur délai de réveil",
                it: "Miglior ritardo di sveglia",
                es: "Mejor retardo de despertar",
                pl: "Najlepsze opóźnienie wybudzania",
                uk: "Найкраща затримка пробудження",
                "zh-cn": "最佳起床延迟",
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
                ru: "Наихудшая задержка пробуждения",
                pt: "Pior atraso para acordar",
                nl: "Ergste wekvertraging",
                fr: "Le pire retard au réveil",
                it: "Il peggior ritardo di risveglio",
                es: "El peor retraso al despertar",
                pl: "Najgorsze opóźnienie wybudzania",
                uk: "Найгірша затримка пробудження",
                "zh-cn": "最糟糕的起床延迟",
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
                de: "Verlauf der Aufwachverzögerungen",
                en: "Progression of wake-up delays",
                ru: "Прогрессирование задержек пробуждения",
                pt: "Progressão dos atrasos no despertar",
                nl: "Verloop van de wekvertraging",
                fr: "Progression des retards au réveil",
                it: "Progressione dei ritardi di risveglio",
                es: "Progresión de los retrasos al despertar",
                pl: "Postęp opóźnień wybudzania",
                uk: "Прогресування затримок пробудження",
                "zh-cn": "觉醒延迟的进展",
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
                ru: "Последний будильник",
                pt: "Último alarme",
                nl: "Laatste alarm",
                fr: "Dernière alarme",
                it: "Ultimo allarme",
                es: "Última alarma",
                pl: "Ostatni alarm",
                uk: "Останній будильник",
                "zh-cn": "最后警报",
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
                en: "Last getting up",
                ru: "Последнее вставание",
                pt: "Último a levantar",
                nl: "Als laatste opstaan",
                fr: "Dernier lever",
                it: "Ultimo alzarsi",
                es: "Por último, levantarse",
                pl: "Ostatnie wstawanie",
                uk: "Останній підйом",
                "zh-cn": "最后起床",
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
