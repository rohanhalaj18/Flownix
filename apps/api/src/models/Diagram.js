import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

const DiagramSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Untitled Diagram',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    sourceCode: {
      type: String,
      required: [true, 'Diagram source code is required']
    },
    diagramType: {
      type: String,
      default: 'flowchart'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    shareId: {
      type: String,
      unique: true,
      default: () => randomBytes(6).toString('hex')
    }
  },
  {
    timestamps: true
  }
);

export const Diagram = mongoose.model('Diagram', DiagramSchema);
