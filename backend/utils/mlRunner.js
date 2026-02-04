const { spawn } = require("child_process");
const path = require("path");

// ================= ML SCRIPT PATHS =================
const TYPING_ML_PATH = path.join(__dirname, "../../ml/ml_service.py");
const FACE_ML_PATH = path.join(__dirname, "../../ml/face_service.py");
const SCREEN_ML_PATH = path.join(
  __dirname,
  "../../ml/screen_monitoring/screen_monitor.py"
);

// Track running ML processes per session
const mlProcesses = {};

exports.startMLService = (userId, sessionId) => {
  console.log("🚀 Starting ML services for session:", sessionId);

  // 🔒 Safety: avoid duplicate start
  if (mlProcesses[sessionId]) {
    console.log("⚠️ ML services already running for session:", sessionId);
    return;
  }

  // 🔒 ALWAYS initialize FIRST
  mlProcesses[sessionId] = {};

  // ---------- Typing + Mouse ----------
  const typingProcess = spawn("python", [
    TYPING_ML_PATH,
    userId,
    sessionId
  ]);

  typingProcess.stdout.on("data", d =>
    console.log(`⌨️ TYPING ML: ${d.toString()}`)
  );

  typingProcess.stderr.on("data", d =>
    console.error(`❌ TYPING ML ERROR: ${d.toString()}`)
  );

  typingProcess.on("exit", code =>
    console.log(`⌨️ TYPING ML exited with code ${code}`)
  );

  mlProcesses[sessionId].typing = typingProcess;

  // ---------- Face Verification ----------
  const faceProcess = spawn("python", [
    FACE_ML_PATH,
    userId,
    sessionId
  ]);

  faceProcess.stdout.on("data", d =>
    console.log(`🧠 FACE ML: ${d.toString()}`)
  );

  faceProcess.stderr.on("data", d =>
    console.error(`❌ FACE ML ERROR: ${d.toString()}`)
  );

  faceProcess.on("exit", code =>
    console.log(`🧠 FACE ML exited with code ${code}`)
  );

  mlProcesses[sessionId].face = faceProcess;

  // ---------- Screen Monitoring ----------
  const screenProcess = spawn("python", [
    SCREEN_ML_PATH,
    userId,
    sessionId
  ]);

  screenProcess.stdout.on("data", d =>
    console.log(`🖥️ SCREEN ML: ${d.toString()}`)
  );

  screenProcess.stderr.on("data", d =>
    console.error(`❌ SCREEN ML ERROR: ${d.toString()}`)
  );

  screenProcess.on("exit", code =>
    console.log(`🖥️ SCREEN ML exited with code ${code}`)
  );

  mlProcesses[sessionId].screen = screenProcess;
};

exports.stopMLService = (sessionId) => {
  const processes = mlProcesses[sessionId];

  if (!processes) {
    console.log("⚠️ No ML processes found for session:", sessionId);
    return;
  }

  console.log("🛑 Stopping ML services for session:", sessionId);

  if (processes.typing) processes.typing.kill("SIGTERM");
  if (processes.face) processes.face.kill("SIGTERM");
  if (processes.screen) processes.screen.kill("SIGTERM");

  delete mlProcesses[sessionId];
};
