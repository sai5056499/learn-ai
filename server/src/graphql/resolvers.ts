

import { User } from '../models/User';
import { Course } from '../models/Course';
import { Project } from '../models/Project';
import { Types } from 'mongoose';
import * as geminiService from '../services/geminiService';

const XP_PER_LESSON = 100;
const calculateRequiredXp = (level: number) => level * 500;

export const root = {
    // --- QUERIES ---
    me: async ({ email }: { email: string }) => {
        const user = await User.findOne({ email })
            .populate('courses')
            .populate('projects')
            .lean({ virtuals: true });
        
        if (user?.courses) {
            for (const course of user.courses as any[]) {
                if (course.progress instanceof Map) {
                    course.progress = Object.fromEntries(course.progress);
                }
            }
        }
        if (user?.projects) {
            for (const project of user.projects as any[]) {
                if (project.progress instanceof Map) {
                    project.progress = Object.fromEntries(project.progress);
                }
            }
        }
        
        return user;
    },

    // --- MUTATIONS ---
    login: async ({ email, name }: { email: string, name: string }) => {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name, courses: [], folders: [], projects: [] });
        }
        return root.me({ email });
    },

    createCourse: async ({ email, courseInput }: { email: string, courseInput: any }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const newCourse = new Course({ ...courseInput, user: user._id });
        await newCourse.save();
        
        user.courses.push(newCourse._id);
        await user.save();
        
        const courseJson = newCourse.toJSON();
        if (courseJson.progress instanceof Map) {
            courseJson.progress = Object.fromEntries(courseJson.progress);
        }
        return courseJson;
    },

    deleteCourse: async ({ email, courseId }: { email: string, courseId: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const courseObjectId = new Types.ObjectId(courseId);

        // Remove from user's course list
        user.courses.pull(courseObjectId);
        // Remove from any folder
        for (const folder of user.folders) {
            folder.courses.pull(courseObjectId);
        }

        await user.save();
        await Course.findByIdAndDelete(courseId);
        
        return true;
    },

    toggleLessonProgress: async ({ email, courseId, lessonId }: { email: string, courseId: string, lessonId: string }) => {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const user = await User.findOne({ email });
        if (!user || course.user.toString() !== user._id.toString()) {
            throw new Error("Unauthorized");
        }
        
        const wasCompleted = course.progress.has(lessonId);

        if (wasCompleted) {
            course.progress.delete(lessonId);
            // Note: XP is not removed when un-completing a lesson.
        } else {
            course.progress.set(lessonId, Date.now());
            // Award XP only when completing for the first time
            user.xp += XP_PER_LESSON;
            
            // Check for level up. Use a loop in case of multiple level-ups.
            let requiredXp = calculateRequiredXp(user.level);
            while (user.xp >= requiredXp) {
                user.level += 1;
                user.xp -= requiredXp;
                requiredXp = calculateRequiredXp(user.level);
            }
            
            await user.save();
        }

        await course.save();
        
        return {
            progress: Object.fromEntries(course.progress),
            xp: user.xp,
            level: user.level
        };
    },

    saveNote: async ({ email, courseId, lessonId, note }: { email: string, courseId: string, lessonId: string, note: string }) => {
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        const user = await User.findOne({ email });
        if (!user || course.user.toString() !== user._id.toString()) {
            throw new Error("Unauthorized");
        }
        
        let lessonFound = false;
        for (const module of course.modules) {
            const lesson = module.lessons.find((l: any) => l.id === lessonId);
            if (lesson) {
                lesson.notes = note;
                lessonFound = true;
                break;
            }
        }

        if (!lessonFound) throw new Error("Lesson not found");

        await course.save();
        return true;
    },

    createFolder: async ({ email, folderName }: { email: string, folderName: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const newFolder = { name: folderName, courses: [] };
        user.folders.push(newFolder as any);
        await user.save();

        // Return the newly created folder, which now has an ID
        const createdFolder = user.folders.slice(-1)[0];
        return createdFolder.toJSON();
    },
    
    updateFolderName: async({ email, folderId, newName }: { email: string, folderId: string, newName: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const folder = user.folders.id(folderId);
        if (folder) {
            folder.name = newName;
            await user.save();
            return folder.toJSON();
        }
        throw new Error("Folder not found");
    },
    
    deleteFolder: async ({ email, folderId }: { email: string, folderId: string }) => {
        await User.updateOne(
            { email },
            { $pull: { folders: { _id: new Types.ObjectId(folderId) } } }
        );
        return true;
    },
    
    moveCourseToFolder: async ({ email, courseId, folderId }: { email: string, courseId: string, folderId: string | null }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const courseObjectId = new Types.ObjectId(courseId);

        // Remove course from all existing folders first
        for (const folder of user.folders) {
            folder.courses.pull(courseObjectId);
        }
        
        // Add to new folder if one is specified
        if (folderId) {
            const targetFolder = user.folders.id(folderId);
            if (targetFolder) {
                // Avoid duplicates
                if (targetFolder.courses.indexOf(courseObjectId) === -1) {
                    targetFolder.courses.push(courseObjectId);
                }
            } else {
                throw new Error("Target folder not found");
            }
        }

        await user.save();
        
        // Return the updated user by calling the main query logic
        return root.me({ email });
    },

    // --- PROJECT MUTATIONS ---

    createProject: async ({ email, projectInput }: { email: string, projectInput: any }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const newProject = new Project({ ...projectInput, user: user._id });
        await newProject.save();

        user.projects.push(newProject._id);
        await user.save();

        const projectJson = newProject.toJSON();
        if (projectJson.progress && projectJson.progress instanceof Map) {
            projectJson.progress = Object.fromEntries(projectJson.progress);
        }
        return projectJson;
    },

    deleteProject: async ({ email, projectId }: { email: string, projectId: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        await Project.deleteOne({ _id: new Types.ObjectId(projectId), user: user._id });
        user.projects.pull(new Types.ObjectId(projectId));
        await user.save();
        
        return true;
    },

    toggleProjectStepProgress: async ({ email, projectId, stepId }: { email: string, projectId: string, stepId: string }) => {
        const project = await Project.findById(projectId);
        if (!project) throw new Error("Project not found");
        
        const user = await User.findOne({ email });
        if (!user || project.user.toString() !== user._id.toString()) {
            throw new Error("Unauthorized");
        }

        if (project.progress.has(stepId)) {
            project.progress.delete(stepId);
        } else {
            project.progress.set(stepId, Date.now());
        }

        await project.save();
        return Object.fromEntries(project.progress);
    },

    // --- INTERVIEW PREP MUTATIONS ---

    generateInterviewQuestions: async ({ email, courseId, difficulty, count }: { email: string; courseId: string; difficulty: string; count: number; }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const course = await Course.findById(courseId);
        if (!course || course.user.toString() !== user._id.toString()) {
            throw new Error("Course not found or unauthorized");
        }
        
        const existingQuestions = course.interviewQuestionSets?.flatMap(set => set.questions.map(q => q.question)) || [];
        const newQuestions = await geminiService.generateInterviewQuestions(course.title, difficulty, count, existingQuestions);

        const newQuestionSet = {
            id: new Types.ObjectId().toString(),
            timestamp: Date.now(),
            difficulty,
            questionCount: newQuestions.length,
            questions: newQuestions,
        };

        course.interviewQuestionSets = course.interviewQuestionSets || [];
        course.interviewQuestionSets.push(newQuestionSet);
        
        await course.save();
        return course.toJSON();
    },

    elaborateAnswer: async ({ email, courseId, questionSetId, qIndex, question, answer }: { email: string; courseId: string; questionSetId: string; qIndex: number; question: string; answer: string; }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const course = await Course.findById(courseId);
        if (!course || course.user.toString() !== user._id.toString()) {
            throw new Error("Course not found or unauthorized");
        }

        const elaboratedAnswer = await geminiService.elaborateOnAnswer(question, answer);
        
        const questionSet = course.interviewQuestionSets?.find(set => set.id === questionSetId);
        if (questionSet && questionSet.questions[qIndex]) {
            questionSet.questions[qIndex].answer = elaboratedAnswer;
            await course.save();
            return questionSet;
        }

        throw new Error("Question set or question index not found");
    },

    // --- LIVE INTERVIEW MUTATIONS ---

    startLiveInterview: async ({ email, topic }: { email: string; topic: string }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        const message = await geminiService.startLiveInterview(topic);
        return { message };
    },

    sendLiveInterviewMessage: async ({ email, topic, history }: { email: string; topic: string; history: any[] }) => {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");
        
        const message = await geminiService.generateLiveInterviewResponse(topic, history);
        return { message };
    },
};