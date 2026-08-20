import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl) return NextResponse.json([], { status: 500 });

    try {
        const res = await fetch(`${webhookUrl}?action=get_coaches`, { cache: 'no-store' });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch coaches' }, { status: 500 });
    }
}
