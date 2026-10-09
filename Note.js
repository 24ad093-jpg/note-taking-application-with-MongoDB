import mongoose from 'mongoose';

export const NOTE_COLORS = ['white', 'lavender', 'mint', 'peach', 'sky', 'rose'];

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A title is required.'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters.'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required.'],
      maxlength: [5000, 'Content cannot exceed 5000 characters.'],
    },
    color: {
      type: String,
      enum: {
        values: NOTE_COLORS,
        message: 'Choose one of the available note colours.',
      },
      default: 'white',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

noteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
