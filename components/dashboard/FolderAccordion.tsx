import React, { useState, useRef, useEffect } from 'react';
import { Folder, Course } from '../../types';
import { ChevronDownIcon, FolderIcon, PencilIcon, TrashIcon, CheckIcon, CloseIcon, FolderPlusIcon } from '../common/Icons';
import ProjectStyleCourseCard from './ProjectStyleCourseCard';

interface FolderAccordionProps {
    folder: Folder;
    courses: Course[];
    allFolders: Folder[];
    onSelectCourse: (courseId: string) => void;
    onStartInterviewPrep: (course: Course) => void;
    onMoveCourse: (courseId: string, folderId: string | null) => void;
    onDeleteCourse: (courseId: string) => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onAddTopics: (folderId: string) => void;
}

const FolderAccordion: React.FC<FolderAccordionProps> = ({
    folder,
    courses,
    allFolders,
    onSelectCourse,
    onStartInterviewPrep,
    onMoveCourse,
    onDeleteCourse,
    onRenameFolder,
    onDeleteFolder,
    onAddTopics
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(folder.name);
    const renameInputRef = useRef<HTMLInputElement>(null);
    const isUncategorized = folder.id === 'uncategorized';

    useEffect(() => {
        if (isRenaming) {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        }
    }, [isRenaming]);

    const handleRename = () => {
        if (newName.trim() && newName.trim() !== folder.name) {
            onRenameFolder(folder.id, newName.trim());
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleRename();
        if (e.key === 'Escape') setIsRenaming(false);
    }
    
    return (
        <section>
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full hover:bg-[var(--color-secondary-hover)]">
                        <ChevronDownIcon className={`w-6 h-6 text-[var(--color-muted-foreground)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <FolderIcon className="w-7 h-7 text-[var(--color-primary)]" />
                    {isRenaming ? (
                        <input
                            ref={renameInputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleRename}
                            className="text-xl font-bold bg-transparent border-b-2 border-[var(--color-primary)] text-[var(--color-foreground)] focus:outline-none"
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-[var(--color-foreground)]">{folder.name}</h2>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isUncategorized && (
                        <>
                            <button onClick={() => onAddTopics(folder.id)} className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)]" title="Add Topics to Folder">
                                <FolderPlusIcon className="w-5 h-5"/>
                            </button>
                            {isRenaming ? (
                                <>
                                    <button onClick={handleRename} className="p-2 rounded-full text-green-600 hover:bg-green-100"><CheckIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setIsRenaming(false)} className="p-2 rounded-full text-red-600 hover:bg-red-100"><CloseIcon className="w-5 h-5"/></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsRenaming(true)} className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)]"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteFolder(folder.id)} className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)]"><TrashIcon className="w-5 h-5"/></button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
             <div className={`grid overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, index) => (
                                <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                                    <ProjectStyleCourseCard 
                                        course={course} 
                                        folders={allFolders}
                                        onSelectCourse={onSelectCourse} 
                                        onStartInterviewPrep={onStartInterviewPrep} 
                                        onMoveCourse={onMoveCourse}
                                        onDeleteCourse={onDeleteCourse}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[var(--color-muted-foreground)]">
                            <p>This folder is empty. Use the 'Add Topics' button to populate it.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FolderAccordion;