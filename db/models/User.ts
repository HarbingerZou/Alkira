import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import { Connection } from '../mongodb';

const userSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: { 
      type: String, 
      minlength: [6, 'Password must be at least 6 characters long'],
      default: null
    },
    is_temporary: { 
      type: Boolean, 
      default: false 
    },
    access_level: { 
      type: String, 
      enum: [null, 'read', 'write'],
      default: null
    },
    verificationCode: { 
      type: String, 
      default: null
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = Connection.models.User || Connection.model("User", userSchema);
