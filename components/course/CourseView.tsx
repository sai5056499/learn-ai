





import React, { useState, useEffect, useMemo } from 'react';
import { Course, LearningItem, Module } from '../../types';
import { View } from '../../App';
import CourseSidebar from './CourseSidebar';
import LearningItemContent from './LessonContent';
import { useAppContext } from '../../context/AppContext';
import { CheckCircleIcon, SparklesIcon, AcademicCapIcon, Bars3Icon } from '../common/Icons';

interface CourseViewProps {
    course: Course;
    onBack: () => void;
    onNavigate: (view: View) => void;
    onStartInterviewPrep: (course: Course) => void;
}

const CourseView: React.FC<CourseViewProps> = ({ course, onBack, onNavigate, onStartInterviewPrep }) => {
    const { handleToggleItemComplete, handleExploreTopics } = useAppContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const allItems = useMemo(() => course.modules.flatMap(m => m.items), [course]);
    
    const findFirstUncompletedItem = () => allItems.find(i => !course.progress.has(i.id));

    const [activeItemId, setActiveItemId] = useState<string | null>(() => {
        const firstUncompleted = findFirstUncompletedItem();
        return firstUncompleted ? firstUncompleted.id : allItems[0]?.id || null;
    });

    const { activeModule, activeItem } = useMemo(() => {
        if (!activeItemId) return { activeModule: null, activeItem: null };

        for (const module of course.modules) {
            const item = module.items.find(i => i.id === activeItemId);
            if (item) {
                return { activeModule: module, activeItem: item };
            }
        }
        return { activeModule: null, activeItem: null };
    }, [activeItemId, course]);

    const handleSelectItem = (itemId: string) => {
        setActiveItemId(itemId);
        setIsSidebarOpen(false); // Close sidebar on selection in mobile
    };

    const handleCompleteAndContinue = () => {
        if (!activeItemId) return;

        // Mark current item as complete if it isn't already
        if (!course.progress.has(activeItemId)) {
            handleToggleItemComplete(course.id, activeItemId);
        }

        // Find the next item
        const currentIndex = allItems.findIndex(i => i.id === activeItemId);
        if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
            setActiveItemId(allItems[currentIndex + 1].id);
        } else {
            // Last item completed
            setActiveItemId(null);
        }
    };
    
    // Resync if the active course changes from outside
    useEffect(() => {
        const firstUncompleted = findFirstUncompletedItem();
        setActiveItemId(firstUncompleted ? firstUncompleted.id : allItems[0]?.id || null);
    }, [course]);

    return (
        <div className="w-full max-w-screen-2xl mx-auto h-full flex flex-col bg-[var(--color-card)] rounded-2xl shadow-lg animate-fade-in overflow-hidden">
            <header className="p-4 border-b border-[var(--color-border)] flex-shrink-0 flex justify-between items-center">
                 <button
                    onClick={onBack}
                    className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                >
                    &larr; Back to Dashboard
                </button>
                 <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-[var(--color-muted-foreground)]">
                    <Bars3Icon className="w-6 h-6" />
                 </button>
            </header>
            <div className="flex-grow flex flex-row min-h-0">
                <CourseSidebar 
                    course={course}
                    activeItemId={activeItemId}
                    onSelectItem={handleSelectItem}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
                    {activeItem && activeModule ? (
                        <LearningItemContent
                            course={course}
                            module={activeModule}
                            item={activeItem}
                            isCompleted={course.progress.has(activeItem.id)}
                            onCompleteAndContinue={handleCompleteAndContinue}
                            onNavigateToPractice={() => onNavigate('practice')}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[var(--color-secondary)]">
                            <CheckCircleIcon className="w-24 h-24 text-green-500" />
                            <h2 className="mt-6 text-3xl font-bold text-[var(--color-foreground)]">Course Complete!</h2>
                            <p className="mt-2 text-lg text-[var(--color-muted-foreground)]">Congratulations on finishing all items in "{course.title}".</p>
                             <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button onClick={() => handleExploreTopics(course)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-card)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-secondary-hover)] border border-[var(--color-border)]">
                                    <SparklesIcon className="w-5 h-5 text-[var(--color-accent)]" />
                                    Explore Related Topics
                                </button>
                                <button onClick={() => onStartInterviewPrep(course)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-card)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-secondary-hover)] border border-[var(--color-border)]">
                                     <AcademicCapIcon className="w-5 h-5 text-[var(--color-primary)]" />
                                    Practice for Interview
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CourseView;