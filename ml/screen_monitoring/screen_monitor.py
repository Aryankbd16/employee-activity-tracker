# ================= IMPORTS =================
# Time & OS utilities
import time
import os

# Used to send screen efficiency data to backend
import requests

# Windows API for fetching active window title
import win32gui

# Used to track time durations
from datetime import datetime

# Used for REAL screen capture (not webcam)
from PIL import ImageGrab  # ✅ REAL SCREEN CAPTURE


# ================= CONFIGURATION =================

# Interval (in seconds) to check active window
CHECK_INTERVAL = 1  # seconds

# Backend API endpoint to send screen monitoring results
BACKEND_API = "http://localhost:5000/api/work/ml-result"

# ---------- ALLOWED / WORK APPLICATIONS ----------
# Applications considered productive / work-related
WORK_APPS = [
    "visual studio", "vscode", "pycharm", "intellij",
    "android studio", "eclipse", "netbeans",
    "terminal", "cmd", "powershell",
    "github", "git", "docker"
]

# ---------- UNWANTED / DISTRACTING APPLICATIONS ----------
# Applications considered unproductive
UNWANTED_APPS = [
    "spotify", "vlc", "media player",
    "youtube", "netflix", "prime video",
    "instagram", "facebook", "whatsapp",
    "game"
]


# ================= WINDOW TRACKING =================

def get_active_window_title():
    """
    Fetches the title of the currently active window
    Used to determine which application the user is using
    """
    try:
        hwnd = win32gui.GetForegroundWindow()
        return win32gui.GetWindowText(hwnd).lower()
    except:
        return "unknown"


# ================= SCREEN TRACKER CLASS =================

class ScreenTracker:
    """
    Responsible for:
    - Tracking active applications
    - Calculating screen efficiency
    - Capturing proof for unwanted apps
    - Sending updates to backend
    """

    def __init__(self, user_id, session_id, data_dir):
        # ---------- SESSION IDENTIFIERS ----------
        self.user_id = user_id
        self.session_id = session_id

        # ---------- SCREEN EFFICIENCY STATE ----------
        self.screen_efficiency = 100
        self.last_sent_efficiency = 100

        # ---------- ACTIVE APP TRACKING ----------
        self.active_app = None
        self.active_start = datetime.now()

        # ---------- TIME ACCUMULATORS ----------
        self.work_seconds = 0
        self.unwanted_seconds = 0

        # ---------- SCREENSHOT EVIDENCE ----------
        self.evidence = []

        # ---------- SCREENSHOT STORAGE PATH ----------
        self.screen_path = os.path.join(
            data_dir, "screen", user_id, session_id
        )
        os.makedirs(self.screen_path, exist_ok=True)

    # ================= UTILITY METHODS =================

    def is_work_app(self, title):
        # Checks if active window belongs to a work-related app
        return any(k in title for k in WORK_APPS)

    def is_unwanted_app(self, title):
        # Checks if active window belongs to an unwanted app
        return any(k in title for k in UNWANTED_APPS)

    def capture_proof(self, title):
        """
        Captures screenshot evidence when an unwanted
        application is detected
        """
        filename = f"unwanted_{int(time.time())}.png"
        path = os.path.join(self.screen_path, filename)

        # ✅ REAL SCREENSHOT (DESKTOP)
        screenshot = ImageGrab.grab()
        screenshot.save(path)

        # Relative path stored in backend for evidence
        rel = f"screen/{self.user_id}/{self.session_id}/{filename}"
        if rel not in self.evidence:
            self.evidence.append(rel)

    def push_update(self):
        """
        Sends updated screen efficiency and evidence
        to backend only if efficiency has changed
        """
        if self.screen_efficiency == self.last_sent_efficiency:
            return

        payload = {
            "sessionId": self.session_id,
            "screenData": {
                "screenEfficiency": self.screen_efficiency,
                "evidence": self.evidence
            }
        }

        try:
            requests.post(BACKEND_API, json=payload, timeout=5)
            self.last_sent_efficiency = self.screen_efficiency
        except Exception as e:
            print("[SCREEN ML] Failed to push:", e)

    # ================= CORE LOGIC (UNCHANGED) =================

    def tick(self):
        """
        Runs one monitoring cycle:
        - Detects app change
        - Updates work/unwanted time
        - Adjusts screen efficiency
        - Captures proof if required
        """
        current_app = get_active_window_title()

        # Detect application change
        if current_app != self.active_app:
            now = datetime.now()
            duration = (now - self.active_start).seconds

            if self.active_app:
                # ---------- WORK APP HANDLING ----------
                if self.is_work_app(self.active_app):
                    self.work_seconds += duration
                    gained = self.work_seconds // 120
                    self.screen_efficiency = min(
                        100, self.screen_efficiency + gained
                    )

                # ---------- UNWANTED APP HANDLING ----------
                elif self.is_unwanted_app(self.active_app):
                    self.unwanted_seconds += duration
                    penalty = self.unwanted_seconds // 60
                    self.screen_efficiency = max(
                        0, self.screen_efficiency - penalty
                    )
                    self.capture_proof(self.active_app)

                # Push updated efficiency to backend
                self.push_update()

            # Update active app tracking
            self.active_app = current_app
            self.active_start = now


# ================= MAIN SERVICE =================

def main():
    """
    Entry point for Screen Monitoring ML Service
    Responsible for:
    - Initializing screen tracker
    - Running continuous monitoring loop
    """
    import sys

    # Session identifiers received from backend
    user_id, session_id = sys.argv[1], sys.argv[2]

    # Base data directory resolution
    DATA_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../data")
    )

    # Initialize screen tracker
    tracker = ScreenTracker(user_id, session_id, DATA_DIR)

    # Continuous monitoring loop
    try:
        while True:
            tracker.tick()
            time.sleep(CHECK_INTERVAL)
    except KeyboardInterrupt:
        pass


# ================= SCRIPT ENTRY POINT =================

# Ensures this file runs only when executed directly
if __name__ == "__main__":
    main()
