import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export type SubmissionStatus = 'PENDING' | 'ACHIEVED' | 'INTERVENTION';
export type SubmissionType = 'Day 1 Intro' | 'Day 5/6 Execution';

export interface Submission {
    id: string;
    coachName: string;
    batch: string;
    state: string;
    center: string;
    trainingWeek: string;
    submissionType: SubmissionType;
    videoUrl: string; // URL to the uploaded video
    status: SubmissionStatus;
    createdAt: number;
}

// In a real app we'd use PostgreSQL/Supabase, but here we mock it local JSON file for the prototype
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

function ensureDb() {
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ submissions: [] }));
    }
}

export async function getSubmissions(): Promise<Submission[]> {
    ensureDb();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data).submissions;
}

export async function createSubmission(
    submissionData: Omit<Submission, 'id' | 'status' | 'createdAt'>
): Promise<Submission> {
    ensureDb();
    const subs = await getSubmissions();
    const newSub: Submission = {
        ...submissionData,
        id: uuidv4(),
        status: 'PENDING',
        createdAt: Date.now(),
    };
    subs.push(newSub);
    fs.writeFileSync(DB_FILE, JSON.stringify({ submissions: subs }));
    return newSub;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission> {
    ensureDb();
    const subs = await getSubmissions();
    const subIndex = subs.findIndex(s => s.id === id);
    if (subIndex === -1) throw new Error('Submission not found');

    subs[subIndex].status = status;
    fs.writeFileSync(DB_FILE, JSON.stringify({ submissions: subs }));
    return subs[subIndex];
}
