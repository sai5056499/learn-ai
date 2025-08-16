
import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single step in the project
export interface IProjectStep extends Document {
    id: string;
    title: string;
    description: string;
    codeStub: string;
    challenge: string;
}

const ProjectStepSchema = new Schema<IProjectStep>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    codeStub: { type: String, required: true },
    challenge: { type: String, required: true },
}, { _id: false });


// Interface for the main Project document
export interface IProject extends Document {
    title: string;
    description: string;
    steps: IProjectStep[];
    course: {
        id: string;
        title: string;
    };
    progress: Map<string, number>; // stepId -> completion timestamp
    user: Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    steps: [ProjectStepSchema],
    course: {
        id: { type: String, required: true },
        title: { type: String, required: true }
    },
    progress: {
        type: Map,
        of: Number,
        default: {}
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            if (ret.progress) {
                // The transformation of progress map to object is moved to the resolver
                // to maintain consistency with how the Course model is handled.
            }
        }
    }
});

export const Project = model<IProject>('Project', ProjectSchema);