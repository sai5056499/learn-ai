import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Course, Folder, Progress, KnowledgeLevel, ChatMessage, LearningItem, RelatedTopic, QuizData, InterviewQuestion, MindMapNode, StoryModalState, ArticleModalState, ExpandTopicModalState, InterviewQuestionSet, Module, PracticeSession, FlashcardModalState, AnalogyModalState, ContentBlock, BackgroundTask, Project, LiveInterviewState, User, LearningGoal, LearningStyle, CreateTopicsModalState, Achievement, AchievementId, CourseSource } from '../types';
import * as storageService from '../services/storageService';
import * as geminiService from '../services/geminiService';
import { achievementsMap } from '../services/achievements';
import { useAuth } from './AuthContext';

const XP_PER_LESSON = 100;
const calculateRequiredXp = (level: number) => level * 500;

interface ExploreModalState {
    isOpen: boolean;
    isLoading: boolean;
    courseTitle: string;
    topics: RelatedTopic[];
}

interface InterviewPrepState {
    isGenerating: boolean;
    questionSets: InterviewQuestionSet[];
    error: string | null;
    elaboratingIndex: { setIndex: number; qIndex: number } | null;
}

interface PreloadedTestState {
    topic: string;
    difficulty: KnowledgeLevel;
    questions: QuizData[];
}

interface AppContextType {
    // Data
    courses: Course[];
    folders: Folder[];
    projects: Project[];
    localUser: User; // User from AuthContext
    activeCourse: Course | null;
    activeProject: Project | null;
    topic: string; // for loading screen
    error: string | null;
    
    setActiveCourse: React.Dispatch<React.SetStateAction<Course | null>>;

    // Actions
    handleGenerateCourse: (topic: string, level: KnowledgeLevel, folderId: string | null, goal: LearningGoal, style: LearningStyle, source: CourseSource, specificTech: string, includeTheory: boolean) => void;
    handleSelectCourse: (courseId: string | null) => void;
    
    handleDeleteCourse: (courseId: string) => void;
    handleToggleItemComplete: (courseId: string, itemId: string) => void;
    handleCreateFolder: (name: string) => void;
    handleDeleteFolder: (folderId: string) => void;
    handleUpdateFolderName: (folderId: string, newName: string) => void;
    handleMoveCourseToFolder: (courseId: string, targetFolderId: string | null) => void;
    handleSaveItemNote: (courseId: string, itemId: string, note: string) => void;
    handleTestCourseConcepts: (course: Course, navigateToAssessment: () => void) => void;
    handleExploreTopics: (course: Course) => void;
    closeExploreModal: () => void;
    handleGenerateModuleMindMap: (courseId: string, moduleNumber: number) => Promise<MindMapNode>;
    handleUpdateContentBlock: (courseId: string, lessonId: string, blockId: string, newDiagramSyntax: string) => void;
    
    lastActiveCourseId: string | null;
    exploreModalState: ExploreModalState;
    storyModalState: StoryModalState;
    closeStoryModal: () => void;
    preloadedTest: PreloadedTestState | null;
    clearPreloadedTest: () => void;
    
    // Article Feature
    articleDisplayModal: ArticleModalState;
    closeArticleDisplayModal: () => void;
    handleGenerateArticle: (topic: string) => void;

    // Interview Prep
    interviewPrepState: InterviewPrepState;
    handleStartInterviewPrep: (course: Course) => void;
    handleGenerateInterviewQuestions: (courseId: string, difficulty: KnowledgeLevel, count: number) => void;
    handleElaborateAnswer: (courseId: string, questionSetId: string, qIndex: number, question: string, answer: string) => void;
    resetInterviewPrep: () => void;

    // Chat
    isChatOpen: boolean;
    chatHistory: ChatMessage[];
    isChatLoading: boolean;
    toggleChat: () => void;
    sendChatMessage: (message: string) => void;

    // New Topic/Module Actions
    practiceSession: PracticeSession | null;
    isPracticeLoading: boolean;
    practiceError: string | null;
    flashcardModalState: FlashcardModalState;
    analogyModalState: AnalogyModalState;
    expandTopicModalState: ExpandTopicModalState;

    handleStartTopicPractice: (course: Course, module: Module, item: LearningItem, navigateToPractice: () => void) => void;
    handleShowTopicFlashcards: (item: LearningItem) => void;
    handleShowTopicAnalogy: (item: LearningItem) => void;
    handleShowTopicStory: (item: LearningItem) => void;
    openExpandTopicModal: (course: Course, module: Module, item: LearningItem) => void;
    handleExpandTopicInModule: (course: Course, module: Module, item: LearningItem, expansionPrompt: string) => void;

    closeFlashcardModal: () => void;
    closeAnalogyModal: () => void;
    closeExpandTopicModal: () => void;
    
    // Background Tasks
    activeTask: BackgroundTask | null;
    backgroundTasks: BackgroundTask[];
    cancelTask: (taskId: string) => void;
    minimizeTask: (taskId: string) => void;
    clearBackgroundTask: (taskId: string) => void;

    // Projects
    handleGenerateProject: (course: Course, item: LearningItem) => void;
    handleSelectProject: (projectId: string | null) => void;
    handleDeleteProject: (projectId: string) => void;
    handleToggleProjectStepComplete: (projectId: string, stepId: string) => void;
    projectProgressData: Record<string, Progress>;

    // Live Interview
    liveInterviewState: LiveInterviewState | null;
    handleStartLiveInterview: (topic: string) => void;
    handleSendLiveInterviewMessage: (message: string) => void;
    handleEndLiveInterview: () => void;

    // Quick Practice
    practiceQuizSession: { topic: string; difficulty: KnowledgeLevel; questions: QuizData[] } | null;
    isPracticeQuizLoading: boolean;
    handleStartPracticeQuiz: (topic: string, difficulty: KnowledgeLevel, navigate: () => void) => void;

    // Code Explainer
    codeExplanation: { isLoading: boolean; content: string | null; error: string | null; };
    handleGenerateCodeExplanation: (input: { type: 'link' | 'text' | 'image'; content: string | File; }) => void;
    
    // New Folder Flow
    createTopicsModalState: CreateTopicsModalState;
    openCreateTopicsModal: (folderId: string) => void;
    closeCreateTopicsModal: () => void;
    handleBulkGenerateCourses: (topics: string[], folderId: string) => Promise<void>;

    // Gamification
    unlockAchievement: (id: AchievementId) => void;
    unlockedAchievementNotification: Achievement | null;
    clearUnlockedAchievementNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser, updateUserStats } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    
    // The user object from AuthContext is now the source of truth
    const localUser = authUser!;

    // --- DATA PERSISTENCE & INITIALIZATION ---
    useEffect(() => {
        const localCourses = storageService.getCourses();
        const localFoldersData = storageService.getFolders();
        const localProjects = storageService.getProjects();
        const courseMap = new Map(localCourses.map(c => [c.id, c]));

        const populatedFolders = localFoldersData.map(folder => ({
            ...folder,
            courses: folder.courses.map(c => c ? courseMap.get(c.id) : null).filter((c): c is Course => !!c)
        }));
        
        setCourses(localCourses);
        setFolders(populatedFolders);
        setProjects(localProjects);
    }, []);
    
    useEffect(() => { storageService.saveCourses(courses); }, [courses]);
    useEffect(() => { storageService.saveFolders(folders); }, [folders]);
    useEffect(() => { storageService.saveProjects(projects); }, [projects]);
    
    // === SESSION STATE ===
    const [error, setError] = useState<string | null>(null);
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [topic, setTopic] = useState<string>('');
    const [lastActiveCourseId, setLastActiveCourseId] = useState<string|null>(() => localStorage.getItem('learnai-last-active-course'));
    const [preloadedTest, setPreloadedTest] = useState<PreloadedTestState | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => storageService.getChatHistory());
    const [exploreModalState, setExploreModalState] = useState<ExploreModalState>({ isOpen: false, isLoading: false, courseTitle: '', topics: [] });
    const [storyModalState, setStoryModalState] = useState<StoryModalState>({ isOpen: false, isLoading: false, title: '', story: '', error: null });
    const [articleDisplayModal, setArticleDisplayModal] = useState<ArticleModalState>({ isOpen: false, isLoading: false, title: '', article: '', error: null });
    const [interviewPrepState, setInterviewPrepState] = useState<InterviewPrepState>({ isGenerating: false, questionSets: [], error: null, elaboratingIndex: null });
    
    const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
    const [isPracticeLoading, setIsPracticeLoading] = useState(false);
    const [practiceError, setPracticeError] = useState<string | null>(null);
    const [flashcardModalState, setFlashcardModalState] = useState<FlashcardModalState>({ isOpen: false, isLoading: false, title: '', flashcards: [], error: null });
    const [analogyModalState, setAnalogyModalState] = useState<AnalogyModalState>({ isOpen: false, isLoading: false, title: '', analogy: '', error: null });
    const [expandTopicModalState, setExpandTopicModalState] = useState<ExpandTopicModalState>({ isOpen: false, isLoading: false, course: null, module: null, item: null, error: null });
    const [projectProgressData, setProjectProgressData] = useState<Record<string, Progress>>({});
    const [liveInterviewState, setLiveInterviewState] = useState<LiveInterviewState | null>(null);

    // New states for new features
    const [practiceQuizSession, setPracticeQuizSession] = useState<{ topic: string; difficulty: KnowledgeLevel; questions: QuizData[] } | null>(null);
    const [isPracticeQuizLoading, setIsPracticeQuizLoading] = useState(false);
    const [codeExplanation, setCodeExplanation] = useState<{ isLoading: boolean; content: string | null; error: string | null; }>({ isLoading: false, content: null, error: null });
    const [createTopicsModalState, setCreateTopicsModalState] = useState<CreateTopicsModalState>({isOpen: false, folderId: null});

    // Gamification
    const [unlockedAchievementNotification, setUnlockedAchievementNotification] = useState<Achievement | null>(null);

    // Background Tasks
    const [activeTask, setActiveTask] = useState<BackgroundTask | null>(null);
    const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
    
    useEffect(() => {
        storageService.saveChatHistory(chatHistory);
    }, [chatHistory]);

    // --- ACTIONS ---

    const clearUnlockedAchievementNotification = useCallback(() => {
        setUnlockedAchievementNotification(null);
    }, []);

    const unlockAchievement = useCallback((id: AchievementId) => {
        // This logic will be expanded to update the user in AuthContext
        console.log("Unlocking achievement:", id);
    }, []);

    const openCreateTopicsModal = useCallback((folderId: string) => {
        setCreateTopicsModalState({ isOpen: true, folderId });
    }, []);

    const closeCreateTopicsModal = useCallback(() => {
        setCreateTopicsModalState({ isOpen: false, folderId: null });
    }, []);

    const handleGenerateCourse = useCallback(async (topic: string, level: KnowledgeLevel, folderId: string | null, goal: LearningGoal, style: LearningStyle, source: CourseSource, specificTech: string, includeTheory: boolean) => {
        const taskId = `task-course-${Date.now()}`;
        setError(null);
        setActiveTask({ id: taskId, type: 'course_generation', topic, status: 'generating', message: 'Generating Course...' });
        
        try {
            const generatedCourseData = await geminiService.generateCourse(topic, level, goal, style, source, specificTech, includeTheory);
            const courseWithIds: Course = {
                ...generatedCourseData,
                id: `course_local_${Date.now()}`,
                progress: new Map(),
                knowledgeLevel: level
            };
            
            setCourses(prev => {
                const newCourses = [...prev, courseWithIds];
                if (newCourses.length >= 5) unlockAchievement('topicExplorer');
                return newCourses;
            });
            unlockAchievement('curiousMind');

            if (folderId) {
                setFolders(prev => prev.map(f => {
                    if (f.id === folderId) {
                        return { ...f, courses: [...f.courses, courseWithIds] };
                    }
                    return f;
                }));
            }

            setActiveCourse(courseWithIds);
            setActiveTask(null);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate course.';
            setError(errorMessage);
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, [unlockAchievement]);

     const handleBulkGenerateCourses = useCallback(async (topics: string[], folderId: string) => {
        const newTasks: BackgroundTask[] = topics.map(topic => ({
            id: `task-course-${topic.replace(/\s/g, '-')}-${Date.now()}`,
            type: 'course_generation',
            topic: topic,
            status: 'generating',
            message: 'Queued for generation...'
        }));
        
        setBackgroundTasks(prev => [...newTasks, ...prev]);

        for (const task of newTasks) {
            try {
                setBackgroundTasks(prev => prev.map(t => t.id === task.id ? {...t, message: 'Generating course...'} : t));

                const generatedCourseData = await geminiService.generateCourse(task.topic, 'beginner', 'theory', 'balanced', { type: 'syllabus', content: '' }, '', false);
                const courseWithIds: Course = {
                    ...generatedCourseData,
                    id: `course_local_${task.topic.replace(/\s/g, '-')}_${Date.now()}`,
                    progress: new Map(),
                    knowledgeLevel: 'beginner'
                };

                setCourses(prevCourses => [...prevCourses, courseWithIds]);
                setFolders(prevFolders => prevFolders.map(f => {
                    if (f.id === folderId) {
                        return { ...f, courses: [...f.courses, courseWithIds] };
                    }
                    return f;
                }));
                unlockAchievement('curiousMind');

                 setBackgroundTasks(prev => prev.map(t => t.id === task.id ? {...t, status: 'done', message: 'Course generated successfully.', courseId: courseWithIds.id} : t));
            } catch (e) {
                console.error(`Failed to generate course for topic: ${task.topic}`, e);
                const errorMessage = e instanceof Error ? e.message : 'Failed to generate course.';
                setBackgroundTasks(prev => prev.map(t => t.id === task.id ? {...t, status: 'error', message: errorMessage} : t));
            }
        }
    }, [unlockAchievement]);

    const handleSelectCourse = useCallback((courseId: string | null) => {
        if (!courseId) {
            setActiveCourse(null);
            localStorage.removeItem('learnai-last-active-course');
            setLastActiveCourseId(null);
            return;
        }
        const course = courses.find(c => c.id === courseId);
        if (course) {
             setActiveCourse(course);
             localStorage.setItem('learnai-last-active-course', courseId);
             setLastActiveCourseId(courseId);
        }
    }, [courses]);
    
    const handleDeleteCourse = useCallback((courseId: string) => {
        if (activeCourse?.id === courseId) setActiveCourse(null);
        setCourses(prev => prev.filter(c => c.id !== courseId));
        setFolders(prev => prev.map(f => ({
            ...f,
            courses: f.courses.filter(c => c?.id !== courseId)
        })));
    }, [activeCourse]);
    
    const handleCreateFolder = useCallback((name: string) => {
        const newFolder: Folder = { id: `folder_local_${Date.now()}`, name, courses: [] };
        setFolders(prev => [...prev, newFolder]);
    }, []);
    
    const handleDeleteFolder = useCallback((folderId: string) => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
    }, []);

    const handleUpdateFolderName = useCallback((folderId: string, newName: string) => {
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
    }, []);
    
    const handleMoveCourseToFolder = useCallback((courseId: string, targetFolderId: string | null) => {
        let courseToMove: Course | undefined;

        const updatedFolders = folders.map(f => {
            const courseIndex = f.courses.findIndex(c => c?.id === courseId);
            if (courseIndex > -1) {
                courseToMove = f.courses[courseIndex] as Course;
                return { ...f, courses: f.courses.filter(c => c?.id !== courseId) };
            }
            return f;
        });

        if (!courseToMove) {
            courseToMove = courses.find(c => c.id === courseId);
        }
        if (!courseToMove) return;

        if (targetFolderId) {
            const finalFolders = updatedFolders.map(f => {
                if (f.id === targetFolderId) {
                    return { ...f, courses: [...f.courses, courseToMove!] };
                }
                return f;
            });
            setFolders(finalFolders);
        } else {
            setFolders(updatedFolders);
        }
    }, [courses, folders]);
    
    const handleToggleItemComplete = useCallback((courseId: string, itemId: string) => {
        let wasCompleted = false;
        
        const updatedCourses = courses.map(c => {
            if (c.id === courseId) {
                const newProgress = new Map(c.progress);
                wasCompleted = newProgress.has(itemId);
                if (wasCompleted) {
                    newProgress.delete(itemId);
                } else {
                    newProgress.set(itemId, Date.now());
                }
                const updatedCourse = { ...c, progress: newProgress };
                
                const totalItems = updatedCourse.modules.reduce((sum, mod) => sum + mod.items.length, 0);
                if (!wasCompleted && newProgress.size === totalItems && totalItems > 0) {
                    unlockAchievement('dedicatedLearner');
                }
                
                return updatedCourse;
            }
            return c;
        });

        setCourses(updatedCourses);
        
        if (!wasCompleted) {
            unlockAchievement('firstSteps');
            const currentUser = { ...localUser };
            currentUser.xp += XP_PER_LESSON;
            let requiredXp = calculateRequiredXp(currentUser.level);
            while(currentUser.xp >= requiredXp) {
                currentUser.level += 1;
                currentUser.xp -= requiredXp;
                requiredXp = calculateRequiredXp(currentUser.level);
            }
            updateUserStats({ xp: currentUser.xp, level: currentUser.level });
        }
    }, [courses, unlockAchievement, localUser, updateUserStats]);
    
    const handleSaveItemNote = useCallback((courseId: string, itemId: string, note: string) => {
        setCourses(prevCourses => prevCourses.map(c => {
             if (c.id === courseId) {
                const newModules = c.modules.map(m => ({
                    ...m,
                    items: m.items.map(i => i.id === itemId ? { ...i, notes: note } : i)
                }));
                return { ...c, modules: newModules };
            }
            return c;
        }));
    }, []);
    
    const sendChatMessage = useCallback(async (message: string) => {
        const userMessage: ChatMessage = { role: 'user', content: message };
        setChatHistory(prev => [...prev, userMessage]);
        setIsChatLoading(true);

        let contextMessage: string | undefined;
        if (activeCourse) {
            contextMessage = `The user is currently studying a course titled "${activeCourse.title}". Description: "${activeCourse.description}".`;
        }
    
        const historyForApi = [...chatHistory, userMessage];
    
        try {
            const modelResponse = await geminiService.generateChatResponse(historyForApi, contextMessage);
            const modelMessage: ChatMessage = { role: 'model', content: modelResponse };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    }, [chatHistory, activeCourse]);

    const handleTestCourseConcepts = useCallback(async (course: Course, navigateToAssessment: () => void) => {
        try {
            const questions = await geminiService.generateTestFromCourse(course);
            setPreloadedTest({
                topic: course.title,
                difficulty: course.knowledgeLevel,
                questions: questions,
            });
            navigateToAssessment();
        } catch(e) {
            console.error("Could not generate test from course", e);
            setError("Could not generate a test for this course right now.");
        }
    }, []);

    const handleExploreTopics = useCallback(async (course: Course) => {
        setExploreModalState({ isOpen: true, isLoading: true, courseTitle: course.title, topics: [] });
        try {
            const topics = await geminiService.generateRelatedTopics(course);
            setExploreModalState(prev => ({...prev, topics, isLoading: false }));
        } catch (e) {
            console.error("Failed to fetch related topics", e);
            setExploreModalState(prev => ({...prev, isLoading: false, error: 'Failed to load topics.' } as any));
        }
    }, []);
    
    const handleShowTopicStory = useCallback(async (item: LearningItem) => {
        setStoryModalState({ isOpen: true, isLoading: true, title: item.title, story: '', error: null });
        try {
            const story = await geminiService.generateTopicStory(item);
            setStoryModalState(prev => ({ ...prev, isLoading: false, story }));
        } catch (e) {
            console.error("Failed to generate story", e);
            setStoryModalState(prev => ({ ...prev, isLoading: false, error: "Failed to generate story. The AI might be busy, please try again." }));
        }
    }, []);
    
    const handleGenerateArticle = useCallback(async (topic: string) => {
        setArticleDisplayModal({ isOpen: true, isLoading: true, title: topic, article: '', error: null });
        try {
            const article = await geminiService.generateBlogArticle(topic);
            setArticleDisplayModal(prev => ({ ...prev, isLoading: false, article }));
        } catch (e) {
            console.error("Failed to generate article", e);
            setArticleDisplayModal(prev => ({ ...prev, isLoading: false, error: "Failed to generate article. Please try again." }));
        }
    }, []);
    
    const handleStartInterviewPrep = useCallback((course: Course) => {
        setInterviewPrepState(prev => ({
            ...prev,
            questionSets: course.interviewQuestionSets || [],
        }));
    }, []);

    const handleGenerateInterviewQuestions = useCallback(async (courseId: string, difficulty: KnowledgeLevel, count: number) => {
        setInterviewPrepState(prev => ({ ...prev, isGenerating: true, error: null }));
        const course = courses.find(c => c.id === courseId);
        if (!course) {
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, error: "Course not found." }));
            return;
        }

        try {
            const existingQuestions = course.interviewQuestionSets?.flatMap(set => set.questions.map(q => q.question)) || [];
            const newQuestions = await geminiService.generateInterviewQuestions(course.title, difficulty, count, existingQuestions);

            const newQuestionSet: InterviewQuestionSet = {
                id: `qset_${Date.now()}`,
                timestamp: Date.now(),
                difficulty,
                questionCount: newQuestions.length,
                questions: newQuestions,
            };
            
            setCourses(prev => prev.map(c => c.id === courseId ? {...c, interviewQuestionSets: [...(c.interviewQuestionSets || []), newQuestionSet] } : c));
            
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, questionSets: [...(course.interviewQuestionSets || []), newQuestionSet] }));

        } catch(e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate questions.";
            console.error(e);
            setInterviewPrepState(prev => ({ ...prev, isGenerating: false, error: errorMsg }));
        }
    }, [courses]);

    const handleElaborateAnswer = useCallback(async (courseId: string, questionSetId: string, qIndex: number, question: string, answer: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        
        const setIndex = course.interviewQuestionSets?.findIndex(s => s.id === questionSetId) ?? -1;
        if(setIndex === -1) return;

        setInterviewPrepState(prev => ({ ...prev, elaboratingIndex: { setIndex, qIndex } }));
        try {
            const elaboratedAnswer = await geminiService.elaborateOnAnswer(question, answer);
            
             setCourses(prev => prev.map(c => {
                if (c.id === courseId) {
                    const updatedSets = [...(c.interviewQuestionSets || [])];
                    const updatedSet = { ...updatedSets[setIndex] };
                    updatedSet.questions[qIndex] = { ...updatedSet.questions[qIndex], answer: elaboratedAnswer };
                    updatedSets[setIndex] = updatedSet;
                    return { ...c, interviewQuestionSets: updatedSets };
                }
                return c;
            }));
            
        } catch(e) {
            console.error(e);
        } finally {
            setInterviewPrepState(prev => ({ ...prev, elaboratingIndex: null }));
        }
    }, [courses]);
    
    const handleGenerateModuleMindMap = useCallback(async (courseId: string, moduleNumber: number): Promise<MindMapNode> => {
        const course = courses.find(c => c.id === courseId);
        if (!course) throw new Error("Course not found");
        const module = course.modules[moduleNumber - 1];
        if (!module) throw new Error("Module not found");
        const mindMap = await geminiService.generateModuleMindMap(module);
        if (!mindMap) throw new Error('Failed to generate mind map.');
        return mindMap;
    }, [courses]);
    
    const openExpandTopicModal = useCallback((course: Course, module: Module, item: LearningItem) => {
        setExpandTopicModalState({ isOpen: true, course, module, item, isLoading: false, error: null });
    }, []);

    const closeExpandTopicModal = useCallback(() => {
        setExpandTopicModalState({ isOpen: false, isLoading: false, course: null, module: null, item: null, error: null });
    }, []);

    const handleExpandTopicInModule = useCallback(async (course: Course, moduleToExpand: Module, item: LearningItem, expansionPrompt: string) => {
        // This would need to be a mutation to be persistent
    }, []);


    const handleUpdateContentBlock = useCallback((courseId: string, lessonId: string, blockId: string, newDiagramSyntax: string) => {
        // This would need to be a mutation to be persistent
    }, []);

    const handleStartTopicPractice = useCallback(async (course: Course, module: Module, item: LearningItem, navigateToPractice: () => void) => {
        setIsPracticeLoading(true);
        setPracticeError(null);
        setPracticeSession(null);
        navigateToPractice();
        try {
            const sessionData = await geminiService.generateTopicPracticeSession(item);
            setPracticeSession(sessionData);
        } catch (e) {
            console.error("Failed to generate practice session", e);
            setPracticeError(e instanceof Error ? e.message : 'Failed to generate practice session.');
        } finally {
            setIsPracticeLoading(false);
        }
    }, []);

    const handleShowTopicFlashcards = useCallback(async (item: LearningItem) => {
        setFlashcardModalState({ isOpen: true, isLoading: true, title: item.title, flashcards: [], error: null });
        try {
            const flashcards = await geminiService.generateTopicFlashcards(item);
            setFlashcardModalState(prev => ({ ...prev, isLoading: false, flashcards }));
        } catch (e) {
            console.error("Failed to generate module flashcards", e);
            setFlashcardModalState(prev => ({ ...prev, isLoading: false, error: 'Failed to generate flashcards.' }));
        }
    }, []);

    const handleShowTopicAnalogy = useCallback(async (item: LearningItem) => {
        setAnalogyModalState({ isOpen: true, isLoading: true, title: item.title, analogy: '', error: null });
        try {
            const analogy = await geminiService.generateTopicAnalogy(item);
            setAnalogyModalState(prev => ({ ...prev, isLoading: false, analogy }));
        } catch (e) {
            console.error("Failed to generate module analogy", e);
            setAnalogyModalState(prev => ({ ...prev, isLoading: false, error: 'Failed to generate analogy.' }));
        }
    }, []);
    
    const cancelTask = useCallback((taskId: string) => {
        if(activeTask?.id === taskId) {
            setActiveTask(null);
        }
        setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
    }, [activeTask]);

    const minimizeTask = useCallback((taskId: string) => {
        if(activeTask?.id === taskId) {
            setBackgroundTasks(prev => [activeTask, ...prev]);
            setActiveTask(null);
        }
    }, [activeTask]);

    const clearBackgroundTask = useCallback((taskId: string) => {
        setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
    }, []);

    // --- PROJECT ACTIONS ---
    const handleGenerateProject = useCallback(async (course: Course, item: LearningItem) => {
        const taskId = `task-project-${Date.now()}`;
        setError(null);
        setActiveTask({ id: taskId, type: 'project_generation', topic: item.title, status: 'generating', message: 'Generating Guided Project...' });
        setActiveCourse(null);
        
        try {
            const generatedProjectData = await geminiService.generateProject(course, item);
            const projectWithId: Project = {
                ...generatedProjectData,
                id: `project_local_${Date.now()}`,
                progress: new Map(),
            };
            
            setProjects(prev => [...prev, projectWithId]);
            unlockAchievement('projectStarter');
            setActiveProject(projectWithId);
            
            setActiveTask(null);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Failed to generate project.';
            setError(errorMessage);
            setActiveTask(prev => prev?.id === taskId ? { ...prev, status: 'error', message: errorMessage } : prev);
        }
    }, [unlockAchievement]);

    const handleSelectProject = useCallback((projectId: string | null) => {
        if (!projectId) {
            setActiveProject(null);
            return;
        }
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setActiveProject(project);
            setActiveCourse(null); // Can't view a course and a project at the same time
        }
    }, [projects]);

    const handleDeleteProject = useCallback((projectId: string) => {
        if (activeProject?.id === projectId) setActiveProject(null);
        setProjects(prev => prev.filter(p => p.id !== projectId));
    }, [activeProject]);

    const handleToggleProjectStepComplete = useCallback((projectId: string, stepId: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id === projectId) {
                const newProgress = new Map(p.progress);
                if (newProgress.has(stepId)) {
                    newProgress.delete(stepId);
                } else {
                    newProgress.set(stepId, Date.now());
                }
                return { ...p, progress: newProgress };
            }
            return p;
        }));
    }, []);

    // --- LIVE INTERVIEW ACTIONS ---
    const handleStartLiveInterview = useCallback(async (topic: string) => {
        setLiveInterviewState({ topic, transcript: [], isLoading: true, error: null });
        try {
            const message = await geminiService.startLiveInterview(topic);
            const firstMessage: ChatMessage = { role: 'model', content: message };
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [firstMessage], isLoading: false } : null);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to start interview session.";
            console.error(e);
            setLiveInterviewState(prev => prev ? { ...prev, isLoading: false, error: errorMsg } : null);
        }
    }, []);

    const handleSendLiveInterviewMessage = useCallback(async (message: string) => {
        if (!liveInterviewState) return;

        const userMessage: ChatMessage = { role: 'user', content: message };
        const newTranscript = [...liveInterviewState.transcript, userMessage];
        setLiveInterviewState(prev => prev ? { ...prev, transcript: newTranscript, isLoading: true } : null);

        try {
            const modelResponse = await geminiService.generateLiveInterviewResponse(liveInterviewState.topic, newTranscript);
            const modelMessage: ChatMessage = { role: 'model', content: modelResponse };
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [...newTranscript, modelMessage], isLoading: false } : null);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to get response.";
            console.error(e);
            const errorMessage: ChatMessage = { role: 'model', content: `Sorry, an error occurred: ${errorMsg}` };
            setLiveInterviewState(prev => prev ? { ...prev, transcript: [...newTranscript, errorMessage], isLoading: false } : null);
        }
    }, [liveInterviewState]);

    const handleEndLiveInterview = useCallback(() => {
        setLiveInterviewState(null);
    }, []);

    // --- NEW FEATURE ACTIONS ---
    const handleStartPracticeQuiz = useCallback(async (topic: string, difficulty: KnowledgeLevel, navigate: () => void) => {
        setIsPracticeQuizLoading(true);
        setPracticeQuizSession(null);
        navigate(); // Navigate to the quiz page immediately
        try {
            const questions = await geminiService.generateQuickPracticeQuiz(topic, difficulty, 10);
            setPracticeQuizSession({ topic, difficulty, questions });
        } catch (e) {
            console.error("Failed to generate practice quiz", e);
            // Handle error state on the quiz page itself
            setPracticeQuizSession({ topic, difficulty, questions: [] });
        } finally {
            setIsPracticeQuizLoading(false);
        }
    }, []);

    const handleGenerateCodeExplanation = useCallback(async (input: { type: 'link' | 'text' | 'image'; content: string | File; }) => {
        setCodeExplanation({ isLoading: true, content: null, error: null });
        try {
            let preparedContent: string | { data: string; mimeType: string; };

            if (input.type === 'image' && input.content instanceof File) {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(input.content as File);
                });
                preparedContent = { data: base64, mimeType: (input.content as File).type };
            } else {
                preparedContent = input.content as string;
            }
            
            const explanation = await geminiService.generateCodeExplanation({ type: input.type, content: preparedContent });
            setCodeExplanation({ isLoading: false, content: explanation, error: null });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to generate explanation.";
            console.error(e);
            setCodeExplanation({ isLoading: false, content: null, error: errorMsg });
        }
    }, []);


    const closeExploreModal = useCallback(() => setExploreModalState({ isOpen: false, isLoading: false, courseTitle: '', topics: [] }), []);
    const closeStoryModal = useCallback(() => setStoryModalState({ isOpen: false, isLoading: false, title: '', story: '', error: null }), []);
    const closeArticleDisplayModal = useCallback(() => setArticleDisplayModal({ isOpen: false, isLoading: false, title: '', article: '', error: null }), []);
    const closeFlashcardModal = useCallback(() => setFlashcardModalState({ isOpen: false, isLoading: false, title: '', flashcards: [], error: null }), []);
    const closeAnalogyModal = useCallback(() => setAnalogyModalState({ isOpen: false, isLoading: false, title: '', analogy: '', error: null }), []);
    const clearPreloadedTest = useCallback(() => setPreloadedTest(null), []);
    const resetInterviewPrep = useCallback(() => setInterviewPrepState({ isGenerating: false, questionSets: [], error: null, elaboratingIndex: null }), []);
    const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), []);

    const value = useMemo(() => ({
        courses, folders, projects, localUser,
        activeCourse, setActiveCourse,
        activeProject,
        topic, error,
        handleGenerateCourse, handleSelectCourse, handleDeleteCourse,
        handleToggleItemComplete, handleCreateFolder, handleDeleteFolder, handleUpdateFolderName, handleMoveCourseToFolder,
        handleSaveItemNote, 
        handleTestCourseConcepts, handleExploreTopics, closeExploreModal, clearPreloadedTest,
        handleGenerateModuleMindMap, handleUpdateContentBlock,
        lastActiveCourseId, exploreModalState, storyModalState, preloadedTest,
        articleDisplayModal, closeArticleDisplayModal, handleGenerateArticle,
        interviewPrepState, handleStartInterviewPrep, handleGenerateInterviewQuestions, handleElaborateAnswer, resetInterviewPrep,
        isChatOpen, chatHistory, isChatLoading, toggleChat, sendChatMessage,
        practiceSession, isPracticeLoading, practiceError, flashcardModalState, analogyModalState, expandTopicModalState,
        handleStartTopicPractice, handleShowTopicFlashcards, handleShowTopicAnalogy, handleShowTopicStory,
        openExpandTopicModal, handleExpandTopicInModule,
        closeFlashcardModal, closeAnalogyModal, closeStoryModal, closeExpandTopicModal,
        activeTask, backgroundTasks, cancelTask, minimizeTask, clearBackgroundTask,
        handleGenerateProject, handleSelectProject, handleDeleteProject, handleToggleProjectStepComplete, projectProgressData,
        liveInterviewState, handleStartLiveInterview, handleSendLiveInterviewMessage, handleEndLiveInterview,
        practiceQuizSession, isPracticeQuizLoading, handleStartPracticeQuiz,
        codeExplanation, handleGenerateCodeExplanation,
        createTopicsModalState, openCreateTopicsModal, closeCreateTopicsModal, handleBulkGenerateCourses,
        unlockAchievement, unlockedAchievementNotification, clearUnlockedAchievementNotification
    }), [
        courses, folders, projects, localUser, activeCourse, topic, error, activeProject,
        lastActiveCourseId, exploreModalState, storyModalState, preloadedTest,
        articleDisplayModal, interviewPrepState, isChatOpen, chatHistory, isChatLoading,
        practiceSession, isPracticeLoading, practiceError, flashcardModalState, analogyModalState, expandTopicModalState,
        activeTask, backgroundTasks, projectProgressData, liveInterviewState,
        practiceQuizSession, isPracticeQuizLoading, codeExplanation, createTopicsModalState,
        unlockedAchievementNotification, handleGenerateCourse, handleSelectCourse, handleDeleteCourse, handleToggleItemComplete, handleCreateFolder,
        handleDeleteFolder, handleUpdateFolderName, handleMoveCourseToFolder, handleSaveItemNote,
        handleTestCourseConcepts, handleExploreTopics, closeExploreModal, clearPreloadedTest, handleGenerateModuleMindMap,
        handleUpdateContentBlock, handleGenerateArticle, closeArticleDisplayModal,
        handleStartInterviewPrep, handleGenerateInterviewQuestions, handleElaborateAnswer, resetInterviewPrep,
        openExpandTopicModal, closeExpandTopicModal, handleExpandTopicInModule, toggleChat, sendChatMessage,
        handleStartTopicPractice, handleShowTopicFlashcards, handleShowTopicAnalogy, handleShowTopicStory,
        closeFlashcardModal, closeAnalogyModal, closeStoryModal,
        cancelTask, minimizeTask, clearBackgroundTask,
        handleGenerateProject, handleSelectProject, handleDeleteProject, handleToggleProjectStepComplete,
        handleStartLiveInterview, handleSendLiveInterviewMessage, handleEndLiveInterview,
        handleStartPracticeQuiz, handleGenerateCodeExplanation,
        openCreateTopicsModal, closeCreateTopicsModal, handleBulkGenerateCourses,
        unlockAchievement, clearUnlockedAchievementNotification
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
