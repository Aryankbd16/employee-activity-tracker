# ================= IMPORTS =================
# System & OS utilities
import sys
import os
import time

# Used to send ML results to backend API
import requests

# Custom module responsible for tracking keystrokes and mouse activity
from keystroke_mouse.tracker import KeystrokeMouseTracker


# ================= CONFIGURATION =================

# Base directory of this ML service file
BASE_DIR = os.path.dirname(__file__)

# Path where keystroke & mouse data will be stored locally
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "../data"))

# Backend API endpoint to send ML-processed results
BACKEND_API = "http://localhost:5000/api/work/ml-result"

# ---------- GLOBAL STATE ----------
# Tracker instance (initialized once session starts)
tracker = None

# User and session identifiers (received from backend)
user_id = None
session_id = None

# Interval (in seconds) to send summarized data to backend
SEND_INTERVAL = 10  # seconds


# ================= BACKEND COMMUNICATION =================

def send_result_to_backend(summary):
    """
    Sends summarized keystroke & mouse activity data
    to the backend server for storage and analysis
    """
    try:
        # Payload structure expected by backend API
        payload = {
            "sessionId": session_id,
            "keystrokeMouseData": summary
        }

        # HTTP POST request to backend
        res = requests.post(BACKEND_API, json=payload, timeout=5)

        print("ML SERVICE: Data sent", res.status_code)

    except Exception as e:
        # Handles connection issues, timeout errors, etc.
        print("ML SERVICE ERROR:", str(e))


# ================= MAIN SERVICE LOGIC =================

def main():
    """
    Entry point of the ML keystroke & mouse tracking service
    Responsible for:
    - Reading user & session info
    - Starting tracker
    - Periodically sending data to backend
    """
    global tracker, user_id, session_id

    # ---------- ARGUMENT VALIDATION ----------
    # Expecting userId and sessionId from backend process
    if len(sys.argv) != 3:
        print("Usage: python ml_service.py <userId> <sessionId>")
        sys.exit(1)

    # Extract user and session IDs from command-line arguments
    user_id = sys.argv[1]
    session_id = sys.argv[2]

    print("ML SERVICE STARTED")
    print("User:", user_id)
    print("Session:", session_id)

    # ---------- TRACKER INITIALIZATION ----------
    # Creates tracker instance that monitors keyboard & mouse activity
    tracker = KeystrokeMouseTracker(
        user_id=user_id,
        session_id=session_id,
        data_dir=DATA_DIR
    )

    # Start capturing keystroke and mouse events
    tracker.start()
    print("Tracking STARTED")

    # Timestamp to control backend send interval
    last_sent = time.time()

    # ---------- CONTINUOUS TRACKING LOOP ----------
    while True:
        # Reduce CPU usage
        time.sleep(1)

        # Send summarized activity data every SEND_INTERVAL seconds
        if time.time() - last_sent >= SEND_INTERVAL:
            summary = tracker.summary()          # Generate activity summary
            send_result_to_backend(summary)      # Send to backend
            last_sent = time.time()              # Reset timer


# ================= SCRIPT ENTRY POINT =================

# Ensures this file runs only when executed directly
# and not when imported as a module
if __name__ == "__main__":
    main()
