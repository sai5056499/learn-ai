import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { UserStorageService } from '../services/userStorageService';
import * as geminiService from '../services/geminiService';
import { useAuth } from './AuthContext';
import { Course, Folder, Project, Progress, ProjectProgress, KnowledgeLevel, ChatMessage, RelatedTopic, QuizData } from '../types';

interface ExploreModalState {
    isOpen: boolean;
    isLoading: boolean;
    courseTitle: string;
    topics: RelatedTopic[];
}

interface PreloadedTestState {
    topic: string;
    difficulty: KnowledgeLevel;
    questions: QuizData[];
}

interface AppContextType {
    courses: Course[];
    folders: Folder[];
    projects: Project[];
    progressData: Record<string, Progress>;
    projectProgressData: Record<string, ProjectProgress>;
    activeCourse: Course | null;
    activeProject: Project | null;
    topic: string;
    error: string | null;
    funFacts: string[];
    generatingLessonFlashcardId: string | null;
    lastActiveCourseId: string | null;
    exploreModalState: ExploreModalState;
    preloadedTest: PreloadedTestState | null;
    
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    setActiveCourse: React.Dispatch<React.SetStateAction<Course | null>>;
    setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>;
    clearPreloadedTest: () => void;

    handleGenerateCourse: (topic: string, level: KnowledgeLevel, folderId: string | null, setViewCourse: () => void, setViewGenerating: () => void, setViewCanvas: () => void) => void;
    handleSelectCourse: (courseId: string) => void;
    handleDeleteCourse: (courseId: string) => void;
    handleToggleLessonComplete: (courseId: string, lessonId: string) => void;
    
    handleCreateFolder: (name: string) => void;
    handleDeleteFolder: (folderId: string) => void;
    handleUpdateFolderName: (folderId: string, newName: string) => void;
    handleMoveCourseToFolder: (courseId: string, targetFolderId: string | null) => void;

    handleCreateProject: (projectTopic: string, setViewProject: () => void, setViewGenerating: () => void, setViewProjects: () => void) => void;
    handleSelectProject: (projectId: string) => void;
    handleDeleteProject: (projectId: string) => void;
    handleToggleProjectStepComplete: (projectId: string, stepId: string) => void;

    handleGenerateLessonFlashcards: (lessonId: string) => void;
    handleSaveNote: (courseId: string, lessonId: string, note: string) => void;
    handleCloseSocraticModal: (setSocraticState: React.Dispatch<React.SetStateAction<any>>) => void;
    handleSendSocraticMessage: (message: string, socraticState: any, setSocraticState: React.Dispatch<React.SetStateAction<any>>) => void;
    
    handleTestCourseConcepts: (course: Course, navigateToAssessment: () => void) => void;
    handleExploreTopics: (course: Course) => void;
    closeExploreModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [progressData, setProgressData] = useState<Record<string, Progress>>({});
    const [projectProgressData, setProjectProgressData] = useState<Record<string, ProjectProgress>>({});
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [topic, setTopic] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [funFacts, setFunFacts] = useState<string[]>([]);
    const [generatingLessonFlashcardId, setGeneratingLessonFlashcardId] = useState<string | null>(null);
    const [preloadedTest, setPreloadedTest] = useState<PreloadedTestState | null>(null);
    const [exploreModalState, setExploreModalState] = useState<ExploreModalState>({
        isOpen: false,
        isLoading: false,
        courseTitle: '',
        topics: [],
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Initialize user and load data when user authentication changes
    useEffect(() => {
        const initializeUserData = async () => {
            if (user) {
                try {
                    // Initialize user in database
                    await UserStorageService.initializeUser(user.uid, {
                        email: user.email || '',
                        displayName: user.displayName || '',
                        photoURL: user.photoURL || ''
                    });

                    // Load user data
                    const [savedCourses, savedFolders, savedProjects, savedProgress, savedProjectProgress] = await Promise.all([
                        UserStorageService.getCourses(),
                        UserStorageService.getFolders(),
                        UserStorageService.getProjects(),
                        UserStorageService.getAllProgress(),
                        UserStorageService.getAllProjectProgress()
                    ]);

                    setCourses(savedCourses);
                    setFolders(savedFolders);
                    setProjects(savedProjects);
                    setProgressData(savedProgress);
                    setProjectProgressData(savedProjectProgress);
                    setIsDataLoaded(true);
                } catch (error) {
                    console.error('Failed to initialize user data:', error);
                    setError('Failed to load user data. Please try refreshing the page.');
                }
            } else {
                // Clear data when user logs out
                UserStorageService.clearCurrentUser();
                setCourses([]);
                setFolders([]);
                setProjects([]);
                setProgressData({});
                setProjectProgressData({});
                setActiveCourse(null);
                setActiveProject(null);
                setIsDataLoaded(false);
            }
        };

        initializeUserData();
    }, [user]);

    // Set up real-time data synchronization
    useEffect(() => {
        if (user && isDataLoaded) {
            const unsubscribe = UserStorageService.subscribeToUserData({
                onCoursesUpdate: setCourses,
                onFoldersUpdate: setFolders,
                onProjectsUpdate: setProjects
            });

            return unsubscribe;
        }
    }, [user, isDataLoaded]);

    const lastActiveCourseId = useMemo(() => {
        let lastTimestamp = 0;
        let lastCourseId: string | null = null;
        if (!progressData || Object.keys(progressData).length === 0) return null;
        for (const courseId in progressData) {
            const progressMap = progressData[courseId];
            if (progressMap) {
                for (const timestamp of progressMap.values()) {
                    if (timestamp > lastTimestamp) {
                        lastTimestamp = timestamp;
                        lastCourseId = courseId;
                    }
                }
            }
        }
        return lastCourseId;
    }, [progressData]);
    
    const clearPreloadedTest = useCallback(() => {
        setPreloadedTest(null);
    }, []);

    const handleGenerateCourse = useCallback(async (topic: string, level: KnowledgeLevel, folderId: string | null, setViewCourse: () => void, setViewGenerating: () => void, setViewCanvas: () => void) => {
        if (!user) {
            setError('Please sign in to generate courses.');
            return;
        }

        setTopic(topic);
        setViewGenerating();
        setError(null);
        setFunFacts([]);

        geminiService.generateFunFacts(topic)
            .then(setFunFacts)
            .catch(e => console.error("Failed to fetch fun facts for loading screen:", e));

        try {
            const generatedCourse = await geminiService.generateCourse(topic, level);
            await UserStorageService.saveCourse(generatedCourse);

            if (folderId) {
                const updatedFolders = folders.map(f =>
                    f.id === folderId ? { ...f, courseIds: [...f.courseIds, generatedCourse.id] } : f
                );
                setFolders(updatedFolders);
                await UserStorageService.saveFolders(updatedFolders);
            }

            setCourses(prev => [generatedCourse, ...prev]);
            setActiveCourse(generatedCourse);
            setViewCourse();
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate the course. ${errorMessage}. Please try again.`);
            setViewCanvas();
        }
    }, [folders, user]);

    const handleSelectCourse = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (course) setActiveCourse(course);
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            const remainingCourses = courses.filter(c => c.id !== courseId);
            const updatedFolders = folders.map(f => ({ ...f, courseIds: f.courseIds.filter(id => id !== courseId) }));
            
            setCourses(remainingCourses);
            setFolders(updatedFolders);
            setProgressData(prev => { const newProgress = { ...prev }; delete newProgress[courseId]; return newProgress; });
            
            await Promise.all([
                UserStorageService.deleteCourse(courseId),
                UserStorageService.saveFolders(updatedFolders)
            ]);
        } catch (error) {
            console.error('Failed to delete course:', error);
            setError('Failed to delete course. Please try again.');
        }
    };

    const handleToggleLessonComplete = async (courseId: string, lessonId: string) => {
        try {
            const newProgress = await UserStorageService.toggleLessonProgress(courseId, lessonId);
            setProgressData(prev => ({ ...prev, [courseId]: newProgress }));
        } catch (error) {
            console.error('Failed to toggle lesson progress:', error);
            setError('Failed to update progress. Please try again.');
        }
    };

    const handleCreateFolder = async (name: string) => {
        try {
            const newFolder: Folder = { id: `folder_${Date.now()}`, name, courseIds: [], articleIds: [] };
            const updatedFolders = [...folders, newFolder];
            setFolders(updatedFolders);
            await UserStorageService.saveFolder(newFolder);
        } catch (error) {
            console.error('Failed to create folder:', error);
            setError('Failed to create folder. Please try again.');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        try {
            const updatedFolders = folders.filter(f => f.id !== folderId);
            setFolders(updatedFolders);
            await UserStorageService.deleteFolder(folderId);
        } catch (error) {
            console.error('Failed to delete folder:', error);
            setError('Failed to delete folder. Please try again.');
        }
    };

    const handleUpdateFolderName = async (folderId: string, newName: string) => {
        try {
            const updatedFolders = folders.map(f => (f.id === folderId ? { ...f, name: newName } : f));
            setFolders(updatedFolders);
            await UserStorageService.saveFolders(updatedFolders);
        } catch (error) {
            console.error('Failed to update folder name:', error);
            setError('Failed to update folder name. Please try again.');
        }
    };

    const handleMoveCourseToFolder = async (courseId: string, targetFolderId: string | null) => {
        try {
            let updatedFolders = folders.map(f => ({ ...f, courseIds: f.courseIds.filter(id => id !== courseId) }));
            if (targetFolderId) {
                const folderIndex = updatedFolders.findIndex(f => f.id === targetFolderId);
                if (folderIndex !== -1) updatedFolders[folderIndex].courseIds.push(courseId);
            }
            setFolders(updatedFolders);
            await UserStorageService.saveFolders(updatedFolders);
        } catch (error) {
            console.error('Failed to move course to folder:', error);
            setError('Failed to move course. Please try again.');
        }
    };

    const handleGenerateLessonFlashcards = useCallback(async (lessonId: string) => {
        if (!activeCourse) return;
        setGeneratingLessonFlashcardId(lessonId);
        try {
            const lesson = activeCourse.modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
            if (!lesson) throw new Error("Lesson not found");
            const generatedCards = await geminiService.generateLessonFlashcards(lesson);
            const updatedCourse = { ...activeCourse, modules: activeCourse.modules.map(m => ({ ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, flashcards: generatedCards } : l) })) };
            await UserStorageService.updateCourse(updatedCourse);
            setActiveCourse(updatedCourse);
            setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        } catch (e) {
            console.error("Failed to generate lesson flashcards", e);
            setError('Failed to generate flashcards. Please try again.');
        } finally {
            setGeneratingLessonFlashcardId(null);
        }
    }, [activeCourse]);

    const handleSaveNote = useCallback(async (courseId: string, lessonId: string, note: string) => {
        try {
            const courseToUpdate = courses.find(c => c.id === courseId);
            if (!courseToUpdate) return;
            const updatedCourse = { ...courseToUpdate, modules: courseToUpdate.modules.map(m => ({ ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, notes: note } : l) })) };
            await UserStorageService.updateCourse(updatedCourse);
            setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
            if (activeCourse?.id === courseId) setActiveCourse(updatedCourse);
        } catch (error) {
            console.error('Failed to save note:', error);
            setError('Failed to save note. Please try again.');
        }
    }, [courses, activeCourse]);
    
    const handleCloseSocraticModal = (setSocraticState: React.Dispatch<React.SetStateAction<any>>) => {
        setSocraticState({ isOpen: false, originalText: '', history: [], isLoading: false });
    };

    const handleSendSocraticMessage = useCallback(async (message: string, socraticState: { history: ChatMessage[], originalText: string }, setSocraticState: React.Dispatch<React.SetStateAction<{ history: ChatMessage[], originalText: string, isLoading: boolean, isOpen: boolean }>>) => {
        const newHistory: ChatMessage[] = [...socraticState.history, { role: 'user', content: message }];
        setSocraticState((prev) => ({ ...prev, history: newHistory, isLoading: true }));
        try {
            const aiResponse = await geminiService.continueSocraticDialogue(socraticState.originalText, newHistory);
            setSocraticState((prev) => ({ ...prev, history: [...newHistory, { role: 'model', content: aiResponse }], isLoading: false }));
        } catch (e) {
            console.error("Failed to get Socratic response", e);
            setSocraticState(prev => ({ ...prev, history: [...newHistory, { role: 'model', content: "I'm having trouble thinking. Please try again." }], isLoading: false }));
        }
    }, []);
    
    const handleCreateProject = useCallback(async (projectTopic: string, setViewProject: () => void, setViewGenerating: () => void, setViewProjects: () => void) => {
        if (!user) {
            setError('Please sign in to generate projects.');
            return;
        }

        setTopic(projectTopic);
        setViewGenerating();
        setError(null);
        setFunFacts([]);
        geminiService.generateFunFacts(projectTopic).then(setFunFacts).catch(e => console.error("Failed to fetch fun facts for project:", e));
        try {
            const generatedProject = await geminiService.generateProjectScaffold(projectTopic);
            await UserStorageService.saveProject(generatedProject);
            setProjects(prev => [generatedProject, ...prev]);
            setActiveProject(generatedProject);
            setViewProject();
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate the project. ${errorMessage}. Please try again.`);
            setViewProjects();
        }
    }, [user]);

    const handleSelectProject = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) setActiveProject(project);
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            const remainingProjects = projects.filter(p => p.id !== projectId);
            setProjects(remainingProjects);
            setProjectProgressData(prev => { const newProgress = { ...prev }; delete newProgress[projectId]; return newProgress; });
            await UserStorageService.deleteProject(projectId);
        } catch (error) {
            console.error('Failed to delete project:', error);
            setError('Failed to delete project. Please try again.');
        }
    };

    const handleToggleProjectStepComplete = async (projectId: string, stepId: string) => {
        try {
            const newProgress = await UserStorageService.toggleProjectStepProgress(projectId, stepId);
            setProjectProgressData(prev => ({ ...prev, [projectId]: newProgress }));
        } catch (error) {
            console.error('Failed to toggle project step progress:', error);
            setError('Failed to update project progress. Please try again.');
        }
    };

    const handleTestCourseConcepts = useCallback(async (course: Course, navigateToAssessment: () => void) => {
        try {
            const questions = await geminiService.generateTestFromCourse(course);
            setPreloadedTest({
                questions,
                topic: course.title,
                difficulty: course.knowledgeLevel,
            });
            navigateToAssessment();
        } catch(e) {
            console.error("Failed to generate test from course", e);
            setError(e instanceof Error ? e.message : "Could not generate the test for this course.");
        }
    }, []);

    const handleExploreTopics = useCallback(async (course: Course) => {
        setExploreModalState({
            isOpen: true,
            isLoading: true,
            courseTitle: course.title,
            topics: [],
        });
        try {
            const topics = await geminiService.generateRelatedTopics(course);
            setExploreModalState(prev => ({ ...prev, topics, isLoading: false }));
        } catch(e) {
            console.error("Failed to generate related topics", e);
            setExploreModalState(prev => ({ ...prev, isLoading: false })); // Still show modal but empty
        }
    }, []);
    
    const closeExploreModal = useCallback(() => {
        setExploreModalState({ isOpen: false, isLoading: false, courseTitle: '', topics: [] });
    }, []);

    const value = {
        courses, setCourses,
        folders, setFolders,
        projects, setProjects,
        progressData,
        projectProgressData,
        activeCourse, setActiveCourse,
        activeProject, setActiveProject,
        topic,
        error,
        funFacts,
        generatingLessonFlashcardId,
        lastActiveCourseId,
        exploreModalState,
        preloadedTest,
        clearPreloadedTest,
        handleGenerateCourse,
        handleSelectCourse,
        handleDeleteCourse,
        handleToggleLessonComplete,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolderName,
        handleMoveCourseToFolder,
        handleCreateProject,
        handleSelectProject,
        handleDeleteProject,
        handleToggleProjectStepComplete,
        handleGenerateLessonFlashcards,
        handleSaveNote,
        handleCloseSocraticModal,
        handleSendSocraticMessage,
        handleTestCourseConcepts,
        handleExploreTopics,
        closeExploreModal,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};