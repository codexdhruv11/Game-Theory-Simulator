import mongoose, { Document, Schema } from 'mongoose';

export interface IPhilosopher extends Document {
  name: string;
  slug: string;
  era: string;
  school: string;
  avatar: string;
  biography: {
    brief: string;
    detailed: string;
    keyWorks: string[];
    influences: string[];
    influenced: string[];
  };
  philosophy: {
    coreBeliefs: string[];
    ethicalFramework: string;
    gameTheoryRelevance: string;
    keyQuotes: Array<{
      text: string;
      context: string;
      source?: string;
    }>;
  };
  gameGuidance: {
    prisonersDilemma: {
      cooperationAdvice: string;
      defectionAdvice: string;
      generalStrategy: string;
      reasoning: string;
    };
    nashEquilibrium: {
      advice: string;
      reasoning: string;
    };
    zeroSumGame: {
      advice: string;
      reasoning: string;
    };
    auctionTheory: {
      biddingAdvice: string;
      reasoning: string;
    };
    evolutionaryGame: {
      strategyAdvice: string;
      reasoning: string;
    };
    repeatedGames: {
      longTermStrategy: string;
      cooperationThreshold: string;
      reasoning: string;
    };
    networkGames: {
      coordinationAdvice: string;
      reasoning: string;
    };
    cooperativeGames: {
      coalitionAdvice: string;
      reasoning: string;
    };
  };
  moralAlignment: {
    utilitarian: number;
    deontological: number;
    virtue: number;
    contractual: number;
    care: number;
  };
  popularity: {
    timesSelected: number;
    averageRating: number;
    totalRatings: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const philosopherSchema = new Schema<IPhilosopher>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  era: {
    type: String,
    required: true,
    enum: ['Ancient', 'Medieval', 'Renaissance', 'Enlightenment', 'Modern', 'Contemporary'],
  },
  school: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  biography: {
    brief: {
      type: String,
      required: true,
      maxlength: 500,
    },
    detailed: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    keyWorks: [{
      type: String,
      required: true,
    }],
    influences: [String],
    influenced: [String],
  },
  philosophy: {
    coreBeliefs: [{
      type: String,
      required: true,
    }],
    ethicalFramework: {
      type: String,
      required: true,
    },
    gameTheoryRelevance: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    keyQuotes: [{
      text: {
        type: String,
        required: true,
      },
      context: {
        type: String,
        required: true,
      },
      source: String,
    }],
  },
  gameGuidance: {
    prisonersDilemma: {
      cooperationAdvice: {
        type: String,
        required: true,
      },
      defectionAdvice: {
        type: String,
        required: true,
      },
      generalStrategy: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    nashEquilibrium: {
      advice: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    zeroSumGame: {
      advice: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    auctionTheory: {
      biddingAdvice: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    evolutionaryGame: {
      strategyAdvice: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    repeatedGames: {
      longTermStrategy: {
        type: String,
        required: true,
      },
      cooperationThreshold: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    networkGames: {
      coordinationAdvice: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
    cooperativeGames: {
      coalitionAdvice: {
        type: String,
        required: true,
      },
      reasoning: {
        type: String,
        required: true,
      },
    },
  },
  moralAlignment: {
    utilitarian: {
      type: Number,
      required: true,
      min: -100,
      max: 100,
    },
    deontological: {
      type: Number,
      required: true,
      min: -100,
      max: 100,
    },
    virtue: {
      type: Number,
      required: true,
      min: -100,
      max: 100,
    },
    contractual: {
      type: Number,
      required: true,
      min: -100,
      max: 100,
    },
    care: {
      type: Number,
      required: true,
      min: -100,
      max: 100,
    },
  },
  popularity: {
    timesSelected: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes will be created automatically from unique: true in schema
philosopherSchema.index({ 'popularity.timesSelected': -1 });
philosopherSchema.index({ 'popularity.averageRating': -1 });
philosopherSchema.index({ isActive: 1 });

export const Philosopher = mongoose.model<IPhilosopher>('Philosopher', philosopherSchema);