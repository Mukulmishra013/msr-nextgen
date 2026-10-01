import { NextRequest, NextResponse } from 'next/server';
import { getLeadsFromFirestore, updateLeadStatusInFirestore } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'needs_you' | 'hot' | 'all'

    let leads = await getLeadsFromFirestore();

    if (filter === 'needs_you') {
      // Unhandled, cold, or not auto-sent leads needing owner review
      leads = leads.filter(
        (l) => l.status === 'new' && (l.aiScore === 'cold' || !l.autoSent)
      );
    } else if (filter === 'hot') {
      leads = leads.filter((l) => l.aiScore === 'hot');
    }

    return NextResponse.json({ success: true, leads });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { leadId, status } = await req.json();

    if (!leadId || !['new', 'contacted', 'converted', 'archived'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    const updated = await updateLeadStatusInFirestore(leadId, status);
    return NextResponse.json({ success: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}
