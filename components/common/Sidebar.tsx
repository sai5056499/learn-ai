import React from 'react';
import { View } from '../../App';
import { LogoIcon, RectangleGroupIcon, Cog6ToothIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, CloseIcon, WrenchScrewdriverIcon, CommandLineIcon, UserCircleIcon } from './Icons';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    view: View;
    setView: (view: View) => void;
    isOpen: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group relative ${
            isActive
                ? 'text-white'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] hover:text-[var(--color-foreground)]'
        }`}
        aria-label={label}
        title={label}
    >
        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} style={{background: isActive ? 'var(--gradient-primary-accent)' : ''}}></div>
        <div className="relative flex items-center">
            {icon}
            <span className="ml-4 font-semibold">{label}</span>
        </div>
    </button>
);

const UserProfile: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
             <div className="flex items-center gap-3 p-2">
                {user.picture ? (
                    <img src={user.picture} alt="User" className="w-10 h-10 rounded-full" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--color-secondary-hover)] flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-[var(--color-muted-foreground)]" />
                    </div>
                )}
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-sm text-[var(--color-foreground)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)] truncate">{user.email}</p>
                </div>
            </div>
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ view, setView, isOpen, onClose, onOpenSettings }) => {
    const { logout } = useAuth();
    
    const handleNavigation = (targetView: View) => {
        setView(targetView);
        onClose(); // Close sidebar on navigation for mobile
    };
    
    const handleSettingsClick = () => {
        onOpenSettings();
        onClose();
    };

    return (
        <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        ></div>
        
        <aside 
            className={`w-64 bg-[var(--color-secondary)] p-4 flex flex-col border-r border-[var(--color-border)] h-full fixed lg:sticky top-0 z-50 lg:z-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
            <div className="flex items-center justify-between gap-3 mb-10 px-2">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-8 h-8 text-[var(--color-primary)]" />
                    <h1 className="text-xl font-bold text-[var(--color-foreground)]">LearnAI</h1>
                </div>
                <button onClick={onClose} className="p-1 lg:hidden">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-grow space-y-2">
                <NavItem
                    icon={<RectangleGroupIcon className="w-6 h-6" />}
                    label="Dashboard"
                    isActive={view === 'dashboard'}
                    onClick={() => handleNavigation('dashboard')}
                />
                 <NavItem
                    icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
                    label="Skill Assessment"
                    isActive={view === 'assessment'}
                    onClick={() => handleNavigation('assessment')}
                />
                <NavItem
                    icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
                    label="Projects"
                    isActive={view === 'projects'}
                    onClick={() => handleNavigation('projects')}
                />
                 <NavItem
                    icon={<AcademicCapIcon className="w-6 h-6" />}
                    label="Interview Prep"
                    isActive={view === 'interview'}
                    onClick={() => handleNavigation('interview')}
                />
                 <NavItem
                    icon={<CommandLineIcon className="w-6 h-6" />}
                    label="Code Explainer"
                    isActive={view === 'code_explainer'}
                    onClick={() => handleNavigation('code_explainer')}
                />
            </nav>
            <div className="flex-shrink-0 space-y-2">
                <UserProfile />
                <NavItem
                    icon={<UserCircleIcon className="w-6 h-6" />}
                    label="Profile"
                    isActive={view === 'profile'}
                    onClick={() => handleNavigation('profile')}
                />
                <NavItem
                    icon={<Cog6ToothIcon className="w-6 h-6" />}
                    label="Settings"
                    isActive={false} // This button just opens a modal
                    onClick={handleSettingsClick}
                />
                 <button onClick={logout} className="w-full text-left p-3 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] font-semibold">
                    Sign Out
                </button>
            </div>
        </aside>
        </>
    );
};

export default Sidebar;
