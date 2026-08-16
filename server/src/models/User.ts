import { Schema, model, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'admin' | 'expert';
  profile?: {
    phone?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      coordinates?: { latitude?: number; longitude?: number };
    };
    farmSize?: number;
    farmType?: 'crop' | 'livestock' | 'mixed' | 'organic' | 'conventional';
    experience?: number;
  };
  preferences?: {
    language?: string;
    units?: 'metric' | 'imperial';
    notifications?: { email: boolean; weather: boolean; reports: boolean };
  };
  isEmailVerified: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  getSignedJwtToken(): string;
  matchPassword(entered: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['farmer', 'admin', 'expert'],
      default: 'farmer',
    },
    profile: {
      phone: {
        type: String,
        trim: true,
      },
      location: {
        address: String,
        city: String,
        state: String,
        country: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      farmSize: {
        type: Number,
        min: 0,
      },
      farmType: {
        type: String,
        enum: ['crop', 'livestock', 'mixed', 'organic', 'conventional'],
      },
      experience: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      units: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        weather: {
          type: Boolean,
          default: true,
        },
        reports: {
          type: Boolean,
          default: true,
        },
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Clean up empty strings in profile fields before validation
userSchema.pre('validate', function (next) {
  const isEmpty = (v: unknown): boolean => v === '';
  if (this.profile) {
    // Convert empty strings to undefined so they don't fail enum validation
    if (isEmpty(this.profile.farmType)) {
      this.profile.farmType = undefined;
    }
    if (isEmpty(this.profile.phone)) {
      this.profile.phone = undefined;
    }
    if (this.preferences) {
      if (isEmpty(this.preferences.language)) {
        this.preferences.language = undefined;
      }
      if (isEmpty(this.preferences.units)) {
        this.preferences.units = undefined;
      }
    }
  }
  next();
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id, role: this.role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  } as jwt.SignOptions);
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (entered: string): Promise<boolean> {
  return bcrypt.compare(entered, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function (): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

const User = model<IUser, UserModel>('User', userSchema);
export default User;
