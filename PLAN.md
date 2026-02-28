# Flip Timer – iPhone Timer App (PWA)

> Inspiriert von der physischen Ticktime TK3 Pomodoro-Uhr.
> Drehe dein iPhone auf der Qi-Ladestation, um zwischen Fokus und Pause zu wechseln.

---

## 1. Konzept-Übersicht

| Eigenschaft | Detail |
|---|---|
| **App-Typ** | Progressive Web App (PWA) |
| **Grund** | Kein Apple Developer Account nötig – direkt über Safari installierbar auf dem Home Screen |
| **Framework** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS (minimalistisch, TK3-inspiriert) |
| **Sensor-API** | DeviceOrientation API (Gyroscop/Beschleunigungssensor) |
| **Offline** | Service Worker für volle Offline-Funktionalität |

---

## 2. Kernidee – Rotation als Steuerung

Das iPhone liegt auf der Qi-Ladestation. Die App erkennt die Ausrichtung:

```
  ┌─────────┐
  │  12:00  │  ▲ Oberseite oben
  │  FOKUS  │  → Fokus-Timer läuft (z.B. 25 min)
  │         │
  └─────────┘

  ┌─────────┐
  │         │
  │  PAUSE  │  ▼ Oberseite unten (um 180° gedreht)
  │  05:00  │  → Pause-Timer läuft (z.B. 5 min)
  └─────────┘
```

**Technisch:** Die DeviceOrientation API liefert `beta` und `gamma` Werte:
- **Portrait, Oberseite oben** (beta ≈ 0°, gamma ≈ 0°): → Fokus-Modus
- **Portrait, Oberseite unten** (beta ≈ ±180°): → Pause-Modus
- Hysterese-Schwellenwert (z.B. 150°) um versehentliches Umschalten zu verhindern

---

## 3. Design – TK3-inspiriert

### Farbpalette
```
Hintergrund:    #1A1A2E  (tiefes Dunkelblau)
Fokus-Akzent:   #E94560  (warmes Rot)
Pause-Akzent:   #0F3460  (ruhiges Blau)
Text:            #EAEAEA  (helles Grau)
Ring-Track:      #2A2A4A  (gedämpftes Dunkelviolett)
```

### Layout (Vollbild, zentriert)
```
    ┌──────────────────────┐
    │                      │
    │      ╭──────╮        │
    │    ╭─┤      ├─╮      │
    │   │  │ 24:35 │  │    │   ← SVG Kreis-Ring
    │   │  │       │  │    │     (animierter Countdown)
    │    ╰─┤      ├─╯      │
    │      ╰──────╯        │
    │                      │
    │     F O K U S        │   ← Modus-Anzeige
    │                      │
    │   [25] [45] [60]     │   ← Zeitvorwahl (Minuten)
    │                      │
    └──────────────────────┘
```

### Designprinzipien
- **Runder Timer**: Großer SVG-Circle als Fortschrittsring (wie TK3)
- **Minimalistisch**: Nur Timer + Modus + Zeitauswahl sichtbar
- **Vollbild**: Nutzt den gesamten Bildschirm, keine Navigation
- **Sanfte Übergänge**: CSS-Transitions beim Moduswechsel (Farben morphen)
- **Große Typografie**: Gut lesbar aus der Entfernung auf der Ladestation

---

## 4. Features

### MVP (Phase 1)
- [ ] Kreisförmiger Countdown-Timer (SVG-Ring-Animation)
- [ ] Fokus-Modus (25 / 45 / 60 Minuten wählbar)
- [ ] Pause-Modus (5 / 10 / 15 Minuten wählbar)
- [ ] Rotation-Detection via DeviceOrientation API
- [ ] Sanfter Farbwechsel beim Moduswechsel
- [ ] Wake Lock API (Bildschirm bleibt an)
- [ ] Vibration bei Timer-Ende
- [ ] Audio-Notification (dezenter Ton)
- [ ] PWA-Manifest (installierbar auf Home Screen)
- [ ] Service Worker (Offline-fähig)
- [ ] Fullscreen API für immersives Erlebnis

### Nice-to-Have (Phase 2)
- [ ] Statistik-Seite (Fokus-Minuten pro Tag/Woche)
- [ ] Anpassbare Timer-Zeiten
- [ ] Verschiedene Sounds
- [ ] Dunkler/Heller Modus
- [ ] Haptic-Feedback Patterns

---

## 5. Technische Architektur

### Projektstruktur
```
flip-timer/
├── public/
│   ├── manifest.json          # PWA Manifest
│   ├── sw.js                  # Service Worker
│   ├── icons/                 # App Icons (192x192, 512x512)
│   └── sounds/
│       └── bell.mp3           # Timer-Ende Sound
├── src/
│   ├── main.tsx               # Entry Point
│   ├── App.tsx                # Hauptkomponente
│   ├── components/
│   │   ├── TimerRing.tsx      # SVG Kreis-Timer
│   │   ├── ModeIndicator.tsx  # Fokus/Pause Anzeige
│   │   ├── TimeSelector.tsx   # Zeitvorwahl-Buttons
│   │   └── PermissionPrompt.tsx # Sensor-Zugriff anfragen
│   ├── hooks/
│   │   ├── useDeviceOrientation.ts  # Rotation erkennen
│   │   ├── useTimer.ts              # Timer-Logik
│   │   └── useWakeLock.ts           # Bildschirm wach halten
│   ├── utils/
│   │   ├── orientation.ts     # Schwellenwert-Logik
│   │   └── audio.ts           # Sound abspielen
│   └── styles/
│       └── index.css          # Tailwind + Custom Styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Schlüssel-Komponenten

#### `useDeviceOrientation` Hook
```typescript
// Erkennt Orientierung und gibt den aktuellen Modus zurück
// Nutzt Hysterese um Flackern zu verhindern
// Threshold: 150° für Umschaltung, 30° für Rückkehr
type Mode = 'focus' | 'break'
```

#### `useTimer` Hook
```typescript
// Countdown-Logik mit requestAnimationFrame
// Unterstützt Start, Pause, Reset
// Speichert State in localStorage für Persistenz
```

#### `TimerRing` Komponente
```typescript
// SVG Circle mit stroke-dasharray/dashoffset Animation
// Radius ~120px, stroke-width ~8px
// Smooth Animation via CSS transition
```

---

## 6. PWA-Konfiguration

### manifest.json (Kern)
```json
{
  "name": "Flip Timer",
  "short_name": "FlipTimer",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1A1A2E",
  "background_color": "#1A1A2E"
}
```

### Installation auf iPhone (ohne Developer Account)
1. App im Safari öffnen (lokaler Dev-Server oder gehostet z.B. auf Vercel/Netlify)
2. Teilen-Button → "Zum Home-Bildschirm"
3. App erscheint als eigenständige App (kein Safari-UI)

---

## 7. Wichtige Hinweise & Einschränkungen

### iOS DeviceOrientation API
- **Seit iOS 13** muss der Nutzer explizit die Erlaubnis geben
- `DeviceOrientationEvent.requestPermission()` muss durch User-Geste (Tap) ausgelöst werden
- Die App zeigt beim ersten Start einen "Sensoren aktivieren"-Button

### Wake Lock API
- In Safari/iOS eingeschränkt unterstützt
- Fallback: NoSleep.js (spielt ein unsichtbares Video ab um den Bildschirm wach zu halten)

### Qi-Ladestation & Rotation
- Das iPhone muss flach liegen → `beta`-Wert ist der primäre Indikator
- Die meisten Qi-Charger erlauben 180°-Drehung
- Magnetische MagSafe-Charger könnten die Rotation einschränken → Am besten flache Qi-Pads verwenden

---

## 8. Tech-Stack Zusammenfassung

| Technologie | Zweck |
|---|---|
| **React 18** | UI Framework |
| **TypeScript** | Typsicherheit |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Utility-first Styling |
| **vite-plugin-pwa** | PWA-Generierung (Manifest + SW) |
| **DeviceOrientation API** | Rotation erkennen |
| **Wake Lock API** | Bildschirm wach halten |
| **Web Audio API** | Timer-Sounds |
| **Vibration API** | Haptisches Feedback |
| **localStorage** | Einstellungen & Timer-State |

---

## 9. Hosting / Deployment

Da kein Apple Developer Account vorhanden:

1. **Vercel** (empfohlen) – Kostenloses Hosting, automatisches HTTPS (nötig für PWA)
2. **Netlify** – Alternative, ebenfalls kostenlos
3. **GitHub Pages** – Einfachste Option

→ PWA über Safari installieren → Verhält sich wie eine native App

---

## 10. Umsetzungsreihenfolge

1. **Projekt-Setup**: Vite + React + TS + Tailwind + PWA Plugin
2. **Timer-Logik**: `useTimer` Hook mit Countdown
3. **Timer-UI**: SVG Ring-Komponente + Zeitanzeige
4. **Zeitvorwahl**: Buttons für voreingestellte Zeiten
5. **Orientierung**: `useDeviceOrientation` Hook + Modus-Umschaltung
6. **Wake Lock**: Bildschirm wach halten
7. **Audio/Vibration**: Benachrichtigung bei Timer-Ende
8. **PWA**: Manifest, Icons, Service Worker
9. **Polish**: Animationen, Übergänge, Feinschliff
10. **Deploy**: Auf Vercel/Netlify veröffentlichen
