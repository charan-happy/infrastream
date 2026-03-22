'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Settings,
  Zap,
  Radio,
  DollarSign,
  Users,
  AlertTriangle,
  GitBranch,
  HeartPulse,
  Menu,
  X,
} from 'lucide-react';

const mainNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Events', icon: Activity },
  { href: '/metrics', label: 'DORA Metrics', icon: BarChart3 },
  { href: '/repos', label: 'Repositories', icon: GitBranch },
  { href: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { href: '/costs', label: 'Cost Tracking', icon: DollarSign },
  { href: '/team', label: 'Team', icon: Users },
];

const integrationNav = [
  { href: '/healops', label: 'HealOps', icon: HeartPulse },
];

const bottomNav = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">InfraStream</h1>
          <p className="text-[10px] text-zinc-500 -mt-0.5">DevOps Intelligence</p>
        </div>
        <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-zinc-400">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Integrations</p>
          <div className="space-y-1">
            {integrationNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-zinc-800 text-emerald-400'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="space-y-1">
            {bottomNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-zinc-800 text-emerald-400'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          <span>Live streaming</span>
        </div>
        <p className="mt-1 text-[10px] text-zinc-600">
          Powered by Aiven
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-zinc-900 p-2 text-zinc-400 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide in) */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar (always visible) */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
        {navContent}
      </aside>
    </>
  );
}
