# TaskFlow AI - Production React Native Todo Application

TaskFlow AI is a modern, premium, offline-first productivity and task management application built with **React Native** and **Expo**. It utilizes a gorgeous glassmorphic UI, custom animated SVG metrics charts, secure local authentication, and interactive alarm alerts.

## 🚀 Features

- **🔒 Offline Authentication:** Secure Login, Signup, and Forgot Password flows backed by `AsyncStorage`.
- **✨ Onboarding Slider:** 3-step animated slide-through guide featuring high-performance vector illustrations.
- **📊 Home Dashboard:** Tasks counters, completion widgets, and animated circular SVG progress trackers.
- **📅 Interactive Calendar:** Monthly grid layout showcasing daily task indicator dots (color-coded by highest priority).
- **📈 Productivity Insights:** Custom SVG bar charts (weekly stats), linear gradient area charts (monthly stats), and category completion meters.
- **⏰ Smart Alarms:** Notifications with snooze (5m, 10m, 30m) and dismiss controls. Top-level in-app overlay triggers custom ringing sounds and vibrations.
- **🔄 Recurring Tasks:** Automatically generates the next scheduled task instance (Daily, Weekly, Monthly) on completion.
- **🌓 Adaptive Theme:** Dynamic sync with System Dark/Light settings.

---

## 🛠️ Technology Stack

- **Framework:** React Native (Expo SDK 56)
- **Language:** TypeScript
- **State Management:** Zustand (with local AsyncStorage persistence)
- **Form Validation:** React Hook Form
- **Navigation:** React Navigation (Stack and Bottom Tabs)
- **Styling:** React Native Paper & Linear Gradients
- **Animations:** React Native Reanimated
- **Charts & Graphics:** React Native SVG
- **Alarms & Sound:** Expo Notifications & Expo AV

---

## 📂 Project Structure

```
taskflow-ai/
├── assets/                     # Packaged static assets (icons, alarm.wav sound)
├── src/
│   ├── components/             # Reusable UI widgets
│   ├── context/
│   │   └── store.ts            # Zustand persistent offline data store
│   ├── hooks/
│   │   └── useAppTheme.ts      # Premium light/dark theme hooks
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Stacks, Tabs, and modal route flows
│   ├── screens/                # Core screens (Dashboard, Calendar, Stats, Auth)
│   ├── services/
│   │   ├── alarmService.ts     # Sound playback and physical vibration loops
│   │   └── notificationService.ts # Local notification channels and category schedules
│   ├── types/
│   │   └── index.ts            # App-wide interfaces
│   └── utils/
│       └── date.ts             # Recurring dates calculations and formatting
├── App.tsx                     # App bootstrap root component
├── app.json                    # Expo config overrides (permissions, bundles)
├── index.ts                    # Root entry point
└── tsconfig.json               # TypeScript configurations
```

---

## 📦 Installation & Setup

Follow these steps to run the application locally on your machine:

### Prerequisites

- Node.js (v20.x or higher recommended)
- Git
- Android Studio (for emulator testing) / Expo Go app on physical iOS/Android phone

### Step 1: Clone and Navigate to the Repository
```bash
cd "Todo app R"
```

### Step 2: Install Package Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npx expo start
```

### Step 4: Scan and Test
- Install the **Expo Go** application on your physical mobile device.
- Scan the QR code displayed in your terminal to view and run the application.
- To run on a simulator, press `a` for Android Emulator or `i` for iOS Simulator (requires macOS).

---

## 🛠️ Build and Release Guides

Because TaskFlow AI is built using Expo, you have two primary options for compiling production release builds.

---

### Option A: Cloud Builds using EAS (Recommended)

EAS (Expo Application Services) handles all native compile dependencies, signs files automatically, and outputs optimized builds.

#### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Log in to your Expo account
```bash
eas login
```

#### 3. Initialize EAS Project Configuration
```bash
eas build:configure
```

#### 4. Build Android App Bundle (.aab)
```bash
eas build --platform android --profile production
```
*This command runs the cloud compile process and returns a download link for your final production-ready `.aab` file.*

---

### Option B: Local Android Builds (Native Compiling)

To compile the app locally on your machine, you must have the Android SDK, Gradle, and Java Development Kit (JDK) configured on your system.

#### 1. Prebuild Native Directories
Generate the standard Android native project folder:
```bash
npx expo prebuild --platform android
```

#### 2. Generate Release Keystore
If you do not have an existing upload key, generate a keystore file using `keytool` (included with JDK):
```bash
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
*Save this keystore inside the `android/app` directory and update `android/app/build.gradle` signing configs with the passwords and alias.*

#### 3. Build Release APK (Android Package)
Run the native gradle compile task:
```bash
cd android
./gradlew assembleRelease
```
*Output APK path: `android/app/build/outputs/apk/release/app-release.apk`*

#### 4. Build Production Android App Bundle (.aab)
Compile the optimized publishing bundle:
```bash
./gradlew bundleRelease
```
*Output AAB path: `android/app/build/outputs/bundle/release/app-release.aab`*

---

## 🌍 Google Play Store Publishing Guide

Once you have generated your `.aab` bundle file, follow this checklist to submit TaskFlow AI to the Google Play Store:

### 1. Set Up Google Play Console
- Go to the [Google Play Console](https://play.google.com/console).
- Log in and pay the one-time $25 developer registration fee.

### 2. Create Application
- Click **Create app** in the top-right corner.
- Enter App Details:
  - **App Name:** TaskFlow AI
  - **Default Language:** English (US)
  - **App Type:** App
  - **Free or Paid:** Free

### 3. Complete App Setup Dashboard Tasks
Google requires completing self-declaration questionnaires before uploading releases:
- **Set Privacy Policy:** Paste the URL linking to your hosted `privacy_policy.html` (the local template is provided in this project root).
- **App Access:** Select "All functionality is available without special access" (since the app works 100% offline).
- **Content Rating:** Complete the questionnaire. Select "Utility/Productivity" to receive a "3+" or suitable rating.
- **Target Audience:** Select your target ages (e.g. 13-15, 16-17, 18 and older).

### 4. Create a Production Release
- In the left sidebar, navigate to **Release** > **Production**.
- Click **Create new release**.
- Set up **Google Play App Signing** (let Google manage and secure your app signing keys).
- Upload the `app-release.aab` file from your build output.
- Add release notes (e.g., *"Initial production release of TaskFlow AI offline productivity organizer."*).

### 5. Review & Publish
- Navigate to the **Review and roll out** section.
- Verify that there are no warnings or blockages.
- Click **Start roll-out to Production** to submit your bundle for Google's review pipeline. (Reviews typically take 1 to 5 business days for new developer accounts).
