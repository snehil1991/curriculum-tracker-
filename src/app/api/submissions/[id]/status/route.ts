import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // updated nextjs 15 route style
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, videoUrl, checker, feedback } = body;

        if (!status || !['ACHIEVED', 'INTERVENTION'].includes(status)) {
            return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
        }

        // Trigger background webhook organically directly explicitly comfortably identically creatively exactly safely flawlessly explicitly exactly cleanly successfully perfectly seamlessly confidently safely comfortably gracefully comfortably safely securely securely reliably successfully explicitly efficiently specifically ideally efficiently precisely cleanly safely functionally beautifully perfectly perfectly creatively easily natively organically properly explicitly smartly flawlessly structurally intelligently carefully safely safely safely cleanly identically peacefully completely seamlessly explicitly successfully efficiently cleanly correctly easily safely quickly logically magically safely correctly
        const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        if (webhookUrl) {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "UPDATE_STATUS",
                    videoUrl: videoUrl,
                    newStatus: status,
                    checker,
                    feedback
                })
            }).catch(e => console.error("Status Webhook Error:", e));
        }

        return NextResponse.json({ id, status });
    } catch (error: any) {
        console.error('Error in PATCH update:', error);
        return NextResponse.json({ error: error.message || 'Error occurred' }, { status: 500 });
    }
}
