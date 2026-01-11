import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

// Load env vars if running standalone
dotenv.config({ path: '.env.local' });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function migrate() {
    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        console.error('Error: Environment variables not set.');
        process.exit(1);
    }

    console.log('Starting migration...');

    const serviceAccountAuth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['MasterData'];
    if (sheet) {
        console.log('Sheet "MasterData" already exists. Clearing content...');
        await sheet.clear();
        await sheet.setHeaderRow(['Date', 'AaronSteps', 'AndrewSteps']);
    } else {
        console.log('Creating "MasterData" sheet...');
        sheet = await doc.addSheet({
            title: 'MasterData',
            headerValues: ['Date', 'AaronSteps', 'AndrewSteps']
        });
    }

    const csvFile = path.join(process.cwd(), 'step data.csv');
    let fileContent = fs.readFileSync(csvFile, 'utf-8');

    // Remove UTF-8 BOM if present
    if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
    }

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    console.log(`Parsed ${records.length} records. Formatting...`);

    const formattedRows = records.map((r: any) => {
        const keys = Object.keys(r);
        const dateKey = keys.find(k => k.toLowerCase().includes('date'));
        const aaronKey = keys.find(k => k.toLowerCase().includes('aaron'));
        const andrewKey = keys.find(k => k.toLowerCase().includes('andrew'));

        if (!dateKey || !r[dateKey]) return null;

        const rawDate = r[dateKey];
        const dateParts = rawDate.split('/');
        let formattedDate = rawDate;
        if (dateParts.length === 3) {
            const month = dateParts[0].padStart(2, '0');
            const day = dateParts[1].padStart(2, '0');
            const year = dateParts[2];
            formattedDate = `${year}-${month}-${day}`;
        }

        const aaronStepsStr = aaronKey ? r[aaronKey] : '0';
        const andrewStepsStr = andrewKey ? r[andrewKey] : '0';

        const aaronSteps = parseInt(aaronStepsStr.replace(/,/g, '')) || 0;
        const andrewSteps = parseInt(andrewStepsStr.replace(/,/g, '')) || 0;

        return {
            Date: formattedDate,
            AaronSteps: isNaN(aaronSteps) ? 0 : aaronSteps,
            AndrewSteps: isNaN(andrewSteps) ? 0 : andrewSteps,
        };
    }).filter((r: any) => r !== null);

    // Sort by date just in case
    formattedRows.sort((a: any, b: any) => a.Date.localeCompare(b.Date));

    // Batch insert to avoid rate limits and for speed
    const BATCH_SIZE = 500;
    for (let i = 0; i < formattedRows.length; i += BATCH_SIZE) {
        const batch = formattedRows.slice(i, i + BATCH_SIZE);
        console.log(`Uploading batch ${i / BATCH_SIZE + 1}...`);
        await sheet.addRows(batch);
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);
