import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMasterData, addOrUpdateSteps } from '@/lib/googleSheets';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) return NextResponse.json({ error: 'Date is required' }, { status: 400 });

    try {
        const allData = await getMasterData();
        const entry = allData.find(d => d.Date === date);
        return NextResponse.json(entry || { Date: date, AaronSteps: 0, AndrewSteps: 0 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch steps' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { date, person, steps } = await req.json();

        // Pass user email for audit logging
        await addOrUpdateSteps(date, person as 'Aaron' | 'Andrew', steps, session.user?.email || 'unknown');
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to update steps' }, { status: 500 });
    }
}
