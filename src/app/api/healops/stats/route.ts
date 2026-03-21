import { NextResponse } from 'next/server';
import { generateHealOpsStats, generateRepoHealth, generateHealingTimeline, generateDORAComparison } from '@/lib/demo-data-healops';

export async function GET() {
  return NextResponse.json({
    stats: generateHealOpsStats(),
    repo_health: generateRepoHealth(),
    timeline: generateHealingTimeline(30),
    dora_comparison: generateDORAComparison(),
    source: 'demo',
  });
}
