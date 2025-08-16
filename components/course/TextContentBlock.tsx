import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as geminiService from '../../services/geminiService';
import { ContentBlock } from '../../types';
import { SparklesIcon, ArrowDownCircleIcon, LoadingSpinnerIcon, LanguageIcon, PlayIcon, StopIcon } from '../common/Icons';

const Explainer: React.FC<{ title: string, icon: React.ReactNode, fetcher: () => Promise<string>, onDone: () => void, renderFooter?: (content: string) => React.ReactNode }> = ({ title, icon, fetcher, onDone, renderFooter }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        fetcher()
            .then(res => { if(isMounted) setContent(res); })
            .catch(() => { if(isMounted) setContent("Sorry, I couldn't process that request right now."); })
            .finally(() => { if(isMounted) setIsLoading(false); });
        return () => { isMounted = false; };
    }, [fetcher]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onDone();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onDone]);

    return (
        <div ref={ref} className="explainer-popover top-full right-0 mt-2">
            <h5 className="font-bold text-blue-600 flex items-center gap-1.5 text-sm mb-2">{icon} {title}</h5>
            {isLoading ? (
                <div className="flex justify-center items-center h-16"><LoadingSpinnerIcon className="w-6 h-6 text-blue-500" /></div>
            ) : (
                <div className="text-sm text-slate-600 max-h-48 overflow-y-auto">
                    <p>{content}</p>
                    {renderFooter && renderFooter(content)}
                </div>
            )}
        </div>
    );
};

const TTSPlayer: React.FC<{ content: string }> = ({ content }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const cleanup = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        const u = new SpeechSynthesisUtterance(content);
        u.lang = 'hi-IN'; // Set language for Hinglish
        u.onend = () => setIsPlaying(false);
        utteranceRef.current = u;

        // Cleanup on component unmount
        return () => cleanup();
    }, [content, cleanup]);
    
    const handlePlayPause = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if (window.speechSynthesis.paused) {
                 window.speechSynthesis.resume();
            } else if (utteranceRef.current) {
                 window.speechSynthesis.speak(utteranceRef.current);
            }
            setIsPlaying(true);
        }
    };
    
    return (
        <div className="mt-3 pt-3 border-t border-gray-200">
            <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
                {isPlaying ? <StopIcon className="w-4 h-4"/> : <PlayIcon className="w-4 h-4"/>}
                {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </button>
        </div>
    );
};

const TextContentBlock: React.FC<{ block: ContentBlock }> = ({ block }) => {
    const [explainer, setExplainer] = useState<{type: 'simple' | 'deep' | 'hinglish'; content: string} | null>(null);

    // Cancel speech synthesis when the popover closes
    useEffect(() => {
        if (!explainer) {
            window.speechSynthesis.cancel();
        }
    }, [explainer]);

    if (!block.text) return null;

    const handleExplainSimply = () => setExplainer({ type: 'simple', content: block.text! });
    const handleDeeperDive = () => setExplainer({ type: 'deep', content: block.text! });
    const handleExplainHinglish = () => setExplainer({ type: 'hinglish', content: block.text! });

    return (
        <div className="relative group">
            <p className="text-gray-700 leading-relaxed">{block.text}</p>
            <div className="absolute -top-2 -right-2 flex items-center gap-1 p-1 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={handleExplainSimply} className="p-1.5 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Explain Simply">
                    <SparklesIcon className="w-4 h-4" />
                </button>
                <button onClick={handleDeeperDive} className="p-1.5 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Deeper Dive">
                    <ArrowDownCircleIcon className="w-4 h-4" />
                </button>
                 <button onClick={handleExplainHinglish} className="p-1.5 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Explain in Hinglish">
                    <LanguageIcon className="w-4 h-4" />
                </button>
            </div>
            {explainer?.type === 'simple' && (
                <Explainer title="Simplified" icon={<SparklesIcon className="w-4 h-4" />} fetcher={() => geminiService.explainSimply(explainer.content)} onDone={() => setExplainer(null)} />
            )}
            {explainer?.type === 'deep' && (
                <Explainer title="Deeper Dive" icon={<ArrowDownCircleIcon className="w-4 h-4" />} fetcher={() => geminiService.deeperDive(explainer.content)} onDone={() => setExplainer(null)} />
            )}
            {explainer?.type === 'hinglish' && (
                <Explainer 
                    title="Hinglish Explanation" 
                    icon={<LanguageIcon className="w-4 h-4" />} 
                    fetcher={() => geminiService.generateHinglishExplanation(explainer.content)} 
                    onDone={() => setExplainer(null)}
                    renderFooter={(content) => <TTSPlayer content={content} />}
                />
            )}
        </div>
    );
};

export default TextContentBlock;