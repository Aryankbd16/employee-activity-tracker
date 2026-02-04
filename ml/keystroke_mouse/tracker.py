# ================= IMPORTS =================
# Core utilities
import time
import os

# Efficient fixed-size queue for timestamp tracking
from collections import deque

# Low-level keyboard and mouse listeners
from pynput import keyboard, mouse

# Used to detect similarity between typed words and dictionary words
from difflib import SequenceMatcher


# ================= CONFIGURATION =================

# Time (in seconds) after which inactivity is considered idle
IDLE_TIME_THRESHOLD = 5

# Similarity threshold to treat a word as meaningful
MEANINGLESS_SCORE_LIMIT = 0.65


# ================= KEYSTROKE & MOUSE TRACKER =================

class KeystrokeMouseTracker:
    """
    Responsible for:
    - Tracking keyboard and mouse activity
    - Detecting idle time
    - Detecting automation (bots / scripts)
    - Detecting gibberish typing
    - Storing evidence files
    - Providing summarized activity data
    """

    def __init__(self, user_id, session_id, data_dir):
        # ---------- SESSION IDENTIFIERS ----------
        self.user_id = user_id
        self.session_id = session_id
        self.data_dir = data_dir

        # Timestamp when tracking started
        self.start_time = time.time()

        # ---------- KEYBOARD TRACKING ----------
        self.keystrokes = 0
        self.typed_chars = []
        self.key_timestamps = []
        self.last_key_time = None
        self.keyboard_idle_time = 0

        # ---------- MOUSE TRACKING ----------
        self.mouse_events = 0
        self.mouse_clicks = 0
        self.mouse_timestamps = deque(maxlen=30)
        self.mouse_idle_time = 0
        self.last_mouse_time = None

        # NEW: mouse position tracking
        self.last_mouse_pos = None

        # NEW: sustained suspicion counter
        self.mouse_suspicious_count = 0

        # ---------- FLAGS & COUNTERS ----------
        self.keyboard_automation = False
        self.mouse_automation = False
        self.gibberish_detected = False
        self.gibberish_count = 0

        # ---------- EVIDENCE TRACKING ----------
        self.evidence_files = {
            "typing": []
        }

        # ---------- DICTIONARY ----------
        self.dictionary_words = set("""about above accept account across action actual after again air all almost also always among amount answer any appear apply area art ask back base be become before begin behavior believe best better between big body book both break bring build business but buy call can car case cause change check child choice class clear close come company compare computer control cost could country course create data day deal decide decision describe design develop difference difficult direction discover discuss do doctor down drive during early easy eat economic education effect effort end energy enjoy enough enter environment especially establish even event ever every example exist expect experience explain face fact fail fall family fast father feel few field find first five follow food force form four free friend from front full future game general get give good government great group grow guess hand happen happy hard have head hear help here high history hold home hope hour house however human idea important include increase information interest involve issue job join keep kind know language large last late lead learn least leave life light like line listen little live long look lose lot love low main make man manage many market material mean measure media meet member memory method might million mind minute miss modern money month more morning most mother move much music must name nation natural near need never news night none number occur offer office often old once only open opportunity order other over own page paper part particular pass past pattern pay people perform period person phone place plan play point policy power practice prepare present prevent price problem process produce product program protect prove provide public question quickly quite reason receive record reflect region relate remain remember report represent require research resource respond result return reveal right risk road role room rule run safe same save say school science second see seem sense serve service set seven several share short should show side similar simple since situation skill small social some someone something sometimes sound source speak special spend stand start state stay step still stop story strategy strong student study success suffer suggest support system take talk task teach teacher team technology tell term test thank theory thing think those though thought through time today together toward trade training treat trip true try turn type understand until use usually value very view visit voice wait walk want water week well west what when where which while whole why will wish woman word work world would write year young yourself""".split())

        # ---------- SESSION DATA DIRECTORY ----------
        self.session_path = os.path.join(
            self.data_dir, "typing", self.user_id, self.session_id
        )
        os.makedirs(self.session_path, exist_ok=True)

    # ================= KEYBOARD HANDLING =================

    def on_key_press(self, key):
        now = time.time()
        self.key_timestamps.append(now)

        if self.last_key_time:
            pause = now - self.last_key_time
            if pause > IDLE_TIME_THRESHOLD:
                self.keyboard_idle_time += pause

        self.last_key_time = now

        try:
            char = key.char
        except AttributeError:
            char = " "

        self.typed_chars.append(char)

        self.detect_typing_automation()
        self.detect_gibberish()

    # ================= MOUSE HANDLING =================

    def on_move(self, x, y):
        now = time.time()
        self.mouse_events += 1
        self.mouse_timestamps.append(now)

        # Track mouse movement distance
        if self.last_mouse_pos:
            dx = abs(x - self.last_mouse_pos[0])
            dy = abs(y - self.last_mouse_pos[1])
            self.last_mouse_distance = dx + dy
        else:
            self.last_mouse_distance = 0

        self.last_mouse_pos = (x, y)

        if self.last_mouse_time:
            idle = now - self.last_mouse_time
            if idle > IDLE_TIME_THRESHOLD:
                self.mouse_idle_time += idle

        self.last_mouse_time = now

        self.detect_mouse_automation()

    def on_click(self, x, y, button, pressed):
        if pressed:
            self.mouse_clicks += 1

    # ================= DETECTION LOGIC =================

    def detect_typing_automation(self):
        if len(self.key_timestamps) < 10:
            return

        diffs = [
            self.key_timestamps[i+1] - self.key_timestamps[i]
            for i in range(len(self.key_timestamps) - 1)
        ]

        avg = sum(diffs) / len(diffs)
        variance = sum((d - avg) ** 2 for d in diffs) / len(diffs)

        if variance < 0.002:
            self.keyboard_automation = True
            self.save_automation_log()

    def detect_mouse_automation(self):
        """
        Improved automation detection:
        - Higher variance threshold
        - Sustained detection required
        - Distance-based human check
        - Ignore normal coding usage
        """

        # ✅ Ignore normal coding usage
        if self.mouse_events < 50:
            return

        if len(self.mouse_timestamps) < 10:
            return

        diffs = [
            self.mouse_timestamps[i+1] - self.mouse_timestamps[i]
            for i in range(len(self.mouse_timestamps) - 1)
        ]

        diffs = [d for d in diffs if d < 1.5]
        if len(diffs) < 6:
            return

        avg = sum(diffs) / len(diffs)
        variance = sum((d - avg) ** 2 for d in diffs) / len(diffs)

        # ✅ Increased threshold (less sensitive)
        if variance < 0.00005 and self.last_mouse_distance < 10:
            self.mouse_suspicious_count += 1
        else:
            self.mouse_suspicious_count = 0

        # ✅ Sustained detection
        if self.mouse_suspicious_count >= 10:
            self.mouse_automation = True
            self.save_automation_log()

    def detect_gibberish(self):
        if len(self.typed_chars) < 20:
            return

        text = "".join(self.typed_chars[-60:])
        words = [w.lower() for w in text.split() if w.isalpha()]
        if not words:
            return

        meaningful = 0
        for w in words:
            if w in self.dictionary_words:
                meaningful += 1
            else:
                similarity = max(
                    (SequenceMatcher(None, w, dw).ratio()
                     for dw in self.dictionary_words),
                    default=0
                )
                if similarity > MEANINGLESS_SCORE_LIMIT:
                    meaningful += 1

        if meaningful / len(words) < 0.4:
            self.gibberish_detected = True
            self.gibberish_count += 1
            self.save_gibberish(text)

    # ================= PROOF STORAGE =================

    def save_gibberish(self, text):
        path = os.path.join(self.session_path, "gibberish.txt")
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        with open(path, "a", encoding="utf-8") as f:
            f.write("----- GIBBERISH DETECTED -----\n")
            f.write(f"Time : {timestamp}\n")
            f.write(f"Text : {text}\n")
            f.write("--------------------------------\n\n")

        rel_path = f"typing/{self.user_id}/{self.session_id}/gibberish.txt"
        if rel_path not in self.evidence_files["typing"]:
            self.evidence_files["typing"].append(rel_path)

    def save_automation_log(self):
        path = os.path.join(self.session_path, "automation_flag.txt")
        with open(path, "w") as f:
            f.write(f"Keyboard automation: {self.keyboard_automation}\n")
            f.write(f"Mouse automation: {self.mouse_automation}\n")

    # ================= CONTROL =================

    def start(self):
        keyboard.Listener(on_press=self.on_key_press).start()
        mouse.Listener(on_move=self.on_move, on_click=self.on_click).start()

    # ================= SUMMARY =================

    def summary(self):
        return {
            "keyboard_idle_time": round(self.keyboard_idle_time, 2),
            "mouse_idle_time": round(self.mouse_idle_time, 2),
            "keyboard_automation": self.keyboard_automation,
            "mouse_automation": self.mouse_automation,
            "gibberish_detected": self.gibberish_detected,
            "gibberish_count": self.gibberish_count,
            "evidence": self.evidence_files
        }
