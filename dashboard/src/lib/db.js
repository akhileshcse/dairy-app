import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.json');

// Initialize with some default structure if empty
const defaultData = {
    milkLogs: [],
    livestock: {
        cows: { milking: 0, dry: 0, heifer: 0, calves: 0 },
        buffaloes: { milking: 0, dry: 0, heifer: 0, calves: 0 },
    },
    healthLogs: [],
    inventoryLogs: []
};

function ensureDb() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
    }
}

export function readDb() {
    ensureDb();
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
}

export function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
