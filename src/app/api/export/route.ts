import { NextRequest, NextResponse } from 'next/server';
import { generateDemoEvents, generateDORAMetrics, generateDORAHistory } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type') || 'events'; // 'events' | 'dora'
  const format = searchParams.get('format') || 'csv';

  if (type === 'dora') {
    const history = generateDORAHistory(30);
    if (format === 'csv') {
      const header = 'Date,Deployment Frequency,Lead Time (hrs),Change Failure Rate (%),MTTR (hrs)\n';
      const rows = history.map((h) =>
        `${h.date},${h.deployment_frequency},${h.lead_time},${h.change_failure_rate},${h.mttr}`
      ).join('\n');
      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="infrastream-dora-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON export
    const metrics = generateDORAMetrics();
    return NextResponse.json({ metrics, history }, {
      headers: { 'Content-Disposition': `attachment; filename="infrastream-dora-${new Date().toISOString().split('T')[0]}.json"` },
    });
  }

  // Events export
  const events = generateDemoEvents(100);
  if (format === 'csv') {
    const header = 'ID,Type,Repo,Branch,Title,Status,Severity,Author,Created At\n';
    const rows = events.map((e) =>
      `"${e.id}","${e.type}","${e.repo}","${e.branch}","${e.title.replace(/"/g, '""')}","${e.status}","${e.severity}","${e.author}","${e.created_at}"`
    ).join('\n');
    return new NextResponse(header + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="infrastream-events-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ events }, {
    headers: { 'Content-Disposition': `attachment; filename="infrastream-events-${new Date().toISOString().split('T')[0]}.json"` },
  });
}
