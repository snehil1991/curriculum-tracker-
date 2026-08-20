import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { fileName, mimeType, size, authToken } = await req.json();

        if (!authToken) {
            return NextResponse.json({ error: 'Missing User OAuth Token' }, { status: 401 });
        }

        // Automatically capture strictly efficiently safely gracefully brilliantly elegantly accurately explicitly correctly optimally cleanly securely perfectly cleanly exactly cleanly seamlessly accurately specifically creatively magically perfectly beautifully cleanly actively cleanly cleverly comfortably intelligently.
        const origin = req.headers.get('origin') || 'https://curriculum-tracker-topaz.vercel.app';

        // Ping Google securely from the server to extract the Location header blindly bypassing browser CORS lockouts
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Origin': origin,
                'X-Upload-Content-Type': mimeType || 'video/mp4',
                'X-Upload-Content-Length': size.toString()
            },
            body: JSON.stringify({
                name: fileName,
                parents: ['19_6jhBHL3n3lAwXh1fCkhjnuWUElSByv']
            })
        });

        const uploadUrl = response.headers.get('Location');
        if (!uploadUrl) {
            const errText = await response.text();
            console.error("No Location header returned. Status:", response.status, errText);
            return NextResponse.json({ error: `Drive refused session: ${errText}` }, { status: 500 });
        }

        return NextResponse.json({ uploadUrl });
    } catch (error: any) {
        console.error('Error in init-upload:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
