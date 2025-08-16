import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { achievementsList } from '../../services/achievements';
import AchievementCard from './AchievementCard';
import CircularProgressBar from '../common/CircularProgressBar';
import { UserCircleIcon } from '../common/Icons';

const ProfilePage: React.FC = () => {
    const { localUser } = useAppContext();

    if (!localUser) {
        return <div>Loading user profile...</div>;
    }

    const requiredXp = localUser.level * 500;
    const progressPercentage = requiredXp > 0 ? (localUser.xp / requiredXp) * 100 : 0;

    return (
        <div className="w-full max-w-4xl animate-fade-in-up">
            <header className="pb-6 border-b border-[var(--color-border)] mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                    <UserCircleIcon className="w-10 h-10 text-[var(--color-primary)]" />
                    My Profile
                </h1>
            </header>

            <section className="bg-[var(--color-card)] p-8 rounded-2xl border border-[var(--color-border)] shadow-lg flex flex-col sm:flex-row items-center gap-8 mb-10">
                <CircularProgressBar 
                    progress={progressPercentage}
                    size={140}
                    strokeWidth={10}
                    level={localUser.level}
                />
                <div className="flex-grow text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-[var(--color-foreground)]">{localUser.name}</h2>
                    <p className="text-lg text-[var(--color-muted-foreground)] mt-1">Level {localUser.level}</p>
                    <div className="mt-4">
                         <div className="w-full bg-[var(--color-secondary)] rounded-full h-4 border border-[var(--color-border)]">
                            <div
                                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-[var(--color-muted-foreground)] text-right mt-1 font-semibold">{localUser.xp} / {requiredXp} XP</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Achievements</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievementsList.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            isUnlocked={localUser.achievements.includes(achievement.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;