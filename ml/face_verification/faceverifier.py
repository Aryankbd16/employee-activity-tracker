# ================= IMPORTS =================
import cv2
import time
import os
import base64
from io import BytesIO
import requests
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1

# ================= CONFIGURATION =================
THRESHOLD = 0.5
CHECK_INTERVAL = 15  # seconds

# ================= FACE VERIFIER CLASS =================

class FaceVerifier:
    def __init__(self, user, session_id, data_dir, backend_url):
        # ---------- USER & SESSION ----------
        self.user = user
        self.session_id = session_id
        self.backend_url = backend_url

        # ---------- FACE EFFICIENCY STATE ----------
        self.face_efficiency = 100
        self.last_check = 0
        self.sent_efficiency = 100

        # ✅ SUCCESS STREAK (now only 2 needed)
        self.success_streak = 0

        # ---------- DEVICE ----------
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        # ---------- MODELS ----------
        self.mtcnn = MTCNN(keep_all=True, device=self.device)
        self.resnet = (
            InceptionResnetV1(pretrained="vggface2")
            .eval()
            .to(self.device)
        )

        # ---------- REFERENCE FACE ----------
        self.reference_embedding = self._get_reference_embedding(
            user.get("photo")
        )

        if self.reference_embedding is None:
            print("[FACE ML] Reference face not detected. Stopping ML.")
            raise RuntimeError("Invalid reference image")

        # ---------- EVIDENCE STORAGE ----------
        self.face_path = os.path.join(
            data_dir, "face", str(user["_id"]), session_id
        )
        os.makedirs(self.face_path, exist_ok=True)
        self.evidence = []

        # ---------- CAMERA ----------
        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if not self.cap.isOpened():
            raise RuntimeError("Camera not accessible")

    # ================= UTILS =================

    def _get_reference_embedding(self, photo_base64):
        try:
            img = Image.open(
                BytesIO(base64.b64decode(photo_base64.split(",")[-1]))
            ).convert("RGB")

            faces = self.mtcnn(img)
            if faces is None:
                return None

            with torch.no_grad():
                embedding = self.resnet(faces)[0]

            return embedding

        except Exception as e:
            print("[FACE ML] Reference embedding error:", e)
            return None

    def _cosine_similarity(self, a, b):
        return torch.dot(a / a.norm(), b / b.norm()).item()

    def _save_frame(self, frame, filename):
        path = os.path.join(self.face_path, filename)
        cv2.imwrite(path, frame)

        rel = f"face/{self.user['_id']}/{self.session_id}/{filename}"
        if rel not in self.evidence:
            self.evidence.append(rel)

    def _push_update(self):
        if self.face_efficiency == self.sent_efficiency:
            return

        payload = {
            "sessionId": self.session_id,
            "faceData": {
                "faceEfficiency": self.face_efficiency,
                "evidence": self.evidence
            }
        }

        try:
            requests.post(self.backend_url, json=payload, timeout=5)
            self.sent_efficiency = self.face_efficiency
        except Exception as e:
            print("[FACE ML] Failed to push update:", e)

    # ================= CORE LOGIC =================

    def run_check(self):
        now = time.time()
        if now - self.last_check < CHECK_INTERVAL:
            return

        self.last_check = now

        ret, frame = self.cap.read()
        if not ret:
            return

        img = Image.fromarray(
            cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        )

        faces = self.mtcnn(img)
        timestamp = int(time.time())

        # ❌ NO FACE
        if faces is None:
            self.face_efficiency = max(0, self.face_efficiency - 4)
            self.success_streak = 0
            self._save_frame(frame, f"no_face_{timestamp}.png")
            self._push_update()
            return

        # ❌ MULTIPLE FACES
        if faces.shape[0] > 1:
            self.face_efficiency = max(0, self.face_efficiency - 15)
            self.success_streak = 0
            self._save_frame(frame, f"multiple_faces_{timestamp}.png")
            self._push_update()
            return

        # ✅ SINGLE FACE → VERIFY
        with torch.no_grad():
            live_embedding = self.resnet(faces)[0]
            similarity = self._cosine_similarity(
                live_embedding,
                self.reference_embedding
            )

        # ❌ FACE MISMATCH
        if similarity < THRESHOLD:
            self.face_efficiency = max(0, self.face_efficiency - 20)
            self.success_streak = 0
            self._save_frame(
                frame, f"mismatch_{similarity:.2f}_{timestamp}.png"
            )
            self._push_update()
            return

        # ✅ FACE MATCH SUCCESS
        self.success_streak += 1

        # 🔁 RECOVERY AFTER 2 SUCCESSFUL CHECKS (~30 sec)
        if self.success_streak >= 2:
            self.face_efficiency = min(100, self.face_efficiency + 9)
            self.success_streak = 0
            self._push_update()

    # ================= CLEANUP =================

    def stop(self):
        if self.cap.isOpened():
            self.cap.release()
