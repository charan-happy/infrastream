export interface DeployCost {
  id: string;
  repo: string;
  environment: string;
  version: string;
  compute_cost: number;
  build_minutes: number;
  build_cost: number;
  infra_cost: number;
  total_cost: number;
  deployed_by: string;
  deployed_at: string;
}

export interface TeamMember {
  name: string;
  avatar_url: string;
  deployments: number;
  successful_deploys: number;
  failed_deploys: number;
  incidents_resolved: number;
  prs_merged: number;
  commits: number;
  avg_lead_time: number;
  streak: number; // consecutive successful deploys
}

export interface RepoCostSummary {
  repo: string;
  total_cost: number;
  deploy_count: number;
  avg_cost_per_deploy: number;
  cost_trend: number; // percentage change
}

const repos = ['infrastream/api', 'infrastream/frontend', 'infrastream/worker', 'infrastream/infra'];
const authors = [
  { name: 'nagacharan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nagacharan' },
  { name: 'alice-dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' },
  { name: 'bob-ops', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob' },
  { name: 'carol-sre', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol' },
];

export function generateDeployCosts(count = 20): DeployCost[] {
  const costs: DeployCost[] = [];
  const now = Date.now();
  const envs = ['production', 'staging', 'development'];

  for (let i = 0; i < count; i++) {
    const buildMinutes = 2 + Math.floor(Math.random() * 15);
    const buildCost = +(buildMinutes * 0.008).toFixed(3);
    const computeCost = +(0.05 + Math.random() * 0.3).toFixed(3);
    const infraCost = +(0.02 + Math.random() * 0.1).toFixed(3);

    costs.push({
      id: `dc-${i}`,
      repo: repos[Math.floor(Math.random() * repos.length)],
      environment: envs[Math.floor(Math.random() * envs.length)],
      version: `v${2 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
      compute_cost: computeCost,
      build_minutes: buildMinutes,
      build_cost: buildCost,
      infra_cost: infraCost,
      total_cost: +(buildCost + computeCost + infraCost).toFixed(3),
      deployed_by: authors[Math.floor(Math.random() * authors.length)].name,
      deployed_at: new Date(now - Math.floor(Math.random() * 30) * 86400000).toISOString(),
    });
  }

  return costs.sort((a, b) => new Date(b.deployed_at).getTime() - new Date(a.deployed_at).getTime());
}

export function generateRepoCosts(): RepoCostSummary[] {
  return repos.map((repo) => {
    const deployCount = 10 + Math.floor(Math.random() * 40);
    const avgCost = +(0.15 + Math.random() * 0.35).toFixed(3);
    return {
      repo,
      total_cost: +(deployCount * avgCost).toFixed(2),
      deploy_count: deployCount,
      avg_cost_per_deploy: avgCost,
      cost_trend: +(-15 + Math.random() * 30).toFixed(1),
    };
  }).sort((a, b) => b.total_cost - a.total_cost);
}

export function generateCostHistory(days = 30): { date: string; total: number; build: number; compute: number; infra: number }[] {
  const history = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const build = +(0.5 + Math.random() * 2).toFixed(2);
    const compute = +(0.3 + Math.random() * 1.5).toFixed(2);
    const infra = +(0.1 + Math.random() * 0.5).toFixed(2);
    history.push({
      date: date.toISOString().split('T')[0],
      total: +(build + compute + infra).toFixed(2),
      build,
      compute,
      infra,
    });
  }
  return history;
}

export function generateTeamMembers(): TeamMember[] {
  return authors.map((a) => ({
    name: a.name,
    avatar_url: a.avatar,
    deployments: 5 + Math.floor(Math.random() * 30),
    successful_deploys: 5 + Math.floor(Math.random() * 25),
    failed_deploys: Math.floor(Math.random() * 5),
    incidents_resolved: Math.floor(Math.random() * 12),
    prs_merged: 3 + Math.floor(Math.random() * 20),
    commits: 10 + Math.floor(Math.random() * 80),
    avg_lead_time: +(1 + Math.random() * 20).toFixed(1),
    streak: Math.floor(Math.random() * 15),
  })).sort((a, b) => b.deployments - a.deployments);
}
