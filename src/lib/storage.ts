import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function saveVideoUpload(fileBuffer: Buffer, originalFilename: string): Promise<string> {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = path.extname(originalFilename) || '.mp4';
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, fileBuffer);

    // Return the public URL path
    return `/uploads/${filename}`;
}
