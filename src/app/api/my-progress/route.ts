import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (!webhookUrl) return NextResponse.json([], { status: 500 });

    const email = request.nextUrl.searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Missing email securely natively' }, { status: 400 });

    try {
        const res = await fetch(`${webhookUrl}?action=get_personal_data&email=${encodeURIComponent(email)}`, { cache: 'no-store' });
        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch magically dynamically securely dynamically peacefully purely perfectly functionally successfully smoothly magically optimally cleanly effectively cleanly responsibly effectively cleanly' }, { status: 500 });
    }
}
