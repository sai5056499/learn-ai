import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_CLIENT_ID } from './config';
import { AnimatedLearnAIIcon } from '../common/Icons';

declare const google: any;

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        if (typeof google === 'undefined' || !googleButtonRef.current || GOOGLE_CLIENT_ID.startsWith('YOUR')) {
            return;
        }

        const handleCredentialResponse = (response: any) => {
            login(response.credential);
        };

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: "outline", size: "large", type: "standard", shape: "pill", width: "300" }
        );

    }, [login]);

    const handleEmailSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && name) {
            login({ email, name });
        }
    };

    const isGoogleConfigured = !GOOGLE_CLIENT_ID.startsWith('YOUR');

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-md text-center">
                <AnimatedLearnAIIcon className="w-24 h-24 text-[var(--color-primary)] mx-auto mb-6" />
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Welcome to <span className="gradient-text">LearnAI</span>
                </h1>
                <p className="max-w-md mx-auto mt-6 text-base sm:text-lg text-[var(--color-muted-foreground)]">
                    Your personal AI learning companion. Sign in to begin generating courses and tracking your progress.
                </p>
                
                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                    {/* Google Sign-In Button */}
                    {isGoogleConfigured && (
                        <div ref={googleButtonRef}></div>
                    )}
                    
                    {/* Divider */}
                    {isGoogleConfigured && (
                        <div className="flex items-center w-full">
                            <div className="flex-1 border-t border-[var(--color-border)]"></div>
                            <span className="px-4 text-sm text-[var(--color-muted-foreground)]">or</span>
                            <div className="flex-1 border-t border-[var(--color-border)]"></div>
                        </div>
                    )}
                    
                    {/* Email Sign-In Form */}
                    {showEmailForm ? (
                        <form onSubmit={handleEmailSignIn} className="w-full space-y-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                                Continue with Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEmailForm(false)}
                                className="w-full px-4 py-3 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                            >
                                Back to Sign In Options
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowEmailForm(true)}
                            className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] transition-colors"
                        >
                            Continue with Email
                        </button>
                    )}
                    
                    {/* Configuration Notice */}
                    {!isGoogleConfigured && (
                        <p className="text-xs text-yellow-500 max-w-xs mt-4">
                            Google Sign-In is not configured. You can still use email sign-in, or add your Client ID in `components/auth/config.ts`.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
