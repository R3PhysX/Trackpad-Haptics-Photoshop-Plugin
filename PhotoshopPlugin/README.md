# Trackpad Haptics for Adobe Photoshop

This Adobe Photoshop UXP Plugin connects Photoshop's canvas interactions and tools with your Mac's Trackpad Haptics engine.

## Monitored Interactions
- 🔍 **Pinch-to-Zoom / Canvas Scaling**: Precise haptic clicks modulated with zoom velocity
- 🔄 **2-Finger Canvas Rotate**: Smooth haptic step pulses and snap clicks at 0°, 90°, 180°, 270°
- 📐 **Layer Snapping & Alignment**: Responsive feedback when dragging layers near guides or edges
- 🎨 **Tool & Palette Switching**: Subtle tactile confirmation when changing tools
- 🖌️ **Brush & Painting Activity**: Delicate haptic texture while sketching
- 💾 **Document Save Confirmation**: Reassuring tactile cue on save

---

## 🚀 Easy Installation Options (No UXP Developer Tool Required!)

You do **NOT** need the Adobe UXP Developer Tool. Choose any of these simple methods:

### Option 1: 1-Click Auto Install (Inside the App)
1. Open the **Trackpad Haptics** app and switch to the **Photoshop** tab.
2. Click the blue **"⚡ 1-Click Auto Install to Photoshop"** button.
3. Restart Adobe Photoshop. The panel will automatically appear under **Plugins → Trackpad Haptics**!

---

### Option 2: Double-Click the `.ccx` Package
1. Double-click the [`TrackpadHaptics.ccx`](TrackpadHaptics.ccx) file in this directory (or click **"Open .ccx (CC)"** in the app).
2. The **Adobe Creative Cloud Desktop** app will launch and prompt you to install the plugin.
3. Click **Install**. Done!

---

### Option 3: Run the Terminal Installer Script
Open Terminal and run:
```bash
./install.sh
```
This automatically locates your Photoshop installation (e.g. `/Applications/Adobe Photoshop 2025/Plug-ins/`) and installs the files.

---

### Option 4: Manual Copy to Photoshop Plug-ins
1. Copy this entire `PhotoshopPlugin` folder.
2. In Finder, navigate to:
   `/Applications/Adobe Photoshop 2025/Plug-ins/`
3. Paste the folder here and rename it to `TrackpadHaptics`.
4. Restart Photoshop.
