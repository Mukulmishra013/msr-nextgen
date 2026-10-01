import { NextRequest, NextResponse } from 'next/server';
import {
  getBrandsFromFirestore,
  saveBrandToFirestore,
  deleteBrandFromFirestore,
} from '@/lib/firebaseAdmin';
import { BrandClient } from '@/types';

export async function GET() {
  try {
    const brands = await getBrandsFromFirestore();
    return NextResponse.json({ success: true, brands });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, handle, category, url, logoUrl } = body;

    if (!name || !handle || !category || !url) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }

    const brand: BrandClient = {
      id: body.id || `brand_${Date.now()}`,
      name,
      handle,
      category,
      url,
      logoUrl: logoUrl || '',
      initials: name.substring(0, 2).toUpperCase(),
    };

    const saved = await saveBrandToFirestore(brand);
    return NextResponse.json({ success: saved, brand });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save brand' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Brand ID required' }, { status: 400 });
    }

    const deleted = await deleteBrandFromFirestore(id);
    return NextResponse.json({ success: deleted });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete brand' }, { status: 500 });
  }
}
