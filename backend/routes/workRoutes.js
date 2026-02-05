const express = require('express');
const WorkSession = require('../models/WorkSession');
const { startWork, stopWork } = require('../controllers/workController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// ================= START / STOP WORK =================
router.post('/start', protect, startWork);
router.post('/stop', protect, stopWork);

// ================= ML RESULT (TYPING + MOUSE + FACE + SCREEN) =================
router.post('/ml-result', async (req, res) => {
  try {
    const {
      sessionId,
      keystrokeMouseData,
      faceData,
      screenData
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID missing' });
    }

    const session = await WorkSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // ================= TYPING + MOUSE =================
    if (keystrokeMouseData) {
      let typingEfficiency = 100;
      let mouseEfficiency = 100;

      typingEfficiency -= keystrokeMouseData.keyboard_idle_time * 0.5;
      typingEfficiency -= keystrokeMouseData.gibberish_count * 5;
      if (keystrokeMouseData.keyboard_automation) typingEfficiency -= 25;

      mouseEfficiency -= keystrokeMouseData.mouse_idle_time * 0.5;
      if (keystrokeMouseData.mouse_automation) mouseEfficiency -= 25;

      session.typingEfficiency = Math.max(0, Math.round(typingEfficiency));
      session.mouseEfficiency = Math.max(0, Math.round(mouseEfficiency));

      // Typing evidence
      if (keystrokeMouseData.evidence?.typing?.length) {
        keystrokeMouseData.evidence.typing.forEach(p => {
          if (!session.evidence.typing.includes(p)) {
            session.evidence.typing.push(p);
          }
        });
      }
    }

    // ================= FACE VERIFICATION =================
    if (faceData) {
      session.faceEfficiency = Math.max(
        0,
        Math.min(100, Math.round(faceData.faceEfficiency))
      );

      if (faceData.evidence?.length) {
        faceData.evidence.forEach(p => {
          if (!session.evidence.face.includes(p)) {
            session.evidence.face.push(p);
          }
        });
      }
    }

    // ================= SCREEN MONITORING =================
    if (screenData) {
      session.screenEfficiency = Math.max(
        0,
        Math.min(100, Math.round(screenData.screenEfficiency))
      );

      if (screenData.evidence?.length) {
        screenData.evidence.forEach(p => {
          if (!session.evidence.screen.includes(p)) {
            session.evidence.screen.push(p);
          }
        });
      }
    }

    // ================= OVERALL EFFICIENCY =================
    const components = [];

    if (typeof session.typingEfficiency === 'number')
      components.push(session.typingEfficiency);

    if (typeof session.mouseEfficiency === 'number')
      components.push(session.mouseEfficiency);

    if (typeof session.faceEfficiency === 'number')
      components.push(session.faceEfficiency);

    if (typeof session.screenEfficiency === 'number')
      components.push(session.screenEfficiency);

    session.overallEfficiency = Math.round(
      components.reduce((a, b) => a + b, 0) / components.length
    );

    await session.save();

    res.json({
      message: 'ML data updated successfully',
      typingEfficiency: session.typingEfficiency,
      mouseEfficiency: session.mouseEfficiency,
      faceEfficiency: session.faceEfficiency,
      screenEfficiency: session.screenEfficiency,
      overallEfficiency: session.overallEfficiency
    });

  } catch (err) {
    console.error('ML RESULT ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= USER SUMMARY FOR ADMIN =================
router.get('/user-summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await WorkSession.find({
      userId,
      status: 'completed'
    });

    if (!sessions.length) {
      return res.json({
        averageEfficiency: 0,
        totalWorkHours: 0,
        totalWastedHours: 0
      });
    }

    let totalEfficiency = 0;
    let totalWorkMs = 0;

    sessions.forEach(session => {
      if (typeof session.overallEfficiency === 'number') {
        totalEfficiency += session.overallEfficiency;
      }

      if (session.sessionStart && session.sessionEnd) {
        totalWorkMs +=
          new Date(session.sessionEnd) - new Date(session.sessionStart);
      }
    });

    const averageEfficiency = Math.round(
      totalEfficiency / sessions.length
    );

    const totalWorkHours = +(
      totalWorkMs / (1000 * 60 * 60)
    ).toFixed(2);

    const totalWastedHours = +(
      totalWorkHours * (1 - averageEfficiency / 100)
    ).toFixed(2);

    res.json({
      averageEfficiency,
      totalWorkHours,
      totalWastedHours
    });

  } catch (err) {
    console.error('USER SUMMARY ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ================= SESSION DETAILS FOR REPORT (✅ NEW API) =================
router.get('/sessions/:userId', async (req, res) => {
  try {
    const sessions = await WorkSession.find({
      userId: req.params.userId,
      status: 'completed'
    });

    res.json(sessions);
  } catch (err) {
    console.error('SESSION FETCH ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
