// Trackpad Haptics — Photoshop UXP Plugin v3.9.1
// High Performance Haptic Bridge:
//   - zoom       : Direct 50ms property read with ZERO lag
//   - layer_snap : Smart guide pink lines, boundary snap, center snap, ruler guide & layer action events

const WS_URL = "ws://localhost:9006";
const POLL_MS = 50; // 20fps polling — proven perfect zoom responsiveness
const APP_STORE_URL = "https://apps.apple.com/in/app/trackpad-haptics/id6780054447?mt=12";

// ── Photoshop API ──────────────────────────────────────────
let psApp = null;
let psAction = null;
try {
  const ps = require("photoshop");
  psApp = ps.app;
  psAction = ps.action;
} catch (e) {
  console.log("[TrackpadHaptics] Photoshop API unavailable:", e);
}

// ── State ──────────────────────────────────────────────────
let socket = null;
let masterEnabled = true;
let isPolling = false;

// Zoom state
let lastZoom = null;

// Snap state tracking
let lastSnapTriggerTime = 0;
const SNAP_COOLDOWN_MS = 100; // 100ms cooldown for distinct crisp snap clicks
let lastGeometrySyncTime = 0;

// ── DOM Elements ───────────────────────────────────────────
let statusBoxEl, statusTextEl, lastEventEl;
let zoomIcon, snapIcon;
let zoomDot, snapDot;
let zoomTimer = null;
let snapTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  statusBoxEl  = document.getElementById("statusBox");
  statusTextEl = document.getElementById("statusText");
  lastEventEl  = document.getElementById("lastEvent");
  zoomIcon     = document.getElementById("zoomIndicator");
  snapIcon     = document.getElementById("snapIndicator");
  zoomDot      = document.getElementById("zoomDot");
  snapDot      = document.getElementById("snapDot");

  // 1. App Store navigation on icon & title click
  const openAppStore = (e) => {
    if (e) {
      e.preventDefault();
    }
    // A. Send to native host via WebSocket (100% reliable AppKit NSWorkspace launch)
    sendRaw({ type: "open_url", url: APP_STORE_URL });

    // B. Also invoke UXP shell openExternal
    try {
      const uxp = require("uxp");
      if (uxp?.shell?.openExternal) {
        uxp.shell.openExternal(APP_STORE_URL);
      }
    } catch (_) {}

    // C. Also try standard window.open
    try {
      window.open(APP_STORE_URL, "_blank");
    } catch (_) {}
  };

  document.getElementById("appIconLink")?.addEventListener("click", openAppStore);
  document.getElementById("appTitleLink")?.addEventListener("click", openAppStore);

  // Restore master toggle state
  try {
    const saved = localStorage.getItem("th_master");
    if (saved !== null) masterEnabled = (saved === "true");
  } catch (_) {}

  const toggleEl = document.getElementById("masterToggle");
  if (toggleEl) {
    toggleEl.checked = masterEnabled;

    toggleEl.addEventListener("change", (e) => {
      masterEnabled = e.target.checked;
      try { localStorage.setItem("th_master", masterEnabled); } catch (_) {}
    });
  }

  // Allow clicking on Snap row or hidden testBtn to test snap haptic
  const triggerSnapTest = () => {
    sendHapticEvent("layer_snap", { source: "Test Pulse" });
    showEvent("⚡ Layer Snap", "snap");
  };

  document.getElementById("testBtn")?.addEventListener("click", triggerSnapTest);
  document.getElementById("snapRow")?.addEventListener("click", triggerSnapTest);

  // Allow clicking on Zoom row to test zoom haptic
  document.getElementById("zoomRow")?.addEventListener("click", () => {
    sendHapticEvent("zoom", { delta: 0.1 });
    showEvent("🔍 Zoom In", "zoom");
  });

  // Reconnect button
  const reconnectBtn = document.getElementById("reconnectBtn");
  if (reconnectBtn) {
    reconnectBtn.addEventListener("click", connectWebSocket);
    reconnectBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        connectWebSocket();
      }
    });
  }

  connectWebSocket();
  setupPhotoshopListeners();

  // Single safe polling timer at proven 50ms interval (20fps) — zero lag zoom
  setInterval(safePoll, POLL_MS);
});

// ── WebSocket Bridge ───────────────────────────────────────

function connectWebSocket() {
  if (socket) {
    try { socket.close(); } catch (_) {}
    socket = null;
  }

  try {
    socket = new WebSocket(WS_URL);
  } catch (err) {
    setConnectionUI(false);
    setTimeout(connectWebSocket, 2500);
    return;
  }

  socket.addEventListener("open", () => {
    setConnectionUI(true);
    sendRaw({ type: "handshake", client: "photoshop_uxp", version: "3.9.1" });
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "ps_event_feedback") {
        if (data.event === "snap" || data.event === "layer_snap") {
          showEvent(data.source || "⚡ Snap", "snap");
        } else if (data.event === "zoom") {
          showEvent("🔍 Zoom", "zoom");
        }
      }
    } catch (_) {}
  });

  socket.addEventListener("close", () => {
    socket = null;
    setConnectionUI(false);
    setTimeout(connectWebSocket, 2500);
  });

  socket.addEventListener("error", () => {});
}

function sendRaw(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  try {
    socket.send(JSON.stringify(payload));
  } catch (_) {}
}

function sendHapticEvent(eventName, extra = {}) {
  if (!masterEnabled) return;
  sendRaw({
    type: "ps_event",
    event: eventName,
    timestamp: Date.now(),
    ...extra
  });
}

function setConnectionUI(connected) {
  if (statusBoxEl) {
    statusBoxEl.className = "status-box " + (connected ? "connected" : "disconnected");
  }
  if (statusTextEl) {
    statusTextEl.textContent = connected ? "Connected" : "Disconnected";
  }
}

// ── UI Visual Feedback (Blinking Green Dot on Event Detection) ───

function showEvent(text, type) {
  if (lastEventEl) lastEventEl.textContent = text;

  if (type === "zoom") {
    if (zoomIcon) zoomIcon.classList.add("active");
    if (zoomDot) zoomDot.classList.add("active");
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => {
      if (zoomIcon) zoomIcon.classList.remove("active");
      if (zoomDot) zoomDot.classList.remove("active");
    }, 250);
  } else if (type === "snap") {
    if (snapIcon) {
      snapIcon.classList.remove("active");
      void snapIcon.offsetWidth; // Force reflow to cleanly restart blink animation
      snapIcon.classList.add("active");
    }
    if (snapDot) {
      snapDot.classList.remove("active");
      void snapDot.offsetWidth; // Force reflow to cleanly restart blink animation
      snapDot.classList.add("active");
    }
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (snapIcon) snapIcon.classList.remove("active");
      if (snapDot) snapDot.classList.remove("active");
    }, 250);
  }
}

// ── Polling — Zoom (Direct 50ms property read with ZERO lag) ───

function safePoll() {
  if (isPolling) return;
  isPolling = true;
  pollGestureState().finally(() => {
    isPolling = false;
  });
}

async function pollGestureState() {
  if (!masterEnabled) return;

  let doc = null;
  try {
    doc = psApp?.activeDocument ?? null;
  } catch (_) {}

  if (!doc) {
    lastZoom = null;
    return;
  }

  // 1. Pinch-to-Zoom
  let isZooming = false;
  try {
    const zoom = doc.zoom; // e.g. 100.0 = 100%
    if (lastZoom !== null && typeof zoom === "number" && !isNaN(zoom)) {
      const delta = zoom - lastZoom;
      if (Math.abs(delta) > 0.5) { // > 0.5% change in 50ms → active pinch
        isZooming = true;
        sendHapticEvent("zoom", { delta: Math.abs(delta) / 100 });
        showEvent(delta > 0 ? "🔍 Zoom In" : "🔍 Zoom Out", "zoom");
      }
    }
    lastZoom = zoom;
  } catch (_) {}

  // Periodic geometry refresh only when completely idle (never while zooming)
  const now = Date.now();
  if (!isZooming && now - lastGeometrySyncTime > 1500) {
    lastGeometrySyncTime = now;
    try {
      syncSnapGeometryToNativeHost(doc);
    } catch (_) {}
  }
}

// ── Photoshop Action Notification Listeners (Snapping) ─────

function setupPhotoshopListeners() {
  if (!psAction || !psAction.addNotificationListener) return;

  const events = [
    "move",
    "nudge",
    "align",
    "distribute",
    "transform",
    "set",
    "drag",
    "guide",
    "select"
  ];

  const handler = (eventName, descriptor) => {
    try {
      handlePhotoshopAction(eventName, descriptor);
    } catch (_) {}
  };

  try {
    const eventObjects = events.map(e => ({ event: e }));
    psAction.addNotificationListener(eventObjects, handler);
  } catch (e) {
    try {
      psAction.addNotificationListener(events, handler);
    } catch (_) {}
  }
}

function handlePhotoshopAction(eventName, descriptor) {
  if (!masterEnabled) return;

  // Layer Moving, Alignment, Distribution, Guides
  if (eventName === "move" || eventName === "align" || eventName === "distribute" ||
      eventName === "nudge" || eventName === "transform" || eventName === "set" ||
      eventName === "drag" || eventName === "guide") {

    const now = Date.now();
    if (now - lastSnapTriggerTime > SNAP_COOLDOWN_MS) {
      lastSnapTriggerTime = now;

      let label = "Layer Snap";
      if (eventName === "align") label = "Align Snap";
      else if (eventName === "nudge") label = "Nudge";
      else if (eventName === "guide" || (eventName === "set" && descriptor?._target?.[0]?._ref === "guide")) label = "Guide Snap";
      else if (eventName === "transform") label = "Shape Snap";
      else if (eventName === "move") label = "Layer / Shape Snap";

      sendHapticEvent("layer_snap", { source: label });
      showEvent("⚡ " + label, "snap");
    }

    // Immediately sync geometry for native live drag tracker when layers move
    try {
      if (psApp?.activeDocument) {
        syncSnapGeometryToNativeHost(psApp.activeDocument);
      }
    } catch (_) {}
  } else if (eventName === "select") {
    // When layer selection changes, immediately sync geometry for native drag tracker
    try {
      if (psApp?.activeDocument) {
        syncSnapGeometryToNativeHost(psApp.activeDocument);
      }
    } catch (_) {}
  }
}

function syncSnapGeometryToNativeHost(doc) {
  let layers = null;
  try { layers = doc.layers; } catch (_) {}
  if (!layers || layers.length === 0) return;

  const activeLayer = doc.activeLayers?.[0];
  const activeId = activeLayer ? activeLayer.id : null;

  const snapLinesX = [0, doc.width / 2, doc.width];
  const snapLinesY = [0, doc.height / 2, doc.height];

  if (doc.guides && doc.guides.length > 0) {
    for (const g of doc.guides) {
      if (g.direction === "vertical" || g.direction === "kVertical") {
        snapLinesX.push(g.coordinate);
      } else {
        snapLinesY.push(g.coordinate);
      }
    }
  }

  let activeBounds = null;
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    if (!l.visible || !l.bounds) continue;
    const b = l.bounds;
    if (l.id === activeId) {
      activeBounds = { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height };
    } else {
      snapLinesX.push(b.left, b.right, (b.left + b.right) / 2);
      snapLinesY.push(b.top, b.bottom, (b.top + b.bottom) / 2);
    }
  }

  sendRaw({
    type: "snap_geometry",
    zoom: doc.zoom / 100,
    snapLinesX: Array.from(new Set(snapLinesX)),
    snapLinesY: Array.from(new Set(snapLinesY)),
    activeBounds: activeBounds
  });
}
