export interface NotificationChannel {
  id: string;
  type: 'slack' | 'discord';
  name: string;
  webhook_url: string;
  events: string[]; // which event types to notify on
  severities: string[]; // which severities to notify on
  enabled: boolean;
}

// In-memory store for demo mode (PostgreSQL in real mode)
let channels: NotificationChannel[] = [
  {
    id: 'demo-slack',
    type: 'slack',
    name: 'DevOps Alerts',
    webhook_url: '',
    events: ['incident', 'deployment'],
    severities: ['critical', 'warning'],
    enabled: false,
  },
];

export function getChannels(): NotificationChannel[] {
  return channels;
}

export function addChannel(channel: Omit<NotificationChannel, 'id'>): NotificationChannel {
  const newChannel = { ...channel, id: `ch-${Date.now()}` };
  channels.push(newChannel);
  return newChannel;
}

export function updateChannel(id: string, updates: Partial<NotificationChannel>): NotificationChannel | null {
  const idx = channels.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  channels[idx] = { ...channels[idx], ...updates };
  return channels[idx];
}

export function removeChannel(id: string): boolean {
  const before = channels.length;
  channels = channels.filter((c) => c.id !== id);
  return channels.length < before;
}

async function sendSlack(webhookUrl: string, event: Record<string, unknown>): Promise<boolean> {
  if (!webhookUrl) return false;
  try {
    const color = event.severity === 'critical' ? '#ef4444' : event.severity === 'warning' ? '#f59e0b' : '#10b981';
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${event.title}*\n${event.type} | ${event.repo} | ${event.branch}\nStatus: \`${event.status}\` | Severity: \`${event.severity}\``,
              },
            },
            {
              type: 'context',
              elements: [
                { type: 'mrkdwn', text: `By *${event.author}* | ${event.created_at}` },
              ],
            },
          ],
        }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendDiscord(webhookUrl: string, event: Record<string, unknown>): Promise<boolean> {
  if (!webhookUrl) return false;
  try {
    const color = event.severity === 'critical' ? 0xef4444 : event.severity === 'warning' ? 0xf59e0b : 0x10b981;
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: String(event.title),
          description: `**${event.type}** in \`${event.repo}\` on \`${event.branch}\``,
          color,
          fields: [
            { name: 'Status', value: String(event.status), inline: true },
            { name: 'Severity', value: String(event.severity), inline: true },
            { name: 'Author', value: String(event.author), inline: true },
          ],
          timestamp: event.created_at,
          footer: { text: 'InfraStream' },
        }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifyEvent(event: Record<string, unknown>): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const channel of channels) {
    if (!channel.enabled || !channel.webhook_url) continue;
    if (!channel.events.includes(String(event.type))) continue;
    if (!channel.severities.includes(String(event.severity))) continue;

    const ok = channel.type === 'slack'
      ? await sendSlack(channel.webhook_url, event)
      : await sendDiscord(channel.webhook_url, event);

    if (ok) sent++;
    else failed++;
  }

  return { sent, failed };
}
