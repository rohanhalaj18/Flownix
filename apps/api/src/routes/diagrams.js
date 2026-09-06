import express from 'express';
import { Diagram } from '../models/Diagram.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all diagram routes
router.use(protect);

// POST /api/diagrams - Create Diagram
router.post('/', async (req, res) => {
  try {
    const { title, description, sourceCode, diagramType, isPublic } = req.body;

    if (!sourceCode) {
      return res.status(400).json({ success: false, error: 'Diagram sourceCode is required' });
    }

    const diagram = await Diagram.create({
      title: title || 'Untitled Diagram',
      description: description || '',
      sourceCode,
      diagramType: diagramType || 'flowchart',
      isPublic: isPublic !== undefined ? isPublic : true,
      owner: req.user._id
    });

    return res.status(201).json({ success: true, diagram });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/diagrams - List Owner Diagrams
router.get('/', async (req, res) => {
  try {
    const diagrams = await Diagram.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    return res.json({ success: true, count: diagrams.length, diagrams });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/diagrams/:id - Get Single Diagram
router.get('/:id', async (req, res) => {
  try {
    const diagram = await Diagram.findOne({ _id: req.params.id, owner: req.user._id });
    if (!diagram) {
      return res.status(404).json({ success: false, error: 'Diagram not found' });
    }
    return res.json({ success: true, diagram });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/diagrams/:id - Update Diagram
router.put('/:id', async (req, res) => {
  try {
    const { title, description, sourceCode, diagramType, isPublic } = req.body;
    let diagram = await Diagram.findOne({ _id: req.params.id, owner: req.user._id });

    if (!diagram) {
      return res.status(404).json({ success: false, error: 'Diagram not found' });
    }

    if (title !== undefined) diagram.title = title;
    if (description !== undefined) diagram.description = description;
    if (sourceCode !== undefined) diagram.sourceCode = sourceCode;
    if (diagramType !== undefined) diagram.diagramType = diagramType;
    if (isPublic !== undefined) diagram.isPublic = isPublic;

    await diagram.save();
    return res.json({ success: true, diagram });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/diagrams/:id - Delete Diagram
router.delete('/:id', async (req, res) => {
  try {
    const diagram = await Diagram.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!diagram) {
      return res.status(404).json({ success: false, error: 'Diagram not found' });
    }
    return res.json({ success: true, message: 'Diagram deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
