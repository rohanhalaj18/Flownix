import express from 'express';
import { Diagram } from '../models/Diagram.js';

const router = express.Router();

// GET /api/share/:shareId - Public Diagram Share Lookup
router.get('/:shareId', async (req, res) => {
  try {
    const diagram = await Diagram.findOne({ shareId: req.params.shareId, isPublic: true })
      .populate('owner', 'username avatar');

    if (!diagram) {
      return res.status(404).json({ success: false, error: 'Shared diagram not found or set to private' });
    }

    return res.json({
      success: true,
      diagram: {
        id: diagram._id,
        title: diagram.title,
        description: diagram.description,
        sourceCode: diagram.sourceCode,
        diagramType: diagram.diagramType,
        owner: diagram.owner,
        shareId: diagram.shareId,
        createdAt: diagram.createdAt,
        updatedAt: diagram.updatedAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
