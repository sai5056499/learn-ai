import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import { GoogleGenerativeAI } from '@google/genai';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GraphQL Schema
const schema = buildSchema(`
  type User {
    id: ID!
    email: String!
    name: String!
    xp: Int!
    level: Int!
    courses: [Course!]!
    projects: [Project!]!
    folders: [Folder!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    category: String!
    technologies: [String!]!
    knowledgeLevel: String!
    progress: Float!
    modules: [Module!]!
    interviewQuestionSets: [InterviewQuestionSet!]!
  }

  type Module {
    title: String!
    lessons: [Lesson!]!
  }

  type Lesson {
    id: ID!
    title: String!
    objective: String!
    notes: String
    contentBlocks: [ContentBlock!]!
    resources: [Resource!]!
    practiceProblems: [PracticeProblem!]!
  }

  type ContentBlock {
    id: ID!
    type: String!
    text: String
    code: String
    diagram: String
    quiz: Quiz
  }

  type Quiz {
    q: String!
    options: [String!]!
    answer: String!
  }

  type Resource {
    type: String!
    title: String!
    url: String!
  }

  type PracticeProblem {
    platform: String!
    title: String!
    url: String!
  }

  type InterviewQuestionSet {
    id: ID!
    timestamp: String!
    difficulty: String!
    questionCount: Int!
    questions: [Question!]!
  }

  type Question {
    question: String!
    answer: String!
  }

  type Project {
    id: ID!
    title: String!
    description: String!
    steps: [ProjectStep!]!
    course: Course
    progress: Float!
  }

  type ProjectStep {
    id: ID!
    title: String!
    description: String!
    codeStub: String!
    challenge: String!
  }

  type Folder {
    id: ID!
    name: String!
    courses: [Course!]!
  }

  type Query {
    me(email: String!): User
  }

  type Mutation {
    login(email: String!, name: String!): User
    createCourse(email: String!, courseInput: CourseInput!): Course
    deleteCourse(email: String!, courseId: String!): Boolean
    toggleLessonProgress(email: String!, courseId: String!, lessonId: String!): Course
    saveNote(email: String!, courseId: String!, lessonId: String!, note: String!): Boolean
    createFolder(email: String!, folderName: String!): Folder
    updateFolderName(email: String!, folderId: String!, newName: String!): Folder
    deleteFolder(email: String!, folderId: String!): Boolean
    moveCourseToFolder(email: String!, courseId: String!, folderId: String): User
    createProject(email: String!, projectInput: ProjectInput!): Project
    deleteProject(email: String!, projectId: String!): Boolean
    toggleProjectStepProgress(email: String!, projectId: String!, stepId: String!): Boolean
    generateInterviewQuestions(email: String!, courseId: String!, difficulty: String!, count: Int!): User
    elaborateAnswer(email: String!, courseId: String!, questionSetId: String!, qIndex: Int!, question: String!, answer: String!): InterviewQuestionSet
    startLiveInterview(email: String!, topic: String!): InterviewResponse
    sendLiveInterviewMessage(email: String!, topic: String!, history: [ChatMessageInput!]!): InterviewResponse
  }

  input CourseInput {
    title: String!
    description: String!
    category: String!
    technologies: [String!]!
    knowledgeLevel: String!
    modules: [ModuleInput!]!
  }

  input ModuleInput {
    title: String!
    lessons: [LessonInput!]!
  }

  input LessonInput {
    title: String!
    objective: String!
    contentBlocks: [ContentBlockInput!]!
    resources: [ResourceInput!]!
    practiceProblems: [PracticeProblemInput!]!
  }

  input ContentBlockInput {
    type: String!
    text: String
    code: String
    diagram: String
    quiz: QuizInput
  }

  input QuizInput {
    q: String!
    options: [String!]!
    answer: String!
  }

  input ResourceInput {
    type: String!
    title: String!
    url: String!
  }

  input PracticeProblemInput {
    platform: String!
    title: String!
    url: String!
  }

  input ProjectInput {
    title: String!
    description: String!
    steps: [ProjectStepInput!]!
    courseId: String
  }

  input ProjectStepInput {
    title: String!
    description: String!
    codeStub: String!
    challenge: String!
  }

  input ChatMessageInput {
    role: String!
    content: String!
  }

  type InterviewResponse {
    message: String!
  }
`);

// Mock data storage (replace with Supabase in production)
let users = new Map();
let courses = new Map();
let projects = new Map();

// Root resolver
const root = {
  me: ({ email }) => {
    const user = users.get(email);
    if (!user) {
      // Create new user if doesn't exist
      const newUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        xp: 0,
        level: 1,
        courses: [],
        projects: [],
        folders: []
      };
      users.set(email, newUser);
      return newUser;
    }
    return user;
  },

  login: ({ email, name }) => {
    let user = users.get(email);
    if (!user) {
      user = {
        id: Date.now().toString(),
        email,
        name,
        xp: 0,
        level: 1,
        courses: [],
        projects: [],
        folders: []
      };
      users.set(email, user);
    }
    return user;
  },

  createCourse: ({ email, courseInput }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const course = {
      id: Date.now().toString(),
      ...courseInput,
      progress: 0,
      interviewQuestionSets: []
    };

    courses.set(course.id, course);
    user.courses.push(course);
    return course;
  },

  deleteCourse: ({ email, courseId }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    user.courses = user.courses.filter(c => c.id !== courseId);
    courses.delete(courseId);
    return true;
  },

  toggleLessonProgress: ({ email, courseId, lessonId }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const course = user.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    // Simple progress calculation
    course.progress = Math.min(100, course.progress + 10);
    user.xp += 10;
    user.level = Math.floor(user.xp / 100) + 1;

    return course;
  },

  saveNote: ({ email, courseId, lessonId, note }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const course = user.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    const lesson = course.modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    lesson.notes = note;
    return true;
  },

  createFolder: ({ email, folderName }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const folder = {
      id: Date.now().toString(),
      name: folderName,
      courses: []
    };

    user.folders.push(folder);
    return folder;
  },

  updateFolderName: ({ email, folderId, newName }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const folder = user.folders.find(f => f.id === folderId);
    if (!folder) throw new Error('Folder not found');

    folder.name = newName;
    return folder;
  },

  deleteFolder: ({ email, folderId }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    user.folders = user.folders.filter(f => f.id !== folderId);
    return true;
  },

  moveCourseToFolder: ({ email, courseId, folderId }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    // Remove course from all folders
    user.folders.forEach(folder => {
      folder.courses = folder.courses.filter(c => c.id !== courseId);
    });

    // Add to specified folder
    if (folderId) {
      const folder = user.folders.find(f => f.id === folderId);
      if (folder) {
        const course = user.courses.find(c => c.id === courseId);
        if (course) {
          folder.courses.push(course);
        }
      }
    }

    return user;
  },

  createProject: ({ email, projectInput }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const project = {
      id: Date.now().toString(),
      ...projectInput,
      progress: 0
    };

    projects.set(project.id, project);
    user.projects.push(project);
    return project;
  },

  deleteProject: ({ email, projectId }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    user.projects = user.projects.filter(p => p.id !== projectId);
    projects.delete(projectId);
    return true;
  },

  toggleProjectStepProgress: ({ email, projectId, stepId }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const project = user.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    // Simple progress calculation
    project.progress = Math.min(100, project.progress + 20);
    return true;
  },

  generateInterviewQuestions: async ({ email, courseId, difficulty, count }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const course = user.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate ${count} interview questions about ${course.title} at ${difficulty} level. Format as JSON with questions array containing question and answer objects.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response and create question set
      const questionSet = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        difficulty,
        questionCount: count,
        questions: [
          {
            question: "Sample question about " + course.title,
            answer: "Sample answer for the question"
          }
        ]
      };

      course.interviewQuestionSets.push(questionSet);
      return user;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  },

  elaborateAnswer: ({ email, courseId, questionSetId, qIndex, question, answer }) => {
    const user = users.get(email);
    if (!user) throw new Error('User not found');

    const course = user.courses.find(c => c.id === courseId);
    if (!course) throw new Error('Course not found');

    const questionSet = course.interviewQuestionSets.find(qs => qs.id === questionSetId);
    if (!questionSet) throw new Error('Question set not found');

    if (qIndex >= 0 && qIndex < questionSet.questions.length) {
      questionSet.questions[qIndex] = { question, answer };
    }

    return questionSet;
  },

  startLiveInterview: ({ email, topic }) => {
    return { message: `Live interview started for topic: ${topic}. You can now ask questions.` };
  },

  sendLiveInterviewMessage: ({ email, topic, history }) => {
    return { message: `Message received for topic: ${topic}. Processing your request...` };
  }
};

// GraphQL handler
const graphqlHandler = createHandler({
  schema,
  rootValue: root,
  context: (req) => ({ req })
});

// Routes
app.use('/graphql', graphqlHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
