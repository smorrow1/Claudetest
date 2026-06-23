# ReefLog — Reef Tank Parameter & Dosing Tracker

> Track water parameters, nail your dosing, spot drift early. Built for serious reef keepers.

## Quick Start

```bash
cd reeflog
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` for iOS simulator.

## Stack

- React Native + Expo SDK 51
- TypeScript
- React Navigation v6 (bottom tabs + stack)
- Zustand + AsyncStorage (local-first, no backend required)
- expo-notifications (local push, no server)
- expo-linear-gradient

## Project Structure

```
src/
├── navigation/     # AppNavigator (tabs + stack)
├── screens/        # One file per screen
├── components/     # Reusable UI components
├── store/          # Zustand stores (tanks, tests, dosing, subscription)
├── hooks/          # usePremium, useNotifications
├── data/           # Parameter definitions, mock data
└── theme/          # Colors, typography, spacing
```

## Feature Gates (Free vs Pro)

| Feature | Free | Pro ($9.99) |
|---|---|---|
| Tanks | 1 | Unlimited |
| Test log entries | 30 | Unlimited |
| Dosing chemicals | 2 | Unlimited |
| History | 7 days | 30 / 90 days |
| Reminders | — | Daily push |

## TODOs Before Publishing

### Required
- [ ] Add real app icon (1024x1024) to `assets/icon.png`
- [ ] Add splash screen to `assets/splash.png`
- [ ] Update `app.json` bundleIdentifier + package name
- [ ] Wire `expo-in-app-purchases` in `PaywallScreen.tsx` (replace simulation)
- [ ] Add real Privacy Policy URL to `SettingsScreen.tsx`
- [ ] Add real Terms of Service URL to `SettingsScreen.tsx`
- [ ] Add real feedback email/URL
- [ ] Set up EAS Build: `npx eas build:configure`

### Recommended
- [ ] Add analytics (PostHog or Mixpanel) — track log events, paywall views, conversions
- [ ] Add Sentry for crash reporting
- [ ] Set up EAS Update for OTA updates
- [ ] Add App Store review prompt (after 3rd test log)
- [ ] Add MMKV for faster storage (replace AsyncStorage)

### v1.1
- [ ] PDF export (react-native-pdf or server-side via Supabase function)
- [ ] Cloud sync (Supabase with email magic link)
- [ ] Dosing calculator (target → dose amount based on volume)
- [ ] Multiple active tanks

### v1.2
- [ ] Coral inventory
- [ ] Planted freshwater mode (different parameters)
- [ ] Equipment log (pump, heater, skimmer maintenance)

## EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
eas build --platform android
```

## ASO Keywords

reef aquarium tracker, saltwater tank log, coral parameter tracker, dosing schedule,
alk cal mag reef, reef chemistry, water test log, aquarium journal, reef tank app, SPS keeper

## Monetization

One-time Pro unlock: $9.99
- Trial: 14-day free trial starts automatically on first launch
- Paywall triggers: 2nd tank, 3rd chemical, 30-day history, export
- TODO: Set up App Store Connect and Google Play billing
