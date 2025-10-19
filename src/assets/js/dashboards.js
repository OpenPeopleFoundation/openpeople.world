import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const doc = typeof document !== 'undefined' ? document : null;
if (!doc) {
  throw new Error('Dashboards script requires a document context.');
}

const dataset = (doc.body && doc.body.dataset) || {};
const SUPABASE_URL =
  dataset.supabaseUrl ||
  (typeof window !== 'undefined' ? window.SUPABASE_URL : undefined) ||
  (typeof SUPABASE_URL_KEY !== 'undefined' ? SUPABASE_URL_KEY : undefined) ||
  'https://vwrqapholagchwzkkqpt.supabase.co';
const SUPABASE_ANON =
  dataset.supabaseAnon ||
  (typeof window !== 'undefined' ? window.SUPABASE_ANON : undefined) ||
  (typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cnFhcGhvbGFnY2h3emtrcXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjcyMjIsImV4cCI6MjA3NjE0MzIyMn0.cYUNYMx4ebvly0fLWFTtAqWVLEuPmOTZ21wzxEt1_kI';

const el = id => doc.getElementById(id);
const msg = el('dash-msg');
const range = el('range');
const refreshButton = el('refresh');

if (!range || !refreshButton) {
  // Not on the dashboards page
  return;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const ChartLib = typeof window !== 'undefined' ? window.Chart : null;

const safe = value => (typeof value === 'number' && isFinite(value) ? value : 0);
const rand = amp => (Math.random() - 0.5) * amp;

const cas = ({ vr = 0, de = 0, qaa = 0, fl = 0, cri = 0 }) => {
  const invFL = !fl || fl === 0 ? 0 : (1 / fl);
  return (safe(vr) + safe(de) + safe(qaa) + safe(invFL) + safe(cri)) / 5;
};

const demoSeries = days => {
  const rows = [];
  const now = Date.now();
  for (let i = 0; i < days; i += 1) {
    const day = new Date(now - (days - i) * 864e5).toISOString().slice(0, 10);
    const vr = 0.65 + Math.sin(i / 5) / 10 + rand(0.02);
    const de = 0.7 + Math.cos(i / 7) / 12 + rand(0.02);
    const qaa = 0.68 + Math.sin(i / 6) / 14 + rand(0.02);
    const fl = 0.8 + Math.sin(i / 8) / 16 + rand(0.02);
    const cri = 0.66 + Math.cos(i / 9) / 13 + rand(0.02);
    rows.push({ day, vr, de, qaa, fl, cri, cas: cas({ vr, de, qaa, fl, cri }) });
  }
  if (msg) msg.textContent = 'Showing demo data (connect Supabase metrics to go live).';
  return rows;
};

const requireAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/members/';
    return null;
  }
  return user;
};

const fetchMetrics = async days => {
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);

  let { data, error } = await supabase
    .from('metrics_30d')
    .select('day, vr, de, qaa, fl, cri, cas')
    .gte('day', since);

  if (!error && data) {
    return data.sort((a, b) => (a.day > b.day ? 1 : -1));
  }

  const fallback = await supabase
    .from('metrics_daily')
    .select('day, vr, de, qaa, fl, cri')
    .gte('day', since);

  if (!fallback.error && fallback.data) {
    return fallback.data
      .map(row => ({ ...row, cas: cas(row) }))
      .sort((a, b) => (a.day > b.day ? 1 : -1));
  }

  return demoSeries(days);
};

let chartCAS;
let chartMetrics;
let chartRadar;

const upsertCAS = (labels, values) => {
  if (!ChartLib) return;
  chartCAS?.destroy();
  chartCAS = new ChartLib(el('chart-cas'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'CAS', data: values, tension: 0.25 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,.08)' } },
        y: { min: 0, max: 1, grid: { color: 'rgba(255,255,255,.08)' } }
      }
    }
  });
};

const upsertMetrics = (labels, series) => {
  if (!ChartLib) return;
  chartMetrics?.destroy();
  chartMetrics = new ChartLib(el('chart-metrics'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'VR', data: series.vr, stack: 'm' },
        { label: 'DE', data: series.de, stack: 'm' },
        { label: 'QAA', data: series.qaa, stack: 'm' },
        { label: '1/FL', data: series.invfl, stack: 'm' },
        { label: 'CRI', data: series.cri, stack: 'm' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { color: 'rgba(255,255,255,.08)' } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,.08)' } }
      }
    }
  });
};

const upsertRadar = latest => {
  if (!ChartLib) return;
  chartRadar?.destroy();
  const invfl = !latest.fl || latest.fl === 0 ? 0 : 1 / latest.fl;
  chartRadar = new ChartLib(el('chart-radar'), {
    type: 'radar',
    data: {
      labels: ['VR', 'DE', 'QAA', '1/FL', 'CRI'],
      datasets: [{ label: 'Profile', data: [latest.vr, latest.de, latest.qaa, invfl, latest.cri] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 1,
          grid: { color: 'rgba(255,255,255,.12)' },
          angleLines: { color: 'rgba(255,255,255,.12)' }
        }
      }
    }
  });
};

const renderDash = async days => {
  const rows = await fetchMetrics(days);
  if (!rows || rows.length === 0) {
    if (msg) msg.textContent = 'No data yet.';
    return;
  }

  if (msg) msg.textContent = '';
  const last = rows[rows.length - 1];
  el('kpi-cas').textContent = safe(last.cas).toFixed(2);
  el('kpi-vr').textContent = safe(last.vr).toFixed(2);
  el('kpi-de').textContent = safe(last.de).toFixed(2);
  el('kpi-qaa').textContent = safe(last.qaa).toFixed(2);

  const labels = rows.map(row => row.day.slice(5));
  upsertCAS(labels, rows.map(row => safe(row.cas)));

  const series = {
    vr: rows.map(row => safe(row.vr)),
    de: rows.map(row => safe(row.de)),
    qaa: rows.map(row => safe(row.qaa)),
    invfl: rows.map(row => (!row.fl || row.fl === 0 ? 0 : 1 / row.fl)),
    cri: rows.map(row => safe(row.cri))
  };

  upsertMetrics(labels, series);
  upsertRadar(last);
};

const parseDays = () => {
  const value = parseInt(range.value, 10);
  return Number.isFinite(value) ? value : 30;
};

refreshButton.addEventListener('click', () => {
  renderDash(parseDays());
});

range.addEventListener('change', () => {
  renderDash(parseDays());
});

(async () => {
  const user = await requireAuth();
  if (!user) return;
  await renderDash(parseDays());
})();
