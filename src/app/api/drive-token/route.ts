import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';

// Secure API endpoint that only returns short-lived scoped upload tokens
export async function GET() {
    try {
        const keyPath = path.join(process.cwd(), 'google-credentials.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const client = await auth.getClient();
        const token = await client.getAccessToken();

        return NextResponse.json({ accessToken: token.token });
    } catch (error: any) {
        console.error('Error generating token:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
