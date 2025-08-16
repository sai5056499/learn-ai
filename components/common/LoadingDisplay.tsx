
import React, { useState, useEffect } from 'react';
import { CloseIcon, MinusIcon, XCircleIcon } from './Icons';
import { BackgroundTask } from '../../types';

interface LoadingDisplayProps {
    task: BackgroundTask;
    onCancel: () => void;
    onMinimize: () => void;
}

const steps = [
    "Creating Your Learning Path",
    "Collecting Key Details",
    "Curating the Best Resources Just for You",
    "Saving this on your dashboard"
];

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ task, onCancel, onMinimize }) => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const { topic, status, message } = task;

    useEffect(() => {
        if (status !== 'generating') {
            return;
        }

        const interval = setInterval(() => {
            setActiveStepIndex(prevIndex => {
                // Stop interval when the last step is reached
                if (prevIndex >= steps.length - 1) {
                    clearInterval(interval);
                    return prevIndex;
                }
                return prevIndex + 1;
            });
        }, 3000); // Change step every 3 seconds

        return () => clearInterval(interval);
    }, [status]);

    if (status === 'error') {
        return (
             <div className="relative flex flex-col p-8 sm:p-10 animate-fade-in w-full max-w-lg bg-[var(--color-card)] rounded-2xl shadow-2xl border border-red-500/50 loading-card">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                     <button 
                        onClick={onCancel} 
                        className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                        title="Close"
                        aria-label="Close"
                     >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="w-full text-center">
                    <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Generation Failed</h2>
                    <p className="text-[var(--color-muted-foreground)] mt-2">
                        Something went wrong while generating a course for: <span className="font-semibold text-[var(--color-primary)]">{topic}</span>
                    </p>
                    <p className="mt-4 p-2 bg-[var(--color-secondary)] text-red-400 rounded-md text-sm">{message}</p>
                </div>
             </div>
        );
    }

    return (
        <div className="relative flex flex-col p-8 sm:p-10 animate-fade-in w-full max-w-lg bg-[var(--color-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] loading-card">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                    onClick={onMinimize} 
                    className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                    title="Minimize"
                    aria-label="Minimize"
                >
                    <MinusIcon className="w-6 h-6" />
                </button>
                 <button 
                    onClick={onCancel} 
                    className="p-2 rounded-full text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary-hover)] transition-colors"
                    title="Cancel Generation"
                    aria-label="Cancel Generation"
                 >
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="w-full text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] leading-tight">
                    Hang tight, our AI is crafting your personalized learning roadmap 🚀
                </h2>
                <p className="text-[var(--color-muted-foreground)] mt-2">
                    Generating a course on: <span className="font-semibold text-[var(--color-primary)]">{topic}</span>
                </p>

                <div className="mt-12 space-y-5">
                    {steps.map((step, index) => {
                        const isPending = index > activeStepIndex;
                        const isActive = index === activeStepIndex;
                        const isCompleted = index < activeStepIndex;

                        return (
                            <div key={index} className="flex items-center gap-4 transition-opacity duration-500" style={{ opacity: isPending ? 0.4 : 1 }}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                                    ${isActive ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] scale-110 shadow-lg' : ''}
                                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                                    ${isPending ? 'bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]' : ''}
                                `}>
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <p className={`text-lg transition-colors duration-300 ${isActive ? 'font-bold text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)]'}`}>
                                    {step}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LoadingDisplay;
