import { NextResponse } from 'next/server';
import { createSubmission } from '@/lib/database';
import { SubmissionType } from '@/lib/database';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const coachName = formData.get('coachName') as string;
        const batch = formData.get('batch') as string;
        const state = formData.get('state') as string;
        const center = formData.get('center') as string;
        const trainingWeek = formData.get('trainingWeek') as string;
        const submissionType = formData.get('submissionType') as SubmissionType;
        const existingDriveFileId = formData.get('existingDriveFileId') as string;

        if (!coachName || !state || !center || !trainingWeek || !submissionType || !existingDriveFileId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // FIRE GOOGLE SHEET & DRIVE WEBHOOK
        const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbznG0dTjM2VvFtjAW5zSVe4OgE-6pC1wsDGobMXVYrskTno2qJqw0lM-qvRMjs7xni6/exec';

        let remoteDriveUrl = '';

        if (webhookUrl) {
            try {
                console.log("Sending payload to Google Apps Script...");

                const payload = {
                    coachName,
                    batch: batch || 'No Batch',
                    state,
                    center,
                    trainingWeek,
                    submissionType,
                    existingDriveFileId,
                    action: "MOVE_AND_LOG",
                    timestamp: new Date().toISOString()
                };

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (result.url) {
                    remoteDriveUrl = result.url;
                    console.log("Successfully retrieved mapped Google Drive link:", remoteDriveUrl);
                }
            } catch (e) {
                console.error("Failed to forward payload to Google Apps Script webhook:", e);
            }
        }

        // Save to Local Mock DB so Senior Dashboard loads instantly
        const submission = await createSubmission({
            coachName,
            batch: batch || 'No Batch',
            state,
            center,
            trainingWeek,
            submissionType,
            videoUrl: remoteDriveUrl || `https://drive.google.com/file/d/${existingDriveFileId}/view?usp=drivesdk`,
        });

        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/submit-video:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
