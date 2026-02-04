# ================= SESSION CONTEXT MANAGER =================
# This file is responsible for storing and sharing
# the current user's session information (user_id, session_id)
# across different parts of the application (ML services, backend, etc.)

class SessionContext:
    # ---------- GLOBAL SESSION VARIABLES ----------
    # Stores the currently active user's ID
    user_id = None

    # Stores the currently active session ID
    session_id = None

    @classmethod
    def set(cls, user_id, session_id):
        # ---------- SET SESSION CONTEXT ----------
        # This method is called when a new session starts
        # It saves the user_id and session_id so other modules
        # can access them without passing parameters everywhere
        cls.user_id = user_id
        cls.session_id = session_id

    @classmethod
    def get(cls):
        # ---------- GET SESSION CONTEXT ----------
        # This method is used by other parts of the system
        # (ML scripts, services, workers, etc.)
        # to retrieve the current user and session information
        return cls.user_id, cls.session_id
