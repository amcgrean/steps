import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('Google Sheets environment variables are not set.');
}

const serviceAccountAuth = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(SPREADSHEET_ID!, serviceAccountAuth);

export async function getMasterData() {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['MasterData'];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map(row => ({
        Date: row.get('Date'),
        AaronSteps: parseInt(row.get('AaronSteps')) || 0,
        AndrewSteps: parseInt(row.get('AndrewSteps')) || 0,
    }));
}

export async function addOrUpdateSteps(date: string, person: 'Aaron' | 'Andrew', steps: number, userEmail: string) {
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle['MasterData'];

    if (!sheet) {
        sheet = await doc.addSheet({ title: 'MasterData', headerValues: ['Date', 'AaronSteps', 'AndrewSteps'] });
    }

    const rows = await sheet.getRows();
    const existingRow = rows.find(row => row.get('Date') === date);

    const timestamp = new Date().toISOString();
    const oldAaron = existingRow ? (parseInt(existingRow.get('AaronSteps')) || 0) : 0;
    const oldAndrew = existingRow ? (parseInt(existingRow.get('AndrewSteps')) || 0) : 0;

    if (existingRow) {
        existingRow.set(`${person}Steps`, steps);
        await existingRow.save();
    } else {
        const newRow: any = { Date: date };
        newRow[`${person}Steps`] = steps;
        const otherPerson = person === 'Aaron' ? 'Andrew' : 'Aaron';
        newRow[`${otherPerson}Steps`] = 0;
        await sheet.addRow(newRow);
    }

    // Log the change if it was an update or if person had non-zero steps before (unlikely for new row but possible logic-wise)
    const newAaron = person === 'Aaron' ? steps : oldAaron;
    const newAndrew = person === 'Andrew' ? steps : oldAndrew;

    // Only log if something actually changed
    if (oldAaron !== newAaron || oldAndrew !== newAndrew) {
        await addAuditLog({
            Timestamp: timestamp,
            User: userEmail,
            DateUpdated: date,
            OldAaronSteps: oldAaron,
            NewAaronSteps: newAaron,
            OldAndrewSteps: oldAndrew,
            NewAndrewSteps: newAndrew
        });
    }
}

async function addAuditLog(log: any) {
    let sheet = doc.sheetsByTitle['AuditLog'];
    if (!sheet) {
        sheet = await doc.addSheet({
            title: 'AuditLog',
            headerValues: ['Timestamp', 'User', 'DateUpdated', 'OldAaronSteps', 'NewAaronSteps', 'OldAndrewSteps', 'NewAndrewSteps']
        });
    }
    await sheet.addRow(log);
}
