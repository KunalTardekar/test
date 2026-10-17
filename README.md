# SiteRadar — Website Status & Uptime Monitoring Dashboard 🟢

> **Real-Time Website Status, Manual Overrides & Sample 90-Day Uptime History**  
> An enterprise-grade status dashboard designed for engineering teams and public stakeholders to track manually entered website health, monitor simulated response latency, review interactive 90-day SLA history bars, and manage incident reports.

Built for **Webathon 2026**. Runs 100% locally with zero installation, zero build steps, and zero external dependencies.

---

## 🌟 What It Does

1. **Website & Service Health Monitoring**: Displays live operational statuses (Operational 🟢, Degraded 🟡, Major Outage 🔴, Maintenance 🟣) for any manually entered website or API endpoint.
2. **Interactive 90-Day Sample Uptime History**: Generates high-fidelity daily block spark-bars with hoverable tooltips showing daily uptime SLA, latency, and incident annotations.
3. **Manual Status Control & Incident Management**: Operators can manually override any service status, specify incident root causes, and log multi-stage incident timelines (Investigating, Identified, Monitoring, Resolved).

---

## 🚀 Key Features

- **📊 Comprehensive KPI Ribbon**:
  - Overall System Health (e.g. 99.85% SLA)
  - Monitored Services count (10 active)
  - Average Latency Benchmark (e.g. 84 ms)
  - Active Incidents tracker
- **⚡ Live Ping Simulation & Health Checks**:
  - **"Ping" Individual Service**: Simulates realistic network round-trips with millisecond latency and audio chime feedback.
  - **"Ping All" Health Check**: Concurrently runs latency probes across all configured services.
  - **Radar Heartbeat**: Optional auto-polling loop with animated live status beacon.
- **🛠️ Manual Status Management (Full CRUD)**:
  - Add and edit websites: Service Name, URL, Category (Web App, Core API, Database, CDN/Auth), Environment Region, Target Latency SLA.
  - 1-Click Status Override modal to simulate outages or record scheduled maintenance.
- **⚠️ Incident Tracking & Timeline**:
  - Live incident banner with state badges (`Investigating`, `Identified`, `Monitoring`, `Resolved`).
  - Automatic incident notice generation on service outages.
- **🔍 Filter & Search**:
  - Filter by health status or category.
  - Instant search across service names, URLs, and regions.
- **👁️ Public Status Page Mode**:
  - Toggle into a clean visitor view (like GitHub Status or Stripe Status) hiding operator controls.
- **📥 Data Export & Printing**:
  - Export full status report to structured JSON.
  - Print-friendly SLA compliance reports.
  - LocalStorage persistence (changes stay saved in your browser).

---

## 🛠️ Technology Stack

- **Frontend**: Pure Semantic HTML5 & Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS CDN + Custom Responsive CSS3 Design System with CSS variables
- **Sound Engine**: Native Web Audio API (Synthesizers, Pings, Audio Chimes)
- **Data Persistence**: HTML5 LocalStorage
- **Zero Build Step**: Double-click `index.html` to run anywhere.

---

## 💻 How to Run

1. Open this repository folder: `c:\Users\KUNAL\OneDrive\Desktop\Hackathon\`
2. Double-click **`index.html`** in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).
3. That's it! No `npm install`, no server, and no setup required.

---

## 👥 Authors & Event Disclosure

- **Created by**: Kunal (Participant, Webathon 2026)
- **AI Disclosure**: Built with AI pairing assistance during the event per AGENTS.md guidelines.
