import { NextResponse } from 'next/server';
import { updateSubmissionStatus, SubmissionStatus } from '@/lib/database';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // updated nextjs 15 route style
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['ACHIEVED', 'INTERVENTION'].includes(status)) {
            return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
        }

        const updated = await updateSubmissionStatus(id, status as SubmissionStatus);

        // Trigger background webhook update!
        const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbznG0dTjM2VvFtjAW5zSVe4OgE-6pC1wsDGobMXVYrskTno2qJqw0lM-qvRMjs7xni6/exec';
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "UPDATE_STATUS",
                videoUrl: updated.videoUrl, // We map by matching the exact Video URL link
                newStatus: status
            })
        }).catch(e => console.error("Status Webhook Error:", e));

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Error in PATCH update:', error);
        return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
    }
}
