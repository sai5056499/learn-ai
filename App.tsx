import React, { useState, useEffect } from 'react';
import { KnowledgeLevel, Course, Module, LearningItem } from './types';
import { useAppContext } from './context/AppContext';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

import Sidebar from './components/common/Sidebar';
import LoadingDisplay from './components/common/LoadingDisplay';
import CourseView from './components/course/CourseView';
import Dashboard from './components/dashboard/Dashboard';
import FlashcardModal from './components/modals/FlashcardModal';
import AssessmentPage from './components/assessment/AssessmentPage';
import CreateModal from './components/modals/CreateCourseModal';
import ExploreModal from './components/modals/ExploreModal';
import ArticleDisplayModal from './components/modals/ArticleDisplayModal';
import InterviewPrepModal from './components/modals/InterviewPrepModal';
import StoryModal from './components/modals/StoryModal';
import AIChatModal from './components/chat/AIChatModal';
import ExpandTopicModal from './components/modals/ExpandTopicModal';
import PracticePage from './components/practice/PracticePage';
import AnalogyModal from './components/modals/AnalogyModal';
import BackgroundGlow from './components/common/BackgroundGlow';
import SettingsModal from './components/modals/SettingsModal';
import BackgroundTasksDisplay from './components/dashboard/BackgroundTasksDisplay';
import { Bars3Icon, LoadingSpinnerIcon } from './components/common/Icons';
import AIChatButton from './components/chat/AIChatButton';
import InterviewPage from './components/interview/InterviewPage';
import ProjectsPage from './components/project/ProjectsPage';
import ProjectDetail from './components/project/ProjectDetail';
import InterviewSessionPage from './components/interview/InterviewSessionPage';
import QuizSessionPage from './components/session/QuizSessionPage';
import CodeExplainerPage from './components/explainer/CodeExplainerPage';
import CreateTopicsForFolderModal from './components/modals/CreateTopicsForFolderModal';
import ProfilePage from './components/profile/ProfilePage';
import AchievementToast from './components/common/AchievementToast';
import AuthPage from './components/auth/AuthPage';


export type View = 'dashboard' | 'assessment' | 'practice' | 'interview' | 'projects' | 'practice_quiz' | 'code_explainer' | 'profile';

declare global {
  interface Window {
      mermaid: any;
  }
}

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInterviewPrepModalOpen, setIsInterviewPrepModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [courseForInterviewPrep, setCourseForInterviewPrep] = useState<Course | null>(null);
  
  const { theme, isDark } = useTheme();
  const { isAuthenticated, isLoading: isAuthLoading, isSkipped } = useAuth();
  const {
      activeCourse,
      error,
      exploreModalState,
      storyModalState,
      articleDisplayModal,
      flashcardModalState,
      analogyModalState,
      activeTask,
      activeProject,
      liveInterviewState,
      handleGenerateCourse,
      handleSelectCourse,
      handleStartLiveInterview,
      closeExploreModal,
      closeStoryModal,
      closeArticleDisplayModal,
      closeFlashcardModal,
      closeAnalogyModal,
      cancelTask,
      minimizeTask,
      handleSelectProject
  } = useAppContext();

  useEffect(() => {
    if (window.mermaid) {
        const mermaidTheme = isDark ? 'dark' : 'default';
        window.mermaid.initialize({
            startOnLoad: false,
            theme: mermaidTheme,
            fontFamily: 'inherit',
            flowchart: { htmlLabels: true },
        });
        if (window.mermaid) {
             window.mermaid.run();
        }
    }
  }, [view, activeCourse, theme, isDark]);
  
  const generateCourseFromRecommendation = (topic: string, level: KnowledgeLevel) => {
    closeExploreModal();
    // Use default goal and style for recommendations
    handleGenerateCourse(topic, level, null, 'theory', 'balanced', { type: 'syllabus', content: '' }, '', false);
  }

  const openInterviewPrep = (course: Course) => {
      setCourseForInterviewPrep(course);
      setIsInterviewPrepModalOpen(true);
  }

  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingSpinnerIcon style={{
          width: '3rem',
          height: '3rem',
          color: 'var(--color-primary)'
        }} />
      </div>
    );
  }

  // Show auth page only if not authenticated AND not skipped
  if (!isAuthenticated && !isSkipped) {
    return <AuthPage />;
  }
  
  const renderContent = () => {
    if (liveInterviewState) {
        return <InterviewSessionPage />;
    }
    
    if (activeTask) {
        return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
                <LoadingDisplay 
                    task={activeTask} 
                    onCancel={() => {
                        cancelTask(activeTask.id);
                        setView('dashboard');
                    }}
                    onMinimize={() => {
                        minimizeTask(activeTask.id);
                        setView('dashboard');
                    }}
                />
            </div>
        )
    }

    if (activeCourse) {
        return <CourseView course={activeCourse} onBack={() => handleSelectCourse(null)} onNavigate={setView} onStartInterviewPrep={openInterviewPrep}/>
    }

    if (activeProject) {
        return <ProjectDetail project={activeProject} onBackToProjects={() => handleSelectProject(null)} />
    }

    switch (view) {
      case 'profile':
        return <ProfilePage />;
      case 'assessment':
        return <AssessmentPage 
            onBackToDashboard={() => setView('dashboard')} 
            onGenerateCourse={(level, topic) => {
              handleGenerateCourse(topic, level, null, 'theory', 'balanced', { type: 'syllabus', content: '' }, '', false);
            }}
        />;
      case 'interview':
        return <InterviewPage onStartInterviewPrep={openInterviewPrep} onStartLiveInterview={handleStartLiveInterview} />;
      case 'projects':
        return <ProjectsPage onSelectProject={(projectId) => handleSelectProject(projectId)} onBackToDashboard={() => setView('dashboard')} />;
      case 'practice':
        return <PracticePage onBack={() => { setView('dashboard'); }} />;
      case 'practice_quiz':
        return <QuizSessionPage onBack={() => setView('dashboard')} />;
      case 'code_explainer':
        return <CodeExplainerPage />;
      case 'dashboard':
      default:
        return <>
            <BackgroundTasksDisplay />
            <Dashboard 
                onSelectCourse={(courseId) => handleSelectCourse(courseId)} 
                onStartCreate={() => setIsCreateModalOpen(true)} 
                onTestSkills={() => setView('assessment')}
                onStartInterviewPrep={openInterviewPrep}
                onNavigate={setView}
            />
        </>;
    }
  };

  return (
    <>
    {isDark && <BackgroundGlow />}
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-foreground)',
      fontFamily: 'sans-serif',
      display: 'flex'
    }}>
      <Sidebar 
        view={view} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsModalOpen(true)} 
      />
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <header style={{
          display: 'none',
          padding: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(var(--color-background), 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 30,
          borderBottom: '1px solid var(--color-border)'
        }} className="lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} style={{ padding: '0.5rem' }}>
            <Bars3Icon style={{ width: '1.5rem', height: '1.5rem' }}/>
          </button>
        </header>
        <main style={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem'
        }} className="w-full flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>

      <AIChatButton />
      <AIChatModal />
      <AchievementToast />

      <CreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGenerate={(topic, level, folderId, goal, style, source, specificTech, includeTheory) => {
          setIsCreateModalOpen(false);
          handleGenerateCourse(topic, level, folderId, goal, style, source, specificTech, includeTheory);
        }}
        error={error}
      />
      
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />

      {/* Modals for course-specific actions */}
      <ExploreModal
        isOpen={exploreModalState.isOpen}
        isLoading={exploreModalState.isLoading}
        onClose={closeExploreModal}
        courseTitle={exploreModalState.courseTitle}
        relatedTopics={exploreModalState.topics}
        onGenerateCourse={generateCourseFromRecommendation}
      />
      <ArticleDisplayModal 
        isOpen={articleDisplayModal.isOpen}
        isLoading={articleDisplayModal.isLoading}
        title={articleDisplayModal.title}
        article={articleDisplayModal.article}
        error={articleDisplayModal.error}
        onClose={closeArticleDisplayModal}
      />
      <FlashcardModal
        isOpen={flashcardModalState.isOpen}
        isLoading={flashcardModalState.isLoading}
        title={flashcardModalState.title}
        flashcards={flashcardModalState.flashcards}
        error={flashcardModalState.error}
        onClose={closeFlashcardModal}
      />
      <StoryModal 
        isOpen={storyModalState.isOpen}
        isLoading={storyModalState.isLoading}
        title={storyModalState.title}
        story={storyModalState.story}
        error={storyModalState.error}
        onClose={closeStoryModal}
      />
      <AnalogyModal
        isOpen={analogyModalState.isOpen}
        isLoading={analogyModalState.isLoading}
        title={analogyModalState.title}
        analogy={analogyModalState.analogy}
        error={analogyModalState.error}
        onClose={closeAnalogyModal}
      />
      {courseForInterviewPrep && <InterviewPrepModal
        isOpen={isInterviewPrepModalOpen}
        onClose={() => setIsInterviewPrepModalOpen(false)}
        course={courseForInterviewPrep}
      />}
      <ExpandTopicModal />
      <CreateTopicsForFolderModal />
    </div>
    </>
  );
}

export default App;
