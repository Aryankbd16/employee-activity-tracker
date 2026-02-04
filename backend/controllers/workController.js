const WorkSession = require('../models/WorkSession');
const { startMLService, stopMLService } = require('../utils/mlRunner');

// ================= START WORK =================
exports.startWork = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const existingSession = await WorkSession.findOne({
      userId,
      status: 'running'
    });

    if (existingSession) {
      return res.status(400).json({
        message: 'Work session already running'
      });
    }

    const session = await WorkSession.create({
      userId,
      sessionStart: new Date(),
      status: 'running'
    });

    // 🚀 START ML
    startMLService(userId.toString(), session._id.toString());

    res.status(201).json({
      message: 'Work session started',
      sessionId: session._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= STOP WORK =================
exports.stopWork = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await WorkSession.findById(sessionId);

    if (!session || session.status !== 'running') {
      return res.status(400).json({
        message: 'No active session found'
      });
    }

    session.sessionEnd = new Date();
    session.status = 'completed';
    await session.save();

    // 🛑 STOP ML (this triggers ML → backend save)
    stopMLService(sessionId.toString());

    res.json({ message: 'Work session stopped successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
