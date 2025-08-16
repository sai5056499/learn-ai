
import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  scalar JSON

  type Quiz {
    q: String!
    options: [String!]!
    answer: Int!
  }

  type ContentBlock {
    id: String!
    type: String!
    text: String
    code: String
    diagram: String
    quiz: Quiz
    interactiveModel: JSON
    hyperparameterSimulator: JSON
    triageChallenge: JSON
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

  type Lesson {
    id: String!
    title: String!
    objective: String!
    contentBlocks: [ContentBlock!]!
    resources: [Resource!]
    practiceProblems: [PracticeProblem!]
    notes: String
  }

  type Module {
    title: String!
    lessons: [Lesson!]!
  }

  type InterviewQuestion {
      question: String!
      answer: String!
  }

  type InterviewQuestionSet {
      id: String!
      timestamp: Float!
      difficulty: String!
      questionCount: Int!
      questions: [InterviewQuestion!]!
  }

  type Course {
    id: ID!
    title: String!
    description: String!
    category: String!
    technologies: [String!]!
    modules: [Module!]!
    knowledgeLevel: String!
    progress: JSON
    interviewQuestionSets: [InterviewQuestionSet!]
  }

  type Folder {
      id: ID!
      name: String!
      courses: [Course!]!
  }

  type ProjectStep {
    id: String!
    title: String!
    description: String!
    codeStub: String!
    challenge: String!
  }

  type ProjectCourseLink {
      id: String!
      title: String!
  }

  type Project {
      id: ID!
      title: String!
      description: String!
      steps: [ProjectStep!]!
      course: ProjectCourseLink
      progress: JSON!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    courses: [Course!]!
    projects: [Project!]!
    folders: [Folder!]!
    xp: Int!
    level: Int!
  }

  type ProgressUpdatePayload {
    progress: JSON!
    xp: Int!
    level: Int!
  }

  type LiveInterviewResponse {
      message: String!
  }
  
  # --- INPUTS ---
  
  input QuizInput {
    q: String!
    options: [String!]!
    answer: Int!
  }

  input ContentBlockInput {
    id: String!
    type: String!
    text: String
    code: String
    diagram: String
    quiz: QuizInput
    interactiveModel: JSON
    hyperparameterSimulator: JSON
    triageChallenge: JSON
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

  input LessonInput {
    id: String!
    title: String!
    objective: String!
    contentBlocks: [ContentBlockInput!]!
    resources: [ResourceInput!]
    practiceProblems: [PracticeProblemInput!]
    notes: String
  }

  input ModuleInput {
    title: String!
    lessons: [LessonInput!]!
  }

  input CourseInput {
    title: String!
    description: String!
    category: String!
    technologies: [String!]!
    modules: [ModuleInput!]!
    knowledgeLevel: String!
    id: String
  }

  input ProjectStepInput {
      id: String!
      title: String!
      description: String!
      codeStub: String!
      challenge: String!
  }

  input ProjectCourseLinkInput {
      id: String!
      title: String!
  }

  input ProjectInput {
      title: String!
      description: String!
      steps: [ProjectStepInput!]!
      course: ProjectCourseLinkInput!
  }

  input ChatMessageInput {
    role: String!
    content: String!
  }
  
  type Query {
    me(email: String!): User
  }

  type Mutation {
    login(email: String!, name: String!): User!
    createCourse(email: String!, courseInput: CourseInput!): Course!
    deleteCourse(email: String!, courseId: String!): Boolean!
    toggleLessonProgress(email: String!, courseId: String!, lessonId: String!): ProgressUpdatePayload!
    saveNote(email: String!, courseId: String!, lessonId: String!, note: String!): Boolean!
    
    createFolder(email: String!, folderName: String!): Folder!
    updateFolderName(email: String!, folderId: String!, newName: String!): Folder!
    deleteFolder(email: String!, folderId: String!): Boolean!
    moveCourseToFolder(email: String!, courseId: String!, folderId: String): User!

    createProject(email: String!, projectInput: ProjectInput!): Project!
    deleteProject(email: String!, projectId: String!): Boolean!
    toggleProjectStepProgress(email: String!, projectId: String!, stepId: String!): JSON!

    generateInterviewQuestions(email: String!, courseId: String!, difficulty: String!, count: Int!): Course!
    elaborateAnswer(email: String!, courseId: String!, questionSetId: String!, qIndex: Int!, question: String!, answer: String!): InterviewQuestionSet!
    
    startLiveInterview(email: String!, topic: String!): LiveInterviewResponse!
    sendLiveInterviewMessage(email: String!, topic: String!, history: [ChatMessageInput!]!): LiveInterviewResponse!
  }
`);