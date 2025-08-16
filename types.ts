



export type AchievementId = 'curiousMind' | 'topicExplorer' | 'firstSteps' | 'dedicatedLearner' | 'projectStarter' | 'quizMaster';

export interface Achievement {
    id: AchievementId;
    title: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface QuizData {
  q: string;
  options: string[];
  answer: number; // index of the correct option
  explanation?: string;
}

export interface LayerData {
  type: 'input' | 'hidden' | 'output';
  neurons: number;
  activation?: 'relu' | 'sigmoid' | 'tanh';
}

export interface InteractiveModelData {
  title: string;
  description: string;
  layers: LayerData[];
  sampleInput: number[];
  expectedOutput: number[];
}

export interface Hyperparameter {
  name: 'Learning Rate' | 'Batch Size' | 'Dropout';
  options: {
    label: string; // e.g., 'Low', 'Medium', 'High' or '0.01'
    description: string;
  }[];
}

export interface Outcome {
  trainingLoss: number[];
  validationLoss: number[];
  description: string;
}

export interface OutcomeCombination {
  combination: string; // e.g., "0-1-0"
  result: Outcome;
}

export interface HyperparameterData {
  title: string;
  description: string;
  parameters: Hyperparameter[];
  outcomes: OutcomeCombination[];
}

export interface TriageChallengeData {
  scenario: string;
  evidence: string; // Mermaid diagram string
  options: {
    title: string;
    description: string;
  }[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'code' | 'quiz' | 'diagram' | 'interactive_model' | 'hyperparameter_simulator' | 'triage_challenge';
  text?: string;
  code?: string;
  diagram?: string;
  quiz?: QuizData;
  interactiveModel?: InteractiveModelData;
  hyperparameterSimulator?: HyperparameterData;
  triageChallenge?: TriageChallengeData;
}

export interface Resource {
  type: 'video' | 'documentation' | 'article';
  title: string;
  url: string;
}

export interface PracticeProblem {
  platform: 'leetcode' | 'geeksforgeeks';
  title: string;
  url: string;
}

// --- NEW COURSE STRUCTURE ---

export interface LectureData {
  objective: string;
  contentBlocks: ContentBlock[];
  resources: Resource[];
  practiceProblems?: PracticeProblem[];
}

export interface QuizActivityData {
    description: string;
    questions: QuizData[];
}

export interface ProjectActivityData {
    description: string;
    codeStub: string;
    challenge: string;
}

export type LearningItem = { id: string; notes?: string; } & (
    | { type: 'lecture'; title: string; data: LectureData; }
    | { type: 'quiz'; title: string; data: QuizActivityData; }
    | { type: 'project'; title: string; data: ProjectActivityData; }
);

export interface Module {
  title: string;
  items: LearningItem[];
}

export interface Course {
  id:string;
  title:string;
  description: string;
  category: string;
  technologies: string[];
  modules: Module[];
  knowledgeLevel: KnowledgeLevel;
  interviewQuestionSets?: InterviewQuestionSet[];
  progress: Progress;
}
// --- END NEW COURSE STRUCTURE ---


export interface ProjectStep {
  id: string;
  title: string;
  description: string;
  codeStub: string;
  challenge: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  steps: ProjectStep[];
  course?: {
    id: string;
    title: string;
  };
  progress: Progress;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface Folder {
  id: string;
  name: string;
  courses: (Course | { id: string } | null)[];
}

// Progress is a map of completed LearningItem IDs to their completion timestamp.
export type Progress = Map<string, number>; 
export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal = 'project' | 'interview' | 'theory' | 'curiosity';
export type LearningStyle = 'visual' | 'code' | 'balanced' | 'interactive';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface TestResult {
  id: string;
  topic: string;
  difficulty: KnowledgeLevel;
  score: number; // e.g., 0.8 for 80%
  questionCount: number;
  timestamp: number;
}

export interface Recommendation {
    topic: string;
    reason: string;
}

export interface RelatedTopic {
    topic: string;
    reason: string;
}

export interface InterviewQuestion {
    question: string;
    answer: string;
}

export interface InterviewQuestionSet {
    id: string;
    timestamp: number;
    difficulty: KnowledgeLevel;
    questionCount: number;
    questions: InterviewQuestion[];
}

export interface MindMapNode {
    title: string;
    children?: MindMapNode[];
}

export interface StoryModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  story: string;
  error: string | null;
}

export interface CreateTopicsModalState {
  isOpen: boolean;
  folderId: string | null;
}

export interface ArticleModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  article: string;
  error: string | null;
}

export interface ExpandTopicModalState {
  isOpen: boolean;
  isLoading: boolean;
  course: Course | null;
  module: Module | null;
  item: LearningItem | null;
  error: string | null;
}

export interface AnalogyModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  analogy: string;
  error: string | null;
}

export interface FlashcardModalState {
  isOpen: boolean;
  isLoading: boolean;
  title: string;
  flashcards: Flashcard[];
  error: string | null;
}

export interface PracticeConcept {
    title: string;
    description: string;
    codeExample: string;
}

export interface PracticeSession {
    topic: string;
    concepts: PracticeConcept[];
    quiz: QuizData[];
}

export interface BackgroundTask {
    id: string;
    type: 'course_generation' | 'topic_expansion' | 'project_generation';
    topic: string;
    status: 'generating' | 'done' | 'error';
    message: string;
    courseId?: string;
    projectId?: string;
}

export interface LiveInterviewState {
  topic: string;
  transcript: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  xp: number;
  level: number;
  achievements: AchievementId[];
}

export type CourseSource = {
  type: 'syllabus';
  content: string;
} | {
  type: 'url';
  content: string;
} | {
  type: 'pdf';
  content: string; // base64 encoded text content
  filename: string;
};
