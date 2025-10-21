import mongoose from "mongoose";
import { Connection } from '../mongodb';

const messageSchema = new mongoose.Schema(
  {
    message: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export const Message = Connection.models.Message || Connection.model("Message", messageSchema);
