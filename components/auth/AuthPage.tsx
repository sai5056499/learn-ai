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
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-foreground)',
            fontFamily: 'sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
             <div style={{
                width: '100%',
                maxWidth: '28rem',
                textAlign: 'center'
             }}>
                <AnimatedLearnAIIcon style={{
                    width: '6rem',
                    height: '6rem',
                    color: 'var(--color-primary)',
                    margin: '0 auto 1.5rem'
                }} />
                <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: '800',
                    letterSpacing: '-0.025em'
                }}>
                    Welcome to <span style={{
                        background: 'linear-gradient(to right, #2563eb, #7c3aed)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>LearnAI</span>
                </h1>
                <p style={{
                    maxWidth: '28rem',
                    margin: '1.5rem auto 0',
                    fontSize: '1rem',
                    color: 'var(--color-muted-foreground)'
                }}>
                    Your personal AI learning companion. Sign in to begin generating courses and tracking your progress.
                </p>
                
                <div style={{
                    marginTop: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem'
                }}>
                    {/* Google Sign-In Button */}
                    {isGoogleConfigured && (
                        <div ref={googleButtonRef}></div>
                    )}
                    
                    {/* Divider */}
                    {isGoogleConfigured && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <div style={{
                                flex: '1',
                                borderTop: '1px solid var(--color-border)'
                            }}></div>
                            <span style={{
                                padding: '0 1rem',
                                fontSize: '0.875rem',
                                color: 'var(--color-muted-foreground)'
                            }}>or</span>
                            <div style={{
                                flex: '1',
                                borderTop: '1px solid var(--color-border)'
                            }}></div>
                        </div>
                    )}
                    
                    {/* Email Sign-In Form */}
                    {showEmailForm ? (
                        <form onSubmit={handleEmailSignIn} style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-foreground)',
                                    outline: 'none'
                                }}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-foreground)',
                                    outline: 'none'
                                }}
                                required
                            />
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Continue with Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEmailForm(false)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--color-muted-foreground)',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Sign In Options
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowEmailForm(true)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '0.5rem',
                                backgroundColor: 'transparent',
                                color: 'var(--color-foreground)',
                                cursor: 'pointer'
                            }}
                        >
                            Continue with Email
                        </button>
                    )}
                    
                    {/* Configuration Notice */}
                    {!isGoogleConfigured && (
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#f59e0b',
                            maxWidth: '20rem',
                            marginTop: '1rem'
                        }}>
                            Google Sign-In is not configured. You can still use email sign-in, or add your Client ID in `components/auth/config.ts`.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
