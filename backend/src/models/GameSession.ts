import mongoose, { Document, Schema } from 'mongoose';

export interface IGameSession extends Document {
  userId: mongoose.Types.ObjectId;
  gameType: string;
  gameData: {
    rounds: Array<{
      roundNumber: number;
      playerChoices: Record<string, any>;
      outcomes: Record<string, any>;
      scores: Record<string, number>;
      timestamp: Date;
      moralAnalysis?: {
        decision: string;
        reasoning: string;
        alignmentImpact: Record<string, number>;
      };
    }>;
    finalScores: Record<string, number>;
    winner?: string;
    gameSettings: Record<string, any>;
    philosopherGuidance?: Array<{
      philosopher: string;
      advice: string;
      round: number;
      timestamp: Date;
    }>;
  };
  duration: number; // in seconds
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const gameSessionSchema = new Schema<IGameSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameType: {
    type: String,
    required: true,
    enum: [
      'prisoners-dilemma',
      'nash-equilibrium',
      'zero-sum-game',
      'auction-simulator',
      'evolutionary-game',
      'network-game',
      'cooperative-game',
      'mechanism-design',
      'behavioral-economics',
      'signaling-game',
      'matching-theory',
      'voting-theory',
      'repeated-games'
    ],
  },
  gameData: {
    rounds: [{
      roundNumber: {
        type: Number,
        required: true,
      },
      playerChoices: {
        type: Schema.Types.Mixed,
        required: true,
      },
      outcomes: {
        type: Schema.Types.Mixed,
        required: true,
      },
      scores: {
        type: Schema.Types.Mixed,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      moralAnalysis: {
        decision: String,
        reasoning: String,
        alignmentImpact: {
          type: Schema.Types.Mixed,
        },
      },
    }],
    finalScores: {
      type: Schema.Types.Mixed,
      required: true,
    },
    winner: String,
    gameSettings: {
      type: Schema.Types.Mixed,
      default: {},
    },
    philosopherGuidance: [{
      philosopher: {
        type: String,
        required: true,
      },
      advice: {
        type: String,
        required: true,
      },
      round: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  duration: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
}, {
  timestamps: true,
});

// Indexes
gameSessionSchema.index({ userId: 1, gameType: 1 });
gameSessionSchema.index({ userId: 1, startedAt: -1 });
gameSessionSchema.index({ gameType: 1, startedAt: -1 });
gameSessionSchema.index({ completed: 1, startedAt: -1 });
gameSessionSchema.index({ 'gameData.finalScores': -1 });

// Pre-save middleware to calculate duration
gameSessionSchema.pre('save', function(next) {
  if (this.completed && this.completedAt && this.startedAt) {
    this.duration = Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  next();
});

export const GameSession = mongoose.model<IGameSession>('GameSession', gameSessionSchema);