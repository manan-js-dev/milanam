import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String },
    password: { type: String, select: false },
    provider: { type: String, enum: ['google', 'credentials'], default: 'credentials' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);