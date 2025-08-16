
import React from 'react';
import { CloseIcon, LoadingSpinnerIcon, ArticleIcon } from '../common/Icons';

interface ArticleDisplayModalProps {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    article: string;
    error: string | null;
    onClose: () => void;
}

const ArticleDisplayModal: React.FC<ArticleDisplayModalProps> = ({ isOpen, isLoading, title, article, error, onClose }) => {
    if (!isOpen) return null;

    // A more robust markdown-to-html renderer
    const renderMarkdown = (markdown: string) => {
        const elements: React.ReactNode[] = [];
        const lines = markdown.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Inline parser for bold, italics, and code
            const parseInline = (text: string) => {
                const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).filter(Boolean);
                return parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('*') && part.endsWith('*')) {
                        return <em key={index}>{part.slice(1, -1)}</em>;
                    }
                    if (part.startsWith('`') && part.endsWith('`')) {
                        return <code key={index} className="bg-[var(--color-secondary)] text-[var(--color-primary)] px-1.5 py-1 rounded font-mono text-sm">{part.slice(1, -1)}</code>;
                    }
                    return <span key={index}>{part}</span>;
                });
            };
            
            // Block-level parsing
            if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-xl font-bold text-slate-700 mt-5 mb-2">{parseInline(line.substring(4))}</h3>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-2xl font-bold text-slate-800 mt-6 mb-3 border-b border-[var(--color-border)] pb-2">{parseInline(line.substring(3))}</h2>);
            } else if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-3xl font-extrabold text-slate-900 mb-4">{parseInline(line.substring(2))}</h1>);
            } else if (line.trim() === '---') {
                elements.push(<hr key={i} className="my-10 border-t-2 border-dashed border-[var(--color-border)]" />);
            } else if (line.startsWith('[Image: ') && line.endsWith(']')) {
                elements.push(
                    <div key={i} className="my-6 p-4 border-l-4 border-[var(--color-accent)] bg-[var(--color-secondary)] italic text-[var(--color-muted-foreground)]">
                        <span className="font-bold text-[var(--color-foreground)]">Image Suggestion:</span> {line.slice(8, -1)}
                    </div>
                );
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                const listItems = [];
                while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
                    listItems.push(<li key={i}>{parseInline(lines[i].substring(2))}</li>);
                    i++;
                }
                i--; // Decrement to account for the loop's i++
                elements.push(<ul key={`ul-${i}`} className="list-disc pl-6 my-4 space-y-2">{listItems}</ul>);
            } else if (line.match(/^\d+\. /)) {
                const listItems = [];
                while (i < lines.length && lines[i].match(/^\d+\. /)) {
                    listItems.push(<li key={i}>{parseInline(lines[i].substring(lines[i].indexOf(' ') + 1))}</li>);
                    i++;
                }
                i--; // Decrement
                elements.push(<ol key={`ol-${i}`} className="list-decimal pl-6 my-4 space-y-2">{listItems}</ol>);
            } else if (line.trim() !== '') {
                elements.push(<p key={i} className="my-4">{parseInline(line)}</p>);
            }
            // Empty lines are skipped
        }
        
        return <>{elements}</>;
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[var(--color-card)] rounded-xl shadow-2xl p-8 w-full max-w-4xl border border-[var(--color-border)] animate-modal-content flex flex-col h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                            <ArticleIcon className="w-7 h-7 text-blue-500" />
                            {isLoading ? "Generating Article..." : title || "AI-Generated Article"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 -mr-4 bg-gray-50/50 p-6 rounded-lg border">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <LoadingSpinnerIcon className="w-8 h-8 text-blue-500" />
                            <p className="mt-4 text-[var(--color-muted-foreground)]">The AI is researching and writing your article...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-500 p-8">
                            <p>{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && article && (
                        <div className="max-w-none text-slate-700 leading-relaxed">
                            {renderMarkdown(article)}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg hover:bg-[var(--color-border)] border border-[var(--color-border)]">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleDisplayModal;
