
import { Schema, model, Document, Types } from 'mongoose';

// --- Sub-document Schemas ---

const QuizSchema = new Schema({
  q: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: Number, required: true },
}, { _id: false });

const InteractiveModelSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    layers: [{
        type: { type: String, enum: ['input', 'hidden', 'output'], required: true },
        neurons: { type: Number, required: true },
        activation: { type: String, enum: ['relu', 'sigmoid', 'tanh'] }
    }],
    sampleInput: { type: [Number], required: true },
    expectedOutput: { type: [Number], required: true },
}, { _id: false });

const HyperparameterSimulatorSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    parameters: [{
        name: { type: String, required: true },
        options: [{
            label: { type: String, required: true },
            description: { type: String, required: true }
        }]
    }],
    outcomes: [{
        combination: { type: String, required: true },
        result: {
            trainingLoss: [Number],
            validationLoss: [Number],
            description: String,
        }
    }]
}, { _id: false });

const TriageChallengeSchema = new Schema({
    scenario: { type: String, required: true },
    evidence: { type: String, required: true },
    options: [{
        title: { type: String, required: true },
        description: { type: String, required: true }
    }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
}, { _id: false });

const ContentBlockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  text: String,
  code: String,
  diagram: String,
  quiz: QuizSchema,
  interactiveModel: InteractiveModelSchema,
  hyperparameterSimulator: HyperparameterSimulatorSchema,
  triageChallenge: TriageChallengeSchema,
}, { _id: false });

const ResourceSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false });

const PracticeProblemSchema = new Schema({
    platform: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false });

const LessonSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  objective: { type: String, required: true },
  contentBlocks: [ContentBlockSchema],
  resources: [ResourceSchema],
  practiceProblems: [PracticeProblemSchema],
  notes: String,
}, { _id: false });

const ModuleSchema = new Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema],
}, { _id: false });

const InterviewQuestionSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
}, { _id: false });

const InterviewQuestionSetSchema = new Schema({
    id: { type: String, required: true },
    timestamp: { type: Number, required: true },
    difficulty: { type: String, required: true },
    questionCount: { type: Number, required: true },
    questions: [InterviewQuestionSchema],
}, { _id: false });

// --- Main Course Schema ---

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  modules: any[]; // Using `any` to avoid excessive Mongoose subdocument typing
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  progress: Map<string, number>;
  user: Types.ObjectId;
  interviewQuestionSets?: any[];
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  technologies: [String],
  modules: [ModuleSchema],
  knowledgeLevel: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
  progress: {
      type: Map,
      of: Number, // lessonId -> completion timestamp
      default: {},
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  interviewQuestionSets: [InterviewQuestionSetSchema]
}, {
  timestamps: true,
  // Ensure we transform _id to id for the frontend
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const Course = model<ICourse>('Course', CourseSchema);
