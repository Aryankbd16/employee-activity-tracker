# ================= IMPORTS =================
# System utilities for command-line arguments and timing
import sys, time

# MongoDB client for fetching user data
from pymongo import MongoClient
from bson import ObjectId

# Custom face verification logic
from face_verification.faceverifier import FaceVerifier


# ================= CONFIGURATION =================

# Backend API endpoint to send face verification results
BACKEND_API = "http://localhost:5000/api/work/ml-result"

# Directory where face snapshots / verification data are stored
DATA_DIR = "../data"


# ================= MAIN SERVICE LOGIC =================

def main():
    """
    Entry point for Face Verification ML Service
    Responsible for:
    - Fetching user data from MongoDB
    - Validating presence of registered user photo
    - Running continuous face verification for the session
    """

    # ---------- SESSION IDENTIFIERS ----------
    # Received from backend when ML service is spawned
    user_id, session_id = sys.argv[1], sys.argv[2]

    # ---------- DATABASE CONNECTION ----------
    # Connect to local MongoDB instance
    client = MongoClient("mongodb://localhost:27017/")
    db = client["employeeTracker"]

    # ---------- USER FETCH ----------
    # Fetch user document using MongoDB ObjectId
    user = db.users.find_one({ "_id": ObjectId(user_id) })

    # Validate user existence and registered photo
    if not user or "photo" not in user:
        print("[FACE ML] User or photo missing")
        return

    # ---------- FACE VERIFIER INITIALIZATION ----------
    # Creates FaceVerifier instance responsible for:
    # - Capturing face frames
    # - Matching with registered photo
    # - Sending results to backend
    verifier = FaceVerifier(
        user,
        session_id,
        DATA_DIR,
        BACKEND_API
    )

    # ---------- CONTINUOUS FACE VERIFICATION LOOP ----------
    while True:
        verifier.run_check()   # Perform single face verification cycle
        time.sleep(1)          # Run verification every 1 second


# ================= SCRIPT ENTRY POINT =================

# Ensures this service runs only when executed directly
if __name__ == "__main__":
    main()
