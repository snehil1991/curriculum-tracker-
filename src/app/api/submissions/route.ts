import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/database';

// Global Data Endpoint uniquely called by the Senior Dashboard specifically correctly
export async function GET() {
    try {
        const data = await getSubmissions();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching submissions natively:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
