
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Course, Folder } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { 
    PlusIcon, 
    ClipboardDocumentCheckIcon, 
    FolderPlusIcon, 
    CloseIcon, 
    MagnifyingGlassIcon,
    BookOpenIcon,
    WrenchScrewdriverIcon,
    BeakerIcon
} from '../common/Icons';
import { View } from '../../App';
import QuickPracticeModal from '../modals/QuickPracticeModal';
import StatsCard from './StatsCard';
import ContinueLearningCard from './ContinueLearningCard';
import FolderAccordion from './FolderAccordion';

interface DashboardProps {
    onSelectCourse: (courseId: string) => void;
    onStartCreate: () => void;
    onTestSkills: () => void;
    onStartInterviewPrep: (course: Course) => void;
    onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    onSelectCourse, 
    onStartCreate, 
    onTestSkills, 
    onStartInterviewPrep,
    onNavigate
}) => {
    const { courses, folders, projects, localUser, lastActiveCourseId, handleCreateFolder, handleDeleteCourse, handleMoveCourseToFolder, handleUpdateFolderName, handleDeleteFolder, openCreateTopicsModal } = useAppContext();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isQuickPracticeModalOpen, setIsQuickPracticeModalOpen] = useState(false);
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    
    const menuRef = useRef<HTMLDivElement>(null);
    const createButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isCreateMenuOpen &&
                menuRef.current && 
                !menuRef.current.contains(event.target as Node) &&
                createButtonRef.current &&
                !createButtonRef.current.contains(event.target as Node)
            ) {
                setIsCreateMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCreateMenuOpen]);


    const handleCreateFolderClick = () => {
        if(newFolderName.trim()){
            handleCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    const { categorizedCourses, uncategorizedCourses, visibleFolders } = useMemo(() => {
        const courseMap = new Map(courses.map(c => [c.id, c]));
        const coursesInFolders = new Set<string>();

        folders.forEach(folder => {
            folder.courses.forEach(c => {
                if (c?.id) coursesInFolders.add(c.id);
            });
        });

        const allUncategorized = courses.filter(c => !coursesInFolders.has(c.id));
        
        const filteredUncategorized = allUncategorized.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

        const visibleFoldersResult = folders.filter(f => f.courses.some(c => c && 'title' in c && c.title.toLowerCase().includes(searchTerm.toLowerCase())) || f.name.toLowerCase().includes(searchTerm.toLowerCase()));

        return { categorizedCourses: courseMap, uncategorizedCourses: filteredUncategorized, visibleFolders: visibleFoldersResult };
    }, [courses, folders, searchTerm]);

    const { totalLessons, completedLessons } = useMemo(() => {
        let total = 0;
        let completed = 0;
        courses.forEach(course => {
            total += course.modules.reduce((acc, mod) => acc + mod.items.length, 0);
            completed += course.progress.size;
        });
        return { totalLessons: total, completedLessons: completed };
    }, [courses]);

     const continueLearningCourse = useMemo(() => {
        if (!courses.length) return null;

        if (lastActiveCourseId) {
            const lastActive = courses.find(c => c.id === lastActiveCourseId);
            const totalLessons = lastActive?.modules.reduce((acc, mod) => acc + mod.items.length, 0) ?? 0;
            if (lastActive && lastActive.progress.size < totalLessons) {
                return lastActive;
            }
        }
        
        const inProgressCourse = courses.find(c => {
            const totalLessons = c.modules.reduce((acc, mod) => acc + mod.items.length, 0);
            return c.progress.size > 0 && c.progress.size < totalLessons;
        });
        if (inProgressCourse) return inProgressCourse;

        const firstUnstartedCourse = courses.find(c => c.progress.size === 0);
        if (firstUnstartedCourse) return firstUnstartedCourse;

        return null;
    }, [courses, lastActiveCourseId]);
    
    return (
        <>
        <div className="w-full max-w-screen-xl animate-fade-in mx-auto px-0 sm:px-6 lg:px-8">
            <header className="py-6 mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
                    Welcome back, {localUser.name}!
                </h1>
                <p className="text-[var(--color-muted-foreground)] mt-1">Ready to dive back in and learn something new today?</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2">
                     <ContinueLearningCard course={continueLearningCourse} onSelectCourse={onSelectCourse} hasCourses={courses.length > 0} />
                </div>
                <StatsCard topicsStarted={courses.length} lessonsCompleted={completedLessons} projectsStarted={projects.length} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <button onClick={() => onNavigate('projects')} className="flex items-center gap-4 p-5 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all shadow-sm text-left">
                   <WrenchScrewdriverIcon className="w-8 h-8 flex-shrink-0 text-[var(--color-primary)]" />
                    <div>
                        <p className="font-bold text-[var(--color-foreground)]">My Projects</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Build hands-on skills.</p>
                    </div>
                </button>
                 <button onClick={onTestSkills} className="flex items-center gap-4 p-5 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all shadow-sm text-left">
                    <ClipboardDocumentCheckIcon className="w-8 h-8 flex-shrink-0 text-[var(--color-accent)]" />
                    <div>
                        <p className="font-bold text-[var(--color-foreground)]">Test My Skills</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Find knowledge gaps.</p>
                    </div>
                </button>
                 <button onClick={() => setIsQuickPracticeModalOpen(true)} className="flex items-center gap-4 p-5 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] hover:border-green-500 hover:bg-green-500/10 transition-all shadow-sm text-left">
                    <BeakerIcon className="w-8 h-8 flex-shrink-0 text-green-500" />
                    <div>
                        <p className="font-bold text-[var(--color-foreground)]">Quick Practice</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">Start a quick quiz.</p>
                    </div>
                </button>
            </div>

            <div className="space-y-12">
                <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">My Learning Space</h2>
                        <p className="text-[var(--color-muted-foreground)] mt-1">All your topics and folders, ready for you.</p>
                    </div>
                    {courses.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="w-5 h-5 text-[var(--color-muted-foreground)] absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none"/>
                            <input 
                                type="text"
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                    )}
                </header>
                
                 <div className="flex items-center gap-4 relative">
                    <button
                        ref={createButtonRef}
                        onClick={() => setIsCreateMenuOpen(prev => !prev)}
                        className="px-4 py-2 bg-[var(--gradient-primary-accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create New
                    </button>

                    {isCreateMenuOpen && (
                        <div ref={menuRef} className="absolute top-full left-0 mt-2 w-48 bg-[var(--color-card)] rounded-lg shadow-2xl border border-[var(--color-border)] z-20 animate-fade-in-up-fast">
                            <div className="p-2">
                                <button 
                                    onClick={() => { onStartCreate(); setIsCreateMenuOpen(false); }}
                                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                                >
                                    <BookOpenIcon className="w-5 h-5" />
                                    New Topic
                                </button>
                                <button 
                                    onClick={() => { setIsCreatingFolder(true); setIsCreateMenuOpen(false); }}
                                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                                >
                                    <FolderPlusIcon className="w-5 h-5" />
                                    New Folder
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                 {isCreatingFolder && (
                    <div className="p-4 bg-[var(--color-secondary)] border border-[var(--color-border)] rounded-lg flex items-center gap-4 animate-fade-in-up">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderClick()}
                            placeholder="New folder name..."
                            className="flex-grow px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            autoFocus
                        />
                        <button onClick={handleCreateFolderClick} className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-semibold rounded-lg hover:bg-[var(--color-primary-hover)]">Create</button>
                        <button onClick={() => setIsCreatingFolder(false)} className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)]">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
                
                {courses.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-[var(--color-card)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
                        <BookOpenIcon className="w-16 h-16 text-[var(--color-muted-foreground)]/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Your learning space is empty</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">Use the 'Create New' button above to begin.</p>
                    </div>
                ) : (
                    <>
                        {visibleFolders.map(folder => (
                            <FolderAccordion
                                key={folder.id}
                                folder={folder}
                                courses={folder.courses.map(c => categorizedCourses.get(c!.id)).filter((c): c is Course => !!c && c.title.toLowerCase().includes(searchTerm.toLowerCase()))}
                                allFolders={folders}
                                onSelectCourse={onSelectCourse}
                                onStartInterviewPrep={onStartInterviewPrep}
                                onMoveCourse={handleMoveCourseToFolder}
                                onDeleteCourse={handleDeleteCourse}
                                onRenameFolder={handleUpdateFolderName}
                                onDeleteFolder={handleDeleteFolder}
                                onAddTopics={openCreateTopicsModal}
                            />
                        ))}
                        {uncategorizedCourses.length > 0 && (
                            <FolderAccordion
                                folder={{id: 'uncategorized', name: 'Uncategorized Topics', courses: uncategorizedCourses}}
                                courses={uncategorizedCourses}
                                allFolders={folders}
                                onSelectCourse={onSelectCourse}
                                onStartInterviewPrep={onStartInterviewPrep}
                                onMoveCourse={handleMoveCourseToFolder}
                                onDeleteCourse={handleDeleteCourse}
                                onRenameFolder={() => {}} 
                                onDeleteFolder={() => {}}
                                onAddTopics={() => {}}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
        <QuickPracticeModal 
            isOpen={isQuickPracticeModalOpen}
            onClose={() => setIsQuickPracticeModalOpen(false)}
            onStart={() => {
                setIsQuickPracticeModalOpen(false);
                onNavigate('practice_quiz');
            }}
        />
        </>
    );
};

export default Dashboard;
