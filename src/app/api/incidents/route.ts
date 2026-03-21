import { NextResponse } from 'next/server';
import { generateIncidentCorrelations } from '@/lib/demo-data-incidents';

export async function GET() {
  const incidents = generateIncidentCorrelations();
  return NextResponse.json({ incidents, source: 'demo' });
}
