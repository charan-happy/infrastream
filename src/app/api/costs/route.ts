import { NextRequest, NextResponse } from 'next/server';
import { generateDeployCosts, generateRepoCosts, generateCostHistory } from '@/lib/demo-data-extended';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const view = searchParams.get('view') || 'deploys';
  const days = parseInt(searchParams.get('days') || '30');

  if (view === 'repos') {
    return NextResponse.json({ repos: generateRepoCosts(), source: 'demo' });
  }

  if (view === 'history') {
    return NextResponse.json({ history: generateCostHistory(days), source: 'demo' });
  }

  // Default: deploy costs
  return NextResponse.json({ costs: generateDeployCosts(), source: 'demo' });
}
