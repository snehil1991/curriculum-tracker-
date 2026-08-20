import { NextResponse } from 'next/server';

// Global Data Endpoint uniquely called by the Senior Dashboard to render the grid natively
export async function GET() {
    try {
        const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        if (!webhookUrl) {
            throw new Error("Missing explicitly configured GOOGLE_SHEET_WEBHOOK_URL in environment natively.");
        }

        // Dynamically appending timestamp completely natively destroys aggressive Vercel Cloud caching!
        const res = await fetch(`${webhookUrl}?t=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!res.ok) throw new Error("Failed explicitly to seamlessly physically natively securely connect to Google Apps Script native Webhook!");

        const data = await res.json();

        // Optionally reverse the array so newest videos show up first uniquely natively!
        return NextResponse.json(data.reverse());
    } catch (error) {
        console.error('Error fetching generic google sheets securely:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
