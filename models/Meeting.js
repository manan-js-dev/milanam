import mongoose from "mongoose";
import { randomUUID } from "crypto";

const ParticipantSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["invited", "accepted", "declined"],
      default: "invited",
    },
  },
  { _id: false },
);

const MeetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: { type: [ParticipantSchema], default: [] },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    roomId: { type: String, unique: true, default: () => randomUUID() },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Meeting ||
  mongoose.model("Meeting", MeetingSchema);
