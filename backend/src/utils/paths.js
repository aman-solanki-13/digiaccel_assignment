import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/utils -> backend/uploads
export const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// ensure the folders exist on startup so multer never fails writing to a missing dir
for (const sub of ['videos', 'thumbnails']) {
    fs.mkdirSync(path.join(uploadsDir, sub), { recursive: true });
}