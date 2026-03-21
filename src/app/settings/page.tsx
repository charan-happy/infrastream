'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Plus, Trash2, TestTube, Bell } from 'lucide-react';

interface HealthData {
  demo_mode: boolean;
  services: { kafka: boolean; postgresql: boolean; valkey: boolean };
}

interface NotificationChannel {
  id: string;
  type: 'slack' | 'discord';
  name: string;
  webhook_url: string;
  events: string[];
  severities: string[];
  enabled: boolean;
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [copied, setCopied] = useState('');
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => {});
    fetch('/api/notifications').then((r) => r.json()).then((d) => setChannels(d.channels || [])).catch(() => {});
  }, []);

  async function addNotificationChannel() {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'slack', name: 'New Channel', events: ['incident', 'deployment'], severities: ['critical', 'warning'] }),
    });
    const data = await res.json();
    setChannels((prev) => [...prev, data.channel]);
  }

  async function deleteChannel(id: string) {
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    setChannels((prev) => prev.filter((c) => c.id !== id));
  }

  async function updateChannelField(id: string, field: string, value: unknown) {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    });
    setChannels((prev) => prev.map((c) => c.id === id ? { ...c, [field]: value } : c));
  }

  async function testNotifications() {
    setTestResult('Sending...');
    const res = await fetch('/api/notifications/test', { method: 'POST' });
    const data = await res.json();
    setTestResult(`Sent: ${data.sent}, Failed: ${data.failed}`);
    setTimeout(() => setTestResult(''), 3000);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  const [webhookUrl, setWebhookUrl] = useState('/api/webhooks/github');

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhooks/github`);
  }, []);

  const envVars = [
    { name: 'KAFKA_BROKER', desc: 'Aiven Kafka broker host:port', example: 'kafka-xxx.aiven.com:12345' },
    { name: 'KAFKA_USERNAME', desc: 'Kafka SASL username', example: 'avnadmin' },
    { name: 'KAFKA_PASSWORD', desc: 'Kafka SASL password', example: '***' },
    { name: 'PG_CONNECTION_URI', desc: 'Aiven PostgreSQL connection URI', example: 'postgres://avnadmin:***@pg-xxx.aiven.com:12345/defaultdb?sslmode=require' },
    { name: 'VALKEY_URI', desc: 'Aiven Valkey connection URI', example: 'rediss://default:***@valkey-xxx.aiven.com:12345' },
    { name: 'GITHUB_WEBHOOK_SECRET', desc: 'GitHub webhook secret (optional)', example: 'your-secret-here' },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Configure Aiven services and GitHub webhook integration
        </p>
      </div>

      {/* Service Status */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">Service Status</h3>
        <div className="mt-4 space-y-3">
          {health && (
            <>
              <StatusRow label="Aiven Kafka" connected={health.services.kafka} />
              <StatusRow label="Aiven PostgreSQL" connected={health.services.postgresql} />
              <StatusRow label="Aiven Valkey" connected={health.services.valkey} />
              <div className="mt-4 rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-400">
                  {health.demo_mode
                    ? 'Running in demo mode with mock data. Configure Aiven services to use real data.'
                    : 'All services connected. Events are being processed in real-time.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Webhook URL */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">GitHub Webhook</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Point your GitHub repository webhook to this URL to start streaming events.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 font-mono text-sm text-emerald-400">
            {webhookUrl}
          </code>
          <button
            onClick={() => copyToClipboard(webhookUrl, 'webhook')}
            className="rounded-lg bg-zinc-800 p-2.5 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          >
            {copied === 'webhook' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Supported events: push, pull_request, deployment, deployment_status, issues, check_run, check_suite
        </div>
      </div>

      {/* Environment Variables */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">Environment Variables</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Add these to your <code className="text-emerald-400">.env.local</code> file:
        </p>
        <div className="mt-4 space-y-3">
          {envVars.map((v) => (
            <div key={v.name} className="rounded-lg bg-zinc-800/50 p-3">
              <div className="flex items-center justify-between">
                <code className="font-mono text-sm text-amber-400">{v.name}</code>
                <button
                  onClick={() => copyToClipboard(`${v.name}=${v.example}`, v.name)}
                  className="text-zinc-500 hover:text-white"
                >
                  {copied === v.name ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Channels */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Notification Channels</h3>
          <div className="flex gap-2">
            {testResult && <span className="text-xs text-emerald-400">{testResult}</span>}
            <button onClick={testNotifications} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white">
              <TestTube className="h-3.5 w-3.5" /> Test
            </button>
            <button onClick={addNotificationChannel} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700">
              <Plus className="h-3.5 w-3.5" /> Add Channel
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {channels.map((ch) => (
            <div key={ch.id} className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-zinc-500" />
                <select
                  value={ch.type}
                  onChange={(e) => updateChannelField(ch.id, 'type', e.target.value)}
                  className="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
                >
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                </select>
                <input
                  value={ch.name}
                  onChange={(e) => updateChannelField(ch.id, 'name', e.target.value)}
                  className="flex-1 rounded bg-zinc-700 px-3 py-1 text-xs text-white placeholder-zinc-500"
                  placeholder="Channel name"
                />
                <label className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={ch.enabled}
                    onChange={(e) => updateChannelField(ch.id, 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  Enabled
                </label>
                <button onClick={() => deleteChannel(ch.id)} className="text-zinc-500 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={ch.webhook_url}
                onChange={(e) => updateChannelField(ch.id, 'webhook_url', e.target.value)}
                className="mt-2 w-full rounded bg-zinc-700 px-3 py-1.5 font-mono text-xs text-zinc-300 placeholder-zinc-500"
                placeholder="Webhook URL (https://hooks.slack.com/...)"
              />
              <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                <span>Events: {ch.events.join(', ')}</span>
                <span>Severities: {ch.severities.join(', ')}</span>
              </div>
            </div>
          ))}
          {channels.length === 0 && (
            <p className="py-4 text-center text-xs text-zinc-600">No notification channels configured. Click &quot;Add Channel&quot; to get started.</p>
          )}
        </div>
      </div>

      {/* Aiven Setup Guide */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white">Aiven Free Tier Setup</h3>
        <ol className="mt-4 space-y-3 text-sm text-zinc-400">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span>
            <span>Sign up at <span className="text-emerald-400">aiven.io</span> and create a free tier project</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
            <span>Create Apache Kafka, PostgreSQL, and Valkey services (all free tier)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">3</span>
            <span>Copy connection details to your .env.local file</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">4</span>
            <span>Create a Kafka topic named <code className="text-emerald-400">devops-events</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">5</span>
            <span>Point your GitHub webhook to the URL above and start streaming!</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function StatusRow({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-800/30 px-4 py-3">
      <span className="text-sm text-zinc-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
        <span className={`text-xs ${connected ? 'text-emerald-400' : 'text-zinc-500'}`}>
          {connected ? 'Connected' : 'Not configured'}
        </span>
      </div>
    </div>
  );
}
