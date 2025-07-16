import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email?: string;
  username: string;
  password?: string;
  isGuest: boolean;
  guestId?: string;
  profile: {
    displayName: string;
    avatar?: string;
    bio?: string;
    favoritePhilosopher?: string;
    joinDate: Date;
    lastActive: Date;
  };
  gameStats: {
    totalGamesPlayed: number;
    totalScore: number;
    winRate: number;
    favoriteGame?: string;
    achievements: string[];
  };
  moralAlignment: {
    utilitarian: number;
    deontological: number;
    virtue: number;
    contractual: number;
    care: number;
    lastUpdated: Date;
  };
  preferences: {
    theme: string;
    notifications: boolean;
    privacy: {
      showProfile: boolean;
      showStats: boolean;
      showAlignment: boolean;
    };
  };
  progress: {
    level: number;
    experience: number;
    unlockedFeatures: string[];
    completedTutorials: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values for guest users
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    minlength: 6,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  guestId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profile: {
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    avatar: String,
    bio: {
      type: String,
      maxlength: 500,
    },
    favoritePhilosopher: String,
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  gameStats: {
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    favoriteGame: String,
    achievements: [{
      type: String,
    }],
  },
  moralAlignment: {
    utilitarian: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
    deontological: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
    virtue: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
    contractual: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
    care: {
      type: Number,
      default: 0,
      min: -100,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  preferences: {
    theme: {
      type: String,
      default: 'system',
      enum: ['light', 'dark', 'academic', 'neon', 'system'],
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true,
      },
      showStats: {
        type: Boolean,
        default: true,
      },
      showAlignment: {
        type: Boolean,
        default: false,
      },
    },
  },
  progress: {
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    unlockedFeatures: [{
      type: String,
    }],
    completedTutorials: [{
      type: String,
    }],
  },
}, {
  timestamps: true,
});

// Indexes will be created automatically from unique: true in schema
userSchema.index({ 'gameStats.totalScore': -1 });
userSchema.index({ 'progress.level': -1 });
userSchema.index({ 'profile.lastActive': -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active on save
userSchema.pre('save', function(next) {
  this.profile.lastActive = new Date();
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);