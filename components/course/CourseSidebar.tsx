

import React from 'react';
import { Course, LearningItem } from '../../types';
import { CheckIcon, BookOpenIcon, CloseIcon, QuizIcon, WrenchScrewdriverIcon } from '../common/Icons';

interface CourseSidebarProps {
    course: Course;
    activeItemId: string | null;
    onSelectItem: (itemId: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const getItemIcon = (itemType: LearningItem['type'], isActive: boolean) => {
    switch(itemType) {
        case 'lecture': return <BookOpenIcon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />;
        case 'quiz': return <QuizIcon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />;
        case 'project': return <WrenchScrewdriverIcon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />;
        default: return <BookOpenIcon className={`w-4 h-4 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />;
    }
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ course, activeItemId, onSelectItem, isOpen, onClose }) => {
    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <aside className={`h-full custom-scrollbar p-4 border-r border-[var(--color-border)] bg-[var(--color-secondary)]/30
                transform transition-transform duration-300 ease-in-out z-40
                fixed md:sticky top-0 
                w-72 md:w-auto
                md:col-span-4 lg:col-span-3
                md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center mb-6 px-2">
                     <h2 className="text-xl font-bold text-[var(--color-foreground)]">{course.title}</h2>
                     <button onClick={onClose} className="p-1 md:hidden">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="space-y-6">
                    {course.modules.map((module, index) => (
                        <div key={index}>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-3 px-2">
                                {`Module ${index + 1}: ${module.title}`}
                            </h3>
                            <ul className="space-y-1">
                                {module.items.map(item => {
                                    const isCompleted = course.progress.has(item.id);
                                    const isActive = item.id === activeItemId;
                                    
                                    const statusIcon = isCompleted 
                                        ? <CheckIcon className="w-4 h-4 text-white" />
                                        : getItemIcon(item.type, isActive);

                                    const iconBgClass = isCompleted 
                                        ? 'bg-gradient-to-br from-green-500 to-green-400' 
                                        : `bg-[var(--color-background)]`;
                                    
                                    const textClass = isActive 
                                        ? 'text-[var(--color-primary)] font-semibold' 
                                        : 'text-[var(--color-foreground)] hover:text-[var(--color-primary)]';

                                    const bgClass = isActive ? 'bg-[var(--color-primary)]/10' : 'hover:bg-[var(--color-background)]';

                                    return (
                                        <li key={item.id}>
                                            <button 
                                                onClick={() => onSelectItem(item.id)}
                                                className={`w-full flex items-center text-left p-2.5 rounded-lg transition-colors duration-200 ${bgClass}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mr-3 transition-all duration-300 ${isCompleted ? 'border-green-500' : isActive ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'} ${iconBgClass}`}>
                                                    {statusIcon}
                                                </div>
                                                <span className={`text-sm ${textClass}`}>
                                                    {item.title}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default CourseSidebar;