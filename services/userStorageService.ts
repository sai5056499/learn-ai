import { DatabaseService } from './databaseService';
import { Course, Progress, Folder, Project, ProjectProgress, Article } from '../types';

/**
 * User-specific storage service that integrates with Firebase Firestore
 * This service requires a user to be authenticated and provides personalized data storage
 */
export class UserStorageService {
  private static currentUserId: string | null = null;

  // Set the current user ID
  static setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  // Clear the current user
  static clearCurrentUser() {
    this.currentUserId = null;
  }

  // Helper to get current user ID
  private static getCurrentUserId(): string {
    if (!this.currentUserId) {
      throw new Error('No user is currently authenticated. Please sign in first.');
    }
    return this.currentUserId;
  }

  // --- Folder Management ---
  static async getFolders(): Promise<Folder[]> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getFolders(userId);
    } catch (error) {
      console.error('Failed to load folders from database', error);
      return [];
    }
  }

  static async saveFolders(folders: Folder[]): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveFolders(userId, folders);
    } catch (error) {
      console.error('Failed to save folders to database', error);
      throw error;
    }
  }

  static async saveFolder(folder: Folder): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveFolder(userId, folder);
    } catch (error) {
      console.error('Failed to save folder to database', error);
      throw error;
    }
  }

  static async deleteFolder(folderId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.deleteFolder(userId, folderId);
    } catch (error) {
      console.error('Failed to delete folder from database', error);
      throw error;
    }
  }

  // --- Course Management ---
  static async getCourses(): Promise<Course[]> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getCourses(userId);
    } catch (error) {
      console.error('Failed to load courses from database', error);
      return [];
    }
  }

  static async saveCourse(course: Course): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveCourse(userId, course);
    } catch (error) {
      console.error('Failed to save course to database', error);
      throw error;
    }
  }

  static async updateCourse(course: Course): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.updateCourse(userId, course);
    } catch (error) {
      console.error('Failed to update course in database', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.deleteCourse(userId, courseId);
      // Also delete associated progress
      await DatabaseService.deleteProgress(userId, courseId);
    } catch (error) {
      console.error('Failed to delete course from database', error);
      throw error;
    }
  }

  // --- Article Management ---
  static async getArticles(): Promise<Article[]> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getArticles(userId);
    } catch (error) {
      console.error('Failed to load articles from database', error);
      return [];
    }
  }

  static async saveArticle(article: Article): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveArticle(userId, article);
    } catch (error) {
      console.error('Failed to save article to database', error);
      throw error;
    }
  }

  static async updateArticle(article: Article): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.updateArticle(userId, article);
    } catch (error) {
      console.error('Failed to update article in database', error);
      throw error;
    }
  }

  static async deleteArticle(articleId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.deleteArticle(userId, articleId);
    } catch (error) {
      console.error('Failed to delete article from database', error);
      throw error;
    }
  }

  // --- Project Management ---
  static async getProjects(): Promise<Project[]> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getProjects(userId);
    } catch (error) {
      console.error('Failed to load projects from database', error);
      return [];
    }
  }

  static async saveProject(project: Project): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveProject(userId, project);
    } catch (error) {
      console.error('Failed to save project to database', error);
      throw error;
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.deleteProject(userId, projectId);
    } catch (error) {
      console.error('Failed to delete project from database', error);
      throw error;
    }
  }

  // --- Progress Management ---
  static async getProgress(courseId: string): Promise<Progress> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getProgress(userId, courseId);
    } catch (error) {
      console.error('Failed to load progress from database', error);
      return new Map();
    }
  }

  static async getAllProgress(): Promise<Record<string, Progress>> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getAllProgress(userId);
    } catch (error) {
      console.error('Failed to load all progress from database', error);
      return {};
    }
  }

  static async saveProgress(courseId: string, progress: Progress): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveProgress(userId, courseId, progress);
    } catch (error) {
      console.error('Failed to save progress to database', error);
      throw error;
    }
  }

  static async deleteProgress(courseId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.deleteProgress(userId, courseId);
    } catch (error) {
      console.error('Failed to delete progress from database', error);
      throw error;
    }
  }

  static async toggleLessonProgress(courseId: string, lessonId: string): Promise<Progress> {
    try {
      const userId = this.getCurrentUserId();
      const currentProgress = await DatabaseService.getProgress(userId, courseId);
      
      if (currentProgress.has(lessonId)) {
        currentProgress.delete(lessonId);
      } else {
        currentProgress.set(lessonId, Date.now());
      }
      
      await DatabaseService.saveProgress(userId, courseId, currentProgress);
      return currentProgress;
    } catch (error) {
      console.error('Failed to toggle lesson progress', error);
      throw error;
    }
  }

  // --- Project Progress Management ---
  static async getProjectProgress(projectId: string): Promise<ProjectProgress> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getProjectProgress(userId, projectId);
    } catch (error) {
      console.error('Failed to load project progress from database', error);
      return new Map();
    }
  }

  static async getAllProjectProgress(): Promise<Record<string, ProjectProgress>> {
    try {
      const userId = this.getCurrentUserId();
      return await DatabaseService.getAllProjectProgress(userId);
    } catch (error) {
      console.error('Failed to load all project progress from database', error);
      return {};
    }
  }

  static async saveProjectProgress(projectId: string, progress: ProjectProgress): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await DatabaseService.saveProjectProgress(userId, projectId, progress);
    } catch (error) {
      console.error('Failed to save project progress to database', error);
      throw error;
    }
  }

  static async toggleProjectStepProgress(projectId: string, stepId: string): Promise<ProjectProgress> {
    try {
      const userId = this.getCurrentUserId();
      const currentProgress = await DatabaseService.getProjectProgress(userId, projectId);
      
      const currentValue = currentProgress.get(stepId) || false;
      currentProgress.set(stepId, !currentValue);
      
      await DatabaseService.saveProjectProgress(userId, projectId, currentProgress);
      return currentProgress;
    } catch (error) {
      console.error('Failed to toggle project step progress', error);
      throw error;
    }
  }

  // --- Real-time subscriptions ---
  static subscribeToUserData(callbacks: {
    onCoursesUpdate?: (courses: Course[]) => void;
    onFoldersUpdate?: (folders: Folder[]) => void;
    onProjectsUpdate?: (projects: Project[]) => void;
  }) {
    const userId = this.getCurrentUserId();
    const unsubscribes: (() => void)[] = [];

    if (callbacks.onCoursesUpdate) {
      const unsubscribeCourses = DatabaseService.subscribeToUserCourses(userId, callbacks.onCoursesUpdate);
      unsubscribes.push(unsubscribeCourses);
    }

    if (callbacks.onFoldersUpdate) {
      const unsubscribeFolders = DatabaseService.subscribeToUserFolders(userId, callbacks.onFoldersUpdate);
      unsubscribes.push(unsubscribeFolders);
    }

    if (callbacks.onProjectsUpdate) {
      const unsubscribeProjects = DatabaseService.subscribeToUserProjects(userId, callbacks.onProjectsUpdate);
      unsubscribes.push(unsubscribeProjects);
    }

    // Return a function to unsubscribe from all listeners
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }

  // --- User initialization ---
  static async initializeUser(userId: string, userData: { email: string; displayName: string; photoURL?: string }): Promise<void> {
    try {
      await DatabaseService.initializeUser(userId, userData);
      this.setCurrentUser(userId);
    } catch (error) {
      console.error('Failed to initialize user with Firestore:', error);
      console.warn('Falling back to localStorage for data storage');
      // Set current user even if Firestore fails - we'll use localStorage as fallback
      this.setCurrentUser(userId);
      // Don't throw error - let the app continue with localStorage
    }
  }
}
