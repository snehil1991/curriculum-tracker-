import { NextResponse } from 'next/server';
import { createSubmission, Submission } from '@/lib/database';
import { saveVideoUpload } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract fields
        const state = formData.get('state') as string;
        const center = formData.get('center') as string;
        const trainingWeek = formData.get('trainingWeek') as string;
        const submissionType = formData.get('submissionType') as SubmissionType;
        const videoFile = formData.get('video') as File;

        if (!state || !center || !trainingWeek || !submissionType || !videoFile) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save video
        const arrayBuffer = await videoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const videoUrl = await saveVideoUpload(buffer, videoFile.name);

        // Save to DB
        const submission = await createSubmission({
            state,
            center,
            trainingWeek,
            submissionType,
            videoUrl,
        });

        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/submissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const { getSubmissions } = await import('@/lib/database');
        const submissions = await getSubmissions();
        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Error in GET /api/submissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
