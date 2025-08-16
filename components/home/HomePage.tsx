import React from 'react';
import { View } from '../../App';
import { LogoIcon, SparklesIconV2, AcademicCapIcon, BeakerIcon } from '../common/Icons';

interface HomePageProps {
    setView: (view: View) => void;
    onStartCreate: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-[var(--color-card)] p-6 rounded-xl border border-[var(--color-border)] text-center h-full">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">{title}</h3>
        <p className="text-[var(--color-muted-foreground)]">{description}</p>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ setView, onStartCreate }) => {
    return (
        <div className="w-full animate-fade-in text-[var(--color-foreground)]">
            {/* Hero Section */}
            <section className="text-center py-10 sm:py-20">
                <LogoIcon className="w-16 h-16 sm:w-24 sm:h-24 text-[var(--color-primary)] mx-auto mb-6" />
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Your Personal <span className="gradient-text">AI Learning Companion</span>
                </h1>
                <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-[var(--color-muted-foreground)]">
                    Generate comprehensive, adaptive courses on any topic imaginable. From quantum computing to ancient history, master new skills with a curriculum designed just for you.
                </p>
                <div className="mt-10 flex justify-center">
                     <button
                        onClick={onStartCreate}
                        className="px-8 py-4 bg-[var(--gradient-primary-accent)] text-white font-bold rounded-xl text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-[var(--color-primary)]/40 transform hover:scale-105"
                    >
                        Generate Your First Course ✨
                    </button>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-16 sm:py-20 bg-[var(--color-secondary)]/50 rounded-2xl">
                <div className="text-center max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold">A Smarter Way to Learn</h2>
                    <p className="mt-4 text-[var(--color-muted-foreground)] text-base sm:text-lg">
                        Leverage the power of AI to create a learning experience that adapts to you.
                    </p>
                </div>
                <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    <FeatureCard 
                        icon={<SparklesIconV2 className="w-7 h-7" />}
                        title="Instant Course Generation"
                        description="Simply provide a topic and your knowledge level, and our AI will build a detailed, multi-module course in seconds."
                    />
                    <FeatureCard 
                        icon={<AcademicCapIcon className="w-7 h-7" />}
                        title="Interview Prep"
                        description="Generate targeted Q&A sets for any topic to ensure you're ready for your next technical interview."
                    />
                    <FeatureCard 
                        icon={<BeakerIcon className="w-7 h-7" />}
                        title="Interactive Learning"
                        description="Engage with quizzes, analogies, stories, and practical exercises to solidify your understanding."
                    />
                </div>
            </section>

             {/* How It Works Section */}
            <section className="py-16 sm:py-20">
                <div className="text-center max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold">Get Started in 3 Simple Steps</h2>
                </div>
                <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
                    <div className="p-4">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)] text-2xl font-bold">1</div>
                        <h3 className="text-xl font-bold">Enter a Topic</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">Tell the AI what you want to learn.</p>
                    </div>
                     <div className="p-4">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)] text-2xl font-bold">2</div>
                        <h3 className="text-xl font-bold">Generate Course</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">Watch as a full curriculum is built for you.</p>
                    </div>
                     <div className="p-4">
                        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-primary)] text-2xl font-bold">3</div>
                        <h3 className="text-xl font-bold">Start Learning</h3>
                        <p className="text-[var(--color-muted-foreground)] mt-2">Dive into your personalized lessons.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;