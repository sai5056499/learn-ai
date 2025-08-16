import { GoogleGenAI, Type } from "@google/genai";
import type { Course, Flashcard, LearningItem, KnowledgeLevel, ContentBlock, PracticeProblem, ChatMessage, QuizData, TestResult, Recommendation, RelatedTopic, InterviewQuestion, Module, MindMapNode, PracticeSession, Project, ProjectStep, LearningGoal, LearningStyle, CourseSource } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAIOA0lxZ98ITYtBhe174Ygl7GmfiJkmYYb';

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

// --- SCHEMAS ---
const quizSchema = {
    type: Type.OBJECT,
    description: "Data for a single quiz question.",
    properties: {
        q: { type: Type.STRING, description: "The quiz question." },
        options: {
            type: Type.ARRAY,
            description: "An array of 2 to 4 possible answers.",
            items: { type: Type.STRING },
            minItems: 2,
            maxItems: 4,
        },
        answer: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the 'options' array. This value MUST be between 0 and (number of options - 1)." },
        explanation: { type: Type.STRING, description: "A brief, clear explanation of why the correct answer is right, to be shown after the user answers." }
    },
    required: ['q', 'options', 'answer', 'explanation']
};

const practiceConceptSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        codeExample: { type: Type.STRING },
    },
    required: ['title', 'description', 'codeExample']
};

const practiceSessionSchema = {
    type: Type.OBJECT,
    properties: {
        topic: { type: Type.STRING },
        concepts: {
            type: Type.ARRAY,
            items: practiceConceptSchema,
        },
        quiz: {
            type: Type.ARRAY,
            items: quizSchema,
        }
    },
    required: ['topic', 'concepts', 'quiz']
};


const interactiveModelSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        layers: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['input', 'hidden', 'output'] },
                    neurons: { type: Type.INTEGER },
                    activation: { type: Type.STRING, enum: ['relu', 'sigmoid', 'tanh'] }
                },
                required: ['type', 'neurons']
            }
        },
        sampleInput: { type: Type.ARRAY, items: { type: Type.NUMBER } },
        expectedOutput: { type: Type.ARRAY, items: { type: Type.NUMBER } }
    },
    required: ['title', 'description', 'layers', 'sampleInput', 'expectedOutput']
};

const hyperparameterSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        parameters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, enum: ['Learning Rate', 'Batch Size', 'Dropout'] },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['label', 'description']
                        }
                    }
                },
                required: ['name', 'options']
            }
        },
        outcomes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { combination: { type: Type.STRING }, result: { type: Type.OBJECT, properties: { trainingLoss: { type: Type.ARRAY, items: { type: Type.NUMBER } }, validationLoss: { type: Type.ARRAY, items: { type: Type.NUMBER } }, description: { type: Type.STRING } }, required: ['trainingLoss', 'validationLoss', 'description'] } }, required: ['combination', 'result'] } }
    },
    required: ['title', 'description', 'parameters', 'outcomes']
};

const triageChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        scenario: { type: Type.STRING },
        evidence: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] } },
        correctOptionIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING }
    },
    required: ['scenario', 'evidence', 'options', 'correctOptionIndex', 'explanation']
};

const contentBlockSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['text', 'code', 'quiz', 'diagram', 'interactive_model', 'hyperparameter_simulator', 'triage_challenge'] },
        text: { type: Type.STRING },
        code: { type: Type.STRING },
        diagram: { type: Type.STRING },
        quiz: quizSchema,
        interactiveModel: interactiveModelSchema,
        hyperparameterSimulator: hyperparameterSchema,
        triageChallenge: triageChallengeSchema
    },
    required: ['type']
};

const lectureDataSchema = {
    type: Type.OBJECT,
    properties: {
        objective: { type: Type.STRING },
        contentBlocks: { type: Type.ARRAY, items: contentBlockSchema },
        resources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['video', 'documentation', 'article'] }, title: { type: Type.STRING }, url: { type: Type.STRING } }, required: ['type', 'title', 'url'] } },
        practiceProblems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING, enum: ['leetcode', 'geeksforgeeks'] }, title: { type: Type.STRING }, url: { type: Type.STRING } }, required: ['platform', 'title', 'url'] } }
    },
    required: ['objective', 'contentBlocks', 'resources']
};

const quizActivityDataSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        questions: { type: Type.ARRAY, items: quizSchema, minItems: 3, maxItems: 10 }
    },
    required: ['description', 'questions']
};

const projectActivityDataSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING },
        codeStub: { type: Type.STRING },
        challenge: { type: Type.STRING }
    },
    required: ['description', 'codeStub', 'challenge']
};

const learningItemSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['lecture', 'quiz', 'project'] },
        title: { type: Type.STRING },
        data: { 
            type: Type.OBJECT,
            properties: {
                // Properties for 'lecture'
                objective: { type: Type.STRING },
                contentBlocks: { type: Type.ARRAY, items: contentBlockSchema },
                resources: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['video', 'documentation', 'article'] }, title: { type: Type.STRING }, url: { type: Type.STRING } } } },
                practiceProblems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING, enum: ['leetcode', 'geeksforgeeks'] }, title: { type: Type.STRING }, url: { type: Type.STRING } } } },
                // Properties for 'quiz'
                description: { type: Type.STRING },
                questions: { type: Type.ARRAY, items: quizSchema },
                // Properties for 'project'
                codeStub: { type: Type.STRING },
                challenge: { type: Type.STRING }
            }
        }
    },
    required: ['type', 'title', 'data']
};


const courseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING, description: "A high-level category for the course, e.g., 'Web Development', 'Data Science', 'AI/ML'." },
        technologies: { type: Type.ARRAY, description: "A list of key technologies or frameworks covered.", items: { type: Type.STRING } },
        modules: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    items: {
                        type: Type.ARRAY,
                        items: learningItemSchema
                    }
                },
                required: ['title', 'items']
            }
        }
    },
    required: ['title', 'description', 'category', 'technologies', 'modules']
};


const flashcardSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ['question', 'answer'] } };
const assessmentQuizSchema = { type: Type.ARRAY, items: quizSchema };
const recommendationsSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['topic', 'reason'] } };
const relatedTopicsSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ['topic', 'reason'] } };
const mindMapNodeSchema_L3 = { type: Type.OBJECT, properties: { title: { type: Type.STRING } }, required: ['title'] };
const mindMapNodeSchema_L2 = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, children: { type: Type.ARRAY, items: mindMapNodeSchema_L3 } }, required: ['title'] };
const mindMapNodeSchema_L1 = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, children: { type: Type.ARRAY, items: mindMapNodeSchema_L2 } }, required: ['title'] };
const mindMapSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, children: { type: Type.ARRAY, items: mindMapNodeSchema_L1 } }, required: ['title']};
const interviewQuestionSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }, required: ['question', 'answer'] } };

// --- API CALLER ---
const callGemini = async (contents: any, schema?: object) => {
    try {
        const config = schema ? { responseMimeType: "application/json", responseSchema: schema } : {};
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents, config });
        const text = response.text.trim();
        if (schema) {
            const cleanedJsonString = text.replace(/^```json\s*|```$/g, '');
            return JSON.parse(cleanedJsonString);
        }
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof SyntaxError) throw new Error("Failed to parse the AI's response. The format was invalid.");
        if (error instanceof Error && error.message.includes('INVALID_ARGUMENT')) throw new Error("Request contains an invalid argument.");
        throw new Error("The AI model failed to generate content.");
    }
}

// --- EXPORTED FUNCTIONS ---

const getGoalDescription = (goal: LearningGoal) => {
    switch(goal) {
        case 'project': return "Build a Project. The user wants to apply this knowledge to a hands-on project. Emphasize practical applications and include 'project' items.";
        case 'interview': return "Prepare for Interviews. The user is focused on acing technical interviews. Prioritize common interview questions, core algorithms, data structures, and trade-off discussions relevant to the topic.";
        case 'theory': return "Deepen Understanding. The user wants to explore the theory and core concepts in-depth. Focus on formal definitions, historical context, and the 'why' behind concepts.";
        case 'curiosity': return "Just Curious. The user is exploring new topics for fun. Make the content engaging, use interesting analogies, and include fun facts or surprising applications.";
    }
}

const getStyleDescription = (style: LearningStyle) => {
    switch(style) {
        case 'visual': return "Visual. The user prefers diagrams, charts, and visual aids. You MUST include a higher than average number of `diagram` blocks in 'lecture' items to explain concepts.";
        case 'code': return "Code-Focused. The user learns best through practical examples. You MUST prioritize detailed and numerous `code` blocks in 'lecture' and 'project' items over long text explanations.";
        case 'balanced': return "Balanced. The user wants a mix of theory, code, and visuals. Ensure a good distribution of `text`, `code`, and `diagram` blocks in 'lecture' items.";
        case 'interactive': return "Interactive. The user learns by doing. Where appropriate, include `quiz` items and interactive content blocks within 'lecture' items to make the content more engaging.";
    }
}

const getSourcePrompt = (source: CourseSource) => {
    if (!source.content) return '';

    switch(source.type) {
        case 'syllabus':
            return `
**COURSE SOURCE (VERY IMPORTANT):**
*   **Syllabus:** Adhere to the following syllabus for structure and content, enriching it with the required detail.
\`\`\`
${source.content}
\`\`\`
`;
        case 'url':
            return `
**COURSE SOURCE (VERY IMPORTANT):**
*   **Web Page:** Base the course structure and content on the information found at the following URL.
*   URL: ${source.content}
`;
        case 'pdf':
            return `
**COURSE SOURCE (VERY IMPORTANT):**
*   **Document:** Use the following text, extracted from a user-provided document, as the primary source material for the course content and structure.
\`\`\`
${source.content}
\`\`\`
`;
        default:
            return '';
    }
};

export const generateCourse = async (
    topic: string, 
    knowledgeLevel: KnowledgeLevel, 
    goal: LearningGoal, 
    style: LearningStyle,
    source: CourseSource,
    specificTech: string,
    includeTheory: boolean
): Promise<Omit<Course, 'id' | 'progress'>> => {
    const prompt = `
You are a world-class AI Curriculum Architect. Your task is to generate a comprehensive, personalized course based on a new, activity-based structure.

**USER PROFILE & GOALS (VERY IMPORTANT):**
*   **Knowledge Level:** ${knowledgeLevel}
*   **Primary Goal:** ${getGoalDescription(goal)}
*   **Learning Style:** ${getStyleDescription(style)}

${getSourcePrompt(source)}

${(specificTech || includeTheory) ? `
**CUSTOMIZATION DETAILS:**
${specificTech ? `*   **Technology Focus:** Feature these technologies prominently: ${specificTech}.` : ''}
${includeTheory ? `*   **Theoretical Depth:** You MUST include more rigorous explanations, proofs, or mathematical formulations where relevant.` : ''}
` : ''}

**NEW COURSE STRUCTURE (CRITICAL - READ CAREFULLY):**
A course contains 3-4 **Modules**. Each module contains 3-5 **Learning Items**. A Learning Item is an object with a 'type', 'title', and 'data' field.

There are three types of Learning Items: 'lecture', 'quiz', and 'project'.
1.  **'lecture'**: An in-depth instructional article.
    *   The \`data\` object for a 'lecture' MUST contain: \`objective\`, \`contentBlocks\`, \`resources\`, and optionally \`practiceProblems\`.
    *   Content should be detailed. Use a mix of 'text', 'code', and 'diagram' blocks. Go beyond simple definitions.
2.  **'quiz'**: A multiple-choice quiz to test knowledge.
    *   The \`data\` object for a 'quiz' MUST contain: \`description\` and an array of 3-5 \`questions\`.
3.  **'project'**: A small, hands-on coding challenge.
    *   The \`data\` object for a 'project' MUST contain: \`description\`, \`codeStub\`, and a \`challenge\`.

**REQUIREMENTS (STRICT):**
1.  **Item Variety:** You MUST create a mix of 'lecture', 'quiz', and 'project' items within each module to create a varied and engaging learning path. A typical module should have 2-3 lectures, 1 quiz, and possibly 1 project.
2.  **Schema Adherence:** Adhere strictly to the JSON schema. For each Learning Item, the \`data\` object MUST ONLY contain the properties relevant to its 'type'.
    *   **CORRECT Example:** \`{ "type": "quiz", "title": "...", "data": { "description": "...", "questions": [...] } }\`
    *   **INCORRECT Example:** \`{ "type": "quiz", "title": "...", "data": { "description": "...", "questions": [...], "objective": "..." } }\` (Contains a property from 'lecture' data)
3.  **Realistic Content:**
    *   Code examples (in 'lecture' or 'project' items) should be well-commented and practical. Default to C++ for general CS topics, JavaScript/HTML/CSS for web, and Python for data science.
    *   All URLs in \`resources\` and \`practiceProblems\` MUST be real and valid. Prioritize official documentation and reputable sources. DO NOT invent URLs.

**TOPIC:**
Generate the course on "${topic}". ${source.content ? 'Use the source material provided above as the primary guide for content.' : ''}
    `;
    const courseData = await callGemini(prompt, courseSchema);
    if (!courseData.title || !courseData.modules || courseData.modules.length === 0) {
        throw new Error("Received malformed course data from API.");
    }
    
    // Add unique IDs to the generated content
    const courseWithIds = {
        ...courseData,
        knowledgeLevel,
        modules: courseData.modules.map((module: any, moduleIndex: number) => ({
            ...module,
            items: module.items.map((item: any, itemIndex: number) => ({
                ...item,
                id: `item_${moduleIndex}-${itemIndex}_${Date.now()}`,
                data: {
                    ...item.data,
                    // Add IDs to content blocks if they exist (for lecture items)
                    contentBlocks: item.data.contentBlocks?.map((block: ContentBlock, blockIndex: number) => ({
                        ...block,
                        id: `block_${moduleIndex}-${itemIndex}-${blockIndex}_${Date.now()}`
                    }))
                }
            }))
        }))
    };

    return courseWithIds;
};

export const generateTopicFlashcards = (item: LearningItem): Promise<Flashcard[]> => {
    if (item.type !== 'lecture') {
        return Promise.resolve([]);
    }
    const prompt = `Based on the following lecture content on "${item.title}", generate a concise set of 5-8 flashcards in a question-and-answer format. The questions should test the key concepts from this specific lecture. The answers should be clear and brief. Here is the lecture's objective: ${item.data.objective}`;
    return callGemini(prompt, flashcardSchema);
};

export const explainCodeSnippet = (snippet: string, context: string): Promise<string> => {
    const prompt = `You are an expert programming tutor. Explain what this specific code snippet does, within the context of the larger code block. Focus on the concept, not a literal translation. Explain it simply for a beginner.\n\nFull Context:\n\`\`\`\n${context}\n\`\`\`\n\nHighlighted Snippet:\n\`\`\`\n${snippet}\n\`\`\``;
    return callGemini(prompt);
};

export const generateCodeSnippet = (prompt: string, language: string): Promise<string> => {
    const fullPrompt = `Generate a code snippet in ${language} based on the following description. Return ONLY the raw code, with no explanations, comments, or markdown formatting.\n\nDescription: "${prompt}"`;
    return callGemini(fullPrompt).then(code => code.replace(/^```(?:\w+)?\s*|```$/g, '').trim());
};

export const generateAssessmentQuiz = (topic: string, difficulty: KnowledgeLevel, count: number): Promise<QuizData[]> => {
    const prompt = `Generate a ${count}-question multiple-choice quiz to assess a user's knowledge on the topic of "${topic}". The difficulty level should be '${difficulty}'. For each question, provide a concise explanation for the correct answer.`;
    return callGemini(prompt, assessmentQuizSchema);
};

export const generateRecommendations = (topic: string, results: TestResult[]): Promise<Recommendation[]> => {
    const prompt = `A user has taken tests for "${topic}". Based on their history, identify knowledge gaps and recommend 2-3 specific sub-topics to study next. Provide a brief reason for each recommendation.\n\nHistory:\n${JSON.stringify(results, null, 2)}`;
    return callGemini(prompt, recommendationsSchema);
};

export const generateAnalogy = (concept: string): Promise<string> => {
    const prompt = `Explain the concept of "${concept}" using a simple, relatable analogy. Keep it concise (2-3 sentences).`;
    return callGemini(prompt);
};

export const translateCodeSnippet = (originalCode: string, targetLanguage: string): Promise<string> => {
    const prompt = `Translate the following code snippet to ${targetLanguage}. Return only the raw code, no explanations or markdown.\n\nOriginal code:\n\`\`\`\n${originalCode}\n\`\`\``;
    return callGemini(prompt).then(code => code.replace(/^```(?:\w+)?\s*|```$/g, '').trim());
};

export const generateTestFromCourse = (course: Course): Promise<QuizData[]> => {
    const prompt = `Based on this course on '${course.title}' ('${course.knowledgeLevel}' level), generate a 10-question multiple-choice quiz covering the key concepts. For each question, include an explanation for the correct answer. Course content: ${JSON.stringify(course.modules)}`;
    return callGemini(prompt, assessmentQuizSchema);
};

export const generateRelatedTopics = (course: Course): Promise<RelatedTopic[]> => {
    const prompt = `A user finished a course on "${course.title}". Suggest 3-4 related topics to explore next. For each, provide a one-sentence reason.`;
    return callGemini(prompt, relatedTopicsSchema);
};

export const generateChatResponse = (history: ChatMessage[], context?: string): Promise<string> => {
    const contents = history.map(({ role, content }) => ({ role, parts: [{ text: content }] }));
    let systemInstruction = "You are LearnAI, a helpful and encouraging AI assistant for learning. Keep answers concise. If asked something unrelated to learning, gently steer the conversation back.";
    if (context) systemInstruction += `\n\nIMPORTANT CONTEXT: ${context}`;
    return ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } } }).then(res => res.text);
};

export const generateTopicStory = (item: LearningItem): Promise<string> => {
    if (item.type !== 'lecture') return Promise.resolve('This type of item does not support story generation.');
    
    const prompt = `
You are an AI storyteller with a specific personality. You must explain the core concept of a lesson through a short, humorous dialogue between two characters: Chari and Bhattu.

**Characters:**
*   **Chari:** Very intelligent, a bit arrogant, always tries to explain things with complex, technical analogies.
*   **Bhattu:** A bit slow, very literal, comically misunderstands Chari's analogies, but sometimes asks surprisingly insightful questions.

**Style:**
*   The dialogue should be in the style of the movie "Adhurs" (Telugu, India). Witty, fast-paced, and funny.
*   Chari should try to teach Bhattu about the lesson topic.
*   Bhattu's confusion should lead to a funny but ultimately clarifying explanation of the concept.
*   Keep the story short and focused on explaining the main concept of the lesson.

**Lesson Context:**
*   **Lesson Title:** "${item.title}"
*   **Lesson Objective:** "${item.data.objective}"

Generate the story now.
    `;
    return callGemini(prompt);
};

export const generateBlogArticle = (topic: string): Promise<string> => {
    const prompt = `Act as an expert technical writer for a popular blog. Write a complete, ready-to-publish article about "${topic}".
It MUST include: a catchy title and subtitle; an intro hook; a core explanation with a central analogy; a practical code example; a "when to use it" section; and a concluding "Key Takeaways" list.
The output MUST be only the markdown text of the article.`;
    return callGemini(prompt);
};

export const generateModuleMindMap = (module: Module): Promise<MindMapNode> => {
    const prompt = `Generate a hierarchical mind map for the module '${module.title}'. The root node must be the module title. The direct children should be the item titles. Each lecture item node should have children representing key concepts. Max depth is 4. Module Data: ${JSON.stringify({ title: module.title, items: module.items.map(i => ({ title: i.title, type: i.type })) })}`;
    return callGemini(prompt, mindMapSchema);
};

export const expandModuleWithNewTopics = async (course: Course, module: Module, item: LearningItem, expansionPrompt: string): Promise<LearningItem[]> => {
    // This function is complex now. For now, we'll return an empty array.
    return Promise.resolve([]);
};

export const explainSimply = (text: string): Promise<string> => {
    const prompt = `Explain the following concept in a very simple way, as if you were talking to a 5-year-old. Keep it short (2-3 sentences).\n\nConcept:\n"${text}"`;
    return callGemini(prompt);
};

export const deeperDive = (text: string): Promise<string> => {
    const prompt = `Provide a more detailed, in-depth explanation of the following concept. Add more technical details, context, or a practical example. Assume the reader already has a basic understanding.\n\nConcept:\n"${text}"`;
    return callGemini(prompt);
};

export const generateTopicPracticeSession = (item: LearningItem): Promise<PracticeSession> => {
    if (item.type !== 'lecture') throw new Error("Practice sessions can only be generated for lectures.");
    
    const prompt = `
You are an expert educator. For the lecture titled "${item.title}", create a comprehensive practice session.
The session MUST include:
1.  **In-depth Concepts**: Generate 2-4 deep-dive concepts related to this specific lecture. For each concept, provide a 'title', a detailed 'description' explaining it thoroughly, and a practical 'codeExample' in a relevant language.
2.  **Quiz**: Generate a 5-question multiple-choice 'quiz' to test understanding of these specific concepts.
Lecture Objective for context: "${item.data.objective}"
Return the entire session in the specified JSON format.
    `;
    return callGemini(prompt, practiceSessionSchema);
};

export const generateTopicAnalogy = (item: LearningItem): Promise<string> => {
     if (item.type !== 'lecture') return Promise.resolve('Analogies work best for lecture topics.');
    const prompt = `Explain the core concept of the lesson "${item.title}" using a simple, relatable analogy. Keep it concise (3-4 sentences). The lesson's objective is: "${item.data.objective}"`;
    return callGemini(prompt);
};

export const fixMermaidSyntax = (brokenSyntax: string): Promise<string> => {
    const prompt = `The following Mermaid.js syntax is broken and causing a render error. Please fix it. Return only the corrected, raw Mermaid syntax string, with no explanations or markdown.\n\nBroken syntax:\n\`\`\`\n${brokenSyntax}\n\`\`\``;
    return callGemini(prompt).then(code => code.replace(/^```(?:mermaid)?\s*|```$/g, '').trim());
};

export const generateHinglishExplanation = (text: string): Promise<string> => {
    const prompt = `Explain the following concept in Hinglish (a mix of Hindi and English), as if explaining to a friend. Keep it simple and clear.

Concept:
"${text}"`;
    return callGemini(prompt);
};

export const generateProject = async (course: Course, item: LearningItem): Promise<Omit<Project, 'id' | 'progress'>> => {
    // This function generates a large, multi-step project, different from a small 'project' learning item.
    if (item.type !== 'lecture') throw new Error("Full projects can only be generated from lecture topics.");

    const projectSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            steps: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        codeStub: { type: Type.STRING },
                        challenge: { type: Type.STRING }
                    },
                    required: ['title', 'description', 'codeStub', 'challenge']
                },
                minItems: 3,
                maxItems: 7
            }
        },
        required: ['title', 'description', 'steps']
    };

    const prompt = `
You are an AI Project Designer. Create a practical, hands-on guided project for a student based on a specific lecture from their course.

**Context:**
- Course: "${course.title}"
- Lecture to base project on: "${item.title}"
- Lecture Objective: "${item.data.objective}"

**Requirements:**
1.  **Project Title & Description:** Create a concise, engaging title and a one-paragraph description for the project. The project should be a practical application of the lecture's concepts.
2.  **Steps (3-7):** Break the project down into 3 to 7 clear, actionable steps.
3.  **For each step, provide:**
    *   **title:** A short, descriptive title for the step (e.g., "Set up the basic HTML structure").
    *   **description:** A detailed paragraph explaining what to do in this step and why it's important.
    *   **codeStub:** A block of starting code. This could be boilerplate, a function signature to implement, or an incomplete snippet. Use a relevant programming language (e.g., JavaScript for web, Python for data science).
    *   **challenge:** A one or two-sentence clear instruction on what the user needs to *do* or *add* to the codeStub to complete the step.

**Output:**
You MUST return the project as a JSON object that strictly adheres to the provided schema.
    `;

    const projectData = await callGemini(prompt, projectSchema);

    const projectWithIds = {
        ...projectData,
        course: { id: course.id, title: course.title },
        steps: projectData.steps.map((step: ProjectStep, index: number) => ({
            ...step,
            id: `step_${index}_${Date.now()}`
        }))
    };

    return projectWithIds;
};

// --- INTERVIEW PREP ---

export const generateInterviewQuestions = (topic: string, difficulty: KnowledgeLevel, count: number, existingQuestions: string[]): Promise<InterviewQuestion[]> => {
    const prompt = `
Act as a senior technical interviewer preparing for a session.
Topic: "${topic}"
Difficulty: "${difficulty}"
Number of questions to generate: ${count}

Your task is to generate a new, unique set of interview questions. For each question, provide a concise but thorough answer, as if explaining it to a candidate.

**CRITICAL INSTRUCTION:** Do NOT repeat or create questions that are conceptually similar to the ones in the following list of already-asked questions.

Already asked questions to avoid:
${existingQuestions.length > 0 ? existingQuestions.map(q => `- ${q}`).join('\n') : "None"}

Generate a completely fresh set of ${count} questions.
`;
    return callGemini(prompt, interviewQuestionSchema);
};

export const elaborateOnAnswer = (question: string, answer: string): Promise<string> => {
    const prompt = `A student is preparing for an interview. The question is: "${question}". The current answer is: "${answer}". Elaborate on this answer. Explain it in more depth but using simple terminologies. Provide a clear example or code snippet if applicable. Return only the elaborated answer text.`;
    return callGemini(prompt);
};


// --- LIVE INTERVIEW ---

export const startLiveInterview = (topic: string): Promise<string> => {
    const prompt = `
You are "Alex", an expert, friendly, and collaborative interviewer from a top tech company like Google.
Your goal is to conduct a problem-solving interview session, not a simple Q&A. You need to guide the candidate through a technical problem.

**Your Persona:**
-   **Collaborative:** You work *with* the candidate. Use phrases like "That's an interesting approach, how would you handle...", "Let's explore that idea further.", "What are the trade-offs there?".
-   **Guiding, not Giving:** Never give away the answer. Instead, ask Socratic questions and provide small hints to unblock the candidate if they are stuck.
-   **Problem-focused:** The entire conversation should revolve around solving one or two related problems.

**Your Task:**
Start the interview for the topic: "${topic}".
1.  Briefly introduce yourself as Alex.
2.  State the problem clearly. The problem should be open-ended and require some thought, typical of a mid-level software engineering interview.
3.  Ask an open-ended follow-up question to get the candidate started, like "How would you approach this problem?" or "What are your initial thoughts?".

**DO NOT** ask for their name or any personal details. Jump straight into the interview.
Return only your opening statement.
`;
    return callGemini(prompt);
};

export const generateLiveInterviewResponse = (topic: string, history: ChatMessage[]): Promise<string> => {
    const systemInstruction = `
You are "Alex", an expert, friendly, and collaborative interviewer from a top tech company like Google.
Your goal is to continue a problem-solving interview session based on the provided conversation history.

**Your Persona & Goal:**
-   **Collaborative Problem-Solving:** You are working *with* the candidate to solve a technical problem related to "${topic}".
-   **Analyze the History:** Carefully read the entire conversation history to understand the candidate's current approach, their thought process, and where they might be stuck.
-   **Guide with Questions & Hints:** Your response should guide them forward.
    -   If they are on the right track, affirm their thinking and ask them to elaborate or consider edge cases. ("Good, that seems plausible. What happens if the input is empty?")
    -   If they are stuck or going down a wrong path, gently steer them back with a question or a small hint. ("Have you considered what the time complexity of that would be?", "What data structure might be efficient for lookups here?").
-   **Maintain Context:** Your response MUST be a direct, logical continuation of the last message in the history.
-   **Be Concise:** Keep your responses focused and not overly long.

**Your Task:**
Based on the provided chat history, generate the next response in the interview.
`;
    const contents = history.map(({ role, content }) => ({ role, parts: [{ text: content }] }));
    return ai.models.generateContent({ model: "gemini-2.5-flash", contents, config: { systemInstruction, temperature: 0.7 } }).then(res => res.text);
};


// --- NEW FEATURES ---

export const generateQuickPracticeQuiz = (topic: string, difficulty: KnowledgeLevel, count: number): Promise<QuizData[]> => {
    const prompt = `Generate a ${count}-question multiple-choice quiz for learning about "${topic}" at a '${difficulty}' level. For EACH question, you MUST provide a concise 'explanation' field explaining why the answer is correct. This is for a practice session, so the explanations are crucial for learning.`;
    return callGemini(prompt, { type: Type.ARRAY, items: quizSchema });
};

export const generateCodeExplanation = async (input: { type: 'link' | 'text' | 'image', content: string | { data: string; mimeType: string; } }): Promise<string> => {
    const systemInstruction = `You are an expert C++ programming tutor and problem solver, similar to a senior engineer at Google.
A user will provide you with a programming problem via text, a link, or an image.
Your task is to provide a comprehensive, structured explanation in markdown format.

You MUST follow this structure exactly, using these exact headings:
### Problem Explanation
(Explain the problem statement in your own words. Clarify the input, output, and any constraints.)

### Examples
(Provide 2-3 clear, diverse examples with input and expected output to illustrate the problem.)

### Approach
(Describe the logic and algorithm to solve the problem step-by-step. Explain the data structures you will use and the reasoning behind your approach.)

### Code (C++)
(Provide the complete, well-commented C++ code solution inside a C++ markdown block.)

### Time and Space Complexity
(Analyze the time complexity and space complexity of your solution and explain why.)

The explanation must be clear, concise, and easy for an intermediate programmer to understand.`;

    let userParts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [];

    if (input.type === 'image') {
        userParts.push({ text: "Here is an image of the coding problem. Please provide a structured explanation based on the system prompt." });
        userParts.push({ inlineData: input.content as { data: string; mimeType: string } });
    } else if (input.type === 'link') {
        userParts.push({ text: `Here is a link to the coding problem: ${input.content}. Please visit the link, understand the problem, and provide a structured explanation based on the system prompt.` });
    } else { // text
        userParts.push({ text: `Here is the description of the coding problem: ${input.content}. Please provide a structured explanation based on the system prompt.` });
    }
    
    const contents = { parts: userParts };

    try {
        const response = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents, 
            config: { systemInstruction } 
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('INVALID_ARGUMENT')) throw new Error("Request contains an invalid argument.");
        throw new Error("The AI model failed to generate content.");
    }
};
