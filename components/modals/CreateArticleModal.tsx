import React, { useState, useEffect } from 'react';
import { KnowledgeLevel } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { CloseIcon, LogoIcon } from '../common/Icons';

interface CreateArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, description: string, content: string, level: KnowledgeLevel, folderId: string | null) => void;
    error: string | null;
    selectedFolderId?: string;
}

const CreateArticleModal: React.FC<CreateArticleModalProps> = ({ isOpen, onClose, onCreate, error: propError, selectedFolderId }) => {
    const { folders } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [level, setLevel] = useState<KnowledgeLevel>('beginner');
    const [folderId, setFolderId] = useState<string | null>(selectedFolderId || null);
    const [localError, setLocalError] = useState<string | null>(null);

    // Update folderId when selectedFolderId changes
    useEffect(() => {
        setFolderId(selectedFolderId || null);
    }, [selectedFolderId]);

    const levels: { level: KnowledgeLevel; label: string; description: string }[] = [
        { level: 'beginner', label: 'Beginner', description: 'Start from scratch, cover the basics.' },
        { level: 'intermediate', label: 'Intermediate', description: 'Assume some familiarity, focus on core concepts.' },
        { level: 'advanced', label: 'Advanced', description: 'Dive into details, complex topics, and best practices.' },
    ];

    if (!isOpen) return null;
    
    const handleCreateClick = () => {
        if (!title.trim()) {
            setLocalError("Please enter a title for your article.");
            return;
        }
        if (!description.trim()) {
            setLocalError("Please enter a description for your article.");
            return;
        }
        if (!content.trim()) {
            setLocalError("Please enter content for your article.");
            return;
        }
        onCreate(title, description, content, level, folderId);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (localError) setLocalError(null);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
        if (localError) setLocalError(null);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (localError) setLocalError(null);
    };
    
    const displayError = propError || localError;

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200 animate-modal-content max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <LogoIcon className="w-7 h-7 text-blue-500" />
                            Create New Article
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {selectedFolderId 
                                ? `Create an article in "${folders.find(f => f.id === selectedFolderId)?.name}"`
                                : "Create a new article to share your knowledge"
                            }
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="title-input" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            id="title-input"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="e.g., 'Introduction to React Hooks'"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="description-input" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <input
                            id="description-input"
                            type="text"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Brief description of what this article covers"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="content-input" className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <textarea
                            id="content-input"
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Write your article content here..."
                            rows={8}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-vertical"
                        />
                    </div>

                    <div>
                        <h3 className="block text-sm font-medium text-slate-700 mb-2">Knowledge Level</h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {levels.map((l) => (
                                <button
                                    key={l.level}
                                    onClick={() => setLevel(l.level)}
                                    className={`text-left p-3 rounded-lg border-2 transition-all duration-200 ${level === l.level ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300 hover:border-blue-400'}`}
                                >
                                    <p className="font-bold text-blue-600 capitalize">{l.label}</p>
                                    <p className="text-xs text-gray-500">{l.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {folders.length > 0 && (
                        <div>
                            <label htmlFor="folder-select" className="block text-sm font-medium text-slate-700 mb-1">
                                {selectedFolderId ? 'Folder' : 'Add to Folder (Optional)'}
                            </label>
                            <select
                                id="folder-select"
                                value={folderId ?? ''}
                                onChange={(e) => setFolderId(e.target.value || null)}
                                disabled={!!selectedFolderId}
                                className={`w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${selectedFolderId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Uncategorized</option>
                                {folders.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {displayError && <p className="mt-4 text-center text-red-500 animate-shake">{displayError}</p>}
                
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-slate-700 font-bold rounded-lg hover:bg-gray-200 border border-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateClick}
                        disabled={!title.trim() || !description.trim() || !content.trim()}
                        className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30"
                    >
                        Create Article
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateArticleModal;
