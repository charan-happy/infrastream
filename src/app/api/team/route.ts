import { NextResponse } from 'next/server';
import { generateTeamMembers } from '@/lib/demo-data-extended';

export async function GET() {
  return NextResponse.json({ members: generateTeamMembers(), source: 'demo' });
}
