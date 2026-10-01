import { NextRequest, NextResponse } from 'next/server';
import {
  getCaseStudyStatsFromFirestore,
  saveCaseStudyStatsToFirestore,
} from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const stats = await getCaseStudyStatsFromFirestore();
    return NextResponse.json({ success: true, stats });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch case study' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { stats } = await req.json();

    if (!Array.isArray(stats) || stats.length === 0) {
      return NextResponse.json({ success: false, error: 'Stats array required' }, { status: 400 });
    }

    const saved = await saveCaseStudyStatsToFirestore(stats);
    return NextResponse.json({ success: saved, stats });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save case study' }, { status: 500 });
  }
}
