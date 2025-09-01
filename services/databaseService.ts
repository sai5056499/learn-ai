import { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  onValue,
  off,
  serverTimestamp
} from 'firebase/database';
import { db } from './firebaseConfig';
import { Course, Folder, Article, Progress, ProjectProgress, Project } from '../types';

export class DatabaseService {
  // Database paths
  private static readonly USERS_PATH = 'users';
  private static readonly COURSES_PATH = 'courses';
  private static readonly FOLDERS_PATH = 'folders';
  private static readonly ARTICLES_PATH = 'articles';
  private static readonly PROJECTS_PATH = 'projects';
  private static readonly PROGRESS_PATH = 'progress';
  private static readonly PROJECT_PROGRESS_PATH = 'projectProgress';

  // Helper method to get user reference
  private static getUserRef(userId: string) {
    return ref(db, `${this.USERS_PATH}/${userId}`);
  }

  // Helper method to get user subcollection reference
  private static getUserSubcollectionRef(userId: string, subcollection: string) {
    return ref(db, `${this.USERS_PATH}/${userId}/${subcollection}`);
  }

  // Initialize user document
  static async initializeUser(userId: string, userData: { email: string; displayName: string; photoURL?: string }) {
    try {
      const userRef = this.getUserRef(userId);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        await set(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });
      } else {
        // Update last active time
        await update(userRef, {
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Realtime Database connection error:', error);
      console.warn('Realtime Database is not properly configured. Please check your Firebase project settings.');
      throw new Error('Database connection failed. Please ensure Realtime Database is enabled in your Firebase project.');
    }
  }

  // COURSES
  static async saveCourse(userId: string, course: Course): Promise<void> {
    try {
      const courseRef = ref(db, `${this.USERS_PATH}/${userId}/${this.COURSES_PATH}/${course.id}`);
      await set(courseRef, {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save course:', error);
      throw error;
    }
  }

  static async getCourses(userId: string): Promise<Course[]> {
    try {
      const coursesRef = this.getUserSubcollectionRef(userId, this.COURSES_PATH);
      const snapshot = await get(coursesRef);
      
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        return Object.values(coursesData || {}).map(course => course as Course);
      }
      return [];
    } catch (error) {
      console.error('Failed to get courses from Realtime Database:', error);
      return [];
    }
  }

  static async updateCourse(userId: string, course: Course): Promise<void> {
    try {
      const courseRef = ref(db, `${this.USERS_PATH}/${userId}/${this.COURSES_PATH}/${course.id}`);
      await update(courseRef, {
        ...course,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update course:', error);
      throw error;
    }
  }

  static async deleteCourse(userId: string, courseId: string): Promise<void> {
    try {
      const courseRef = ref(db, `${this.USERS_PATH}/${userId}/${this.COURSES_PATH}/${courseId}`);
      await remove(courseRef);
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw error;
    }
  }

  // FOLDERS
  static async saveFolders(userId: string, folders: Folder[]): Promise<void> {
    try {
      const foldersRef = this.getUserSubcollectionRef(userId, this.FOLDERS_PATH);
      const foldersObject: Record<string, Folder> = {};
      
      folders.forEach(folder => {
        foldersObject[folder.id] = folder;
      });
      
      await set(foldersRef, foldersObject);
    } catch (error) {
      console.error('Failed to save folders:', error);
      throw error;
    }
  }

  static async getFolders(userId: string): Promise<Folder[]> {
    try {
      const foldersRef = this.getUserSubcollectionRef(userId, this.FOLDERS_PATH);
      const snapshot = await get(foldersRef);
      
      if (snapshot.exists()) {
        const foldersData = snapshot.val();
        return Object.values(foldersData || {}).map(folder => folder as Folder);
      }
      return [];
    } catch (error) {
      console.error('Failed to get folders from Realtime Database:', error);
      return [];
    }
  }

  static async saveFolder(userId: string, folder: Folder): Promise<void> {
    try {
      const folderRef = ref(db, `${this.USERS_PATH}/${userId}/${this.FOLDERS_PATH}/${folder.id}`);
      await set(folderRef, {
        ...folder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save folder:', error);
      throw error;
    }
  }

  static async deleteFolder(userId: string, folderId: string): Promise<void> {
    try {
      const folderRef = ref(db, `${this.USERS_PATH}/${userId}/${this.FOLDERS_PATH}/${folderId}`);
      await remove(folderRef);
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  }

  // ARTICLES
  static async saveArticle(userId: string, article: Article): Promise<void> {
    try {
      const articleRef = ref(db, `${this.USERS_PATH}/${userId}/${this.ARTICLES_PATH}/${article.id}`);
      await set(articleRef, {
        ...article,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save article:', error);
      throw error;
    }
  }

  static async getArticles(userId: string): Promise<Article[]> {
    try {
      const articlesRef = this.getUserSubcollectionRef(userId, this.ARTICLES_PATH);
      const snapshot = await get(articlesRef);
      
      if (snapshot.exists()) {
        const articlesData = snapshot.val();
        return Object.values(articlesData || {}).map(article => article as Article);
      }
      return [];
    } catch (error) {
      console.error('Failed to get articles from Realtime Database:', error);
      return [];
    }
  }

  static async updateArticle(userId: string, article: Article): Promise<void> {
    try {
      const articleRef = ref(db, `${this.USERS_PATH}/${userId}/${this.ARTICLES_PATH}/${article.id}`);
      await update(articleRef, {
        ...article,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update article:', error);
      throw error;
    }
  }

  static async deleteArticle(userId: string, articleId: string): Promise<void> {
    try {
      const articleRef = ref(db, `${this.USERS_PATH}/${userId}/${this.ARTICLES_PATH}/${articleId}`);
      await remove(articleRef);
    } catch (error) {
      console.error('Failed to delete article:', error);
      throw error;
    }
  }

  // PROJECTS
  static async saveProject(userId: string, project: Project): Promise<void> {
    try {
      const projectRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROJECTS_PATH}/${project.id}`);
      await set(projectRef, {
        ...project,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  static async getProjects(userId: string): Promise<Project[]> {
    try {
      const projectsRef = this.getUserSubcollectionRef(userId, this.PROJECTS_PATH);
      const snapshot = await get(projectsRef);
      
      if (snapshot.exists()) {
        const projectsData = snapshot.val();
        return Object.values(projectsData || {}).map(project => project as Project);
      }
      return [];
    } catch (error) {
      console.error('Failed to get projects from Realtime Database:', error);
      return [];
    }
  }

  static async deleteProject(userId: string, projectId: string): Promise<void> {
    try {
      const projectRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROJECTS_PATH}/${projectId}`);
      await remove(projectRef);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  // PROGRESS
  static async saveProgress(userId: string, courseId: string, progress: Progress): Promise<void> {
    try {
      const progressRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROGRESS_PATH}/${courseId}`);
      
      // Convert Map to object for Realtime Database storage
      const progressObject = Object.fromEntries(progress);
      
      await set(progressRef, {
        courseId,
        progress: progressObject,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  }

  static async getProgress(userId: string, courseId: string): Promise<Progress> {
    try {
      const progressRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROGRESS_PATH}/${courseId}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object back to Map
        return new Map(Object.entries(data.progress || {}).map(([key, value]) => [key, value as number]));
      }
      
      return new Map();
    } catch (error) {
      console.error('Failed to get progress:', error);
      return new Map();
    }
  }

  static async getAllProgress(userId: string): Promise<Record<string, Progress>> {
    try {
      const progressRef = this.getUserSubcollectionRef(userId, this.PROGRESS_PATH);
      const snapshot = await get(progressRef);
      
      const allProgress: Record<string, Progress> = {};
      if (snapshot.exists()) {
        const progressData = snapshot.val();
        Object.entries(progressData || {}).forEach(([courseId, data]: [string, any]) => {
          allProgress[courseId] = new Map(Object.entries(data.progress || {}).map(([key, value]) => [key, value as number]));
        });
      }
      
      return allProgress;
    } catch (error) {
      console.error('Failed to get all progress:', error);
      return {};
    }
  }

  static async deleteProgress(userId: string, courseId: string): Promise<void> {
    try {
      const progressRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROGRESS_PATH}/${courseId}`);
      await remove(progressRef);
    } catch (error) {
      console.error('Failed to delete progress:', error);
      throw error;
    }
  }

  // PROJECT PROGRESS
  static async saveProjectProgress(userId: string, projectId: string, progress: ProjectProgress): Promise<void> {
    try {
      const progressRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROJECT_PROGRESS_PATH}/${projectId}`);
      
      // Convert Map to object for Realtime Database storage
      const progressObject = Object.fromEntries(progress);
      
      await set(progressRef, {
        projectId,
        progress: progressObject,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save project progress:', error);
      throw error;
    }
  }

  static async getProjectProgress(userId: string, projectId: string): Promise<ProjectProgress> {
    try {
      const progressRef = ref(db, `${this.USERS_PATH}/${userId}/${this.PROJECT_PROGRESS_PATH}/${projectId}`);
      const snapshot = await get(progressRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object back to Map
        return new Map(Object.entries(data.progress || {}).map(([key, value]) => [key, value as boolean]));
      }
      
      return new Map();
    } catch (error) {
      console.error('Failed to get project progress:', error);
      return new Map();
    }
  }

  static async getAllProjectProgress(userId: string): Promise<Record<string, ProjectProgress>> {
    try {
      const progressRef = this.getUserSubcollectionRef(userId, this.PROJECT_PROGRESS_PATH);
      const snapshot = await get(progressRef);
      
      const allProgress: Record<string, ProjectProgress> = {};
      if (snapshot.exists()) {
        const progressData = snapshot.val();
        Object.entries(progressData || {}).forEach(([projectId, data]: [string, any]) => {
          allProgress[projectId] = new Map(Object.entries(data.progress || {}).map(([key, value]) => [key, value as boolean]));
        });
      }
      
      return allProgress;
    } catch (error) {
      console.error('Failed to get all project progress:', error);
      return {};
    }
  }

  // REAL-TIME LISTENERS
  static subscribeToUserCourses(userId: string, callback: (courses: Course[]) => void) {
    const coursesRef = this.getUserSubcollectionRef(userId, this.COURSES_PATH);
    
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const coursesData = snapshot.val();
        const courses = Object.values(coursesData || {}).map(course => course as Course);
        callback(courses);
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  }

  static subscribeToUserFolders(userId: string, callback: (folders: Folder[]) => void) {
    const foldersRef = this.getUserSubcollectionRef(userId, this.FOLDERS_PATH);
    
    const unsubscribe = onValue(foldersRef, (snapshot) => {
      if (snapshot.exists()) {
        const foldersData = snapshot.val();
        const folders = Object.values(foldersData || {}).map(folder => folder as Folder);
        callback(folders);
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  }

  static subscribeToUserProjects(userId: string, callback: (projects: Project[]) => void) {
    const projectsRef = this.getUserSubcollectionRef(userId, this.PROJECTS_PATH);
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const projectsData = snapshot.val();
        const projects = Object.values(projectsData || {}).map(project => project as Project);
        callback(projects);
      } else {
        callback([]);
      }
    });
    
    return unsubscribe;
  }
}
