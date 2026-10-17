/**
 * SiteRadar — Website Status & Uptime Monitoring Dashboard
 * Enterprise Status Management, 90-Day SLA History & Ping Simulator
 */

// ==========================================
// 1. DATA MODELS & STATE
// ==========================================

const STORAGE_SERVICES_KEY = 'siteradar_services_v1';
const STORAGE_INCIDENTS_KEY = 'siteradar_incidents_v1';
const THEME_KEY = 'siteradar_theme';

// Seed 10 realistic enterprise/university services
const DEFAULT_SERVICES = [
  {
    id: 'srv_1',
    name: 'E-Commerce Storefront',
    url: 'https://store.acme-corp.com',
    category: 'FRONTEND',
    region: 'Global Edge (Fastly)',
    status: 'OPERATIONAL', // OPERATIONAL | DEGRADED | OUTAGE | MAINTENANCE
    latency: 42,
    targetLatency: 150,
    uptimePercent: 99.98,
    lastChecked: 'Just now',
    notes: 'Main customer facing storefront with SSR.'
  },
  {
    id: 'srv_2',
    name: 'Auth & OAuth2 Identity Server',
    url: 'https://auth.acme-corp.com/v1',
    category: 'API',
    region: 'US-East (AWS N. Virginia)',
    status: 'OPERATIONAL',
    latency: 68,
    targetLatency: 120,
    uptimePercent: 99.89,
    lastChecked: 'Just now',
    notes: 'JWT validation & user sessions cluster.'
  },
  {
    id: 'srv_3',
    name: 'Payment Processing Gateway',
    url: 'https://api.payments-hub.net',
    category: 'API',
    region: 'US-Central',
    status: 'DEGRADED',
    latency: 540,
    targetLatency: 200,
    uptimePercent: 98.45,
    lastChecked: '1 min ago',
    notes: 'Elevated response latency reported by checkout webhook listeners.'
  },
  {
    id: 'srv_4',
    name: 'User Database Cluster (PostgreSQL)',
    url: 'postgres://db-primary.internal:5432',
    category: 'DATABASE',
    region: 'US-East (Multi-AZ)',
    status: 'OPERATIONAL',
    latency: 14,
    targetLatency: 50,
    uptimePercent: 100.0,
    lastChecked: 'Just now',
    notes: 'Primary relational store with active read-replicas.'
  },
  {
    id: 'srv_5',
    name: 'CDN Asset & Video Delivery',
    url: 'https://cdn.acme-assets.net',
    category: 'INFRA',
    region: 'Cloudflare Anycast',
    status: 'OPERATIONAL',
    latency: 22,
    targetLatency: 80,
    uptimePercent: 99.99,
    lastChecked: 'Just now',
    notes: 'Static media and JS bundles delivery nodes.'
  },
  {
    id: 'srv_6',
    name: 'Elastic Search & Discovery Engine',
    url: 'https://search.api.internal/cluster',
    category: 'API',
    region: 'EU-West (Frankfurt)',
    status: 'OUTAGE',
    latency: 3200,
    targetLatency: 250,
    uptimePercent: 95.80,
    lastChecked: '2 mins ago',
    notes: 'Memory pressure causing index worker timeouts.'
  },
  {
    id: 'srv_7',
    name: 'Telemetry & Log Ingestion Pipeline',
    url: 'https://telemetry.acme-corp.com/v2',
    category: 'API',
    region: 'US-West (Oregon)',
    status: 'MAINTENANCE',
    latency: 185,
    targetLatency: 300,
    uptimePercent: 99.10,
    lastChecked: '5 mins ago',
    notes: 'Scheduled database migration window 13:00 - 15:00 UTC.'
  },
  {
    id: 'srv_8',
    name: 'University Student Portal',
    url: 'https://portal.university.edu',
    category: 'FRONTEND',
    region: 'Campus DataCenter',
    status: 'OPERATIONAL',
    latency: 52,
    targetLatency: 180,
    uptimePercent: 99.92,
    lastChecked: 'Just now',
    notes: 'Student grading and registration portal.'
  },
  {
    id: 'srv_9',
    name: 'Email & Push Notification Relay',
    url: 'https://mail.notifications.io',
    category: 'INFRA',
    region: 'US-East',
    status: 'OPERATIONAL',
    latency: 88,
    targetLatency: 200,
    uptimePercent: 99.78,
    lastChecked: 'Just now',
    notes: 'Transactional notification worker queues.'
  },
  {
    id: 'srv_10',
    name: 'Developer Documentation Hub',
    url: 'https://docs.acme-corp.io',
    category: 'FRONTEND',
    region: 'Global Edge',
    status: 'OPERATIONAL',
    latency: 35,
    targetLatency: 100,
    uptimePercent: 100.0,
    lastChecked: 'Just now',
    notes: 'Static documentation and OpenAPI explorer.'
  }
];

// Seed sample incidents
const DEFAULT_INCIDENTS = [
  {
    id: 'inc_1',
    title: 'Elevated response times & 504 timeouts on Search API',
    serviceName: 'Elastic Search & Discovery Engine',
    state: 'Identified', // Investigating | Identified | Monitoring | Resolved
    createdAt: 'Today, 13:15 UTC',
    message: 'Engineers have identified thread pool exhaustion on the Frankfurt primary node. A failover replica is being brought online.'
  },
  {
    id: 'inc_2',
    title: 'High latency observed on Checkout Webhooks',
    serviceName: 'Payment Processing Gateway',
    state: 'Investigating',
    createdAt: 'Today, 12:45 UTC',
    message: 'Upstream payment processor experiencing network congestion. Automatic retry queues are buffering incoming payloads.'
  },
  {
    id: 'inc_3',
    title: 'Scheduled maintenance on Telemetry pipeline',
    serviceName: 'Telemetry & Log Ingestion Pipeline',
    state: 'Monitoring',
    createdAt: 'Today, 10:00 UTC',
    message: 'Kafka consumer groups re-balancing for storage expansion. Expected completion in 30 minutes.'
  }
];

// Application Runtime State
const state = {
  services: [],
  incidents: [],
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  searchQuery: '',
  theme: 'dark',
  isPublicView: false,
  autoPollActive: true,
  autoPollTimer: null,
  audioCtx: null,
  incidentsCollapsed: false
};

// ==========================================
// 2. AUDIO FEEDBACK (Native Web Audio API)
// ==========================================

function playAudioChime(type = 'ping') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!state.audioCtx) state.audioCtx = new AudioCtx();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

    const ctx = state.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'ping') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  } catch (e) {
    // Audio context graceful fallback
  }
}

// ==========================================
// 3. TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgStyles = {
    success: 'bg-slate-900 border-emerald-500/40 text-emerald-300',
    info: 'bg-slate-900 border-indigo-500/40 text-indigo-300',
    warning: 'bg-slate-900 border-amber-500/40 text-amber-300',
    error: 'bg-slate-900 border-rose-500/40 text-rose-300'
  };

  const icons = {
    success: '✓',
    info: 'ℹ',
    warning: '⚠',
    error: '✕'
  };

  toast.className = `p-3 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold pointer-events-auto toast-animate ${bgStyles[type] || bgStyles.success}`;
  toast.innerHTML = `
    <span class="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">${icons[type] || '✓'}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// 4. STORAGE & DATA MANAGEMENT
// ==========================================

function loadData() {
  try {
    const rawServices = localStorage.getItem(STORAGE_SERVICES_KEY);
    if (rawServices) {
      state.services = JSON.parse(rawServices);
    } else {
      state.services = JSON.parse(JSON.stringify(DEFAULT_SERVICES));
      saveServices();
    }

    const rawIncidents = localStorage.getItem(STORAGE_INCIDENTS_KEY);
    if (rawIncidents) {
      state.incidents = JSON.parse(rawIncidents);
    } else {
      state.incidents = JSON.parse(JSON.stringify(DEFAULT_INCIDENTS));
      saveIncidents();
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      state.theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    state.services = JSON.parse(JSON.stringify(DEFAULT_SERVICES));
    state.incidents = JSON.parse(JSON.stringify(DEFAULT_INCIDENTS));
  }
}

function saveServices() {
  try {
    localStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(state.services));
  } catch (err) {
    console.error('Failed to save services:', err);
  }
}

function saveIncidents() {
  try {
    localStorage.setItem(STORAGE_INCIDENTS_KEY, JSON.stringify(state.incidents));
  } catch (err) {
    console.error('Failed to save incidents:', err);
  }
}

// ==========================================
// 5. STATUS & UPTIME SPARK-BAR GENERATOR
// ==========================================

function getStatusBadge(status) {
  switch (status) {
    case 'OPERATIONAL':
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold status-operational border flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span>Operational</span>`;
    case 'DEGRADED':
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold status-degraded border flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span>Degraded</span>`;
    case 'OUTAGE':
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold status-outage border flex items-center gap-1.5 animate-pulse"><span class="w-2 h-2 rounded-full bg-rose-500"></span>Major Outage</span>`;
    case 'MAINTENANCE':
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold status-maintenance border flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-purple-400"></span>Maintenance</span>`;
    default:
      return `<span class="px-2.5 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700">Unknown</span>`;
  }
}

function getCategoryPill(category) {
  const configs = {
    FRONTEND: { label: 'Web App', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    API: { label: 'Core API', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    DATABASE: { label: 'Database', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    INFRA: { label: 'Infra / CDN', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
  };
  const c = configs[category] || configs.API;
  return `<span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${c.color}">${c.label}</span>`;
}

// Generate 36 realistic daily uptime blocks representing 90-day history
function generateUptimeHistoryHtml(service) {
  const blockCount = 36;
  let blocksHtml = '';

  for (let i = blockCount; i >= 1; i--) {
    const daysAgo = i * 2.5;
    let blockClass = 'block-up';
    let blockStatusText = '100% Uptime';
    let blockLatency = Math.round(service.latency * (0.85 + Math.random() * 0.3));

    if (service.status === 'OUTAGE' && i <= 3) {
      blockClass = 'block-down';
      blockStatusText = 'Major Outage (Zero Responses)';
      blockLatency = 'Timeout';
    } else if (service.status === 'DEGRADED' && i <= 4) {
      blockClass = 'block-degraded';
      blockStatusText = 'Degraded Performance (SLA Violation)';
    } else if (service.status === 'MAINTENANCE' && i <= 2) {
      blockClass = 'block-maintenance';
      blockStatusText = 'Scheduled Maintenance Window';
    } else if (Math.random() < 0.03 && service.uptimePercent < 99.95) {
      blockClass = 'block-degraded';
      blockStatusText = 'Minor Transient Slowdown';
    }

    blocksHtml += `
      <div class="uptime-block ${blockClass}">
        <div class="tooltip-box">
          <div class="font-bold">${Math.round(daysAgo)} days ago</div>
          <div>${blockStatusText}</div>
          <div class="text-[10px] text-slate-400 font-mono">Response: ${blockLatency === 'Timeout' ? 'Timeout' : blockLatency + 'ms'}</div>
        </div>
      </div>
    `;
  }

  return blocksHtml;
}

// ==========================================
// 6. MAIN RENDERING LOGIC
// ==========================================

function renderServices() {
  const container = document.getElementById('servicesListContainer');
  const emptyState = document.getElementById('emptyServicesContainer');
  const countBadge = document.getElementById('filteredCountBadge');

  if (!container) return;

  // Filter Services
  let filtered = state.services.filter(service => {
    // Status Filter
    if (state.statusFilter !== 'ALL' && service.status !== state.statusFilter) {
      return false;
    }
    // Category Filter
    if (state.categoryFilter !== 'ALL' && service.category !== state.categoryFilter) {
      return false;
    }
    // Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchName = service.name.toLowerCase().includes(q);
      const matchUrl = service.url.toLowerCase().includes(q);
      const matchRegion = service.region && service.region.toLowerCase().includes(q);
      if (!matchName && !matchUrl && !matchRegion) return false;
    }
    return true;
  });

  countBadge.textContent = `(${filtered.length} ${filtered.length === 1 ? 'service' : 'services'})`;

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  let html = '';

  filtered.forEach(service => {
    const isPublic = state.isPublicView;
    const historyBars = generateUptimeHistoryHtml(service);

    // Latency badge class
    let latencyBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (service.latency > 500) {
      latencyBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold animate-pulse';
    } else if (service.latency > service.targetLatency) {
      latencyBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }

    html += `
      <div id="service_card_${service.id}" class="glass-panel p-4 sm:p-5 border transition-all duration-200">
        
        <!-- Header row of card -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          
          <!-- Service Identity -->
          <div class="flex items-start gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 font-bold shrink-0 mt-0.5">
              ${service.name.charAt(0)}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-0.5">
                <h3 class="font-heading font-bold text-base text-white truncate">${escapeHtml(service.name)}</h3>
                ${getCategoryPill(service.category)}
                <span class="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">${escapeHtml(service.region || 'Global')}</span>
              </div>
              <a href="${escapeHtml(service.url)}" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-mono truncate max-w-md">
                <span>${escapeHtml(service.url)}</span>
                <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>

          <!-- Status & Latency Pills -->
          <div class="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <div class="text-right">
              <div class="text-xs font-mono font-bold px-2 py-0.5 rounded border ${latencyBadge}">
                ${service.latency} ms
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">Target: &lt;${service.targetLatency}ms</div>
            </div>

            <div>
              ${getStatusBadge(service.status)}
            </div>
          </div>

        </div>

        <!-- Middle: 90-Day Uptime History Spark-Bars -->
        <div class="pt-4 pb-2">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Uptime History (Last 90 Days)</span>
            <span class="font-bold text-slate-200 font-mono">${service.uptimePercent}% Uptime</span>
          </div>

          <!-- Interactive Bars -->
          <div class="uptime-bar-container">
            ${historyBars}
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>90 days ago</span>
            <span class="font-semibold text-slate-400">100% SLA Guarantee</span>
            <span>Today</span>
          </div>
        </div>

        <!-- Footer: Action row -->
        <div class="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 text-slate-400">
            <span>Last checked: <strong class="text-slate-300">${service.lastChecked}</strong></span>
            ${service.notes ? `<span class="hidden md:inline text-slate-500">• ${escapeHtml(service.notes)}</span>` : ''}
          </div>

          <!-- Quick Action Buttons (Hidden in visitor public page mode) -->
          ${!isPublic ? `
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <!-- Ping Check Now -->
              <button onclick="pingSingleService('${service.id}')" title="Send simulated health check ping" class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold transition flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span>Ping</span>
              </button>

              <!-- Override Status -->
              <button onclick="openStatusOverrideModal('${service.id}')" title="Manually change health status" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span>Change Status</span>
              </button>

              <!-- Edit Service Specs -->
              <button onclick="openEditServiceModal('${service.id}')" title="Edit service config" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>

              <!-- Delete Service -->
              <button onclick="deleteService('${service.id}')" title="Remove service" class="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          ` : `
            <div class="text-[11px] text-slate-500 font-mono">Public Status Verified</div>
          `}

        </div>

      </div>
    `;
  });

  container.innerHTML = html;
}

function renderIncidents() {
  const container = document.getElementById('incidentsListContainer');
  const countBadge = document.getElementById('activeIncidentCountBadge');
  const section = document.getElementById('incidentsSection');

  if (!container) return;

  const activeIncidents = state.incidents.filter(i => i.state !== 'Resolved');
  countBadge.textContent = `${activeIncidents.length} active`;

  if (state.incidents.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 py-2">No active or reported incidents.</p>`;
    return;
  }

  let html = '';
  state.incidents.forEach(inc => {
    const isResolved = inc.state === 'Resolved';
    const stateColors = {
      Investigating: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      Identified: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Monitoring: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    };

    html += `
      <div class="p-3 rounded-xl border ${isResolved ? 'bg-slate-900/30 border-slate-800/60' : 'bg-slate-900/80 border-amber-500/30'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div class="space-y-1 flex-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${stateColors[inc.state] || stateColors.Investigating}">
              ${inc.state}
            </span>
            <strong class="text-slate-100 font-semibold">${escapeHtml(inc.title)}</strong>
          </div>
          <p class="text-slate-400 leading-relaxed">${escapeHtml(inc.message)}</p>
          <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
            <span>Affects: <strong class="text-slate-300">${escapeHtml(inc.serviceName)}</strong></span>
            <span>•</span>
            <span>${inc.createdAt}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
          ${!isResolved ? `
            <button onclick="resolveIncident('${inc.id}')" class="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition">
              Mark Resolved
            </button>
          ` : ''}
          <button onclick="deleteIncident('${inc.id}')" title="Delete record" class="p-1 rounded text-slate-500 hover:text-rose-400 transition">
            ✕
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function updateKpiStats() {
  const total = state.services.length;
  if (total === 0) return;

  const operationalCount = state.services.filter(s => s.status === 'OPERATIONAL').length;
  const degradedCount = state.services.filter(s => s.status === 'DEGRADED').length;
  const outageCount = state.services.filter(s => s.status === 'OUTAGE').length;
  const maintenanceCount = state.services.filter(s => s.status === 'MAINTENANCE').length;

  // Compute average uptime %
  const sumUptime = state.services.reduce((acc, s) => acc + s.uptimePercent, 0);
  const avgUptime = (sumUptime / total).toFixed(2);

  // Compute average latency
  const sumLatency = state.services.reduce((acc, s) => acc + s.latency, 0);
  const avgLatency = Math.round(sumLatency / total);

  // Active Incidents count
  const activeIncidentsCount = state.incidents.filter(i => i.state !== 'Resolved').length;

  document.getElementById('statAvgUptime').textContent = `${avgUptime}%`;
  document.getElementById('statTotalServices').textContent = `${total} Active`;
  document.getElementById('statOperationalRatio').textContent = `${operationalCount} Operational`;
  document.getElementById('statAvgLatency').textContent = `${avgLatency} ms`;
  document.getElementById('statActiveIncidents').textContent = `${activeIncidentsCount} Active`;

  const incidentNoteEl = document.getElementById('statIncidentNote');
  if (activeIncidentsCount === 0) {
    incidentNoteEl.textContent = 'All systems nominal';
    incidentNoteEl.className = 'text-[11px] text-emerald-400 font-medium';
  } else {
    incidentNoteEl.textContent = 'Mitigation underway';
    incidentNoteEl.className = 'text-[11px] text-amber-400 font-medium';
  }

  // Update Global Hero Banner
  const banner = document.getElementById('globalStatusBanner');
  const title = document.getElementById('globalStatusTitle');
  const subtitle = document.getElementById('globalStatusSubtitle');
  const icon = document.getElementById('globalStatusIcon');

  if (outageCount > 0) {
    banner.className = 'p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl';
    title.innerHTML = `<span>Major Outage Detected</span> <span class="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold">${outageCount} DOWN</span>`;
    subtitle.textContent = `Immediate incident response active. ${outageCount} core service(s) currently experiencing connectivity loss.`;
    icon.className = 'w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0';
    icon.innerHTML = `<svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
  } else if (degradedCount > 0) {
    banner.className = 'p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl';
    title.innerHTML = `<span>Partial Service Degradation</span> <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">${degradedCount} DEGRADED</span>`;
    subtitle.textContent = `${degradedCount} service(s) are reporting elevated response latencies above target SLAs.`;
    icon.className = 'w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0';
    icon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  } else {
    banner.className = 'p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl';
    title.innerHTML = `<span>All Systems Operational</span> <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">100% HEALTH</span>`;
    subtitle.textContent = `All monitored endpoints, APIs, and databases are responding normally within SLA limits.`;
    icon.className = 'w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0';
    icon.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
  }
}

function renderApp() {
  renderServices();
  renderIncidents();
  updateKpiStats();
}

// ==========================================
// 7. INTERACTIVE PING & HEALTH SIMULATION
// ==========================================

function pingSingleService(serviceId) {
  const service = state.services.find(s => s.id === serviceId);
  if (!service) return;

  playAudioChime('ping');

  // Simulate network latency roundtrip
  const randomVariance = (Math.random() * 0.4 - 0.2); // +/- 20%
  let newLatency = Math.max(12, Math.round(service.targetLatency * (0.4 + Math.random() * 0.5)));

  if (service.status === 'DEGRADED') {
    newLatency = Math.round(service.targetLatency * (2.2 + Math.random() * 1.5));
  } else if (service.status === 'OUTAGE') {
    newLatency = 3000 + Math.round(Math.random() * 1500);
  }

  service.latency = newLatency;
  service.lastChecked = 'Just now';

  saveServices();
  renderApp();
  showToast(`Pinged ${service.name} → ${newLatency}ms response`, 'info');
}

function runCheckAll() {
  const icon = document.getElementById('runCheckIcon');
  if (icon) icon.classList.add('animate-spin');

  playAudioChime('ping');
  showToast('Simulating live health check across all endpoints...', 'info');

  state.services.forEach((s, idx) => {
    setTimeout(() => {
      let variance = 0.5 + Math.random() * 0.6;
      if (s.status === 'DEGRADED') variance = 2.0 + Math.random();
      if (s.status === 'OUTAGE') variance = 10.0;

      s.latency = Math.max(10, Math.round(s.targetLatency * variance));
      s.lastChecked = 'Just now';

      if (idx === state.services.length - 1) {
        if (icon) icon.classList.remove('animate-spin');
        saveServices();
        renderApp();
        playAudioChime('success');
        showToast('All service pings refreshed successfully!', 'success');
      }
    }, idx * 120);
  });
}

function startAutoPoll() {
  if (state.autoPollTimer) clearInterval(state.autoPollTimer);
  state.autoPollTimer = setInterval(() => {
    if (state.autoPollActive) {
      // Pick 2 random services and ping them
      const randomIdx = Math.floor(Math.random() * state.services.length);
      const s = state.services[randomIdx];
      if (s && s.status !== 'OUTAGE') {
        s.latency = Math.max(12, Math.round(s.targetLatency * (0.6 + Math.random() * 0.6)));
        s.lastChecked = 'Just now';
        saveServices();
        renderApp();
      }
    }
  }, 15000);
}

// ==========================================
// 8. SERVICE & INCIDENT CRUD
// ==========================================

function openAddServiceModal() {
  document.getElementById('modalTitle').textContent = 'Add Monitored Website / Service';
  document.getElementById('editServiceId').value = '';
  document.getElementById('serviceNameInput').value = '';
  document.getElementById('serviceUrlInput').value = '';
  document.getElementById('serviceCategoryInput').value = 'API';
  document.getElementById('serviceRegionInput').value = 'US-East';
  document.getElementById('serviceStatusInput').value = 'OPERATIONAL';
  document.getElementById('serviceTargetLatencyInput').value = '200';
  document.getElementById('serviceNotesInput').value = '';

  document.getElementById('serviceModal').classList.remove('hidden');
}

function openEditServiceModal(serviceId) {
  const service = state.services.find(s => s.id === serviceId);
  if (!service) return;

  document.getElementById('modalTitle').textContent = 'Edit Monitored Service';
  document.getElementById('editServiceId').value = service.id;
  document.getElementById('serviceNameInput').value = service.name;
  document.getElementById('serviceUrlInput').value = service.url;
  document.getElementById('serviceCategoryInput').value = service.category;
  document.getElementById('serviceRegionInput').value = service.region || '';
  document.getElementById('serviceStatusInput').value = service.status;
  document.getElementById('serviceTargetLatencyInput').value = service.targetLatency;
  document.getElementById('serviceNotesInput').value = service.notes || '';

  document.getElementById('serviceModal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.add('hidden');
}

function deleteService(serviceId) {
  const service = state.services.find(s => s.id === serviceId);
  if (!service) return;

  if (confirm(`Remove "${service.name}" from status monitoring?`)) {
    state.services = state.services.filter(s => s.id !== serviceId);
    saveServices();
    renderApp();
    showToast(`Removed "${service.name}"`, 'warning');
  }
}

// Status Override Modal
function openStatusOverrideModal(serviceId) {
  const service = state.services.find(s => s.id === serviceId);
  if (!service) return;

  document.getElementById('overrideServiceId').value = service.id;
  document.getElementById('overrideServiceName').textContent = service.name;
  document.getElementById('overrideReasonInput').value = '';

  const radios = document.querySelectorAll('input[name="manualStatus"]');
  radios.forEach(r => {
    r.checked = (r.value === service.status);
  });

  document.getElementById('statusOverrideModal').classList.remove('hidden');
}

function closeStatusOverrideModal() {
  document.getElementById('statusOverrideModal').classList.add('hidden');
}

// Report Incident Modal
function openReportIncidentModal() {
  const select = document.getElementById('incidentServiceSelect');
  select.innerHTML = state.services.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('');

  document.getElementById('incidentTitleInput').value = '';
  document.getElementById('incidentMessageInput').value = '';
  document.getElementById('incidentStateSelect').value = 'Investigating';

  document.getElementById('reportIncidentModal').classList.remove('hidden');
}

function closeReportIncidentModal() {
  document.getElementById('reportIncidentModal').classList.add('hidden');
}

function resolveIncident(incId) {
  const inc = state.incidents.find(i => i.id === incId);
  if (!inc) return;

  inc.state = 'Resolved';
  inc.message += ' (Resolved by operator).';
  saveIncidents();
  renderApp();
  playAudioChime('success');
  showToast(`Incident marked as Resolved!`, 'success');
}

function deleteIncident(incId) {
  state.incidents = state.incidents.filter(i => i.id !== incId);
  saveIncidents();
  renderApp();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString().replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// ==========================================
// 9. EVENT LISTENERS & SETUP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Status Filter Buttons
  const filterBtns = document.querySelectorAll('.status-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.className = 'status-filter-btn px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-transparent font-medium';
      });
      btn.className = 'status-filter-btn px-2.5 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold';
      state.statusFilter = btn.getAttribute('data-status');
      renderServices();
    });
  });

  // Category Dropdown Filter
  const categorySelect = document.getElementById('categorySelect');
  categorySelect.addEventListener('change', e => {
    state.categoryFilter = e.target.value;
    renderServices();
  });

  // Search Input
  const searchInput = document.getElementById('serviceSearchInput');
  searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderServices();
  });

  // Reset Filters Button
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      state.statusFilter = 'ALL';
      state.categoryFilter = 'ALL';
      state.searchQuery = '';
      searchInput.value = '';
      categorySelect.value = 'ALL';
      filterBtns.forEach((b, i) => {
        b.className = i === 0
          ? 'status-filter-btn px-2.5 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold'
          : 'status-filter-btn px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-transparent font-medium';
      });
      renderServices();
    });
  }

  // Toggle Auto-Poll Simulation
  const toggleAutoPollBtn = document.getElementById('toggleAutoPollBtn');
  const autoPollStatus = document.getElementById('autoPollStatus');
  toggleAutoPollBtn.addEventListener('click', () => {
    state.autoPollActive = !state.autoPollActive;
    if (state.autoPollActive) {
      autoPollStatus.textContent = 'Active (15s)';
      autoPollStatus.className = 'text-slate-200 font-semibold font-mono';
      toggleAutoPollBtn.textContent = 'Pause';
      showToast('Auto-polling resumed (every 15s)', 'info');
    } else {
      autoPollStatus.textContent = 'Paused';
      autoPollStatus.className = 'text-amber-400 font-semibold font-mono';
      toggleAutoPollBtn.textContent = 'Resume';
      showToast('Auto-polling paused', 'warning');
    }
  });

  // Run Check All Button
  document.getElementById('runCheckAllBtn').addEventListener('click', runCheckAll);

  // Public View Switcher
  const publicViewBtn = document.getElementById('publicViewToggleBtn');
  publicViewBtn.addEventListener('click', () => {
    state.isPublicView = !state.isPublicView;
    if (state.isPublicView) {
      publicViewBtn.classList.add('bg-cyan-500/20', 'border-cyan-500/40', 'text-cyan-300');
      showToast('Switched to Visitor Public Status Mode', 'info');
    } else {
      publicViewBtn.classList.remove('bg-cyan-500/20', 'border-cyan-500/40', 'text-cyan-300');
      showToast('Switched back to Admin Management Mode', 'info');
    }
    renderServices();
  });

  // Theme Toggle Button
  const themeBtn = document.getElementById('themeToggleBtn');
  const sunIcon = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');

  function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }
  applyTheme(state.theme);

  themeBtn.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // Modal Open/Close Controls
  document.getElementById('openAddModalBtn').addEventListener('click', openAddServiceModal);
  document.getElementById('closeServiceModalBtn').addEventListener('click', closeServiceModal);
  document.getElementById('cancelServiceBtn').addEventListener('click', closeServiceModal);

  document.getElementById('closeStatusModalBtn').addEventListener('click', closeStatusOverrideModal);
  document.getElementById('cancelOverrideBtn').addEventListener('click', closeStatusOverrideModal);

  document.getElementById('openReportIncidentBtn').addEventListener('click', openReportIncidentModal);
  document.getElementById('closeIncidentModalBtn').addEventListener('click', closeReportIncidentModal);
  document.getElementById('cancelIncidentBtn').addEventListener('click', closeReportIncidentModal);

  // Collapsible Incidents Section
  const toggleIncidentsBtn = document.getElementById('toggleIncidentsViewBtn');
  const incidentsListContainer = document.getElementById('incidentsListContainer');
  const incidentToggleIcon = document.getElementById('incidentToggleIcon');
  const incidentToggleText = document.getElementById('incidentToggleText');

  toggleIncidentsBtn.addEventListener('click', () => {
    state.incidentsCollapsed = !state.incidentsCollapsed;
    if (state.incidentsCollapsed) {
      incidentsListContainer.classList.add('hidden');
      incidentToggleIcon.classList.add('rotate-180');
      incidentToggleText.textContent = 'Expand';
    } else {
      incidentsListContainer.classList.remove('hidden');
      incidentToggleIcon.classList.remove('rotate-180');
      incidentToggleText.textContent = 'Collapse';
    }
  });

  // Service Form Submission (Add or Edit)
  document.getElementById('serviceForm').addEventListener('submit', e => {
    e.preventDefault();
    const editId = document.getElementById('editServiceId').value;
    const name = document.getElementById('serviceNameInput').value.trim();
    const url = document.getElementById('serviceUrlInput').value.trim();
    const category = document.getElementById('serviceCategoryInput').value;
    const region = document.getElementById('serviceRegionInput').value.trim() || 'Global';
    const status = document.getElementById('serviceStatusInput').value;
    const targetLatency = parseInt(document.getElementById('serviceTargetLatencyInput').value, 10) || 200;
    const notes = document.getElementById('serviceNotesInput').value.trim();

    if (editId) {
      // Edit existing
      const s = state.services.find(srv => srv.id === editId);
      if (s) {
        s.name = name;
        s.url = url;
        s.category = category;
        s.region = region;
        s.status = status;
        s.targetLatency = targetLatency;
        s.notes = notes;
      }
      showToast(`Updated service "${name}"`, 'success');
    } else {
      // Add new
      const newService = {
        id: 'srv_' + Date.now(),
        name,
        url,
        category,
        region,
        status,
        latency: Math.round(targetLatency * 0.6),
        targetLatency,
        uptimePercent: 99.95,
        lastChecked: 'Just now',
        notes
      };
      state.services.unshift(newService);
      showToast(`Added "${name}" to monitoring dashboard!`, 'success');
    }

    saveServices();
    closeServiceModal();
    renderApp();
    playAudioChime('success');
  });

  // Status Override Form Submission
  document.getElementById('statusOverrideForm').addEventListener('submit', e => {
    e.preventDefault();
    const serviceId = document.getElementById('overrideServiceId').value;
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;

    const selectedRadio = document.querySelector('input[name="manualStatus"]:checked');
    const newStatus = selectedRadio.value;
    const reason = document.getElementById('overrideReasonInput').value.trim();

    service.status = newStatus;
    service.lastChecked = 'Just now';

    if (newStatus === 'OUTAGE') {
      service.latency = 3200;
      service.uptimePercent = Math.max(90, service.uptimePercent - 0.4);
      playAudioChime('warning');
    } else if (newStatus === 'DEGRADED') {
      service.latency = Math.round(service.targetLatency * 2.5);
      playAudioChime('warning');
    } else if (newStatus === 'OPERATIONAL') {
      service.latency = Math.round(service.targetLatency * 0.5);
      playAudioChime('success');
    }

    // Automatically log an incident notice if degraded or outage
    if (newStatus === 'OUTAGE' || newStatus === 'DEGRADED') {
      state.incidents.unshift({
        id: 'inc_' + Date.now(),
        title: `${service.name} status shifted to ${newStatus}`,
        serviceName: service.name,
        state: 'Investigating',
        createdAt: 'Just now',
        message: reason || `Manual operator status change recorded for ${service.name}.`
      });
      saveIncidents();
    }

    saveServices();
    closeStatusOverrideModal();
    renderApp();
    showToast(`Status updated: ${service.name} is now ${newStatus}!`, 'info');
  });

  // Report Incident Form Submission
  document.getElementById('incidentForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('incidentTitleInput').value.trim();
    const serviceName = document.getElementById('incidentServiceSelect').value;
    const incidentState = document.getElementById('incidentStateSelect').value;
    const message = document.getElementById('incidentMessageInput').value.trim();

    const newInc = {
      id: 'inc_' + Date.now(),
      title,
      serviceName,
      state: incidentState,
      createdAt: 'Just now',
      message
    };

    state.incidents.unshift(newInc);
    saveIncidents();
    closeReportIncidentModal();
    renderApp();
    playAudioChime('warning');
    showToast(`Incident published: "${title}"`, 'warning');
  });

  // Export JSON Report
  document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const report = {
      timestamp: new Date().toISOString(),
      overallUptime: document.getElementById('statAvgUptime').textContent,
      totalServices: state.services.length,
      services: state.services,
      activeIncidents: state.incidents.filter(i => i.state !== 'Resolved')
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `siteradar_status_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Exported Status Report JSON!', 'success');
  });

  // Print SLA Report
  document.getElementById('printReportBtn').addEventListener('click', () => {
    window.print();
  });

  // Reset to Default Demo Data
  document.getElementById('resetDemoDataBtn').addEventListener('click', () => {
    if (confirm('Reset to standard sample website statuses and 90-day history?')) {
      state.services = JSON.parse(JSON.stringify(DEFAULT_SERVICES));
      state.incidents = JSON.parse(JSON.stringify(DEFAULT_INCIDENTS));
      saveServices();
      saveIncidents();
      renderApp();
      playAudioChime('success');
      showToast('Reset to default sample services & uptime data!', 'success');
    }
  });

  // Modal Backdrop Click & Escape Key Dismiss
  const serviceModal = document.getElementById('serviceModal');
  const statusOverrideModal = document.getElementById('statusOverrideModal');
  const reportIncidentModal = document.getElementById('reportIncidentModal');

  [serviceModal, statusOverrideModal, reportIncidentModal].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      serviceModal.classList.add('hidden');
      statusOverrideModal.classList.add('hidden');
      reportIncidentModal.classList.add('hidden');
    }
  });

  // Initial App Render & Auto-poll start
  renderApp();
  startAutoPoll();
});
