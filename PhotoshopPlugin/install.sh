#!/bin/bash
# install.sh — 1-Click Installer for Trackpad Haptics Photoshop Plugin
# Installs directly to Photoshop without needing Adobe UXP Developer Tool.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="TrackpadHaptics"
CCX_PATH="$SCRIPT_DIR/TrackpadHaptics.ccx"

echo "======================================================="
echo "   Trackpad Haptics - Adobe Photoshop Plugin Installer "
echo "======================================================="

# Always package clean CCX
echo "📦 Packaging plugin into TrackpadHaptics.ccx..."
rm -f "$CCX_PATH"
(cd "$SCRIPT_DIR" && zip -q -r "$CCX_PATH" manifest.json index.html styles.css index.js assets)

# Method 1: Direct copy to all user UXP External directories (including registered package IDs)
EXTERNAL_BASE="$HOME/Library/Application Support/Adobe/UXP/Plugins/External"
mkdir -p "$EXTERNAL_BASE/$PLUGIN_NAME"
cp -R "$SCRIPT_DIR/manifest.json" "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/styles.css" "$SCRIPT_DIR/index.js" "$SCRIPT_DIR/assets" "$EXTERNAL_BASE/$PLUGIN_NAME/"
echo "✅ Copied to: $EXTERNAL_BASE/$PLUGIN_NAME"

# Copy to specific registered plugin ID folder if present, or create it
for existing_dir in "$EXTERNAL_BASE"/com.techmeeva.trackpadhaptics.ps*; do
    if [ -d "$existing_dir" ]; then
        cp -R "$SCRIPT_DIR/manifest.json" "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/styles.css" "$SCRIPT_DIR/index.js" "$SCRIPT_DIR/assets" "$existing_dir/"
        echo "✅ Updated registered UXP directory: $existing_dir"
    fi
done

# Method 2: Adobe's Unified Plugin Installer Agent (UPIA)
UPIA_PATH="/Library/Application Support/Adobe/Adobe Desktop Common/RemoteComponents/UPI/UnifiedPluginInstallerAgent/UnifiedPluginInstallerAgent.app/Contents/MacOS/UnifiedPluginInstallerAgent"

if [ -f "$UPIA_PATH" ] && [ -f "$CCX_PATH" ]; then
    echo "⚡ Syncing via Adobe Unified Plugin Installer Agent..."
    "$UPIA_PATH" --remove "Trackpad Haptics" 2>/dev/null || true
    "$UPIA_PATH" --install "$CCX_PATH" 2>/dev/null || true
fi

# Ensure all UXP directories have the updated files after UPIA
for existing_dir in "$EXTERNAL_BASE"/com.techmeeva.trackpadhaptics.ps*; do
    if [ -d "$existing_dir" ]; then
        cp -R "$SCRIPT_DIR/manifest.json" "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/styles.css" "$SCRIPT_DIR/index.js" "$SCRIPT_DIR/assets" "$existing_dir/"
    fi
done

# Method 3: Direct copy to installed Photoshop Plug-ins directories
for ps_dir in /Applications/Adobe\ Photoshop\ 20*; do
    if [ -d "$ps_dir" ]; then
        target_plugins="$ps_dir/Plug-ins/$PLUGIN_NAME"
        echo "📂 Found Photoshop: $ps_dir"
        mkdir -p "$target_plugins" 2>/dev/null && cp -R "$SCRIPT_DIR/manifest.json" "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/styles.css" "$SCRIPT_DIR/index.js" "$SCRIPT_DIR/assets" "$target_plugins/" 2>/dev/null || true
    fi
done

echo ""
echo "🎉 Installation & Sync Complete!"
echo "👉 Restart Adobe Photoshop (or close & re-open the panel) to activate the updated plugin."
