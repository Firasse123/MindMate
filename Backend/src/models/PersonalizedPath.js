import mongoose from 'mongoose';

const personalizedPathSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    fiche: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fiche',
        required: true
    },
    pathData: {
        pathTitle: String,
        estimatedDuration: String,
        overview: String,
        phases: [{
            phaseNumber: Number,
            title: String,
            focus: {
                type: String,
                enum: ['weakness', 'strength', 'mixed']
            },
            estimatedTime: String,
            activities: [{
                type: {
                    type: String,
                    enum: ['review', 'practice', 'quiz', 'video', 'reading']
                },
                title: String,
                description: String,
                concepts: [String],
                difficulty: {
                    type: String,
                    enum: ['easy', 'medium', 'hard']
                },
                estimatedTime: String
            }]
        }],
        milestones: [{
            after_phase: Number,
            title: String,
            criteria: String
        }]
    },
    currentPhase: {
        type: Number,
        default: 1
    },
    completedActivities: [{
        phaseNumber: Number,
        activityIndex: Number,
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused'],
        default: 'active'
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
personalizedPathSchema.index({ user: 1, status: 1 });
personalizedPathSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('PersonalizedPath', personalizedPathSchema);
