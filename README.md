![Logo](admin/alarmclock.png)

# ioBroker.alarmclock

[![NPM version](https://img.shields.io/npm/v/iobroker.alarmclock.svg)](https://www.npmjs.com/package/iobroker.alarmclock)
[![Downloads](https://img.shields.io/npm/dm/iobroker.alarmclock.svg)](https://www.npmjs.com/package/iobroker.alarmclock)
![Number of Installations](https://iobroker.live/badges/alarmclock-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/alarmclock-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.alarmclock.png?downloads=true)](https://nodei.co/npm/iobroker.alarmclock/)

**Tests:** ![Test and Release](https://github.com/vganswind/ioBroker.alarmclock/workflows/Test%20and%20Release/badge.svg)

## alarmclock adapter for ioBroker

Ein Adapter für die Einrichtung eines Weckers

## Installation

Please use the "adapter list" in ioBroker to install a stable version of this adapter. You can also use the CLI to install this adapter:

```bash
iobroker add alarmclock
```

## Dokumentation

Die Reihenfolge der Weckzeiten, das letzte gewinnt:

1. Tageszeit
2. Urlaub
3. Feiertage
4. Termine

Der Ablauf des Weckers

```plain
       IDLE
        │
        ▼
     PREALARM
        │
        ▼
      ALARM ◄ ────────┐
      │   │           │
 Stop ┤   ├── Snooze  │
      ▼   ▼           │
STOPPED   SNOOZE ─────┘
    │
    ▼
  IDLE (nächster Tag)
```

### Die Adapter Konfiguration

Die Konfiguration des Adapters

#### Feiertagskalender

Hier kann die Instanz des feiertage-Adapter gewählt werden.
Dieser wird dann für die Überprüfung des Feiertag-Alarms genutzt.

#### Urlaubskalender

Hier kann die Instanz des iCal-Adapter gewählt werden.
Dieser wird für Termine für die Prüfung des Urlaub-Alarms genutzt.

Über die Liste wird gesteuert auf welche Termine reagiert werden soll.

z.B.: Urlaub, Rückfeier, Krankenschein ...

#### Weckzeiten-Kalender

Hier kann die Instanz des iCal-Adapter gewählt werden.
Dieser wird für Termine für die Weckzeit genutzt.

Die Startzeit des Termins wird dann als Weckzeit eingestellt.

Über die Liste wird gesteuert auf welche Termine reagiert werden soll.

z.B.: Wecker, Alarm ...

#### Sonstiges

Hier kann die Länge des Verlaufs der Aufwachverzögerung eingestellt werden.

### Objekte

#### Actions

| Name   | Funktion        |
| ------ | --------------- |
| snooze | Alarm Pausieren |
| stop   | Alarm Stoppen   |

#### Konfiguration

| Name            | Funktion                    | Default    |
| --------------- | --------------------------- | ---------- |
| enabled         | Alarm Aktiviert             | false      |
| preAlarmMinutes | Voralarmzeit in Minuten     | 20 Minuten |
| skipNext        | Nächster Alarm überspringen | false      |
| snoozeMinutes   | Schlummerzeit in Minuten    | 10 Minuten |

#### Laufzeitwerte

countdownPreAlarm, countdownAlarm, countdownSnooze, sunriseBrightness und sunriseProgress werden alle 30 Sekunden aktualisiert.

| Name              | Funktion                                     | Beispiel                 |
| ----------------- | -------------------------------------------- | ------------------------ |
| active            | Alarm ist aktiv                              | false                    |
| countdownAlarm    | Laufzeit bis zum Alarm                       | 512 Minuten              |
| countdownPreAlarm | Laufzeit bis zum Voralarm                    | 492 Minuten              |
| countdownSnooze   | Countdown bis zum Ende der Schlummerfunktion | 8 Minuten                |
| nextAlarm         | Nächster Alarm                               | 2026-11-18T07:00:00.000Z |
| nextPreAlarm      | Nächster Voralarm                            | 2026-11-18T06:40:00.000Z |
| snoozeUntil       | Snooze bis                                   | 2026-11-16T18:37:15.554Z |
| state             | Zustand                                      | ARMED                    |
| sunriseBrightness | Lichtwecker Helligkeit                       | 21 %                     |
| sunriseProgress   | Lichtwecker Fortschritt                      | 20,598 %                 |

Der Zustand des Weckers kann folgende Werte annehmen:

- **DISABLED**: Der Wecker ist deaktiviert
- **ARMED**: Der Wecker wartet
- **PREALARM**: Der Wecker ist im Voralarm
- **TRIGGERED**: Der Wecker hat Ausgelöst
- **SNOOZE**: Der Wecker ist im Schlummermodus
- **STOPPED**: Der Wecker ist gestoppt
- **ERROR**: Fehler

#### Die Weckzeiten

Alle Uhrzeiten sind im Format HH:mm

| Name      | Funktion               | Default |
| --------- | ---------------------- | ------- |
| monday    | Weckzeit am Montag     | 06:00   |
| tuesday   | Weckzeit am Dienstag   | 06:00   |
| wednesday | Weckzeit am Mittwoch   | 06:00   |
| thursday  | Weckzeit am Donnerstag | 06:00   |
| friday    | Weckzeit am Freitag    | 06:00   |
| saturday  | Weckzeit am Samstag    | 08:00   |
| sunday    | Weckzeit am Sonntag    | 08:30   |
| vacation  | Weckzeit im Urlaub     | 10:30   |
| holiday   | Weckzeit an Feiertagen | 09:30   |

#### Statistiken

| Name             | Funktion                             |
| ---------------- | ------------------------------------ |
| alarmCount       | Anzahl der Alarme                    |
| preAlarmCount    | Anzahl der Voralarme                 |
| snoozeCount      | Anzahl der Schlummerzeit             |
| stopCount        | Anzahl der Stopp-Vorgänge            |
| errorCount       | Anzahl der Fehler                    |
| lastWakeDelay    | Letzte Aufwachverzögerung            |
| averageWakeDelay | Durchschnittliche Aufwachverzögerung |
| bestWakeDelay    | Beste Aufwachverzögerung             |
| worstWakeDelay   | Schlechteste Aufwachverzögerung      |
| wakeDelayHistory | Historie der Aufwachverzögerungen    |
| lastAlarm        | Letzter Alarm                        |
| lastWakeup       | Letztes Aufstehen                    |

## Changelog

<!--
    Placeholder for the next version (at the beginning of the line):
    ### **WORK IN PROGRESS**
-->

### 0.0.2 (2026-11-18)

- (Volker Ganswind) Second version

### 0.0.1 (2026-11-17)

- (Volker Ganswind) initial release

## License

MIT License

Copyright (c) 2026 Volker Ganswind <volker@ganswind.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
