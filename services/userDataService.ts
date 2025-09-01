import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Course, Folder, Project, Progress, ProjectProgress, TestResult, Article } from '../types';

export class UserDataService {
  // User collection paths
  static getUserCoursesPath(userId: string) {
    return `users/${userId}/courses`;
  }

  static getUserFoldersPath(userId: string) {
    return `users/${userId}/folders`;
  }

  static getUserProjectsPath(userId: string) {
    return `users/${userId}/projects`;
  }

  static getUserProgressPath(userId: string) {
    return `users/${userId}/progress`;
  }

  static getUserArticlesPath(userId: string) {
    return `users/${userId}/articles`;
  }

  static getUserTestResultsPath(userId: string) {
    return `users/${userId}/testResults`;
  }

  // Course operations
  static async saveCourse(userId: string, course: Course): Promise<void> {
    const courseRef = doc(collection(db, this.getUserCoursesPath(userId)), course.id);
    await setDoc(courseRef, {
      ...course,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  static async getCourses(userId: string): Promise<Course[]> {
    const coursesRef = collection(db, this.getUserCoursesPath(userId));
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Course);
  }

  static async updateCourse(userId: string, course: Course): Promise<void> {
    const courseRef = doc(db, this.getUserCoursesPath(userId), course.id);
    await updateDoc(courseRef, {
      ...course,
      updatedAt: Timestamp.now()
    });
  }

  static async deleteCourse(userId: string, courseId: string): Promise<void> {
    const courseRef = doc(db, this.getUserCoursesPath(userId), courseId);
    await deleteDoc(courseRef);
  }

  // Folder operations
  static async saveFolders(userId: string, folders: Folder[]): Promise<void> {
    const batch = writeBatch(db);
    
    folders.forEach(folder => {
      const folderRef = doc(collection(db, this.getUserFoldersPath(userId)), folder.id);
      batch.set(folderRef, {
        ...folder,
        updatedAt: Timestamp.now()
      });
    });
    
    await batch.commit();
  }

  static async getFolders(userId: string): Promise<Folder[]> {
    const foldersRef = collection(db, this.getUserFoldersPath(userId));
    const snapshot = await getDocs(foldersRef);
    return snapshot.docs.map(doc => doc.data() as Folder);
  }

  static async saveFolder(userId: string, folder: Folder): Promise<void> {
    const folderRef = doc(collection(db, this.getUserFoldersPath(userId)), folder.id);
    await setDoc(folderRef, {
      ...folder,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  static async deleteFolder(userId: string, folderId: string): Promise<void> {
    const folderRef = doc(db, this.getUserFoldersPath(userId), folderId);
    await deleteDoc(folderRef);
  }

  // Project operations
  static async saveProject(userId: string, project: Project): Promise<void> {
    const projectRef = doc(collection(db, this.getUserProjectsPath(userId)), project.id);
    await setDoc(projectRef, {
      ...project,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  static async getProjects(userId: string): Promise<Project[]> {
    const projectsRef = collection(db, this.getUserProjectsPath(userId));
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Project);
  }

  static async deleteProject(userId: string, projectId: string): Promise<void> {
    const projectRef = doc(db, this.getUserProjectsPath(userId), projectId);
    await deleteDoc(projectRef);
  }

  // Progress operations
  static async saveProgress(userId: string, courseId: string, progress: Progress): Promise<void> {
    const progressRef = doc(db, this.getUserProgressPath(userId), courseId);
    
    // Convert Map to object for Firestore
    const progressObj: Record<string, number> = {};
    progress.forEach((timestamp, lessonId) => {
      progressObj[lessonId] = timestamp;
    });
    
    await setDoc(progressRef, {
      courseId,
      progress: progressObj,
      updatedAt: Timestamp.now()
    });
  }

  static async getProgress(userId: string, courseId: string): Promise<Progress> {
    const progressRef = doc(db, this.getUserProgressPath(userId), courseId);
    const snapshot = await getDoc(progressRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const progress = new Map<string, number>();
      
      if (data.progress) {
        Object.entries(data.progress).forEach(([lessonId, timestamp]) => {
          progress.set(lessonId, timestamp as number);
        });
      }
      
      return progress;
    }
    
    return new Map();
  }

  static async getAllProgress(userId: string): Promise<Record<string, Progress>> {
    const progressRef = collection(db, this.getUserProgressPath(userId));
    const snapshot = await getDocs(progressRef);
    
    const allProgress: Record<string, Progress> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const progress = new Map<string, number>();
      
      if (data.progress) {
        Object.entries(data.progress).forEach(([lessonId, timestamp]) => {
          progress.set(lessonId, timestamp as number);
        });
      }
      
      allProgress[data.courseId] = progress;
    });
    
    return allProgress;
  }

  static async deleteProgress(userId: string, courseId: string): Promise<void> {
    const progressRef = doc(db, this.getUserProgressPath(userId), courseId);
    await deleteDoc(progressRef);
  }

  // Article operations
  static async saveArticle(userId: string, article: Article): Promise<void> {
    const articleRef = doc(collection(db, this.getUserArticlesPath(userId)), article.id);
    await setDoc(articleRef, {
      ...article,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }

  static async getArticles(userId: string): Promise<Article[]> {
    const articlesRef = collection(db, this.getUserArticlesPath(userId));
    const q = query(articlesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Article);
  }

  static async deleteArticle(userId: string, articleId: string): Promise<void> {
    const articleRef = doc(db, this.getUserArticlesPath(userId), articleId);
    await deleteDoc(articleRef);
  }

  // Test results operations
  static async saveTestResult(userId: string, testResult: TestResult): Promise<void> {
    const testRef = doc(collection(db, this.getUserTestResultsPath(userId)), testResult.id);
    await setDoc(testRef, {
      ...testResult,
      createdAt: Timestamp.now()
    });
  }

  static async getTestResults(userId: string): Promise<TestResult[]> {
    const testsRef = collection(db, this.getUserTestResultsPath(userId));
    const q = query(testsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as TestResult);
  }

  // Real-time listeners
  static subscribeToUserCourses(userId: string, callback: (courses: Course[]) => void) {
    const coursesRef = collection(db, this.getUserCoursesPath(userId));
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => doc.data() as Course);
      callback(courses);
    });
  }

  static subscribeToUserFolders(userId: string, callback: (folders: Folder[]) => void) {
    const foldersRef = collection(db, this.getUserFoldersPath(userId));
    
    return onSnapshot(foldersRef, (snapshot) => {
      const folders = snapshot.docs.map(doc => doc.data() as Folder);
      callback(folders);
    });
  }

  static subscribeToUserProjects(userId: string, callback: (projects: Project[]) => void) {
    const projectsRef = collection(db, this.getUserProjectsPath(userId));
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      callback(projects);
    });
  }

  // User profile operations
  static async saveUserProfile(userId: string, profile: any): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profile,
      lastActive: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });
  }

  static async getUserProfile(userId: string): Promise<any> {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() : null;
  }
}
