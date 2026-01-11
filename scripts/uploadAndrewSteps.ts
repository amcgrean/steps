import fs from 'fs';
import path from 'path';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function uploadAndrewSteps() {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    const serviceAccountAuth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['MasterData'];
    const auditSheet = doc.sheetsByTitle['AuditLog'];

    const fileContent = fs.readFileSync(path.join(process.cwd(), 'andrew-steps.txt'), 'utf-8');
    const lines = fileContent.trim().split('\n');

    for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length < 2) continue;

        const day = parts[0].padStart(2, '0');
        const steps = parseInt(parts[1].replace(/,/g, '').replace(/\./g, ''));
        const date = `2026-01-${day}`;

        console.log(`Processing ${date}: ${steps} steps`);

        const rows = await sheet.getRows();
        const existingRow = rows.find(r => r.get('Date') === date);

        const oldAaron = existingRow ? (parseInt(existingRow.get('AaronSteps')) || 0) : 0;
        const oldAndrew = existingRow ? (parseInt(existingRow.get('AndrewSteps')) || 0) : 0;

        if (existingRow) {
            existingRow.set('AndrewSteps', steps);
            await existingRow.save();
        } else {
            await sheet.addRow({
                Date: date,
                AaronSteps: 0,
                AndrewSteps: steps
            });
        }

        // Log to AuditLog
        if (!auditSheet) continue; // Skip if audit log sheet somehow missing, but we should create it if needed

        await auditSheet.addRow({
            Timestamp: new Date().toISOString(),
            User: 'system-migration',
            DateUpdated: date,
            OldAaronSteps: oldAaron,
            NewAaronSteps: oldAaron,
            OldAndrewSteps: oldAndrew,
            NewAndrewSteps: steps
        });
    }

    console.log('Upload complete!');
}

uploadAndrewSteps().catch(console.error);
