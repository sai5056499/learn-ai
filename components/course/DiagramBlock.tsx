import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        mermaid: any;
    }
}

interface DiagramBlockProps {
    mermaidString: string;
}

const DiagramBlock: React.FC<DiagramBlockProps> = ({ mermaidString }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [renderError, setRenderError] = useState<string | null>(null);
    
    useEffect(() => {
        const renderDiagram = async () => {
            if (!ref.current || !window.mermaid) {
                return;
            }

            try {
                // Clear previous content and errors
                setRenderError(null);
                ref.current.innerHTML = '';
                
                // Validate mermaid string
                if (!mermaidString || typeof mermaidString !== 'string') {
                    throw new Error('Invalid mermaid string provided');
                }

                // Remove any previously rendered SVG to avoid duplicates on re-render
                const existingSvg = ref.current.querySelector('svg');
                if (existingSvg) {
                    existingSvg.remove();
                }

                // Set the mermaid content
                ref.current.innerHTML = mermaidString;

                // Render the diagram
                await window.mermaid.run({
                    nodes: [ref.current]
                });

            } catch (error) {
                console.error("Mermaid rendering error:", error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setRenderError(`Failed to render diagram: ${errorMessage}`);
                
                // Show fallback content
                if (ref.current) {
                    ref.current.innerHTML = `
                        <div class="text-center p-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p class="text-sm">Diagram could not be rendered</p>
                            <p class="text-xs mt-1">${errorMessage}</p>
                        </div>
                    `;
                }
            }
        };

        renderDiagram();
    }, [mermaidString]);

    if (renderError) {
        return (
            <div className="mermaid flex justify-center p-4 bg-white w-full">
                <div className="text-center p-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm">Diagram could not be rendered</p>
                    <p className="text-xs mt-1">{renderError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mermaid flex justify-center p-4 bg-white w-full" ref={ref}>
            {/* The mermaid string is injected via useEffect to avoid React/Mermaid DOM conflicts */}
        </div>
    );
};

export default DiagramBlock;