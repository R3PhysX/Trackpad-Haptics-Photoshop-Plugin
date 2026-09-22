# Trackpad Haptics — Adobe Photoshop UXP Plugin

<div align="center">

<img src="Trackpad Haptics/assets/AppIcon.png" alt="Trackpad Haptics Icon" width="120" height="120" />

# Trackpad Haptics for Photoshop
**Tactile, physical feedback for Adobe Photoshop powered by macOS Force Touch Trackpads.**

[![Photoshop Version](https://img.shields.io/badge/Adobe%20Photoshop-2022%20(v23.0+)%20--%202025+-31A8FF?style=flat-square&logo=adobephotoshop&logoColor=white)](https://www.adobe.com/products/photoshop.html)
[![Platform](https://img.shields.io/badge/Platform-macOS%20(Force%20Touch%20Trackpad)-000000?style=flat-square&logo=apple&logoColor=white)](https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12)
[![UXP Manifest](https://img.shields.io/badge/UXP%20Manifest-v5.0-blueviolet?style=flat-square)](https://developer.adobe.com/photoshop/uxp/)
[![Mac App Store](https://img.shields.io/badge/Mac%20App%20Store-Download%20Host%20App-blue?style=flat-square&logo=apple)](https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Download Mac Companion App](https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12) • [Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation-options) • [Usage](#-using-the-plugin)

</div>

---

## 📖 Overview

**Trackpad Haptics for Photoshop** connects Photoshop's canvas interactions and smart layout tools directly with your Mac's Trackpad Taptic Engine. 

Whenever you zoom into artwork or snap layers to alignment guides and boundaries, your MacBook or Magic Trackpad produces tactile clicks and pulses under your fingers.

The plugin communicates with the **[Trackpad Haptics Native macOS App](https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12)** via a lightweight, ultra-low-latency local WebSocket bridge.

---

## ✨ Features

| Feature | Trigger | Haptic Feedback |
| :--- | :--- | :--- |
| **🔍 Pinch-to-Zoom** | Two-finger pinch gesture on canvas | Real-time modulated clicks with velocity-based rate calculation (20fps zero-lag sampling) |
| **⚡ Layer & Guide Snapping** | Moving layers near guides, canvas centers, or document boundaries | Crisp, distinct tactile snap clicks upon alignment |
| **📐 Smart Guides Alignment** | Aligning or distributing layers with surrounding objects | Instant tactile confirmation matching Photoshop smart guides |
| **🎛️ Interactive Control Panel** | Built-in Photoshop floating/dockable panel | Real-time event indicators, connection status badge, manual test triggers, and master toggle |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│              Adobe Photoshop (UXP Panel)               │
│                                                        │
│   • Direct 50ms (20fps) non-blocking canvas zoom check │
│   • Action notification listeners:                     │
│     (move, align, distribute, nudge, transform, guide) │
│   • Live document boundary & guide geometry sync       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ WebSocket (ws://localhost:9006)
                           ▼
┌────────────────────────────────────────────────────────┐
│        Trackpad Haptics (Native macOS Companion)       │
│                                                        │
│   • High-precision haptic scheduler                    │
│   • Velocity smoothing & cooldown debouncing           │
│   • Apple Multitouch / Force Touch Actuator Engine     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ NSHapticFeedbackManager
                           ▼
┌────────────────────────────────────────────────────────┐
│     MacBook Force Touch Trackpad / Magic Trackpad      │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation Options

> [!NOTE]
> **Prerequisite:** Make sure the companion **[Trackpad Haptics](https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12)** macOS app is installed and running on your Mac.

You do **not** need the Adobe UXP Developer Tool. Choose any of these easy methods:

### Option 1: Double-Click the `.ccx` Package
1. Double-click [`TrackpadHaptics.ccx`](Trackpad%20Haptics/TrackpadHaptics.ccx) inside the `Trackpad Haptics/` directory.
2. The **Adobe Creative Cloud Desktop** app will prompt you to install the plugin.
3. Click **Install**.
4. Restart Photoshop and open the panel under **Plugins → Trackpad Haptics**.

---

### Option 2: Terminal Installer Script
Run the automated installer script from Terminal:
```bash
cd "Trackpad Haptics"
chmod +x install.sh
./install.sh
```
This script will:
- Package a clean `.ccx` bundle
- Deploy to Adobe's UXP External plugins directory (`~/Library/Application Support/Adobe/UXP/Plugins/External`)
- Sync via Adobe Unified Plugin Installer Agent (`UPIA`)
- Copy directly to all installed `/Applications/Adobe Photoshop 20XX/Plug-ins/` folders

---

### Option 3: Manual Copy to Plug-ins Folder
1. Copy the `Trackpad Haptics` folder from this repository.
2. Open Finder, press `Cmd + Shift + G`, and navigate to:
   ```
   /Applications/Adobe Photoshop 2025/Plug-ins/
   ```
   *(Or your corresponding Photoshop version, e.g. 2024, 2023, 2022)*
3. Paste the folder.
4. Restart Photoshop.

---

### Option 4: Adobe UXP Developer Tool (For Developers)
1. Launch **Adobe UXP Developer Tool**.
2. Click **Add Plugin** and select `Trackpad Haptics/manifest.json`.
3. Click **Actions → Load** to run the plugin in your target Photoshop version.

---

## 🖥️ Using the Plugin

1. In Photoshop, open the menu: **Plugins → Trackpad Haptics**.
2. Dock the panel into your Photoshop sidebar workspace.
3. **Check Connection Status**:
   - 🟢 **Connected**: Successfully connected to `ws://localhost:9006`.
   - 🔴 **Disconnected**: Click **Reconnect** or make sure the native companion app is launched.
4. **Test Haptics Directly**:
   - Click the **Pinch to zoom** row to trigger a zoom test pulse.
   - Click the **Layer & Guide Snap** row to trigger a snap test pulse.
5. Use the top-right **master switch** to toggle haptics on or off at any time.

---

## 📁 Repository Structure

```
.
├── README.md               # Documentation & setup guide
├── LICENSE                 # MIT License
└── Trackpad Haptics/       # Adobe Photoshop UXP Plugin
    ├── manifest.json       # Adobe UXP v5 manifest
    ├── index.html          # Plugin panel UI structure
    ├── styles.css          # Native dark theme styling
    ├── index.js            # Event listeners & WebSocket bridge
    ├── install.sh          # Terminal installation script
    ├── TrackpadHaptics.ccx # Pre-built Creative Cloud installer package
    └── assets/             # Icons & skeuomorphic UI assets
        ├── AppIcon.png
        ├── EventFire_BG.png
        ├── EventFire_Front.png
        ├── Layer_Snap_Icon.png
        ├── Magnifying_Glass_Icon.png
        ├── ReconnectButton.png
        ├── Reconnect_Icon.png
        ├── Status_BG.png
        ├── Toggle_Active_BG.png
        ├── Toggle_BG.png
        └── Toggle_Knob.png
```

---

## 🔧 Technical Specifications

- **Compatibility**: Adobe Photoshop 2022 (v23.0.0) through 2025+ (macOS Apple Silicon & Intel)
- **Plugin Standard**: Adobe UXP Manifest v5
- **Bridge**: Local WebSocket on `ws://localhost:9006`
- **Zoom Sampling**: 50ms polling interval (20fps) with differential delta thresholding
- **Snap Detection**: Native Photoshop action notifications (`move`, `align`, `distribute`, `nudge`, `transform`, `guide`, `select`)
- **Cooldown**: 100ms debouncing on snap events to maintain crisp, tactile separation

---

## 🤝 Companion macOS App

This plugin requires the native macOS host application to communicate with Apple's Force Touch / Taptic Engine:

👉 **[Download Trackpad Haptics on the Mac App Store](https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12)**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
