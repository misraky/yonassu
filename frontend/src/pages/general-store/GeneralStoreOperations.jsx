import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AlertTriangle, BarChart, Bell, Box, CheckCircle, ChevronDown, ChevronUp, ClipboardList, CornerDownLeft, DollarSign, Download, Droplet, Factory, FileText, Leaf, Mailbox, Package, Pin, Plus, Printer, Radio, Receipt, RefreshCw, Scroll, Search, Send, Settings, Shield, ShoppingBag, ShoppingCart, Shuffle, Sprout, TrendingDown, Truck, Wrench, Zap } from 'lucide-react';

import SegmentedSpinner from '../../components/ui/SegmentedSpinner';

/* ─── Color Palette ─────────────────────────────────────────────────────── */
const G = {
  forest: '#228B22', dark: '#1B5E20', emerald: '#2E8B57', leaf: '#4CAF50',
  sage: '#A5D6A7', olive: '#6B8E23', lime: '#8BC34A', brown: '#8D6E63',
  sky: '#87CEEB', white: '#FFFFFF', light: '#F5F5F5', darkGray: '#424242',
  orange: '#FF9800', red: '#F44336', purple: '#7C3AED',
};

const DEPARTMENTS = ['Printing', 'Car Rental', 'AgriRent', 'Retail', 'IT', 'Maintenance', 'Sales'];
const CATEGORIES  = ['Paper', 'Ink', 'Toner', 'Fuel', 'Lubricant/Oil', 'Spare Parts', 'Tires', 'Cleaning', 'Stationery', 'Chemical', 'Other'];

const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
const backendOrigin = rawApiUrl.replace(/\/api\/v1\/?$/, '');

const api = axios.create({
  baseURL: backendOrigin || '',
  withCredentials: true,
});
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  const s = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId');
  if (s) cfg.headers['x-session-id'] = s;
  return cfg;
});

/* ─── Shared UI ─────────────────────────────────────────────────────────── */
const Btn = ({ children, color = G.emerald, onClick, disabled, small }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: color, color: '#fff', border: 'none',
    borderRadius: 0, padding: small ? '6px 14px' : '10px 22px',
    fontWeight: 900, fontSize: small ? 12 : 14, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1, boxShadow: `4px 4px 0 ${color}99`, textTransform: 'uppercase', letterSpacing: 0.5,
  }}>{children}</button>
);

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 800, color: G.olive, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
    <input {...props} style={{ width: '100%', padding: '10px 14px', border: `3px solid ${G.sage}`, borderRadius: 0, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter,sans-serif', boxShadow: `3px 3px 0 ${G.sage}` }} />
  </div>
);

const Sel = ({ label, value, onChange, options, allowCustom }) => {
  const [custom, setCustom] = useState(false);
  const isOther = value && !DEPARTMENTS.concat(options || []).includes(value);
  return (
    <div style={{ marginBottom: 14 }}>
      <GlobalStyles />
      <div style={{ fontSize: 11, fontWeight: 800, color: G.olive, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      {(!custom && !isOther) ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={value} onChange={onChange} style={{ flex: 1, padding: '10px 14px', border: `3px solid ${G.sage}`, borderRadius: 0, fontSize: 14, boxShadow: `3px 3px 0 ${G.sage}` }}>
            <option value="">-- select --</option>
            {(options || DEPARTMENTS).map(d => <option key={d}>{d}</option>)}
          </select>
          {allowCustom && <Btn small color={G.olive} onClick={() => setCustom(true)}>+ Custom</Btn>}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={value} onChange={onChange} placeholder="Type department name..." style={{ flex: 1, padding: '10px 14px', border: `3px solid ${G.sage}`, borderRadius: 0, fontSize: 14 }} />
          <Btn small color={G.brown} onClick={() => { setCustom(false); onChange({ target: { value: '' } }); }}>✕</Btn>
        </div>
      )}
    </div>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 0, padding: 24, border: `3px solid ${G.sage}`, boxShadow: `6px 6px 0 ${G.sage}`, ...style }}>{children}</div>
);

const DeptBadge = ({ dept }) => {
  const colors = { Printing: G.forest, 'Car Rental': G.sky, AgriRent: G.lime, Sales: G.orange, Retail: G.purple, IT: G.emerald, Maintenance: G.brown };
  const c = colors[dept] || G.olive;
  return <span style={{ background: c, color: '#fff', padding: '4px 10px', borderRadius: 0, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{dept}</span>;
};

/* ─── Global Animations ─────────────────────────────────────────────────── */

const CategoryBar = ({ value, max, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.45)', borderRadius: 0, height: 7, overflow: 'hidden', flex: 1 }}>
    <div style={{
      height: '100%', borderRadius: 0, background: color,
      width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`,
      transition: 'width 1.2s ease'
    }} />
  </div>
);

const GlobalStyles = () => (
  <style>{`
    @keyframes floatLeaf { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(7deg); } }
    @keyframes rowIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }
    @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
    @keyframes laserSweep { 0% { left: -150%; } 100% { left: 150%; } }
    @keyframes colorBlink { 0% { color:#228B22; filter:drop-shadow(0 0 6px #228B2288); transform:scale(1) rotate(0deg); } 25% { color:#8BC34A; filter:drop-shadow(0 0 10px #8BC34Acc); transform:scale(1.15) rotate(10deg); } 50% { color:#2E8B57; filter:drop-shadow(0 0 14px #2E8B57); transform:scale(1.3) rotate(-10deg); } 75% { color:#87CEEB; filter:drop-shadow(0 0 10px #87CEEBcc); transform:scale(1.15) rotate(5deg); } 100% { color:#228B22; filter:drop-shadow(0 0 6px #228B2288); transform:scale(1) rotate(0deg); } }
    .blink-star { animation: colorBlink 2.5s infinite ease-in-out; display:inline-block; }

    .artistic-3d-title { font-size:3rem; font-weight:900; color:#1B5E20; letter-spacing:-0.02em; text-shadow:1px 1px 0 #fff, 2px 2px 0 #fff, 3px 3px 0 #fff, 4px 4px 0 #228B22, 5px 5px 0 #228B22, 6px 6px 0 #2E8B57, 7px 7px 0 #2E8B57, 8px 8px 15px rgba(0,0,0,0.2); margin:0; display:flex; align-items:center; gap:12px; line-height:1.1; }
    .artistic-3d-subtitle { font-size:1rem; color:#2E8B57; font-weight:800; text-align:center; text-transform:uppercase; letter-spacing:0.15em; margin:0; text-shadow:1px 1px 0px rgba(255,255,255,0.9); }
    .btn-sync { position: relative; background: #FFFFFF; color: #1B5E20; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; overflow: hidden; z-index: 1; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
    .btn-sync::before { content: ''; position: absolute; top: -100%; left: -100%; width: 300%; height: 300%; background: conic-gradient(transparent, transparent, transparent, #4CAF50, #228B22); animation: rotate-border 2s linear infinite; z-index: -2; }
    .btn-sync::after { content: ''; position: absolute; inset: 2px; background: #FFFFFF; border-radius: 6px; z-index: -1; }
    .btn-sync:hover::after { background: #F5F5F5; }
    .btn-sync:active { transform: scale(0.97); }
    @keyframes rotate-border { 100% { transform: rotate(360deg); } }

    .d-card {
      --hover-color: #2E8B57;
      position:relative; overflow:hidden; background-color:white; border-radius:0; padding:26px; box-shadow:0 2px 14px rgba(0,80,120,0.08); transition:background-size 0.4s cubic-bezier(.4,0,.2,1), box-shadow 0.4s, transform 0.4s; animation:fadeUp 0.5s ease both; border:none; cursor:pointer;
      background-image: linear-gradient(to right, var(--hover-color), var(--hover-color)), linear-gradient(to bottom, var(--hover-color), var(--hover-color)), linear-gradient(to left, var(--hover-color), var(--hover-color)), linear-gradient(to top, var(--hover-color), var(--hover-color));
      background-position: 0 0, 100% 0, 100% 100%, 0 100%; background-repeat: no-repeat; background-size: 0% 4px, 4px 0%, 0% 4px, 4px 0%;
    }
    .d-card::before { content:''; position:absolute; top:0; left:-150%; width:100%; height:100%; background:linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.4) 20%, rgba(255,0,255,0.4) 50%, rgba(0,255,0,0.4) 80%, transparent 100%); transform:skewX(-25deg); pointer-events:none; z-index:1; }
    .d-card:hover { transform:translateY(-4px); box-shadow:0 10px 30px rgba(0,80,120,0.14), 0 0 18px var(--hover-color); background-size: 100% 4px, 4px 100%, 100% 4px, 4px 100%; }
    .d-card:hover::before { animation: laserSweep 0.8s ease-out; }

    .d-card-no-hover {
      --hover-color: #228B22;
      position:relative; overflow:hidden; background:white; border-radius:0; padding:26px; box-shadow:0 2px 14px rgba(0,80,120,0.08); transition:background-size 0.4s cubic-bezier(.4,0,.2,1), box-shadow 0.4s; animation:fadeUp 0.5s ease both;
      background-image: linear-gradient(to right, var(--hover-color), var(--hover-color)), linear-gradient(to bottom, var(--hover-color), var(--hover-color)), linear-gradient(to left, var(--hover-color), var(--hover-color)), linear-gradient(to top, var(--hover-color), var(--hover-color));
      background-position: 0 0, 100% 0, 100% 100%, 0 100%; background-repeat: no-repeat; background-size: 0% 4px, 4px 0%, 0% 4px, 4px 0%;
    }
    .d-card-no-hover::before { content:''; position:absolute; top:0; left:-150%; width:100%; height:100%; background:linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.2) 20%, rgba(255,0,255,0.2) 50%, rgba(0,255,0,0.2) 80%, transparent 100%); transform:skewX(-25deg); pointer-events:none; z-index:1; }
    .d-card-no-hover:hover { box-shadow:0 6px 20px rgba(0,80,120,0.12), 0 0 14px var(--hover-color); background-size: 100% 4px, 4px 100%, 100% 4px, 4px 100%; }
    .d-card-no-hover:hover::before { animation: laserSweep 1s ease-out; }

    .alert-row { position:relative; overflow:hidden; display:flex; align-items:center; gap:14px; padding:13px 16px; background:rgba(230,242,235,0.5); border-radius:0; cursor:pointer; transition:all 0.25s; border:1.5px solid transparent; margin-bottom:10px; }
    .alert-row::before { content:''; position:absolute; top:0; left:-150%; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,0,255,0.3), rgba(0,255,255,0.3), transparent); transform:skewX(-25deg); pointer-events:none; z-index:1; }
    .alert-row:hover { background:white; border-color:var(--row-c); transform:translateX(4px); box-shadow:0 4px 14px rgba(0,0,0,0.08); }
    .alert-row:hover::before { animation: laserSweep 0.6s ease-in-out; }

    .cat-row { position:relative; overflow:hidden; display:grid; grid-template-columns:150px 1fr 70px; gap:12px; align-items:center; padding:11px 14px; border-radius:0; transition:background 0.2s; cursor:pointer; }
    .cat-row::before { content:''; position:absolute; top:0; left:-150%; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(0,255,0,0.2), rgba(0,255,255,0.2), transparent); transform:skewX(-25deg); pointer-events:none; z-index:1; }
    .cat-row:hover { background:rgba(230,242,235,0.6); box-shadow:0 2px 8px rgba(0,80,120,0.05); }
    .cat-row:hover::before { animation: laserSweep 0.6s ease-in-out; }

    .top-row { position:relative; overflow:hidden; display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:0; background:rgba(230,242,235,0.45); margin-bottom:8px; transition:all 0.2s; cursor:pointer; }
    .top-row::before { content:''; position:absolute; top:0; left:-150%; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(107,142,35,0.3), rgba(107,142,35,0.3), transparent); transform:skewX(-25deg); pointer-events:none; z-index:1; }
    .top-row:hover { background:white; box-shadow:0 3px 12px rgba(0,80,120,0.09); border:1px solid rgba(107,142,35,0.4); }
    .top-row:hover::before { animation: laserSweep 0.6s ease-in-out; }

    .qa-card {
      --hover-color: #2E8B57;
      --base-top: transparent;
      position:relative; overflow:hidden; background:rgba(255,255,255,0.65); border-radius:0; padding:22px 16px; text-align:center; cursor:pointer; transition:all 0.4s cubic-bezier(.4,0,.2,1); border:none;
      background-image: linear-gradient(to right, var(--hover-color), var(--hover-color)), linear-gradient(to bottom, var(--hover-color), var(--hover-color)), linear-gradient(to left, var(--hover-color), var(--hover-color)), linear-gradient(to top, var(--hover-color), var(--hover-color)), linear-gradient(to right, var(--base-top), var(--base-top));
      background-position: 0 0, 100% 0, 100% 100%, 0 100%, 0 0; background-repeat: no-repeat; background-size: 0% 4px, 4px 0%, 0% 4px, 4px 0%, 100% 4px;
    }
    .qa-card::before { content:''; position:absolute; top:0; left:-150%; width:100%; height:100%; background:linear-gradient(90deg, transparent, rgba(0,255,255,0.6), rgba(255,0,255,0.6), transparent); transform:skewX(-25deg); pointer-events:none; z-index:1; }
    .qa-card:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,80,120,0.12), 0 0 14px var(--hover-color); background-size: 100% 4px, 4px 100%, 100% 4px, 4px 100%, 100% 4px; }
    .qa-card:hover::before { animation: laserSweep 0.6s ease-out; }
  `}</style>
);


/* ─── 1. HOME ───────────────────────────────────────────────────────────── */
export const GSHome = () => {
  const [stats, setStats] = useState(null);
  const [logs,  setLogs]  = useState([]);
  const [mats,  setMats]  = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => setTimeString(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [rStats, rLogs, rMats] = await Promise.allSettled([
        api.get('/api/v1/printing-assets/stats'),
        api.get('/api/v1/printing-assets/log'),
        api.get('/api/v1/printing-assets/store/materials'),
      ]);
      if (rStats.status === 'fulfilled') setStats(rStats.value.data.data || null);
      if (rLogs.status  === 'fulfilled') setLogs((rLogs.value.data.data || []).slice(0, 8));
      if (rMats.status  === 'fulfilled') {
        const allMats = rMats.value.data.data || [];
        // Show all departments including Sales/Retail
        setMats(allMats);
      }

    } catch {}
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const nav = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };

  // ── Derived KPIs — VALUE always comes from inventory (mats) to avoid double-counting
  // Operations are already posted into inventory stock/value, so never sum from stats
  const totalValue     = mats.reduce((s, m) => s + parseFloat(m.total_value || 0), 0);
  const totalMaterials = mats.length;   // live count of distinct inventory lines

  // Non-value stats (machines, moves) still come from stats API — no overlap with inventory
  const pendingMoves       = stats?.pendingMoveRequests     ?? 0;
  const machinesInStore    = stats?.machinesInStore         ?? 0;
  const machinesInProd     = stats?.machinesInProduction    ?? 0;
  const machinesUnderMaint = stats?.machinesUnderMaintenance ?? 0;

  // ── Derived from materials list
  const lowStock      = mats.filter(m => parseFloat(m.quantity_in_store) <= parseFloat(m.reorder_level || 0));
  const totalQty      = mats.reduce((s, m) => s + parseFloat(m.quantity_in_store || 0), 0);
  const lowStockCount = lowStock.length;

  // ── Action-type breakdown for the table
  const logActions = ['Register', 'Move to Production', 'Issue to Department', 'Consume'];
  const logActionColors = { 'Register': '#16A34A', 'Move to Production': '#D97706', 'Issue to Department': '#2563EB', 'Consume': '#6B7280' };
  const actionBreakdown = logActions.map(a => {
    const rows = logs.filter(l => l.action_type === a);
    return {
      type: a,
      count: rows.length,
      total_qty: rows.reduce((s, l) => s + Math.abs(Number(l.quantity || 0)), 0),
    };
  }).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
  const maxActionCount = Math.max(...actionBreakdown.map(d => d.count), 1);

  // ── Department breakdown from materials
  const deptBreakdown = DEPARTMENTS.map(d => {
    const dMats = mats.filter(m => m.department === d);
    return {
      department: d,
      sku_count:      dMats.length,
      total_quantity: dMats.reduce((s, m) => s + parseFloat(m.quantity_in_store || 0), 0),
      total_value:    dMats.reduce((s, m) => s + parseFloat(m.total_value || 0), 0),
    };
  }).filter(d => d.sku_count > 0).sort((a, b) => b.total_value - a.total_value);
  const maxDeptValue = Math.max(...deptBreakdown.map(c => Number(c.total_value || 0)), 1);

  // ── Log action icons
  const logIcon  = { 'Register': <Package size={16} />, 'Move to Production': <Factory size={16} />, 'Return to Store': <CornerDownLeft size={16} />, 'Issue to Department': <Send size={16} />, 'Value Update': <DollarSign size={16} />, 'Consume': <Settings size={16} /> };
  const logColor = { 'Register': '#16A34A', 'Move to Production': '#D97706', 'Return to Store': '#0284C7', 'Issue to Department': '#2563EB', 'Value Update': '#2563EB', 'Consume': '#6B7280' };
  const COLORS_ARR = ['#2563EB', '#0284C7', '#7C3AED', '#D97706', '#16A34A', '#DC2626'];

  return (
    <div className="gsh-home">
      <style>{`
        .gsh-home { box-sizing: border-box; width: 100%; min-height: 100%; background: var(--color-bg-page, #F5F6FA); color: var(--color-text-primary, #111827); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; padding: 0; }
        .gsh-home *, .gsh-home *::before, .gsh-home *::after { box-sizing: border-box; }
        .gsh-home button { font-family: inherit; }

        /* ── Header ── */
        .gsh-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0 0 24px 0; }
        .gsh-title { margin: 0; font-size: 26px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: var(--color-text-primary, #111827); display: flex; align-items: center; gap: 10px; }
        .gsh-subtitle { margin: 4px 0 0; font-size: 13px; font-weight: 400; color: var(--color-text-secondary, #6B7280); }
        .gsh-sync { height: 36px; padding: 0 16px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 150ms ease-in-out, transform 150ms ease-in-out, box-shadow 150ms ease-in-out; }
        .gsh-sync:hover { background: var(--color-primary-hover, #1D4ED8); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .gsh-sync:active { transform: translateY(0); }
        .gsh-sync:disabled { opacity: 0.5; cursor: not-allowed; }
        .gsh-sync:focus-visible { outline: 3px solid rgba(37,99,235,0.35); outline-offset: 2px; }

        /* ── Cards ── */
        .gsh-card { background: var(--color-bg-card, #FFFFFF); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); padding: 20px; transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out, border-color 150ms ease-in-out; }
        .gsh-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); border-color: #DBEAFE; }
        .gsh-card--hero { background: var(--color-primary, #2563EB); border-color: var(--color-primary, #2563EB); color: #fff; cursor: pointer; }
        .gsh-card--hero:hover { box-shadow: 0 4px 12px rgba(37,99,235,0.28); transform: translateY(-1px); border-color: var(--color-primary, #2563EB); }
        .gsh-clickable { cursor: pointer; }

        /* ── KPI ── */
        .gsh-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .gsh-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .gsh-kpi-label { font-size: 12px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
        .gsh-card--hero .gsh-kpi-label { color: #BFDBFE; }
        .gsh-kpi-icon { width: 36px; height: 36px; border-radius: 8px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: transform 150ms ease-in-out; }
        .gsh-card:hover .gsh-kpi-icon { transform: scale(1.06); }
        .gsh-card--hero .gsh-kpi-icon { background: rgba(255,255,255,0.16); }
        .gsh-kpi-value { margin: 16px 0 4px; font-size: 28px; font-weight: 600; line-height: 1.3; letter-spacing: -0.02em; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }
        .gsh-card--hero .gsh-kpi-value { color: #fff; }
        .gsh-kpi-sub { font-size: 13px; line-height: 1.5; color: var(--color-text-secondary, #6B7280); }
        .gsh-card--hero .gsh-kpi-sub { color: #DBEAFE; }

        /* ── Section layout ── */
        .gsh-grid-32 { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; margin-bottom: 16px; }
        .gsh-grid-13 { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
        .gsh-section-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .gsh-section-title { font-size: 16px; font-weight: 600; line-height: 1.3; color: var(--color-text-primary, #111827); }
        .gsh-section-hint { margin-left: auto; font-size: 12px; color: var(--color-text-muted, #9CA3AF); }

        /* ── Mini sub-KPIs ── */
        .gsh-mini-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .gsh-mini { border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; background: var(--color-bg-card, #FFFFFF); padding: 12px 14px; transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out, border-color 150ms ease-in-out, background 150ms ease-in-out; }
        .gsh-mini:hover { border-color: #BFDBFE; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); background: #F8FAFF; }
        .gsh-mini-icon { font-size: 16px; margin-bottom: 8px; }
        .gsh-mini-value { font-size: 22px; font-weight: 600; line-height: 1.3; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }
        .gsh-mini-label { font-size: 11px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); margin-top: 2px; }

        /* ── Breakdown rows ── */
        .gsh-thead { display: grid; grid-template-columns: 150px 1fr 60px 80px; gap: 12px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--color-border, #E5E7EB); }
        .gsh-thead > div { font-size: 12px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
        .gsh-trow { display: grid; grid-template-columns: 150px 1fr 60px 80px; gap: 12px; align-items: center; padding: 12px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: background 150ms ease-in-out; }
        .gsh-trow:hover { background: #F9FAFB; }
        .gsh-trow:hover .gsh-num { color: var(--color-primary, #2563EB); }
        .gsh-trow:last-child { border-bottom: none; }
        .gsh-tname { display: flex; align-items: center; gap: 8px; min-width: 0; overflow: hidden; font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); }
        .gsh-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .gsh-num { text-align: right; font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }
        .gsh-bar { height: 8px; border-radius: 9999px; background: #F3F4F6; overflow: hidden; }
        .gsh-bar-fill { height: 100%; border-radius: 9999px; transition: width 300ms ease; }

        /* ── Activity feed ── */
        .gsh-actrow { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 8px; cursor: pointer; transition: background 150ms ease-in-out; }
        .gsh-actrow:hover { background: #F9FAFB; }
        .gsh-actrow:hover .gsh-acttitle { color: var(--color-primary, #2563EB); }
        .gsh-actrow:hover .gsh-actdate { color: var(--color-primary, #2563EB); }
        .gsh-acticon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; transition: transform 150ms ease-in-out; }
        .gsh-actrow:hover .gsh-acticon { transform: scale(1.08); }
        .gsh-actbody { flex: 1; min-width: 0; }
        .gsh-acttitle { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gsh-actmeta { font-size: 12px; color: var(--color-text-secondary, #6B7280); margin-top: 2px; }
        .gsh-actdate { font-size: 12px; color: var(--color-text-muted, #9CA3AF); white-space: nowrap; font-variant-numeric: tabular-nums; }

        /* ── Alerts ── */
        .gsh-alert { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--color-border, #E5E7EB); border-left: 3px solid var(--accent, #0284C7); border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
        .gsh-alert:hover { background: #F9FAFB; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .gsh-alert-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; transition: transform 150ms ease-in-out; }
        .gsh-alert:hover .gsh-alert-icon { transform: scale(1.08); }
        .gsh-alert-body { flex: 1; min-width: 0; }
        .gsh-alert-title { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); }
        .gsh-alert-sub { font-size: 12px; color: var(--color-text-secondary, #6B7280); margin-top: 2px; }
        .gsh-chev { color: var(--color-text-muted, #9CA3AF); font-size: 14px; transition: color 150ms ease-in-out, transform 150ms ease-in-out; }
        .gsh-alert:hover .gsh-chev { color: var(--color-primary, #2563EB); transform: translateX(2px); }
        .gsh-lowitem { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin: 0 -10px; border-top: 1px solid #F3F4F6; border-radius: 8px; transition: background 150ms ease-in-out; }
        .gsh-lowitem:hover { background: #F9FAFB; }

        /* ── Badges ── */
        .gsh-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; line-height: 1; }
        .gsh-badge--warn { background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); }
        .gsh-lowname { flex: 1; min-width: 0; font-size: 13px; font-weight: 500; color: var(--color-text-primary, #111827); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .gsh-lowmeta { font-size: 12px; color: var(--color-text-muted, #9CA3AF); white-space: nowrap; }

        /* ── Quick actions ── */
        .gsh-quick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .gsh-quick { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; padding: 16px 12px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; background: var(--color-bg-card, #FFFFFF); cursor: pointer; transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out, border-color 150ms ease-in-out; }
        .gsh-quick:hover { border-color: #BFDBFE; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .gsh-quick-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 6px; transition: transform 150ms ease-in-out; }
        .gsh-quick:hover .gsh-quick-icon { transform: scale(1.08); }
        .gsh-quick-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); transition: color 150ms ease-in-out; }
        .gsh-quick:hover .gsh-quick-label { color: var(--color-primary, #2563EB); }
        .gsh-quick-sub { font-size: 12px; color: var(--color-text-secondary, #6B7280); }

        /* ── Empty state ── */
        .gsh-empty { text-align: center; padding: 28px 0; font-size: 13px; color: var(--color-text-muted, #9CA3AF); }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .gsh-grid-32, .gsh-grid-13 { grid-template-columns: 1fr; }
          .gsh-quick-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .gsh-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .gsh-mini-grid { grid-template-columns: repeat(2, 1fr); }
          .gsh-thead, .gsh-trow { grid-template-columns: 120px 1fr 44px 64px; }
          .gsh-title { font-size: 22px; }
        }
        @media (max-width: 480px) {
          .gsh-sync { height: 44px; }
          .gsh-card { padding: 16px; }
          .gsh-header { gap: 12px; }
          .gsh-kpi-value { font-size: 24px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="gsh-header">
        <div>
          <h1 className="gsh-title">
            Store HQ. <span><Leaf size={18} /></span>
          </h1>
          <p className="gsh-subtitle">
            Universal General Store · It&apos;s {timeString}
          </p>
        </div>
        <button onClick={() => { load().then(() => window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Store dashboard synced with the latest data.', type: 'success' } }))); }} className="gsh-sync" disabled={refreshing}>
          {refreshing && <SegmentedSpinner size={16} color="#fff" />}
          <span>SYNC</span>
        </button>
      </div>

      {/* ── ROW 1: KPI CARDS ── */}
      <div className="gsh-kpi-grid">

        {/* Store Value Hero */}
        <div className="gsh-card gsh-card--hero" onClick={() => nav('/general-store/inventory')}>
          <div className="gsh-kpi-top">
            <span className="gsh-kpi-label">Total Store Value</span>
            <span className="gsh-kpi-icon"><DollarSign size={18} /></span>
          </div>
          <div className="gsh-kpi-value">
            <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8, marginRight: 6 }}>ETB</span>
            {Number(totalValue).toLocaleString(undefined,{maximumFractionDigits:0})}
          </div>
          <div className="gsh-kpi-sub">From live inventory only — no double-count · {totalMaterials} distinct item lines</div>
        </div>

        {/* Stock SKUs */}
        <div className="gsh-card gsh-clickable" onClick={() => nav('/general-store/inventory')}>
          <div className="gsh-kpi-top">
            <span className="gsh-kpi-label">Stock Lines</span>
            <span className="gsh-kpi-icon"><Package size={18} /></span>
          </div>
          <div className="gsh-kpi-value">{totalMaterials.toLocaleString()}</div>
          <div className="gsh-kpi-sub">Unique SKU lines</div>
        </div>

        {/* Stock Units */}
        <div className="gsh-card gsh-clickable" onClick={() => nav('/general-store/inventory')}>
          <div className="gsh-kpi-top">
            <span className="gsh-kpi-label">Total Qty</span>
            <span className="gsh-kpi-icon"><ClipboardList size={18} /></span>
          </div>
          <div className="gsh-kpi-value">{Number(totalQty).toLocaleString()}</div>
          <div className="gsh-kpi-sub">Total units in store</div>
        </div>

        {/* Low Stock Alert */}
        <div className="gsh-card gsh-clickable" onClick={() => nav('/general-store/inventory')}>
          <div className="gsh-kpi-top">
            <span className="gsh-kpi-label">Low Stock</span>
            <span className="gsh-kpi-icon" style={{ background: lowStockCount > 0 ? '#FEF3C7' : '#DCFCE7' }}>
              {lowStockCount > 0 ? <AlertTriangle size={16} /> : '✓…'}
            </span>
          </div>
          <div className="gsh-kpi-value" style={{ color: lowStockCount > 0 ? '#D97706' : '#16A34A' }}>{lowStockCount}</div>
          <div className="gsh-kpi-sub">Items below min level</div>
        </div>
      </div>

      {/* ── ROW 2: MOVEMENT BREAKDOWN + ACTIVITY FEED ── */}
      <div className="gsh-grid-32">

        {/* Action Breakdown */}
        <div className="gsh-card">
          <div className="gsh-section-head">
            <span style={{ fontSize: 18 }}><Shuffle size={18} /></span>
            <span className="gsh-section-title">Store Activity Breakdown</span>
            <span className="gsh-section-hint">Based on recent logs</span>
          </div>
          <div className="gsh-mini-grid">
            {[
              { label: 'Total Machines', val: (machinesInStore + machinesInProd + machinesUnderMaint), icon: <Printer size={16} />, c: G.forest },
              { label: 'In Production',  val: machinesInProd,       icon: <Factory size={16} />, c: G.orange },
              { label: 'Under Maint.',   val: machinesUnderMaint,   icon: <Wrench size={16} />, c: G.sky    },
              { label: 'Pending Moves',  val: pendingMoves,         icon: <RefreshCw size={16} />, c: G.purple },
            ].map(k => (
              <div key={k.label} className="gsh-mini">
                <div className="gsh-mini-icon">{k.icon}</div>
                <div className="gsh-mini-value">{k.val}</div>
                <div className="gsh-mini-label">{k.label}</div>
              </div>
            ))}
          </div>
          <div className="gsh-thead">
            <div>Action</div>
            <div>Trend</div>
            <div className="gsh-num">Count</div>
            <div className="gsh-num">Total Qty</div>
          </div>
          {actionBreakdown.length === 0 ? (
            <div className="gsh-empty">No log data yet</div>
          ) : actionBreakdown.map((row, i) => {
            const c = logActionColors[row.type] || COLORS_ARR[i % COLORS_ARR.length];
            return (
              <div key={row.type} className="gsh-trow" onClick={() => nav('/general-store/logs')}>
                <div className="gsh-tname"><span className="gsh-dot" style={{ background: c }} />{row.type}</div>
                <div>
                  <div className="gsh-bar"><div className="gsh-bar-fill" style={{ width: `${maxActionCount > 0 ? Math.min(100, (row.count / maxActionCount) * 100) : 0}%`, background: c }} /></div>
                </div>
                <div className="gsh-num">{row.count}</div>
                <div className="gsh-num">{Number(row.total_qty).toLocaleString()}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity Feed */}
        <div className="gsh-card">
          <div className="gsh-section-head">
            <span style={{ fontSize: 18 }}><Scroll size={18} /></span>
            <span className="gsh-section-title">Recent Activity</span>
          </div>
          {logs.length === 0 ? (
            <div className="gsh-empty"><TrendingDown size={18} /> No logs yet</div>
          ) : logs.slice(0,6).map((l, i) => {
            const c = logColor[l.action_type] || COLORS_ARR[i % COLORS_ARR.length];
            const icon = logIcon[l.action_type] || <Pin size={16} />;
            return (
              <div key={l.id} className="gsh-actrow" onClick={() => nav('/general-store/logs')}>
                <div className="gsh-acticon" style={{ background: `${c}1A`, color: c }}>{icon}</div>
                <div className="gsh-actbody">
                  <div className="gsh-acttitle">{l.action_type}: {l.item_id}</div>
                  <div className="gsh-actmeta">{l.department}</div>
                </div>
                <span className="gsh-actdate">
                  {l.date_time ? new Date(l.date_time).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ROW 3: LOW STOCK ALERTS + QUICK ACTIONS ── */}
      <div className="gsh-grid-13">

        {/* Low Stock Items */}
        <div className="gsh-card">
          <div className="gsh-section-head"><span className="gsh-section-title"><AlertTriangle size={18} /> Attention Required</span></div>
          {[
            { label: `${pendingMoves} Pending Actions`, sub: 'Movements awaiting approval', icon: <RefreshCw size={16} />, bg: '#E0F2FE', c: '#0284C7', path: '/general-store/logs' },
            { label: `${lowStock.length} Low Stock Items`, sub: 'Below minimum level', icon: <AlertTriangle size={16} />, bg: '#FEF3C7', c: '#D97706', path: '/general-store/inventory' }
          ].map(row => (
            <div key={row.label} className="gsh-alert" style={{ '--accent': row.c }} onClick={() => nav(row.path)}>
              <div className="gsh-alert-icon" style={{ background: row.bg }}>{row.icon}</div>
              <div className="gsh-alert-body">
                <div className="gsh-alert-title">{row.label}</div>
                <div className="gsh-alert-sub">{row.sub}</div>
              </div>
              <span className="gsh-chev">›</span>
            </div>
          ))}
          {lowStock.slice(0,3).map(item => (
            <div key={item.id} className="gsh-lowitem">
              <span className="gsh-badge gsh-badge--warn">{item.quantity_in_store}</span>
              <span className="gsh-lowname">{item.material_name}</span>
              <span className="gsh-lowmeta">min:{item.reorder_level || 0}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="gsh-card">
          <div className="gsh-section-head"><span className="gsh-section-title"><Zap size={18} /> Quick Operations</span></div>
          <div className="gsh-quick-grid">
            {[
              { label: 'View Inventory',  sub: 'Browse items', icon: <ClipboardList size={16} />, bg: '#EFF6FF', color: G.forest,  href: '/general-store/inventory' },
              { label: 'Register Item',   sub: 'New stock',    icon: <Plus size={16} />, bg: '#E0F2FE', color: G.emerald, href: '/general-store/register' },
              { label: 'Issue Item',      sub: 'To dept',      icon: <Send size={16} />, bg: '#DBEAFE', color: G.olive,   href: '/general-store/issue' },
              { label: 'Stock Alerts',    sub: 'Low stock',    icon: <Bell size={16} />, bg: '#FEF3C7', color: G.orange,  href: '/general-store/inventory' },
              { label: 'Move Logs',       sub: 'History',      icon: <Scroll size={16} />, bg: '#DBEAFE', color: G.sky,     href: '/general-store/logs' },
              { label: 'Valuation',       sub: 'Asset value',  icon: <BarChart size={16} />, bg: '#F3E5F5', color: G.purple,  href: '/general-store/valuation' },
              { label: 'Reports',         sub: 'Print audit',  icon: <Printer size={16} />, bg: '#F3F4F6', color: G.brown,   href: '/general-store/reports' }
            ].map(a => (
              <div key={a.label} className="gsh-quick" onClick={() => nav(a.href)}>
                <div className="gsh-quick-icon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                <div className="gsh-quick-label">{a.label}</div>
                <div className="gsh-quick-sub">{a.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


/* ─── 2. INVENTORY LIST ─────────────────────────────────────────────────── */
const GSI_CSS = `
  .gsi-home { box-sizing: border-box; width: 100%; min-height: 100%; background: var(--color-bg-page, #F5F6FA); color: var(--color-text-primary, #111827); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsi-home *, .gsi-home *::before, .gsi-home *::after { box-sizing: border-box; }
  .gsi-home button, .gsi-home input, .gsi-home select { font-family: inherit; }

  /* ── Toast ── */
  @keyframes gsiToastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .gsi-toast { position: fixed; right: 24px; bottom: 24px; z-index: 10000; max-width: 380px; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; background: var(--color-text-primary, #111827); color: #fff; font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.18); animation: gsiToastIn 200ms ease; }
  .gsi-toast--success { background: var(--color-success, #16A34A); }
  .gsi-toast--error { background: var(--color-danger, #DC2626); }
  .gsi-toast-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.24); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* ── Update Material modal ── */
  @keyframes gsiModalIn { from { opacity: 0; transform: translateY(-8px) scale(0.99); } to { opacity: 1; transform: none; } }
  .gsi-modal-wrap { position: fixed; inset: 0; z-index: 9999; display: flex; overflow-y: auto; background: rgba(0,0,0,0.45); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsi-modal { width: 100%; max-width: 720px; margin: auto; background: var(--color-bg-card, #fff); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: gsiModalIn 180ms ease; }
  .gsi-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--color-border, #E5E7EB); }
  .gsi-modal-title { margin: 0; font-size: 18px; font-weight: 600; color: var(--color-text-primary, #111827); display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .gsi-modal-id { font-size: 12px; font-weight: 600; color: var(--color-primary, #2563EB); background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 9999px; padding: 2px 8px; }
  .gsi-modal-sub { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsi-modal-close { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: var(--color-bg-card, #fff); color: var(--color-text-secondary, #6B7280); font-size: 16px; cursor: pointer; transition: background 150ms ease-in-out, color 150ms ease-in-out, border-color 150ms ease-in-out; }
  .gsi-modal-close:hover { background: var(--color-danger-bg, #FEE2E2); color: var(--color-danger, #DC2626); border-color: #FECACA; }
  .gsi-modal-body { display: flex; flex-direction: column; gap: 24px; padding: 24px; }
  .gsi-fieldset-title { margin-bottom: 16px; font-size: 13px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
  .gsi-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .gsi-field { display: flex; flex-direction: column; gap: 6px; }
  .gsi-label { font-size: 12px; font-weight: 500; color: var(--color-text-secondary, #6B7280); }
  .gsi-input { width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out; }
  .gsi-input:focus { outline: none; border-color: var(--color-primary, #2563EB); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
  .gsi-dept-row { display: flex; gap: 8px; }
  .gsi-dept-row .gsi-input { flex: 1; min-width: 0; }
  .gsi-icon-btn { flex-shrink: 0; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-success, #16A34A); font-size: 18px; cursor: pointer; transition: background 150ms ease-in-out, border-color 150ms ease-in-out; }
  .gsi-icon-btn:hover { background: var(--color-success-bg, #DCFCE7); border-color: #86EFAC; }
  .gsi-icon-btn--danger { color: var(--color-danger, #DC2626); }
  .gsi-icon-btn--danger:hover { background: var(--color-danger-bg, #FEE2E2); border-color: #FECACA; }
  .gsi-modal-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 20px 24px; border-top: 1px solid var(--color-border, #E5E7EB); border-radius: 0 0 12px 12px; background: #F9FAFB; }
  .gsi-total { display: flex; flex-direction: column; }
  .gsi-total-label { font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-text-muted, #9CA3AF); }
  .gsi-total-value { font-size: 20px; font-weight: 600; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }
  .gsi-save { height: 40px; padding: 0 20px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsi-save:hover:not(:disabled) { background: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); transform: translateY(-1px); }
  .gsi-save:disabled { opacity: 0.55; cursor: not-allowed; }
  .gsi-save:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }

  /* ── Page header ── */
  .gsi-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0 0 20px 0; }
  .gsi-title { margin: 0; font-size: 24px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: var(--color-text-primary, #111827); display: flex; align-items: center; gap: 10px; }
  .gsi-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsi-refresh { height: 36px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: var(--color-bg-card, #fff); color: var(--color-text-primary, #111827); font-size: 14px; font-weight: 500; cursor: pointer; transition: background 150ms ease-in-out, color 150ms ease-in-out, border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsi-refresh:hover { color: #B45309; border-color: #EAB308; box-shadow: 0 4px 12px rgba(234,179,8,0.18); transform: translateY(-1px); }
  .gsi-refresh:disabled { opacity: 0.55; cursor: not-allowed; }
  .gsi-refresh:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }
  .gsi-add-btn { height: 36px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 150ms ease-in-out; }
  .gsi-add-btn:hover { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
  .gsi-badge--pending { background: #FEF3C7 !important; color: #92400E !important; border: 1px solid #FDE68A; font-weight: 600 !important; }
  .gsi-print { height: 36px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: var(--color-bg-card, #fff); color: var(--color-text-primary, #111827); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 150ms ease-in-out; }
  .gsi-print:hover { color: #2563EB; border-color: #2563EB; background: #EFF6FF; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.15); }


  /* ── Stat cards ── */
  .gsi-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .gsi-stat { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out, border-color 150ms ease-in-out; }
  .gsi-stat:hover { box-shadow: 0 4px 12px rgba(234,179,8,0.18); transform: translateY(-1px); border-color: #FDE68A; }
  .gsi-stat-icon { flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 18px; transition: transform 150ms ease-in-out; }
  .gsi-stat:hover .gsi-stat-icon { transform: scale(1.08); }
  .gsi-stat-value { font-size: 22px; font-weight: 600; line-height: 1.25; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }
  .gsi-stat-label { margin-top: 2px; font-size: 11px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }

  /* ── Filters ── */
  .gsi-filters { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 16px; margin-bottom: 16px; padding: 16px; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .gsi-filter { display: flex; flex-direction: column; gap: 6px; }
  .gsi-filter-label { font-size: 12px; font-weight: 500; color: var(--color-text-secondary, #6B7280); }
  .gsi-select, .gsi-search { width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out; }
  .gsi-select:focus, .gsi-search:focus { outline: none; border-color: var(--color-primary, #2563EB); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }

  /* ── Table ── */
  .gsi-table-card { overflow: hidden; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .gsi-table-wrap { overflow-x: auto; }
  .gsi-thead, .gsi-tr { display: grid; grid-template-columns: 48px 1.8fr 1.1fr 1.2fr 0.8fr 0.7fr 0.7fr 1fr 1.1fr 0.85fr 1fr; min-width: 880px; width: 100%; align-items: center; }
  .gsi-th { padding: 12px 10px; background: #F9FAFB; border-bottom: 1px solid var(--color-border, #E5E7EB); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); white-space: nowrap; }
  .gsi-th--num { text-align: right; }
  .gsi-tr { transition: background 150ms ease-in-out; border-bottom: 1px solid #F3F4F6; }
  .gsi-tr:hover { background: #FEFCE8; }
  .gsi-tr--grand-total { background: #FEF3C7 !important; border-top: 2px solid #F59E0B; border-bottom: none; font-weight: 700; color: #92400E; }
  .gsi-tr--grand-total .gsi-td { padding: 16px 10px; font-size: 14px; }
  .gsi-tr:hover .gsi-num { color: #CA8A04; }
  .gsi-tr--low { background: rgba(234,179,8,0.06); }
  .gsi-tr--low:hover { background: rgba(234,179,8,0.10); }
  .gsi-tr--low > .gsi-td:first-child { box-shadow: inset 3px 0 0 var(--color-warning, #D97706); }
  .gsi-td { padding: 13px 10px; display: flex; align-items: center; min-width: 0; overflow: hidden; font-size: 13px; color: var(--color-text-primary, #111827); }
  .gsi-td--num { justify-content: flex-end; text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .gsi-td--strong { font-weight: 600; }
  .gsi-td--dim { color: var(--color-text-secondary, #6B7280); }
  .gsi-td--idx { justify-content: flex-start; color: var(--color-text-muted, #9CA3AF); font-variant-numeric: tabular-nums; }
  .gsi-badge { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsi-badge--id { background: #F3F4F6; color: var(--color-text-secondary, #6B7280); font-variant-numeric: tabular-nums; }
  .gsi-badge--cat { background: var(--color-info-bg, #E0F2FE); color: var(--color-info, #0284C7); }
  .gsi-badge--low { background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); }
  .gsi-badge--ok { background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); }
  .gsi-value-low { color: var(--color-warning, #D97706); font-weight: 700; }
  .gsi-upd-btn { height: 30px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; border-radius: 6px; background: var(--color-primary, #2563EB); color: #fff; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsi-upd-btn:hover { background: #EAB308; color: #78350F; box-shadow: 0 4px 10px rgba(234,179,8,0.35); transform: translateY(-1px); }
  .gsi-upd-btn:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }

  /* ── States ── */
  .gsi-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 64px 0; color: var(--color-text-secondary, #6B7280); font-size: 14px; }
  .gsi-empty { padding: 48px 0; text-align: center; color: var(--color-text-muted, #9CA3AF); font-size: 14px; }
  .gsi-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 16px; border-top: 1px solid var(--color-border, #E5E7EB); background: #F9FAFB; font-size: 12px; color: var(--color-text-secondary, #6B7280); }
  .gsi-foot-total { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .gsi-stats { grid-template-columns: repeat(2, 1fr); }
    .gsi-filters { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .gsi-filters { grid-template-columns: 1fr; }
    .gsi-grid-2 { grid-template-columns: 1fr; }
    .gsi-title { font-size: 20px; }
    .gsi-modal-wrap { padding: 24px 12px; }
  }
  @media (max-width: 480px) {
    .gsi-stats { grid-template-columns: 1fr; }
    .gsi-refresh { height: 44px; }
    .gsi-select, .gsi-search { height: 44px; }
    .gsi-input { height: 44px; }
    .gsi-icon-btn { width: 44px; height: 44px; }
    .gsi-modal-foot { flex-direction: column; align-items: stretch; }
    .gsi-save { width: 100%; height: 44px; }
  }
`;

export const GSInventory = () => {
  const [items, setItems]     = useState([]);
  const [dept, setDept]       = useState('');
  const [cat, setCat]         = useState('');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [customDept, setCustomDept] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dept) params.department = dept;
      const r = await api.get('/api/v1/printing-assets/store/materials', { params });
      const all = r.data?.data || r.data || [];
      setItems(Array.isArray(all) ? all : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [dept]);

  useEffect(() => { load(); }, [load]);

  // Dynamic departments derived from standard list + actual inventory items
  const allDepts = Array.from(new Set([...DEPARTMENTS, 'Retail', ...items.map(m => m.department)].filter(Boolean)));

  const filtered = items.filter(i => {
    const matchCat = !cat || (i.category && i.category.toLowerCase() === cat.toLowerCase());
    const s = search.trim().toLowerCase();
    const matchSearch = !s || (
      (i.material_name && String(i.material_name).toLowerCase().includes(s)) ||
      (i.material_id && String(i.material_id).toLowerCase().includes(s)) ||
      (i.department && String(i.department).toLowerCase().includes(s))
    );
    return matchCat && matchSearch;
  });

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4500); };

  const submitUpdate = async () => {
    if (!updatingItem.material_name || !updatingItem.material_name.trim()) {
      return showToast('error', 'Item Name required');
    }
    setSaving(true);
    try {
      const res = await api.put(`/api/v1/printing-assets/store/materials/${updatingItem.id}`, updatingItem);
      showToast('success', res.data?.message || `Update request submitted for "${updatingItem.material_name}"!`);
      setTimeout(() => {
        setUpdatingItem(null);
        load();
      }, 1200);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const deptColors = {
    Printing: '#16A34A',
    'Car Rental': '#0284C7',
    AgriRent: '#D97706',
    Sales: '#7C3AED',
    Retail: '#DB2777',
    IT: '#2563EB',
    Maintenance: '#DC2626'
  };

  const lowStockCount = items.filter(m => parseFloat(m.quantity_in_store || 0) <= parseFloat(m.reorder_level || 10)).length;
  const uniqueDeptsCount = Array.from(new Set(items.map(m => m.department).filter(Boolean))).length;

  const stats = [
    { label: 'Total Items', value: items.length, icon: <ClipboardList size={16} />, c: '#2563EB' },
    { label: 'Low Stock', value: lowStockCount, icon: <AlertTriangle size={16} />, c: lowStockCount > 0 ? '#DC2626' : '#D97706' },
    { label: 'Filtered', value: filtered.length, icon: <Search size={16} />, c: '#0284C7' },
    { label: 'Departments', value: uniqueDeptsCount, icon: <Box size={16} />, c: '#16A34A' },
  ];
  const numCols = ['IN STORE', 'REORDER', 'UNIT', 'COST PRICE', 'TOTAL VALUE'];

  const handlePrint = () => {
    const totalVal = filtered.reduce((s, m) => s + parseFloat(m.total_value || 0), 0);
    const dateStr = new Date().toLocaleString();
    const rowsHtml = filtered.map((m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${m.material_id || '—'}</td>
        <td><strong>${m.material_name}</strong></td>
        <td>${m.category || 'General'}</td>
        <td>${m.department || '—'}</td>
        <td class="num">${parseFloat(m.quantity_in_store || 0).toLocaleString()}</td>
        <td class="num">${parseInt(m.reorder_level) || 10}</td>
        <td>${m.unit || 'unit'}</td>
        <td class="num">${m.unit_value > 0 ? parseFloat(m.unit_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
        <td class="num"><strong>${m.total_value > 0 ? parseFloat(m.total_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</strong></td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html><head><title>Consumables Inventory</title>
<style>
@page { size: A4 landscape; margin: 15mm; }
body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; margin: 0; padding: 0; font-size: 11px; }
.header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #111827; padding-bottom: 10px; }
.header h1 { margin: 0 0 5px 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
.header p { margin: 0; color: #4B5563; font-size: 12px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
th { background: #F3F4F6; padding: 8px; text-align: left; border-bottom: 2px solid #D1D5DB; font-size: 10px; text-transform: uppercase; color: #374151; }
td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.grand-total { background: #F9FAFB; font-weight: bold; border-top: 2px solid #111827; }
.grand-total td { padding: 10px 8px; font-size: 12px; }
.footer { text-align: center; font-size: 10px; color: #6B7280; margin-top: 30px; }
</style></head><body>
<div class="header"><h1>SUTANA EMS</h1><p>General Store — Consumables Inventory</p><p>Generated on: ${dateStr} | Total Items: ${filtered.length}</p></div>
<table><thead><tr><th>No.</th><th>Item ID</th><th>Item Name</th><th>Category</th><th>Department</th><th class="num">In Store</th><th class="num">Reorder</th><th>Unit</th><th class="num">Cost Price (ETB)</th><th class="num">Total Value (ETB)</th></tr></thead>
<tbody>${rowsHtml}<tr class="grand-total"><td colspan="9" class="num" style="padding-right: 15px;">GRAND TOTAL VALUE (ETB):</td><td class="num">${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr></tbody></table>
<div class="footer">Printed from SUTANA General Store Operations System</div>
<script>window.onload = function() { window.print(); }<\/script></body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const navToRegister = () => {
    window.history.pushState({}, '', '/general-store/register');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="gsi-home">
      <style>{GSI_CSS}</style>

      {/* ── HEADER ── */}
      <div className="gsi-header">
        <div>
          <h1 className="gsi-title"><Package size={20} /> Consumables Inventory</h1>
          <p className="gsi-subtitle">Comprehensive tracking of consumables, store quantities, unit valuations, and reorder levels</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="gsi-add-btn" onClick={navToRegister} title="Register a new inventory consumable">
            <Plus size={16} />
            <span>REGISTER ITEM</span>
          </button>
          <button className="gsi-print" onClick={handlePrint} title="Print inventory report">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>PRINT</span>
          </button>
          <button className="gsi-refresh" onClick={load} disabled={loading} title="Refresh inventory from server">
            {loading ? <SegmentedSpinner size={16} color="#2563EB" /> : <RefreshCw size={15} />}
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="gsi-stats">
        {stats.map(s => (
          <div key={s.label} className="gsi-stat">
            <div className="gsi-stat-icon" style={{ background: `${s.c}1A`, color: s.c }}>{s.icon}</div>
            <div>
              <div className="gsi-stat-value">{Number(s.value).toLocaleString()}</div>
              <div className="gsi-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ── */}
      <div className="gsi-filters">
        <div className="gsi-filter">
          <label className="gsi-filter-label">Department</label>
          <select className="gsi-select" value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="gsi-filter">
          <label className="gsi-filter-label">Category</label>
          <select className="gsi-select" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="gsi-filter">
          <label className="gsi-filter-label">Search</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              className="gsi-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by item name, SKU code, or department..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 8, background: 'transparent',
                  border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 13
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div className="gsi-loading">
          <SegmentedSpinner size={28} color="#2563EB" />
          <span>Loading consumables inventory...</span>
        </div>
      ) : (
        <div className="gsi-table-card">
          <div className="gsi-table-wrap">
            <div className="gsi-thead">
              {['NO', 'ITEM NAME', 'CATEGORY', 'DEPARTMENT', 'IN STORE', 'REORDER', 'UNIT', 'COST PRICE', 'TOTAL VALUE', 'STATUS', 'ACTION'].map(h => (
                <div key={h} className={`gsi-th${numCols.includes(h) ? ' gsi-th--num' : ''}`}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="gsi-empty">
                <p style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: 600, color: '#374151' }}>No inventory items found</p>
                <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>
                  {dept || cat || search ? 'Try adjusting or clearing your filters to see more results.' : 'Register your first consumable item to start tracking store stock.'}
                </p>
                {(dept || cat || search) && (
                  <button
                    onClick={() => { setDept(''); setCat(''); setSearch(''); }}
                    style={{
                      marginTop: 14, height: 32, padding: '0 14px', background: '#EFF6FF',
                      color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 6,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : filtered.map((m, i) => {
              const low = parseFloat(m.quantity_in_store || 0) <= parseFloat(m.reorder_level || 10);
              const reorderLvl = parseInt(m.reorder_level) || 10;
              const deptC = deptColors[m.department] || '#6B7280';
              return (
                <div key={m.id} className={`gsi-tr${low ? ' gsi-tr--low' : ''}`}>
                  <div className="gsi-td gsi-td--idx gsi-num">{i + 1}</div>
                  <div className="gsi-td gsi-td--strong">
                    <div>
                      <div>{m.material_name}</div>
                      {m.material_id && <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{m.material_id}</div>}
                    </div>
                  </div>
                  <div className="gsi-td">
                    <span className="gsi-badge gsi-badge--cat">{m.category || 'General'}</span>
                  </div>
                  <div className="gsi-td">
                    <span className="gsi-badge" style={{ background: `${deptC}1A`, color: deptC, fontWeight: 600 }}>{m.department || 'General'}</span>
                  </div>
                  <div className={`gsi-td gsi-td--num gsi-num${low ? ' gsi-value-low' : ''}`}>
                    {parseFloat(m.quantity_in_store || 0).toLocaleString()}
                  </div>
                  <div className="gsi-td gsi-td--num gsi-num">{reorderLvl}</div>
                  <div className="gsi-td gsi-td--num gsi-td--dim">{m.unit || 'unit'}</div>
                  <div className="gsi-td gsi-td--num gsi-num">
                    {m.unit_value > 0 ? `ETB ${parseFloat(m.unit_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '— Not Set'}
                  </div>
                  <div className="gsi-td gsi-td--num gsi-num gsi-td--strong">
                    {m.total_value > 0 ? `ETB ${parseFloat(m.total_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                  </div>
                  <div className="gsi-td">
                    {low
                      ? <span className="gsi-badge gsi-badge--low"><AlertTriangle size={13} style={{ marginRight: 3 }} /> LOW</span>
                      : <span className="gsi-badge gsi-badge--ok">✓ OK</span>}
                  </div>
                  <div className="gsi-td">
                    {m.pending_approval ? (
                      <span className="gsi-badge gsi-badge--pending" title="Update request sent to CEO for approval">
                        ⏳ Awaiting CEO
                      </span>
                    ) : (
                      <button className="gsi-upd-btn" onClick={() => setUpdatingItem({ ...m })}>
                        ✓ UPDATE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length > 0 && (
              <div className="gsi-tr gsi-tr--grand-total">
                <div className="gsi-td" style={{ gridColumn: '1 / 9', textAlign: 'right', paddingRight: '12px' }}>
                  GRAND TOTAL VALUE:
                </div>
                <div className="gsi-td gsi-td--num" style={{ gridColumn: '9 / 10' }}>
                  ETB {filtered.reduce((s, m) => s + parseFloat(m.total_value || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div style={{ gridColumn: '10 / 12' }}></div>
              </div>
            )}
          </div>

          {filtered.length > 0 && (
            <div className="gsi-foot">
              <span>Showing {filtered.length} of {items.length} consumables</span>
              <span className="gsi-foot-total">
                Total Stock Quantity: {filtered.reduce((s, m) => s + parseFloat(m.quantity_in_store || 0), 0).toLocaleString()} units
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── UPDATE MATERIAL MODAL (RENDERED AS OVERLAY) ── */}
      {updatingItem && (() => {
        const qty = parseFloat(updatingItem.quantity_in_store) || 0;
        const price = parseFloat(updatingItem.unit_value) || 0;
        const total = qty * price;
        const vatRate = updatingItem.vat_rate != null ? parseFloat(updatingItem.vat_rate) : 15;
        const inputVatUnit = (price * (vatRate / 100));
        const inputVatTotal = (total * (vatRate / 100));
        const modalDepts = Array.from(new Set([...DEPARTMENTS, 'Retail', updatingItem.department].filter(Boolean)));

        return (
          <div
            className="gsi-modal-wrap"
            onClick={e => { if (e.target === e.currentTarget && !saving) setUpdatingItem(null); }}
          >
            <div className="gsi-modal" role="dialog" aria-modal="true" aria-label={`Update Material ${updatingItem.material_id || ''}`}>
              <div className="gsi-modal-head">
                <div>
                  <h2 className="gsi-modal-title">
                    Update Material {updatingItem.material_id && <span className="gsi-modal-id">{updatingItem.material_id}</span>}
                  </h2>
                  <p className="gsi-modal-sub">General Store Inventory Control &amp; Reorder Management</p>
                </div>
                <button className="gsi-modal-close" onClick={() => !saving && setUpdatingItem(null)} aria-label="Close">✕</button>
              </div>

              <div className="gsi-modal-body">
                <div>
                  <div className="gsi-fieldset-title">Material Details</div>
                  <div className="gsi-grid-2">
                    <div className="gsi-field">
                      <label className="gsi-label">Item Name *</label>
                      <input
                        className="gsi-input"
                        value={updatingItem.material_name ?? ''}
                        onChange={e => setUpdatingItem({ ...updatingItem, material_name: e.target.value })}
                        placeholder="e.g. Printer Toner HP-85A"
                      />
                    </div>
                    <div className="gsi-field">
                      <label className="gsi-label">Category</label>
                      <select
                        className="gsi-input"
                        value={updatingItem.category ?? 'Other'}
                        onChange={e => setUpdatingItem({ ...updatingItem, category: e.target.value })}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="gsi-field">
                      <label className="gsi-label">Department</label>
                      {!customDept ? (
                        <div className="gsi-dept-row">
                          <select
                            className="gsi-input"
                            value={updatingItem.department ?? ''}
                            onChange={e => setUpdatingItem({ ...updatingItem, department: e.target.value })}
                          >
                            <option value="">-- Select Department --</option>
                            {modalDepts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <button className="gsi-icon-btn" onClick={() => setCustomDept(true)} title="Type custom department">+</button>
                        </div>
                      ) : (
                        <div className="gsi-dept-row">
                          <input
                            className="gsi-input"
                            value={updatingItem.department ?? ''}
                            onChange={e => setUpdatingItem({ ...updatingItem, department: e.target.value })}
                            placeholder="Type custom department name..."
                          />
                          <button
                            className="gsi-icon-btn gsi-icon-btn--danger"
                            onClick={() => { setCustomDept(false); setUpdatingItem({ ...updatingItem, department: 'Printing' }); }}
                            title="Reset to select"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="gsi-fieldset-title">Inventory &amp; Pricing</div>
                  <div className="gsi-grid-2">
                    <div className="gsi-field">
                      <label className="gsi-label">Unit of Measure (e.g. pcs, roll, box)</label>
                      <input
                        className="gsi-input"
                        type="text"
                        value={updatingItem.unit ?? ''}
                        onChange={e => setUpdatingItem({ ...updatingItem, unit: e.target.value })}
                      />
                    </div>
                    <div className="gsi-field">
                      <label className="gsi-label">Quantity in Store</label>
                      <input
                        className="gsi-input"
                        type="number"
                        min="0"
                        step="any"
                        value={updatingItem.quantity_in_store ?? ''}
                        onChange={e => setUpdatingItem({ ...updatingItem, quantity_in_store: e.target.value })}
                      />
                    </div>
                    <div className="gsi-field">
                      <label className="gsi-label">Cost Price / Unit (ETB)</label>
                      <input
                        className="gsi-input"
                        type="number"
                        min="0"
                        step="any"
                        value={updatingItem.unit_value ?? ''}
                        onChange={e => setUpdatingItem({ ...updatingItem, unit_value: e.target.value })}
                      />
                    </div>
                    <div className="gsi-field">
                      <label className="gsi-label">Reorder Level (Alert Threshold)</label>
                      <input
                        className="gsi-input"
                        type="number"
                        min="0"
                        value={updatingItem.reorder_level ?? ''}
                        onChange={e => setUpdatingItem({ ...updatingItem, reorder_level: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Input VAT config */}
                  <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <input
                        type="checkbox"
                        id="upd_vat_toggle"
                        checked={!!updatingItem.has_input_vat}
                        onChange={e => setUpdatingItem({ ...updatingItem, has_input_vat: e.target.checked })}
                        style={{ width: 15, height: 15, accentColor: '#D97706', cursor: 'pointer' }}
                      />
                      <label htmlFor="upd_vat_toggle" style={{ fontSize: 13, fontWeight: 700, color: '#92400E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Receipt size={16} /> Purchased with Input VAT (VAT-registered supplier)
                      </label>
                    </div>
                    {updatingItem.has_input_vat && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="gsi-field" style={{ marginBottom: 0 }}>
                          <label className="gsi-label">VAT Rate (%)</label>
                          <select
                            className="gsi-input"
                            value={updatingItem.vat_rate || 15}
                            onChange={e => setUpdatingItem({ ...updatingItem, vat_rate: parseFloat(e.target.value) })}
                          >
                            <option value={15}>15% (Standard)</option>
                            <option value={10}>10%</option>
                            <option value={5}>5%</option>
                            <option value={0}>0% (Exempt)</option>
                          </select>
                        </div>
                        <div className="gsi-field" style={{ marginBottom: 0 }}>
                          <label className="gsi-label">Input VAT per Unit (ETB)</label>
                          <input
                            className="gsi-input"
                            type="number"
                            readOnly
                            value={inputVatUnit.toFixed(2)}
                            style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                          />
                        </div>
                        <div className="gsi-field" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                          <label className="gsi-label" style={{ color: '#92400E' }}>Total Input VAT this batch (Qty × VAT/unit)</label>
                          <input
                            className="gsi-input"
                            type="number"
                            readOnly
                            value={inputVatTotal.toFixed(2)}
                            style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="gsi-modal-foot">
                <div className="gsi-total">
                  <span className="gsi-total-label">
                    {updatingItem.has_input_vat ? 'Stock Value (excl. VAT)' : 'Estimated Total Value'}
                  </span>
                  <span className="gsi-total-value">ETB {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {updatingItem.has_input_vat && (
                  <div style={{ fontSize: 13, color: '#D97706', fontWeight: 600, padding: '4px 0' }}>
                    Input VAT: ETB {inputVatTotal.toFixed(2)} | Total incl. VAT: ETB {(total + inputVatTotal).toFixed(2)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="gsi-refresh" onClick={() => !saving && setUpdatingItem(null)} disabled={saving}>
                    CANCEL
                  </button>
                  <button className="gsi-save" onClick={submitUpdate} disabled={saving}>
                    {saving && <SegmentedSpinner size={16} color="#fff" />}
                    <span>{saving ? 'SUBMITTING...' : 'SUBMIT UPDATE'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`gsi-toast gsi-toast--${toast.type}`}>
          <span className="gsi-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

/* ─── 3. REGISTER NEW ITEM ─────────────────────────────────────────────── */
const GSR_CSS = `
  .gsr-reg { box-sizing: border-box; width: 100%; min-height: 100%; background: var(--color-bg-page, #F5F6FA); color: var(--color-text-primary, #111827); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsr-reg *, .gsr-reg *::before, .gsr-reg *::after { box-sizing: border-box; }
  .gsr-reg button, .gsr-reg input, .gsr-reg select, .gsr-reg textarea { font-family: inherit; }

  /* ── Toast ── */
  @keyframes gsrToastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .gsr-toast { position: fixed; right: 24px; bottom: 24px; z-index: 10000; max-width: 440px; display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 10px; border-left: 4px solid rgba(255,255,255,0.55); background: var(--color-text-primary, #111827); color: #fff; font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.18); animation: gsrToastIn 200ms ease; }
  .gsr-toast--success { background: var(--color-success, #16A34A); }
  .gsr-toast--error { background: var(--color-danger, #DC2626); }
  .gsr-toast-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.24); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* ── Header ── */
  .gsr-header { margin-bottom: 24px; }
  .gsr-header-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
  .gsr-title { margin: 0; font-size: 26px; font-weight: 700; line-height: 1.3; letter-spacing: -0.01em; color: var(--color-text-primary, #111827); display: flex; align-items: center; gap: 10px; }
  .gsr-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsr-header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .gsr-top-btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; background: #fff; color: #1E40AF; border: 1.5px solid #BFDBFE; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 150ms ease; }
  .gsr-top-btn:hover { background: #EFF6FF; border-color: #93C5FD; }
  .gsr-income-btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; background: #F0FDF4; color: #15803D; border: 1.5px solid #BBF7D0; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 150ms ease; }
  .gsr-income-btn:hover { background: #DCFCE7; }
  .gsr-income-badge { background: #16A34A; color: #fff; border-radius: 50%; min-width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; padding: 0 6px; }
  .gsr-income-bar { margin-top: 12px; padding: 10px 16px; background: #ECFDF5; border: 1.5px dashed #34D399; border-radius: 8px; font-size: 13px; color: #065F46; display: flex; justify-content: space-between; align-items: center; gap: 10px; cursor: pointer; }
  .gsr-income-bar:hover { background: #D1FAE5; }
  .gsr-income-cta { font-weight: 700; text-decoration: underline; white-space: nowrap; }

  /* ── Type Switcher Tabs ── */
  .gsr-type-switcher { display: flex; gap: 8px; margin-bottom: 20px; background: #E5E7EB; padding: 4px; border-radius: 10px; width: fit-content; }
  .gsr-type-tab { display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border: none; border-radius: 8px; background: transparent; color: #4B5563; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 150ms ease; }
  .gsr-type-tab--active { background: #fff; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 700; }

  /* ── Linked Shipment Banner ── */
  .gsr-linked-banner { margin-bottom: 20px; padding: 12px 16px; background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
  .gsr-linked-info { display: flex; align-items: center; gap: 10px; color: #166534; font-size: 13px; font-weight: 600; }
  .gsr-linked-cancel { background: transparent; border: none; color: #DC2626; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: underline; padding: 2px 6px; }

  /* ── Layout ── */
  .gsr-main { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
  .gsr-cols { display: flex; flex-direction: column; gap: 20px; }
  .gsr-card { background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
  .gsr-card-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--color-border, #E5E7EB); background: #F9FAFB; }
  .gsr-card-head-left { display: flex; align-items: center; gap: 10px; }
  .gsr-card-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsr-card-body { padding: 20px; }

  /* ── Fields ── */
  .gsr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .gsr-field { display: flex; flex-direction: column; gap: 6px; }
  .gsr-label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary, #4B5563); }
  .gsr-input { width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--color-border, #D1D5DB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; transition: border-color 150ms ease, box-shadow 150ms ease; }
  .gsr-input:focus { outline: none; border-color: var(--color-primary, #2563EB); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
  .gsr-input--money { font-weight: 600; font-variant-numeric: tabular-nums; }
  .gsr-dept-row { display: flex; gap: 8px; }
  .gsr-dept-row .gsr-input { flex: 1; min-width: 0; }
  .gsr-icon-btn { flex-shrink: 0; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border, #D1D5DB); border-radius: 8px; background: #F9FAFB; color: var(--color-success, #16A34A); font-size: 18px; cursor: pointer; transition: all 150ms ease; }
  .gsr-icon-btn:hover { background: #ECFDF5; border-color: #A7F3D0; color: #059669; }
  .gsr-icon-btn--danger { color: var(--color-danger, #DC2626); }
  .gsr-icon-btn--danger:hover { background: #FEE2E2; border-color: #FECACA; color: #DC2626; }

  /* ── Submit ── */
  .gsr-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 10px; }
  .gsr-submit { height: 42px; padding: 0 28px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: none; border-radius: 8px; background: #16A34A; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 150ms ease; box-shadow: 0 2px 4px rgba(22,163,74,0.2); }
  .gsr-submit:hover:not(:disabled) { background: #15803D; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(22,163,74,0.3); }
  .gsr-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .gsr-reset-btn { height: 42px; padding: 0 18px; border: 1px solid #D1D5DB; background: #fff; color: #4B5563; font-size: 13px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 150ms ease; }
  .gsr-reset-btn:hover { background: #F3F4F6; }

  /* ── Right summary panel ── */
  .gsr-side { position: sticky; top: 0; display: flex; flex-direction: column; gap: 20px; }
  .gsr-calc-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px; }
  .gsr-calc-label { color: var(--color-text-secondary, #6B7280); }
  .gsr-calc-value { color: var(--color-text-primary, #111827); font-weight: 600; font-variant-numeric: tabular-nums; }
  .gsr-calc-total { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 0 0; }
  .gsr-calc-total-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsr-calc-total-value { font-size: 22px; font-weight: 700; color: #16A34A; font-variant-numeric: tabular-nums; }
  .gsr-reorder-note { display: flex; gap: 8px; margin-top: 16px; padding: 12px 14px; border-radius: 8px; background: var(--color-warning-bg, #FEF3C7); border-left: 3px solid var(--color-warning, #D97706); font-size: 12px; color: #92400E; line-height: 1.5; }
  .gsr-reorder-note strong { color: var(--color-warning, #D97706); }
  .gsr-preview-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 9px 0; border-bottom: 1px solid #F3F4F6; font-size: 13px; }
  .gsr-preview-row:last-child { border-bottom: none; }
  .gsr-preview-label { color: var(--color-text-secondary, #6B7280); flex-shrink: 0; }
  .gsr-preview-value { color: var(--color-text-primary, #111827); font-weight: 500; text-align: right; word-break: break-word; }
  .gsr-preview-value--strong { font-weight: 700; }
  .gsr-tips { background: #EFF6FF; border: 1px solid #BFDBFE; border-left: 3px solid var(--color-primary, #2563EB); border-radius: 10px; padding: 14px 16px; }
  .gsr-tips-title { font-size: 12px; font-weight: 600; color: var(--color-primary, #2563EB); margin-bottom: 10px; }
  .gsr-tip { display: flex; gap: 8px; font-size: 12px; color: var(--color-text-secondary, #6B7280); margin-bottom: 6px; line-height: 1.5; }
  .gsr-tip:last-child { margin-bottom: 0; }
  .gsr-tip-arrow { color: var(--color-primary, #2563EB); font-weight: 700; flex-shrink: 0; }

  /* ── Recent Items Table ── */
  .gsr-recent-wrap { margin-top: 28px; }
  .gsr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .gsr-table th { text-align: left; padding: 10px 14px; background: #F9FAFB; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; color: #6B7280; border-bottom: 1px solid #E5E7EB; }
  .gsr-table td { padding: 11px 14px; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }
  .gsr-table tr:hover td { background: #F9FAFB; }
  .gsr-table tr:last-child td { border-bottom: none; }
  .gsr-table-id { font-family: monospace; font-weight: 700; color: #1E40AF; background: #EFF6FF; padding: 2px 6px; border-radius: 4px; font-size: 11px; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .gsr-main { grid-template-columns: 1fr; }
    .gsr-side { position: static; }
  }
  @media (max-width: 768px) {
    .gsr-grid-2 { grid-template-columns: 1fr; }
    .gsr-title { font-size: 22px; }
    .gsr-header-top { flex-direction: column; align-items: stretch; }
    .gsr-header-actions { justify-content: flex-start; }
  }

  /* ── Incoming Modal ── */
  .gsr-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; }
  .gsr-inc-modal { background: #fff; border-radius: 14px; width: 780px; max-width: 100%; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
  .gsr-inc-head { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #E5E7EB; background: #F9FAFB; }
  .gsr-inc-title { font-size: 16px; font-weight: 700; color: #111827; flex: 1; }
  .gsr-inc-close { background: none; border: none; font-size: 18px; color: #6B7280; cursor: pointer; padding: 4px; }
  .gsr-inc-tabs { display: flex; gap: 8px; padding: 12px 20px 0; border-bottom: 1px solid #E5E7EB; }
  .gsr-inc-tab { padding: 8px 18px; border-radius: 8px 8px 0 0; border: 1px solid #E5E7EB; border-bottom: none; background: #F3F4F6; color: #4B5563; font-size: 12px; font-weight: 700; cursor: pointer; }
  .gsr-inc-tab--on { background: #16A34A; color: #fff; border-color: #16A34A; }
  .gsr-inc-body { padding: 16px 20px 20px; overflow-y: auto; }
  .gsr-inc-empty { text-align: center; padding: 36px 16px; color: #6B7280; background: #F9FAFB; border: 2px dashed #D1D5DB; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
  .gsr-inc-card { border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 14px; margin-bottom: 14px; background: #fff; }
  .gsr-inc-card--active { border-color: #16A34A; box-shadow: 0 4px 12px rgba(22,163,74,0.12); }
  .gsr-inc-status { background: #FEF3C7; color: #D97706; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; padding: 3px 10px; border-radius: 20px; }
  .gsr-inc-status--ok { background: #DCFCE7; color: #15803D; }
  .gsr-inc-items { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
  .gsr-inc-items th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6B7280; padding: 6px 8px; border-bottom: 1px solid #E5E7EB; }
  .gsr-inc-items td { padding: 6px 8px; border-bottom: 1px solid #F3F4F6; }
  .gsr-inc-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
  .gsr-inc-btn { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; }
  .gsr-inc-btn--ghost { background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; }
  .gsr-inc-btn--primary { background: #16A34A; color: #fff; }
  .gsr-inc-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const GSRegisterItem = () => {
  const [regType, setRegType] = useState('material'); // 'material' | 'machine'
  const [form, setForm] = useState({
    material_name: '',
    category: 'Paper',
    unit: 'roll',
    quantity_in_store: '',
    department: 'Printing',
    unit_value: '',
    reorder_level: '10',
    has_input_vat: false,
    vat_rate: 15,
  });
  const [machineForm, setMachineForm] = useState({
    machine_name: '',
    model_serial: '',
    department: 'Printing',
    condition_notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [customDept, setCustomDept] = useState(false);
  const [customCat, setCustomCat] = useState(false);

  const [incomingList, setIncomingList] = useState([]);
  const [acceptedList, setAcceptedList] = useState([]);
  const [incTab, setIncTab] = useState('pending');
  const [showIncoming, setShowIncoming] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [selectedInc, setSelectedInc] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);

  const [recentItems, setRecentItems] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const setMat = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setMac = (k, v) => setMachineForm(f => ({ ...f, [k]: v }));

  const qty = parseFloat(form.quantity_in_store) || 0;
  const price = parseFloat(form.unit_value) || 0;
  const total = qty * price;
  const reorder = parseInt(form.reorder_level) || 0;

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const nav = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getLoggedInUser = () => {
    try {
      const u = localStorage.getItem('user') || sessionStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  };
  const currentUser = getLoggedInUser();
  const userFullName = currentUser?.full_name || currentUser?.fullName || currentUser?.username || 'Store Keeper';

  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const res = await api.get('/api/v1/printing-assets/store/materials');
      const list = res?.data?.data || [];
      setRecentItems(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch (e) { /* non-fatal */ }
    setLoadingRecent(false);
  };

  const fetchIncoming = async () => {
    try {
      const res = await api.get('/api/v1/printing-assets/store/incoming');
      const list = res?.data?.data;
      setIncomingList(Array.isArray(list) ? list : []);
    } catch (e) { /* non-fatal */ }
  };

  const fetchAccepted = async () => {
    try {
      const res = await api.get('/api/v1/printing-assets/store/incoming?status=received');
      const list = res?.data?.data;
      setAcceptedList(Array.isArray(list) ? list : []);
    } catch (e) { /* non-fatal */ }
  };

  useEffect(() => {
    fetchIncoming();
    fetchRecent();
    const timer = setInterval(fetchIncoming, 20000);
    return () => clearInterval(timer);
  }, []);

  const openIncoming = async () => {
    setShowIncoming(true);
    setSelectedInc(null);
    setIncTab('pending');
    await Promise.all([fetchIncoming(), fetchAccepted()]);
  };

  const acceptItem = (inc, item) => {
    if (!item) return;
    setAcceptTarget({
      incomingId: inc.id,
      itemId: item.id,
      itemDesc: item.item_description,
      deliveryNote: inc.delivery_note_no || `Inc-${inc.id}`
    });
    setRegType('material');
    setForm(f => ({
      ...f,
      material_name: item.item_description || f.material_name,
      category: f.category === 'Paper' && item.item_description ? 'Other' : f.category,
      unit: item.unit || f.unit || 'unit',
      quantity_in_store: String(parseFloat(item.quantity) || 0),
      unit_value: String(parseFloat(item.unit_price) || 0),
    }));
    setShowIncoming(false);
    showToast('success', `"${item.item_description}" linked — verify details and submit to register.`);
  };

  const acceptShipment = async (inc) => {
    setReceiving(true);
    setSelectedInc(inc.id);
    try {
      const res = await api.post(`/api/v1/printing-assets/store/incoming/${inc.id}/accept`);
      showToast('success', res?.data?.message || 'Shipment received and added to inventory.');
      await Promise.all([fetchIncoming(), fetchAccepted(), fetchRecent()]);
      setSelectedInc(null);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to receive shipment');
    }
    setReceiving(false);
  };

  const submitMaterial = async () => {
    if (!form.material_name || !form.material_name.trim()) return showToast('error', 'Item Name is required');
    if (!form.department || !form.department.trim()) return showToast('error', 'Department is required');
    if (!form.unit || !form.unit.trim()) return showToast('error', 'Unit of Measure is required');

    const qtyVal = parseFloat(form.quantity_in_store);
    if (isNaN(qtyVal) || qtyVal < 0) return showToast('error', 'Opening Quantity must be 0 or greater');

    const priceVal = parseFloat(form.unit_value);
    if (isNaN(priceVal) || priceVal < 0) return showToast('error', 'Cost Price must be 0 or greater');

    const reorderVal = parseInt(form.reorder_level);
    if (isNaN(reorderVal) || reorderVal < 0) return showToast('error', 'Reorder Level must be 0 or greater');

    setSaving(true);
    try {
      const payload = {
        material_name: form.material_name.trim(),
        category: form.category || 'Other',
        unit: form.unit.trim(),
        quantity_in_store: qtyVal,
        unit_value: priceVal,
        reorder_level: reorderVal,
        department: form.department.trim(),
        registered_by: userFullName,
        has_input_vat: !!form.has_input_vat,
        vat_rate: form.vat_rate || 15,
      };

      const res = await api.post('/api/v1/printing-assets/store/materials', payload);
      const generatedId = res?.data?.data?.material_id || 'Item';

      let acceptMsg = '';
      if (acceptTarget) {
        try {
          const ar = await api.post(`/api/v1/printing-assets/store/incoming/${acceptTarget.incomingId}/accept`, { item_id: acceptTarget.itemId });
          const info = ar?.data?.data || {};
          if (info.shipment_complete) {
            acceptMsg = ` · Shipment complete (${info.percent}%) — marked received.`;
          } else {
            acceptMsg = ` · ${info.received_count} item(s) accepted (${info.percent}%).`;
          }
          setAcceptTarget(null);
        } catch (ae) {
          acceptMsg = ` · Item saved, but shipment status update failed (${ae.response?.data?.message || 'error'}).`;
        }
      }

      showToast('success', `"${form.material_name.trim()}" registered (${generatedId}) — ETB ${(qtyVal * priceVal).toLocaleString(undefined, { minimumFractionDigits: 2 })} total${acceptMsg}`);
      setForm({
        material_name: '',
        category: 'Paper',
        unit: 'roll',
        quantity_in_store: '',
        department: 'Printing',
        unit_value: '',
        reorder_level: '10',
        has_input_vat: false,
        vat_rate: 15,
      });
      setCustomDept(false);
      setCustomCat(false);
      await Promise.all([fetchIncoming(), fetchAccepted(), fetchRecent()]);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Registration failed');
    }
    setSaving(false);
  };

  const submitMachine = async () => {
    if (!machineForm.machine_name || !machineForm.machine_name.trim()) {
      return showToast('error', 'Machine / Asset Name is required');
    }
    if (!machineForm.department || !machineForm.department.trim()) {
      return showToast('error', 'Department is required');
    }

    setSaving(true);
    try {
      const payload = {
        machine_name: machineForm.machine_name.trim(),
        model_serial: machineForm.model_serial ? machineForm.model_serial.trim() : null,
        condition_notes: machineForm.condition_notes ? machineForm.condition_notes.trim() : null,
        department: machineForm.department.trim(),
        registered_by: userFullName,
      };

      const res = await api.post('/api/v1/printing-assets/store/machines', payload);
      const generatedId = res?.data?.data?.machine_id || 'Machine';

      showToast('success', `Machine "${machineForm.machine_name.trim()}" registered successfully (${generatedId})!`);
      setMachineForm({
        machine_name: '',
        model_serial: '',
        department: 'Printing',
        condition_notes: '',
      });
      setCustomDept(false);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to register machine');
    }
    setSaving(false);
  };

  return (
    <div className="gsr-reg">
      <style>{GSR_CSS}</style>

      {/* ── HEADER ── */}
      <div className="gsr-header">
        <div className="gsr-header-top">
          <div>
            <h1 className="gsr-title"><Plus size={22} color="#16A34A" /> Register New Item</h1>
            <p className="gsr-subtitle">Add consumables, materials, or equipment to the Universal General Store across all departments</p>
          </div>
          <div className="gsr-header-actions">
            <button type="button" className="gsr-top-btn" onClick={() => nav('/general-store/inventory')} title="Browse full consumables inventory">
              <Box size={16} /> Consumables Inventory
            </button>
            <button type="button" className="gsr-income-btn" onClick={openIncoming} style={{ whiteSpace: 'nowrap' }}>
              <Download size={16} /> Incoming Shipments
              {incomingList.length > 0 && <span className="gsr-income-badge">{incomingList.length}</span>}
            </button>
          </div>
        </div>

        {/* Incoming Shipments Alert Notice */}
        {incomingList.length > 0 && (
          <div className="gsr-income-bar" onClick={openIncoming}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Package size={16} />
              <span><strong>{incomingList.length}</strong> incoming shipment{incomingList.length !== 1 ? 's' : ''} waiting to be received and stocked.</span>
            </span>
            <span className="gsr-income-cta">Review & Stock →</span>
          </div>
        )}
      </div>

      {/* ── ITEM TYPE SWITCHER ── */}
      <div className="gsr-type-switcher">
        <button
          type="button"
          className={`gsr-type-tab${regType === 'material' ? ' gsr-type-tab--active' : ''}`}
          onClick={() => setRegType('material')}
        >
          <Box size={16} /> Consumable / Store Material
        </button>
        <button
          type="button"
          className={`gsr-type-tab${regType === 'machine' ? ' gsr-type-tab--active' : ''}`}
          onClick={() => setRegType('machine')}
        >
          <Wrench size={16} /> Fixed Asset / Machine / Equipment
        </button>
      </div>

      {/* ── LINKED SHIPMENT BANNER ── */}
      {acceptTarget && (
        <div className="gsr-linked-banner">
          <div className="gsr-linked-info">
            <Package size={18} />
            <span>
              Linked with incoming purchase shipment <strong>{acceptTarget.deliveryNote}</strong>: item <strong>"{acceptTarget.itemDesc}"</strong>.
              Submitting this form will register the stock and automatically update the shipment receipt!
            </span>
          </div>
          <button type="button" className="gsr-linked-cancel" onClick={() => setAcceptTarget(null)}>
            ✕ Cancel Link
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {regType === 'material' ? (
        <div className="gsr-main">
          {/* ── LEFT: FORM ── */}
          <div className="gsr-cols">

            {/* 1. Basic Info */}
            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <ClipboardList size={18} color="#2563EB" />
                  <span className="gsr-card-title">Basic Information</span>
                </div>
              </div>
              <div className="gsr-card-body">
                <div className="gsr-field" style={{ marginBottom: 16 }}>
                  <label className="gsr-label">Item Name *</label>
                  <input
                    className="gsr-input"
                    value={form.material_name}
                    onChange={e => setMat('material_name', e.target.value)}
                    placeholder="e.g. Engine Oil 5W-30, A4 Copy Paper, Printing Toner..."
                  />
                </div>
                <div className="gsr-grid-2">
                  <div className="gsr-field">
                    <label className="gsr-label">Category</label>
                    {!customCat ? (
                      <div className="gsr-dept-row">
                        <select className="gsr-input" value={form.category} onChange={e => {
                          if (e.target.value === '__custom__') {
                            setCustomCat(true);
                            setMat('category', '');
                          } else {
                            setMat('category', e.target.value);
                          }
                        }}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          <option value="__custom__">+ Custom Category...</option>
                        </select>
                      </div>
                    ) : (
                      <div className="gsr-dept-row">
                        <input
                          className="gsr-input"
                          value={form.category}
                          onChange={e => setMat('category', e.target.value)}
                          placeholder="Type custom category..."
                        />
                        <button
                          type="button"
                          className="gsr-icon-btn gsr-icon-btn--danger"
                          onClick={() => { setCustomCat(false); setMat('category', 'Paper'); }}
                          title="Reset category"
                        >✕</button>
                      </div>
                    )}
                  </div>

                  <div className="gsr-field">
                    <label className="gsr-label">Department *</label>
                    {!customDept ? (
                      <div className="gsr-dept-row">
                        <select className="gsr-input" value={form.department} onChange={e => setMat('department', e.target.value)}>
                          <option value="">-- Select Department --</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <button type="button" className="gsr-icon-btn" onClick={() => setCustomDept(true)} title="Enter custom department">+</button>
                      </div>
                    ) : (
                      <div className="gsr-dept-row">
                        <input
                          className="gsr-input"
                          value={form.department}
                          onChange={e => setMat('department', e.target.value)}
                          placeholder="Type department..."
                        />
                        <button
                          type="button"
                          className="gsr-icon-btn gsr-icon-btn--danger"
                          onClick={() => { setCustomDept(false); setMat('department', 'Printing'); }}
                          title="Reset to Printing"
                        >✕</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Stock & Unit */}
            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <Package size={18} color="#16A34A" />
                  <span className="gsr-card-title">Stock & Unit</span>
                </div>
              </div>
              <div className="gsr-card-body">
                <div className="gsr-grid-2">
                  <div className="gsr-field">
                    <label className="gsr-label">Unit of Measure *</label>
                    <input
                      className="gsr-input"
                      type="text"
                      value={form.unit}
                      placeholder="e.g. roll, box, litre, pack, piece..."
                      onChange={e => setMat('unit', e.target.value)}
                    />
                  </div>
                  <div className="gsr-field">
                    <label className="gsr-label">Opening Quantity</label>
                    <input
                      className="gsr-input"
                      type="number"
                      min="0"
                      step="any"
                      value={form.quantity_in_store}
                      placeholder="0"
                      onChange={e => setMat('quantity_in_store', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pricing, VAT & Reorder */}
            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <DollarSign size={18} color="#D97706" />
                  <span className="gsr-card-title">Pricing, VAT & Reorder Control</span>
                </div>
              </div>
              <div className="gsr-card-body">
                <div className="gsr-grid-2">
                  <div className="gsr-field">
                    <label className="gsr-label">Cost Price of 1 Unit (ETB)</label>
                    <input
                      className="gsr-input gsr-input--money"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.unit_value}
                      placeholder="0.00"
                      onChange={e => setMat('unit_value', e.target.value)}
                    />
                  </div>
                  <div className="gsr-field">
                    <label className="gsr-label">Reorder Level (minimum qty alert)</label>
                    <input
                      className="gsr-input gsr-input--money"
                      type="number"
                      min="0"
                      step="1"
                      value={form.reorder_level}
                      placeholder="10"
                      onChange={e => setMat('reorder_level', e.target.value)}
                    />
                  </div>
                </div>

                {/* Input VAT Config */}
                <div style={{ marginTop: 16, padding: '14px 16px', background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: form.has_input_vat ? 12 : 0 }}>
                    <input
                      type="checkbox"
                      id="vat_toggle"
                      checked={!!form.has_input_vat}
                      onChange={e => setMat('has_input_vat', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#D97706', cursor: 'pointer' }}
                    />
                    <label htmlFor="vat_toggle" style={{ fontSize: 13, fontWeight: 700, color: '#92400E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Receipt size={16} /> This item was purchased with Input VAT (VAT-registered supplier)
                    </label>
                  </div>
                  {form.has_input_vat && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="gsr-field" style={{ marginBottom: 0 }}>
                        <label className="gsr-label">VAT Rate (%)</label>
                        <select className="gsr-input" value={form.vat_rate || 15} onChange={e => setMat('vat_rate', parseFloat(e.target.value))}>
                          <option value={15}>15% (Standard Ethiopian VAT)</option>
                          <option value={10}>10%</option>
                          <option value={5}>5%</option>
                          <option value={0}>0% (Exempt)</option>
                        </select>
                      </div>
                      <div className="gsr-field" style={{ marginBottom: 0 }}>
                        <label className="gsr-label">Input VAT per Unit (ETB)</label>
                        <input
                          className="gsr-input gsr-input--money"
                          type="number"
                          readOnly
                          value={(price * ((form.vat_rate || 15) / 100)).toFixed(2)}
                          style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <div className="gsr-actions">
              <button
                type="button"
                className="gsr-reset-btn"
                onClick={() => {
                  setForm({
                    material_name: '',
                    category: 'Paper',
                    unit: 'roll',
                    quantity_in_store: '',
                    department: 'Printing',
                    unit_value: '',
                    reorder_level: '10',
                    has_input_vat: false,
                    vat_rate: 15,
                  });
                  setCustomDept(false);
                  setCustomCat(false);
                  setAcceptTarget(null);
                }}
              >
                Clear Form
              </button>
              <button className="gsr-submit" onClick={submitMaterial} disabled={saving}>
                {saving && <SegmentedSpinner size={16} color="#fff" />}
                <span>{saving ? 'Registering Material...' : 'Register Consumable Item'}</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT: SUMMARY ── */}
          <div className="gsr-side">
            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <BarChart size={18} color="#2563EB" />
                  <span className="gsr-card-title">Live Valuation</span>
                </div>
              </div>
              <div className="gsr-card-body">
                <div className="gsr-calc-row">
                  <span className="gsr-calc-label">Qty × Unit Cost</span>
                  <span className="gsr-calc-value">{qty} × ETB {price.toFixed(2)}</span>
                </div>
                {form.has_input_vat && (
                  <>
                    <div className="gsr-calc-row" style={{ color: '#D97706' }}>
                      <span className="gsr-calc-label">Input VAT ({form.vat_rate || 15}%)</span>
                      <span className="gsr-calc-value">+ ETB {(total * ((form.vat_rate || 15) / 100)).toFixed(2)}</span>
                    </div>
                    <div className="gsr-calc-row" style={{ borderTop: '1px dashed #FDE68A', paddingTop: 6 }}>
                      <span className="gsr-calc-label" style={{ fontWeight: 700 }}>Total incl. VAT</span>
                      <span className="gsr-calc-value" style={{ fontWeight: 700, color: '#D97706' }}>ETB {(total * (1 + (form.vat_rate || 15) / 100)).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="gsr-calc-total">
                  <span className="gsr-calc-total-label">Stock Value (excl. VAT)</span>
                  <span className="gsr-calc-total-value">ETB {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="gsr-reorder-note">
                  <span><Zap size={18} /></span>
                  <span>Low stock warning triggers below <strong>{reorder} {form.unit || 'units'}</strong></span>
                </div>
              </div>
            </div>

            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <Leaf size={18} color="#16A34A" />
                  <span className="gsr-card-title">Item Summary</span>
                </div>
              </div>
              <div className="gsr-card-body">
                {[
                  ['Item Name', form.material_name || '—', true],
                  ['Category', form.category],
                  ['Department', form.department || '—'],
                  ['Unit of Measure', form.unit || '—'],
                  ['Opening Qty', qty.toLocaleString()],
                  ['Unit Cost', `ETB ${price.toFixed(2)}`],
                  ['Registered By', userFullName],
                  ...(form.has_input_vat ? [['Input VAT', `${form.vat_rate || 15}% (ETB ${(price * (form.vat_rate || 15) / 100).toFixed(2)}/unit)`]] : []),
                ].map(([lbl, val, bold]) => (
                  <div key={lbl} className="gsr-preview-row">
                    <span className="gsr-preview-label">{lbl}</span>
                    <span className={`gsr-preview-value${bold ? ' gsr-preview-value--strong' : ''}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gsr-tips">
              <div className="gsr-tips-title"><Sprout size={16} /> STORE KEEPER TIPS</div>
              {[
                'Stock value is auto-computed (Qty × Cost Price) and posts to Store Valuation.',
                'Reorder levels trigger instant alerts on the Dashboard and Inventory view.',
                'Use "Incoming Shipments" to receive purchases directly into inventory.'
              ].map((t, i) => (
                <div key={i} className="gsr-tip">
                  <span className="gsr-tip-arrow">▶</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── MACHINE / FIXED ASSET FORM ── */
        <div className="gsr-main">
          <div className="gsr-cols">
            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <Wrench size={18} color="#7C3AED" />
                  <span className="gsr-card-title">Machine / Asset Details</span>
                </div>
              </div>
              <div className="gsr-card-body">
                <div className="gsr-field" style={{ marginBottom: 16 }}>
                  <label className="gsr-label">Machine / Equipment Name *</label>
                  <input
                    className="gsr-input"
                    value={machineForm.machine_name}
                    onChange={e => setMac('machine_name', e.target.value)}
                    placeholder="e.g. Heidelberg Offset Press, HP LaserJet Pro 400, Industrial Guillotine..."
                  />
                </div>
                <div className="gsr-grid-2">
                  <div className="gsr-field">
                    <label className="gsr-label">Model / Serial Number</label>
                    <input
                      className="gsr-input"
                      value={machineForm.model_serial}
                      onChange={e => setMac('model_serial', e.target.value)}
                      placeholder="e.g. SN-892410-X, Model 2024"
                    />
                  </div>
                  <div className="gsr-field">
                    <label className="gsr-label">Assigned Department *</label>
                    {!customDept ? (
                      <div className="gsr-dept-row">
                        <select className="gsr-input" value={machineForm.department} onChange={e => setMac('department', e.target.value)}>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <button type="button" className="gsr-icon-btn" onClick={() => setCustomDept(true)} title="Custom department">+</button>
                      </div>
                    ) : (
                      <div className="gsr-dept-row">
                        <input
                          className="gsr-input"
                          value={machineForm.department}
                          onChange={e => setMac('department', e.target.value)}
                          placeholder="Type department..."
                        />
                        <button
                          type="button"
                          className="gsr-icon-btn gsr-icon-btn--danger"
                          onClick={() => { setCustomDept(false); setMac('department', 'Printing'); }}
                          title="Reset to Printing"
                        >✕</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="gsr-field" style={{ marginTop: 16 }}>
                  <label className="gsr-label">Condition & Notes</label>
                  <input
                    className="gsr-input"
                    value={machineForm.condition_notes}
                    onChange={e => setMac('condition_notes', e.target.value)}
                    placeholder="e.g. Brand new, operational, fully tested..."
                  />
                </div>
              </div>
            </div>

            <div className="gsr-actions">
              <button
                type="button"
                className="gsr-reset-btn"
                onClick={() => {
                  setMachineForm({ machine_name: '', model_serial: '', department: 'Printing', condition_notes: '' });
                  setCustomDept(false);
                }}
              >
                Clear Form
              </button>
              <button className="gsr-submit" onClick={submitMachine} disabled={saving} style={{ background: '#7C3AED' }}>
                {saving && <SegmentedSpinner size={16} color="#fff" />}
                <span>{saving ? 'Registering Equipment...' : 'Register Machine Asset'}</span>
              </button>
            </div>
          </div>

          <div className="gsr-side">
            <div className="gsr-card">
              <div className="gsr-card-head">
                <div className="gsr-card-head-left">
                  <Leaf size={18} color="#7C3AED" />
                  <span className="gsr-card-title">Asset Summary</span>
                </div>
              </div>
              <div className="gsr-card-body">
                {[
                  ['Machine Name', machineForm.machine_name || '—', true],
                  ['Model / Serial', machineForm.model_serial || '—'],
                  ['Department', machineForm.department || '—'],
                  ['Initial Status', 'In Store (Available)'],
                  ['Registered By', userFullName],
                  ['Condition Notes', machineForm.condition_notes || 'Standard'],
                ].map(([lbl, val, bold]) => (
                  <div key={lbl} className="gsr-preview-row">
                    <span className="gsr-preview-label">{lbl}</span>
                    <span className={`gsr-preview-value${bold ? ' gsr-preview-value--strong' : ''}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECENTLY REGISTERED STORE ITEMS ── */}
      <div className="gsr-recent-wrap">
        <div className="gsr-card">
          <div className="gsr-card-head">
            <div className="gsr-card-head-left">
              <ClipboardList size={18} color="#16A34A" />
              <span className="gsr-card-title">Recently Registered Store Consumables</span>
            </div>
            <button
              type="button"
              className="gsr-top-btn"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => nav('/general-store/inventory')}
            >
              View Full Inventory ({recentItems.length ? 'Live' : '0'}) →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {recentItems.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                {loadingRecent ? 'Loading recent items...' : 'No consumable items registered yet. Use the form above to add your first item.'}
              </div>
            ) : (
              <table className="gsr-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Material Name</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Stock Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right' }}>Total Value</th>
                    <th>Registered By</th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.map(it => (
                    <tr key={it.id || it.material_id}>
                      <td><span className="gsr-table-id">{it.material_id}</span></td>
                      <td style={{ fontWeight: 600 }}>{it.material_name}</td>
                      <td><span style={{ fontSize: 12, color: '#4B5563' }}>{it.category}</span></td>
                      <td><DeptBadge dept={it.department || 'Printing'} /></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{parseFloat(it.quantity_in_store || 0).toLocaleString()} {it.unit || ''}</td>
                      <td style={{ textAlign: 'right' }}>ETB {parseFloat(it.unit_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>ETB {parseFloat(it.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontSize: 12, color: '#6B7280' }}>{it.registered_by || 'Store Keeper'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── INCOMING SHIPMENTS MODAL ── */}
      {showIncoming && (
        <div className="gsr-overlay" onClick={() => setShowIncoming(false)}>
          <div className="gsr-inc-modal" onClick={e => e.stopPropagation()}>
            <div className="gsr-inc-head">
              <Download size={18} color="#16A34A" />
              <span className="gsr-inc-title">Incoming Shipments (From Purchase Quotations)</span>
              <button className="gsr-inc-close" onClick={() => setShowIncoming(false)}>✕</button>
            </div>
            <div className="gsr-inc-tabs">
              <button className={`gsr-inc-tab${incTab === 'pending' ? ' gsr-inc-tab--on' : ''}`} onClick={() => setIncTab('pending')}>
                Pending ({incomingList.length})
              </button>
              <button className={`gsr-inc-tab${incTab === 'received' ? ' gsr-inc-tab--on' : ''}`} onClick={() => setIncTab('received')}>
                Accepted ({acceptedList.length})
              </button>
            </div>
            <div className="gsr-inc-body">
              {incTab === 'pending' ? (
                incomingList.length === 0 ? (
                  <div className="gsr-inc-empty">
                    <div style={{ fontSize: 32 }}><Mailbox size={28} /></div>
                    <div><strong>No pending incoming shipments.</strong></div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Shipments converted and sent to General Store by the Purchase team will appear here.</div>
                  </div>
                ) : (
                  incomingList.map(inc => {
                    const totalValue = Number(inc.total_value || 0);
                    const receivedValue = Number(inc.received_value || 0);
                    const pct = Math.min(100, Number(inc.percent || 0));
                    return (
                      <div key={inc.id} className={`gsr-inc-card${selectedInc === inc.id ? ' gsr-inc-card--active' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>
                            {inc.delivery_note_no || `Inc-${inc.id}`}
                            <span style={{ fontWeight: 600, color: '#6B7280', marginLeft: 8, fontSize: 12 }}>{inc.quotation_no} · {inc.supplier_name || 'supplier'}</span>
                          </div>
                          <span className="gsr-inc-status">PENDING</span>
                        </div>
                        <div style={{ margin: '8px 0', fontSize: 12, color: '#4B5563' }}>
                          Accepted {inc.received_count || 0} of {inc.item_count || (inc.items || []).length} item(s) · ETB {receivedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({pct}%)
                        </div>
                        <table className="gsr-inc-items">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th style={{ textAlign: 'right' }}>Qty</th>
                              <th style={{ textAlign: 'right' }}>Unit</th>
                              <th style={{ textAlign: 'right' }}>Cost</th>
                              <th style={{ textAlign: 'right' }}>Total</th>
                              <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(inc.items || []).map(it => (
                              <tr key={it.id}>
                                <td>{it.item_description || '—'}</td>
                                <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{it.unit || '—'}</td>
                                <td style={{ textAlign: 'right' }}>ETB {parseFloat(it.unit_price || 0).toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>ETB {parseFloat(it.line_total || 0).toLocaleString()}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    className="gsr-inc-btn gsr-inc-btn--primary"
                                    disabled={receiving}
                                    onClick={() => acceptItem(inc, it)}
                                  >
                                    <Plus size={14} /> Stock Item
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="gsr-inc-actions">
                          <button
                            type="button"
                            className="gsr-inc-btn gsr-inc-btn--ghost"
                            disabled={receiving}
                            onClick={() => acceptShipment(inc)}
                          >
                            {receiving && selectedInc === inc.id ? 'Receiving...' : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Package size={16} /> Receive All at Once
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                acceptedList.length === 0 ? (
                  <div className="gsr-inc-empty">
                    <div style={{ fontSize: 32 }}><Package size={28} /></div>
                    <div><strong>No accepted shipments yet.</strong></div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Shipments you accepted will be listed here.</div>
                  </div>
                ) : (
                  acceptedList.map(inc => (
                    <div key={inc.id} className="gsr-inc-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>
                          {inc.delivery_note_no || `Inc-${inc.id}`}
                          <span style={{ fontWeight: 600, color: '#6B7280', marginLeft: 8, fontSize: 12 }}>{inc.quotation_no} · {inc.supplier_name || 'supplier'}</span>
                        </div>
                        <span className="gsr-inc-status gsr-inc-status--ok">ACCEPTED</span>
                      </div>
                      <table className="gsr-inc-items">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th style={{ textAlign: 'right' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Unit</th>
                            <th style={{ textAlign: 'right' }}>Cost</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(inc.items || []).map(it => (
                            <tr key={it.id}>
                              <td>{it.item_description || '—'}</td>
                              <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                              <td style={{ textAlign: 'right' }}>{it.unit || '—'}</td>
                              <td style={{ textAlign: 'right' }}>ETB {parseFloat(it.unit_price || 0).toLocaleString()}</td>
                              <td style={{ textAlign: 'right' }}>ETB {parseFloat(it.line_total || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ fontSize: 12, color: '#15803D', fontWeight: 600, marginTop: 8 }}>
                        ✓ Accepted{inc.received_by_name ? ` by ${inc.received_by_name}` : ''}{inc.received_at ? ` on ${new Date(inc.received_at).toLocaleString()}` : ''}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`gsr-toast gsr-toast--${toast.type}`}>
          <span className="gsr-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};


const GSIS_CSS = `
  .gsis-issue { box-sizing: border-box; width: 100%; min-height: 100%; background: var(--color-bg-page, #F5F6FA); color: var(--color-text-primary, #111827); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsis-issue *, .gsis-issue *::before, .gsis-issue *::after { box-sizing: border-box; }
  .gsis-issue button, .gsis-issue input, .gsis-issue select, .gsis-issue textarea { font-family: inherit; }
  .gsis-content { display: flex; flex-direction: column; }

  /* ── Toast ── */
  @keyframes gsisToastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .gsis-toast { position: fixed; right: 24px; bottom: 24px; z-index: 10000; max-width: 380px; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; border-left: 4px solid rgba(255,255,255,0.55); background: var(--color-text-primary, #111827); color: #fff; font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.18); animation: gsisToastIn 200ms ease; }
  .gsis-toast--success { background: var(--color-success, #16A34A); }
  .gsis-toast--error { background: var(--color-danger, #DC2626); }
  .gsis-toast-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.24); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* ── Header ── */
  .gsis-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0 0 24px 0; }
  .gsis-header-left { display: flex; align-items: center; gap: 14px; }
  .gsis-header-icon { flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #EFF6FF; font-size: 22px; }
  .gsis-title { margin: 0; font-size: 26px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: var(--color-text-primary, #111827); }
  .gsis-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsis-wait-btn { height: 40px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-wait-btn:hover { background: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); transform: translateY(-1px); }
  .gsis-wait-btn:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }
  .gsis-wait-badge { min-width: 24px; height: 20px; padding: 0 7px; display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; background: #fff; color: var(--color-primary, #2563EB); font-size: 12px; font-weight: 600; }

  /* ── Cards & fields ── */
  .gsis-card { background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out, border-color 150ms ease-in-out; }
  .gsis-card:hover { border-color: #FDE68A; box-shadow: 0 4px 12px rgba(234,179,8,0.18); transform: translateY(-1px); }
  .gsis-card-head { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-bottom: 1px solid var(--color-border, #E5E7EB); background: #F9FAFB; }
  .gsis-card-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsis-card-body { padding: 20px; }
  .gsis-field { display: flex; flex-direction: column; gap: 6px; }
  .gsis-label { font-size: 12px; font-weight: 500; color: var(--color-text-secondary, #6B7280); }
  .gsis-input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out; }
  .gsis-input:focus { outline: none; border-color: #EAB308; box-shadow: 0 0 0 3px rgba(234,179,8,0.18); }
  .gsis-input--num { font-variant-numeric: tabular-nums; }
  .gsis-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .gsis-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .gsis-info { margin-top: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; padding: 14px 16px; border: 1px solid #BFDBFE; border-left: 3px solid var(--color-primary, #2563EB); border-radius: 8px; background: #EFF6FF; }
  .gsis-info-item { display: flex; flex-direction: column; gap: 2px; }
  .gsis-info-label { font-size: 11px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
  .gsis-info-value { font-size: 14px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsis-info-value--big { font-size: 20px; font-weight: 600; color: var(--color-primary, #2563EB); font-variant-numeric: tabular-nums; }
  .gsis-info-value--danger { color: var(--color-danger, #DC2626); }

  /* ── Action bar ── */
  .gsis-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 16px; padding: 16px 20px; background: #F9FAFB; border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; }
  .gsis-actions-notes { display: flex; flex-direction: column; gap: 4px; }
  .gsis-action-note { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsis-action-check { flex-shrink: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); font-size: 11px; font-weight: 700; }
  .gsis-submit { height: 44px; padding: 0 28px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-submit:hover:not(:disabled) { background: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); transform: translateY(-1px); }
  .gsis-submit:disabled { opacity: 0.55; cursor: not-allowed; }
  .gsis-submit:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }

  /* ── History section ── */
  .gsis-history-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 32px 0 16px 0; }
  .gsis-history-title { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.3; color: var(--color-text-primary, #111827); }
  .gsis-history-count { margin: 4px 0 0; font-size: 12px; color: var(--color-text-secondary, #6B7280); }
  .gsis-filters { display: flex; gap: 8px; flex-wrap: wrap; }
  .gsis-filter-btn { height: 34px; padding: 0 14px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: var(--color-bg-card, #fff); color: var(--color-text-secondary, #6B7280); font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 150ms ease-in-out, color 150ms ease-in-out, border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-filter-btn:hover { color: #B45309; border-color: #EAB308; box-shadow: 0 3px 10px rgba(234,179,8,0.18); transform: translateY(-1px); }
  .gsis-filter-btn--active { background: var(--color-primary, #2563EB); border-color: var(--color-primary, #2563EB); color: #fff; }
  .gsis-filter-btn--active:hover { background: #EAB308; border-color: #EAB308; color: #78350F; }
  .gsis-filter-count { height: 18px; padding: 0 7px; display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; background: #F3F4F6; color: var(--color-text-secondary, #6B7280); font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .gsis-filter-btn--active .gsis-filter-count { background: rgba(255,255,255,0.25); color: #fff; }
  .gsis-filter-btn--active:hover .gsis-filter-count { background: rgba(120,53,15,0.12); color: #78350F; }

  /* ── Table ── */
  .gsis-table-card { overflow: hidden; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .gsis-table-wrap { overflow-x: auto; }
  .gsis-table { width: 100%; border-collapse: collapse; min-width: 760px; font-size: 13px; }
  .gsis-table th { padding: 12px 14px; background: #F9FAFB; border-bottom: 1px solid var(--color-border, #E5E7EB); text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); white-space: nowrap; }
  .gsis-table td { padding: 12px 14px; border-bottom: 1px solid #F3F4F6; color: var(--color-text-primary, #111827); }
  .gsis-table tbody tr { transition: background 150ms ease-in-out; }
  .gsis-table tbody tr:hover { background: #FEFCE8; }
  .gsis-table tbody tr.gsis-tr--open { background: #FFFBEB; }
  .gsis-table tbody tr.gsis-tr--open > td:first-child { box-shadow: inset 3px 0 0 var(--color-warning, #D97706); }
  .gsis-table tbody tr:last-child td { border-bottom: none; }
  .gsis-td--idx { color: var(--color-text-muted, #9CA3AF); font-variant-numeric: tabular-nums; }
  .gsis-td--strong { font-weight: 600; }
  .gsis-td--code { font-weight: 600; color: var(--color-text-primary, #111827); font-variant-numeric: tabular-nums; }
  .gsis-td--dim { color: var(--color-text-secondary, #6B7280); }
  .gsis-badge { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsis-badge--car { background: var(--color-info-bg, #E0F2FE); color: var(--color-info, #0284C7); }
  .gsis-badge--agri { background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); }
  .gsis-badge--print { background: #F3E8FF; color: #7E22CE; }
  .gsis-badge--sales { background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); }
  .gsis-badge--unknown { background: #F3F4F6; color: var(--color-text-secondary, #6B7280); }
  .gsis-count-badge { display: inline-flex; align-items: center; justify-content: center; height: 22px; padding: 0 9px; border-radius: 9999px; background: #F3F4F6; color: var(--color-text-secondary, #6B7280); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .gsis-status-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsis-view-btn { height: 30px; padding: 0 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 6px; background: #fff; color: var(--color-primary, #2563EB); font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 150ms ease-in-out, color 150ms ease-in-out, border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-view-btn:hover { color: #B45309; border-color: #EAB308; background: #FEFCE8; box-shadow: 0 3px 10px rgba(234,179,8,0.18); transform: translateY(-1px); }

  /* ── Expandable row detail ── */
  .gsis-detail { background: #FAFAF9; border-top: 1px solid var(--color-border, #E5E7EB); }
  .gsis-detail-inner { padding: 16px 20px; border-left: 3px solid var(--color-info, #0284C7); }
  .gsis-detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .gsis-detail-item { padding-left: 10px; border-left: 2px solid var(--color-border, #E5E7EB); }
  .gsis-detail-label { font-size: 10px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-muted, #9CA3AF); margin-bottom: 4px; }
  .gsis-detail-value { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsis-sub-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 480px; }
  .gsis-sub-table th { padding: 8px 12px; background: #F3F4F6; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
  .gsis-sub-table td { padding: 8px 12px; border-bottom: 1px solid #F3F4F6; }
  .gsis-sub-table tbody tr { transition: background 150ms ease-in-out; }
  .gsis-sub-table tbody tr:hover { background: #FEFCE8; }
  .gsis-sub-table tbody tr:last-child td { border-bottom: none; }
  .gsis-sub-table td:first-child { color: var(--color-text-muted, #9CA3AF); font-variant-numeric: tabular-nums; }
  .gsis-ship-flag { font-size: 11px; font-weight: 600; color: var(--color-success, #16A34A); }
  .gsis-ship-pending { font-size: 11px; color: var(--color-text-muted, #9CA3AF); }
  .gsis-detail-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 20px; color: var(--color-text-secondary, #6B7280); font-size: 13px; }
  .gsis-detail-error { padding: 12px; color: var(--color-danger, #DC2626); font-size: 13px; font-weight: 600; }

  /* ── Empty state ── */
  .gsis-empty { padding: 48px 16px; text-align: center; color: var(--color-text-muted, #9CA3AF); }
  .gsis-empty-icon { margin-bottom: 10px; opacity: 0.5; }
  .gsis-empty-title { font-size: 14px; font-weight: 600; color: var(--color-text-secondary, #6B7280); }

  /* ── Modals ── */
  @keyframes gsisModalIn { from { opacity: 0; transform: translateY(-8px) scale(0.99); } to { opacity: 1; transform: none; } }
  .gsis-modal-wrap { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.45); display: flex; overflow-y: auto; font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsis-modal { width: 100%; margin: auto; background: var(--color-bg-card, #fff); border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: gsisModalIn 180ms ease; }
  .gsis-modal--wide { max-width: 880px; }
  .gsis-modal--sm { max-width: 520px; }
  .gsis-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 24px; border-bottom: 1px solid var(--color-border, #E5E7EB); }
  .gsis-modal-title { margin: 0; font-size: 17px; font-weight: 600; color: var(--color-text-primary, #111827); display: flex; align-items: center; gap: 10px; }
  .gsis-modal-sub { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsis-modal-close { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: var(--color-bg-card, #fff); color: var(--color-text-secondary, #6B7280); font-size: 16px; cursor: pointer; transition: background 150ms ease-in-out, color 150ms ease-in-out, border-color 150ms ease-in-out; }
  .gsis-modal-close:hover { background: var(--color-danger-bg, #FEE2E2); color: var(--color-danger, #DC2626); border-color: #FECACA; }
  .gsis-modal-body { padding: 24px; background: #F9FAFB; border-radius: 0 0 12px 12px; }
  .gsis-group { margin-bottom: 24px; }
  .gsis-group:last-child { margin-bottom: 0; }
  .gsis-group-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .gsis-group-tag { height: 24px; padding: 0 10px; display: inline-flex; align-items: center; border-radius: 9999px; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; }
  .gsis-group-tag--print { background: #F97316; color: #fff; }
  .gsis-group-tag--car { background: var(--color-info, #0284C7); color: #fff; }
  .gsis-group-tag--pos { background: var(--color-success, #16A34A); color: #fff; }
  .gsis-group-count { font-size: 12px; font-weight: 600; color: var(--color-text-secondary, #6B7280); }
  .gsis-req-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-left: 3px solid var(--color-info, #0284C7); border-radius: 8px; margin-bottom: 8px; transition: box-shadow 150ms ease-in-out, transform 150ms ease-in-out, border-color 150ms ease-in-out; }
  .gsis-req-row:hover { box-shadow: 0 4px 12px rgba(234,179,8,0.18); transform: translateY(-1px); border-color: #FDE68A; }
  .gsis-req-row:last-child { margin-bottom: 0; }
  .gsis-req-row--pos { border-left-color: var(--color-success, #16A34A); }
  .gsis-req-row--print { border-left-color: #F97316; }
  .gsis-req-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsis-req-meta { margin-top: 4px; font-size: 12px; color: var(--color-text-secondary, #6B7280); line-height: 1.5; }
  .gsis-req-meta strong { color: var(--color-text-primary, #111827); }
  .gsis-req-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .gsis-prep-btn { height: 34px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-prep-btn:hover { background: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); transform: translateY(-1px); }
  .gsis-prep-btn:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }
  .gsis-reject-btn { height: 34px; padding: 0 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid #FECACA; border-radius: 8px; background: var(--color-danger-bg, #FEE2E2); color: var(--color-danger, #DC2626); font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-reject-btn:hover { background: var(--color-danger, #DC2626); color: #fff; box-shadow: 0 4px 12px rgba(220,38,38,0.25); transform: translateY(-1px); }
  .gsis-modal-empty { padding: 48px 16px; text-align: center; color: var(--color-text-secondary, #6B7280); font-size: 14px; font-weight: 500; }

  /* ── Reject modal ── */
  .gsis-reject-title { margin: 0; font-size: 17px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsis-reject-sub { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsis-textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; resize: vertical; transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out; }
  .gsis-textarea:focus { outline: none; border-color: #EAB308; box-shadow: 0 0 0 3px rgba(234,179,8,0.18); }
  .gsis-modal-foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--color-border, #E5E7EB); background: #F9FAFB; border-radius: 0 0 12px 12px; }
  .gsis-btn { height: 36px; padding: 0 18px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: var(--color-bg-card, #fff); color: var(--color-text-primary, #111827); font-size: 13px; font-weight: 500; cursor: pointer; transition: background 150ms ease-in-out, color 150ms ease-in-out, border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsis-btn:hover:not(:disabled) { color: #B45309; border-color: #EAB308; box-shadow: 0 3px 10px rgba(234,179,8,0.18); transform: translateY(-1px); }
  .gsis-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .gsis-btn--danger { background: var(--color-danger, #DC2626); border-color: var(--color-danger, #DC2626); color: #fff; }
  .gsis-btn--danger:hover:not(:disabled) { background: #EAB308; border-color: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); }
  .gsis-btn--success { background: var(--color-success, #16A34A); border-color: var(--color-success, #16A34A); color: #fff; }
  .gsis-btn--success:hover:not(:disabled) { background: #EAB308; border-color: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); }

  /* ── Ship confirm modal table ── */
  .gsis-ship-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 420px; }
  .gsis-ship-table th { padding: 10px 12px; background: #F9FAFB; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); border-bottom: 1px solid var(--color-border, #E5E7EB); }
  .gsis-ship-table td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; }
  .gsis-ship-table tbody tr { transition: background 150ms ease-in-out; }
  .gsis-ship-table tbody tr:hover { background: #FEFCE8; }
  .gsis-ship-input { width: 76px; height: 34px; padding: 0 10px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; text-align: center; font-variant-numeric: tabular-nums; transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out; }
  .gsis-ship-input:focus { outline: none; border-color: #EAB308; box-shadow: 0 0 0 3px rgba(234,179,8,0.18); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .gsis-grid-4 { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .gsis-title { font-size: 22px; }
    .gsis-header-icon { width: 40px; height: 40px; }
    .gsis-grid-2, .gsis-grid-4 { grid-template-columns: 1fr; }
    .gsis-modal-wrap { padding: 24px 12px; }
  }
  @media (max-width: 480px) {
    .gsis-input, .gsis-textarea { height: 44px; }
    .gsis-submit { width: 100%; height: 44px; }
    .gsis-actions { flex-direction: column; align-items: stretch; }
    .gsis-wait-btn { height: 44px; }
    .gsis-btn { height: 44px; }
    .gsis-req-row { flex-direction: column; align-items: flex-start; }
    .gsis-req-actions { width: 100%; }
    .gsis-req-actions .gsis-prep-btn, .gsis-req-actions .gsis-reject-btn { flex: 1; height: 40px; }
    .gsis-detail-inner { padding: 14px; }
    .gsis-info { grid-template-columns: 1fr 1fr; }
  }
`;

/* ─── 4. ISSUE TO DEPARTMENT ────────────────────────────────────────────── */
export const GSIssueItem = () => {
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests]   = useState([]);
  const [carRequests, setCarRequests] = useState([]);
  const [carShipModal, setCarShipModal] = useState(null);
  const [carShipQtys, setCarShipQtys] = useState({});
  const [form, setForm]           = useState({ material_id: '', quantity: '', job_reference: '', department: '', requested_by: '', request_id: null, request_type: null });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [focused, setFocused]     = useState(null);
  // POS Sales Requests from RetailPOS
  const [posRequests, setPosRequests] = useState([]);
  const [posActionLoading, setPosActionLoading] = useState({});
  const [posRejectModal, setPosRejectModal] = useState(null);
  const [posRejectReason, setPosRejectReason] = useState('');
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  
  // History State
  const [allHistory, setAllHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('All');
  const [expandedRows, setExpandedRows] = useState({});
  const [rowDetails, setRowDetails] = useState({});
  const [rowDetailLoading, setRowDetailLoading] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4500); };

  const load = useCallback(async () => {
    try {
      const [rMat, rReq, rCarReq, rPos, rLogs] = await Promise.all([
        api.get('/api/v1/printing-assets/store/materials'),
        api.get('/api/v1/printing-assets/material-requests').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/car-renting/store-requests').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/store-sales-requests').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/printing-assets/log', { params: { action_type: 'Issue to Department' } }).catch(() => ({ data: { data: [] } })),
      ]);
      const mats = rMat.data?.data || rMat.data || [];
      setMaterials(Array.isArray(mats) ? mats : []);
      
      const allPrinting = rReq.data?.data || rReq.data || [];
      setRequests(Array.isArray(allPrinting) ? allPrinting.filter(r => r.status === 'APPROVED') : []);
      
      const allCarAgri = rCarReq.data?.data || rCarReq.data || [];
      setCarRequests(Array.isArray(allCarAgri) ? allCarAgri.filter(r => r.status === 'PENDING_STORE') : []);
      
      const allPos = rPos.data?.data || rPos.data || [];
      setPosRequests(Array.isArray(allPos) ? allPos.filter(r => r.status === 'Pending') : []);

      // Combine histories
      const mapHist = (arr, type, defDept) => (Array.isArray(arr) ? arr : []).map(r => ({
        ...r,
        req_type: type,
        department: r.department || defDept,
        date: r.created_at || r.createdAt || r.date || r.date_time || new Date().toISOString(),
        request_number: r.request_code || r.request_number || r.id,
        item_count: r.item_count || (type === 'pos' ? (() => { try { return JSON.parse(r.cart_items || '[]').length; } catch(e) { return 1; }})() : (r.items ? (typeof r.items === 'number' ? r.items : r.items.length) : 1)),
        status: r.status
      }));

      const histCar = mapHist(Array.isArray(allCarAgri) ? allCarAgri.filter(r => r.status !== 'PENDING_STORE') : [], 'car_agri', 'Car Rental');
      const histPrint = mapHist(Array.isArray(allPrinting) ? allPrinting.filter(r => r.status !== 'APPROVED' && r.status !== 'PENDING') : [], 'printing', 'Printing');
      const histPos = mapHist(Array.isArray(allPos) ? allPos.filter(r => r.status !== 'Pending') : [], 'pos', 'Sales');

      // Direct issues recorded in movement log
      const allIssueLogs = rLogs.data?.data || rLogs.data || [];
      const histDirect = (Array.isArray(allIssueLogs) ? allIssueLogs : []).map(l => {
        const mat = (Array.isArray(mats) ? mats : []).find(m => m.material_id === l.item_id);
        const matName = mat?.material_name || l.notes?.match(/Material registered:\s*([^,]+)/i)?.[1] || l.item_id;
        const reqBy = l.notes?.match(/Requested by:\s*([^|]+)/i)?.[1]?.trim() || l.moved_by || 'Store Requester';
        const jobRef = l.notes?.match(/Ref:\s*([^|]+)/i)?.[1]?.trim() || '—';
        const qtyNum = parseFloat(l.quantity) || 0;
        const unitName = mat?.unit || '';

        return {
          id: l.id,
          req_type: 'issue',
          department: l.department || l.to_location || 'General Store',
          date: l.date_time || l.created_at || new Date().toISOString(),
          request_number: `ISS-${String(l.id).padStart(4, '0')}`,
          item_count: `${qtyNum} ${unitName}`.trim() || `${qtyNum} units`,
          status: 'ISSUED',
          requester_name: reqBy,
          approver_name: l.approved_by || 'Store Keeper',
          store_handler_name: l.moved_by || 'Store Keeper',
          notes: l.notes,
          job_reference: jobRef,
          items: [{
            product_name: `${matName} (${l.item_id})`,
            quantity_requested: `${qtyNum} ${unitName}`.trim(),
            quantity_shipped: `${qtyNum} ${unitName}`.trim(),
            status: 'RELEASED'
          }]
        };
      });

      const hist = [...histCar, ...histPrint, ...histPos, ...histDirect];
      hist.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllHistory(hist);

    } catch (err) {
      console.error('Error loading materials:', err);
      showToast('error', 'Failed to load materials from the store.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selected = materials.find(m => m.material_id === form.material_id);

  const submit = async () => {
    if (!form.material_id) return showToast('error', 'Please select a material to issue.');
    if (!form.quantity || parseFloat(form.quantity) <= 0) return showToast('error', 'Please enter a valid quantity.');
    if (!form.department) return showToast('error', 'Please select the destination department.');
    if (!form.requested_by.trim()) return showToast('error', 'Please enter the name of the person requesting.');
    
    if (selected && parseFloat(form.quantity) > parseFloat(selected.quantity_in_store)) {
      return showToast('error', `Cannot issue more than available (${selected.quantity_in_store} ${selected.unit}).`);
    }

    setSaving(true);
    try {
      if (form.request_id && form.request_type === 'pos') {
        // POS Sales request — issue material then auto-record sale
        await api.post('/api/v1/printing-assets/issue/material', {
          material_id: form.material_id,
          quantity: form.quantity,
          department: form.department,
          requested_by: form.requested_by,
          job_reference: form.job_reference,
        });
        await api.patch(`/api/v1/store-sales-requests/${form.request_id}/release`, {
          store_keeper_signature: 'Store Keeper',
          notes: form.job_reference,
        });
        showToast('success', `✓… Issued & sale recorded for ${form.department}!`);
      } else if (form.request_id && form.request_type === 'printing') {
        // Printing request -- ship via material-requests API (CEO-approved flow)
        await api.post(`/api/v1/printing-assets/material-requests/${form.request_id}/ship`, {
          shipped_qty: form.quantity,
          requested_by: form.requested_by,
          job_reference: form.job_reference
        });
        showToast('success', `Shipped ${form.quantity} ${selected?.unit} to Printing Dept!`);
      } else {
        // Direct issue flow (no linked request)
        await api.post('/api/v1/printing-assets/issue/material', form);
        showToast('success', `✓… Successfully issued ${form.quantity} ${selected?.unit} to ${form.department}!`);
      }
      setForm({ material_id: '', quantity: '', job_reference: '', department: '', requested_by: '', request_id: null, request_type: null });
      load(); // refresh available balances
    } catch (e) { showToast('error', e.response?.data?.message || 'Error issuing material'); }
    setSaving(false);
  };

  const handlePrepareCar = (r) => {
    // Car/Agri requests are multi-item -- open the dedicated ship modal
    // which captures per-item quantities and calls PATCH /car-renting/store-requests/:id/status
    setCarShipModal(r);
    const initQtys = {};
    (r.items || []).forEach(it => { initQtys[it.id] = it.quantity_requested || 0; });
    setCarShipQtys(initQtys);
    setShowWaitingModal(false);
  };

  const handlePreparePos = (r) => {
    let cartItems = [];
    try { cartItems = JSON.parse(r.cart_items || '[]'); } catch(e) {}
    if (cartItems.length === 0 && r.product_name) {
      cartItems = [{ name: r.product_name, qty: r.quantity_requested, price: 0 }];
    }
    
    // Attempt to match pos product to a material by name, or leave blank to force user selection
    const itemName = cartItems[0]?.name || cartItems[0]?.source || r.product_name;
    const matMatch = materials.find(m => m.material_name?.toLowerCase() === itemName?.toLowerCase());
    
    setForm({
      material_id: matMatch ? matMatch.material_id : '',
      quantity: cartItems[0]?.qty || r.quantity_requested || '',
      department: 'Sales',
      requested_by: r.requested_by_name || r.customer_name || '',
      job_reference: 'POS ' + r.request_code,
      request_id: r.id,
      request_type: 'pos'
    });
    setShowWaitingModal(false);
    const formEl = document.getElementById('issue_details_section');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrepareShip = (r) => {
    setForm({
      material_id: r.material_id,
      quantity: r.quantity_requested,
      department: r.department || 'Printing',
      requested_by: r.created_by_name || '',
      job_reference: 'Req ' + r.request_code,
      request_id: r.id,
      request_type: 'printing'
    });
    setShowWaitingModal(false);
    // Scroll down to form
    const formEl = document.getElementById('issue_details_section');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShipCarRequest = async () => {
    if (!carShipModal) return;
    const shippedItems = (carShipModal.items || []).map(it => ({
      id: it.id,
      product_id: it.product_id,
      quantity_shipped: parseInt(carShipQtys[it.id]) || 0,
    })).filter(it => it.quantity_shipped > 0);

    if (!shippedItems.length) {
      showToast('error', 'Please set at least one shipped quantity');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/v1/car-renting/store-requests/${carShipModal.id}/status`, {
        status: 'SHIPPED',
        items: shippedItems,
      });
      showToast('success', 'Car/Agri items shipped successfully! Inventory updated.');
      setCarShipModal(null);
      load();
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to ship');
    }
    setSaving(false);
  };

  const toggleRowDetail = async (id, req_type) => {
    const isOpen = !!expandedRows[id];
    if (isOpen) {
      setExpandedRows(prev => ({ ...prev, [id]: false }));
      return;
    }
    setExpandedRows(prev => ({ ...prev, [id]: true }));
    if (!rowDetails[id]) {
      if (req_type === 'issue') {
        const item = allHistory.find(h => h.id === id && h.req_type === 'issue');
        if (item) {
          setRowDetails(prev => ({ ...prev, [id]: item }));
        }
        return;
      }
      setRowDetailLoading(prev => ({ ...prev, [id]: true }));
      try {
        let endpoint;
        if (req_type === 'pos') {
          endpoint = `/api/v1/store-sales-requests/${id}`;
        } else if (req_type === 'printing') {
          endpoint = `/api/v1/printing-assets/material-requests/${id}`;
        } else {
          // car_agri default
          endpoint = `/api/v1/car-renting/store-requests/${id}`;
        }
        const res = await api.get(endpoint);
        // Normalize response shape for display
        const raw = res.data?.data || res.data || {};
        let normalized = { ...raw };
        // For POS items: parse cart_items as items array
        if (req_type === 'pos' && raw.cart_items) {
          try {
            const cartItems = typeof raw.cart_items === 'string' ? JSON.parse(raw.cart_items) : raw.cart_items;
            normalized.items = cartItems.map(ci => ({
              product_name: ci.name || ci.source || 'Item',
              quantity_requested: ci.qty,
              quantity_shipped: raw.status === 'APPROVED_BY_STORE' ? ci.qty : null,
            }));
          } catch(e) {}
        }
        setRowDetails(prev => ({ ...prev, [id]: normalized }));
      } catch {
        showToast('error', 'Failed to load detail');
        setExpandedRows(prev => ({ ...prev, [id]: false }));
      } finally {
        setRowDetailLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const filteredHistory = historyFilter === 'All'
    ? allHistory
    : historyFilter === 'Car Rental'
      ? allHistory.filter(r => r.department === 'Car Rental')
      : historyFilter === 'AgriRent'
      ? allHistory.filter(r => r.department === 'AgriRent')
      : historyFilter === 'Printing'
      ? allHistory.filter(r => r.department === 'Printing')
      : allHistory.filter(r => r.department === 'Sales' || r.department === 'Retail' || r.department === 'Retail POS' || r.req_type === 'pos');

  const STATUS = {
    PENDING_STORE:        { label: 'Pending Store',  color: '#f59e0b',  bg: '#FFF8E1' },
    FORWARDED_TO_CEO:     { label: 'With CEO',       color: '#3b82f6',  bg: '#E3F2FD' },
    APPROVED:             { label: 'CEO Approved',   color: '#10b981',  bg: '#F1F8E9' },
    REJECTED:             { label: 'Rejected',       color: '#ef4444',  bg: '#FFEBEE' },
    SHIPPED:              { label: 'Shipped ✓',      color: '#059669',  bg: '#E8F5E9' },
    RECEIVED:             { label: 'Received ✓',     color: '#065f46',  bg: '#E8F5E9' },
    Pending:              { label: 'Pending',        color: '#f59e0b',  bg: '#FFF8E1' },
    APPROVED_BY_STORE:    { label: 'Released ✓',     color: '#059669',  bg: '#E8F5E9' },
    REJECTED_BY_STORE:    { label: 'Rejected',       color: '#ef4444',  bg: '#FFEBEE' },
    COMPLETED:            { label: 'Completed ✓',    color: '#065f46',  bg: '#E8F5E9' },
    ISSUED:               { label: 'Issued ✓',       color: '#059669',  bg: '#E8F5E9' },
    'Issue to Department': { label: 'Issued ✓',      color: '#059669',  bg: '#E8F5E9' },
  };

  const StatusBadge = ({ status }) => {
    const cfg = STATUS[status] || { label: status, color: G.darkGray, bg: '#f1f5f9' };
    return (
      <span className="gsis-status-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
    );
  };

  return (
    <div className="gsis-issue">
      <style>{GSIS_CSS}</style>

      {/* Ship Confirm Modal for Car/Agri Requests */}
      {carShipModal && (
        <div className="gsis-modal-wrap">
          <div className="gsis-modal gsis-modal--sm" role="dialog" aria-modal="true">
            <div className="gsis-modal-head">
              <div>
                <div className="gsis-modal-title"><Truck size={18} /> Confirm Shipment</div>
                <div className="gsis-modal-sub">Enter the quantity to ship for each item. Inventory will be deducted automatically.</div>
              </div>
              <button className="gsis-modal-close" onClick={() => setCarShipModal(null)} aria-label="Close">✕</button>
            </div>
            <div className="gsis-modal-body" style={{ borderRadius: 0 }}>
              <div className="gsis-table-wrap">
                <table className="gsis-ship-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Requested</th>
                      <th style={{ textAlign: 'right' }}>Ship Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(carShipModal.items || []).map((it, i) => (
                      <tr key={it.id}>
                        <td>{it.product_name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{it.quantity_requested}</td>
                        <td style={{ textAlign: 'right' }}>
                          <input
                            type="number" min="0" max={it.quantity_requested}
                            value={carShipQtys[it.id] || 0}
                            onChange={e => setCarShipQtys(prev => ({ ...prev, [it.id]: e.target.value }))}
                            className="gsis-ship-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="gsis-modal-foot">
              <button className="gsis-btn" disabled={saving} onClick={() => setCarShipModal(null)}>Cancel</button>
              <button className="gsis-btn gsis-btn--success" disabled={saving} onClick={handleShipCarRequest}>
                {saving ? 'Processing...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="gsis-content">
        
        {/* ── HEADER BAR ── */}
        <div className="gsis-header">
          <div className="gsis-header-left">
            <span className="gsis-header-icon"><Send size={18} /></span>
            <div>
              <h1 className="gsis-title">Issue to Department</h1>
              <p className="gsis-subtitle">Formal process of releasing material from General Store stock</p>
            </div>
          </div>
          <button onClick={() => setShowWaitingModal(true)} className="gsis-wait-btn">
            <Shield size={18} /> Waiting Requests <span className="gsis-wait-badge">{requests.length + carRequests.length + posRequests.length}</span>
          </button>
        </div>

        {/* ── MAIN FORM ── */}
        <div id="issue_details_section">
          
          <div className="gsis-card">
            <div className="gsis-card-head">
              <span style={{ fontSize: 16 }}><FileText size={18} /></span><span className="gsis-card-title">Issue Details</span>
            </div>
            
            <div className="gsis-card-body">
              
              {/* Item Selection */}
              <div style={{ marginBottom: 20 }}>
                <div className="gsis-field">
                  <label className="gsis-label">Select Material / Item *</label>
                  <select value={form.material_id} onChange={e => set('material_id', e.target.value)} className="gsis-input">
                    <option value="">-- Choose an item from store --</option>
                    {materials.map(m => <option key={m.id} value={m.material_id}>{m.material_name} — Avail: {parseFloat(m.quantity_in_store).toLocaleString()} {m.unit}</option>)}
                  </select>
                </div>
                
                {selected && (
                  <div className="gsis-info">
                    <div className="gsis-info-item">
                      <span className="gsis-info-label">Category</span>
                      <span className="gsis-info-value">{selected.category}</span>
                    </div>
                    <div className="gsis-info-item">
                      <span className="gsis-info-label">Current Dept</span>
                      <span className="gsis-info-value">{selected.department}</span>
                    </div>
                    <div className="gsis-info-item">
                      <span className="gsis-info-label">Available Balance</span>
                      <span className={`gsis-info-value--big${parseFloat(selected.quantity_in_store) <= 0 ? ' gsis-info-value--danger' : ''}`}>{parseFloat(selected.quantity_in_store).toLocaleString()} {selected.unit}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Department & Personnel & Reference — all in one row */}
              <div className="gsis-grid-4">
                <div className="gsis-field">
                  <label className="gsis-label">Quantity Issued *</label>
                  <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 5" className="gsis-input gsis-input--num" />
                </div>
                <div className="gsis-field">
                  <label className="gsis-label">Issued To (Department) *</label>
                  <select value={form.department} onChange={e => set('department', e.target.value)} className="gsis-input">
                    <option value="">-- Select Destination --</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="gsis-field">
                  <label className="gsis-label">Requested By (Supervisor) *</label>
                  <input value={form.requested_by} onChange={e => set('requested_by', e.target.value)} placeholder="Name of requester" className="gsis-input" />
                </div>
                <div className="gsis-field">
                  <label className="gsis-label">Purpose / Job Reference</label>
                  <input value={form.job_reference} onChange={e => set('job_reference', e.target.value)} placeholder="Optional: Job#123" className="gsis-input" />
                </div>
              </div>

            </div>
          </div>

          {/* ── ACTION BAR ── */}
          <div className="gsis-actions">
            <div className="gsis-actions-notes">
              <div className="gsis-action-note"><span className="gsis-action-check">✓</span> Auto-deducts from stock balance</div>
              <div className="gsis-action-note"><span className="gsis-action-check">✓</span> Logs movement history with date/time</div>
            </div>
            <button onClick={submit} disabled={saving} className="gsis-submit">
              {saving ? 'Processing...' : <><Send size={18} /> Issue Material Now</>}
            </button>
          </div>

          {/* â•â• PAST REQUESTS (FLOW HISTORY) — CAR & AGRI RENTAL â•â• */}
          <div className="gsis-history-head">
            <div>
              <h2 className="gsis-history-title">Past Requests (Flow History)</h2>
              <div className="gsis-history-count">
                {allHistory.length} total record{allHistory.length !== 1 ? 's' : ''} across departments
              </div>
            </div>
            {/* Department Filter Buttons */}
            <div className="gsis-filters">
              {['All', 'Car Rental', 'AgriRent', 'Printing', 'Sales'].map(f => {
                const isActive = historyFilter === f;
                const col = f === 'Car Rental' ? '#0ea5e9' : f === 'AgriRent' ? G.olive : f === 'Printing' ? '#8b5cf6' : f === 'Sales' ? '#f59e0b' : G.darkGray;
                const Icon = f === 'Car Rental' ? Truck : f === 'AgriRent' ? Leaf : f === 'Printing' ? Printer : f === 'Sales' ? ShoppingBag : null;
                return (
                  <button key={f} onClick={() => setHistoryFilter(f)} className={`gsis-filter-btn${isActive ? ' gsis-filter-btn--active' : ''}`}>
                    {Icon && <Icon size={12} />}
                    {f}
                    <span className="gsis-filter-count">
                      {f === 'All' ? allHistory.length : f === 'Car Rental'
                        ? allHistory.filter(r => r.department === 'Car Rental').length
                        : f === 'AgriRent'
                        ? allHistory.filter(r => r.department === 'AgriRent').length
                        : f === 'Printing'
                        ? allHistory.filter(r => r.department === 'Printing').length
                        : allHistory.filter(r => r.department === 'Sales' || r.department === 'Retail' || r.department === 'Retail POS' || r.req_type === 'pos').length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="gsis-table-card">
            {filteredHistory.length === 0 ? (
              <div className="gsis-empty">
                <div className="gsis-empty-icon"><Package size={36} /></div>
                <div className="gsis-empty-title">No history records{historyFilter !== 'All' ? ` for ${historyFilter}` : ''}</div>
              </div>
            ) : (
              <div className="gsis-table-wrap">
                <table className="gsis-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Request #</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((r, i) => {
                      const isOpen = !!expandedRows[r.id];
                      const det = rowDetails[r.id];
                      const loadingDet = !!rowDetailLoading[r.id];
                      const dept = r.department || 'Unknown';
                      const isAgri = dept === 'AgriRent';
                      const isPrint = dept === 'Printing';
                      const isSales = dept === 'Sales' || dept === 'Retail POS';
                      const isCar = dept === 'Car Rental';
                      const DeptIcon = isAgri ? Leaf : isPrint ? Printer : isSales ? ShoppingBag : isCar ? Truck : Box;
                      const deptClass = isAgri ? 'gsis-badge--agri' : isPrint ? 'gsis-badge--print' : isSales ? 'gsis-badge--sales' : isCar ? 'gsis-badge--car' : 'gsis-badge--unknown';

                      return (
                        <React.Fragment key={`${r.req_type}-${r.id}`}>
                          <tr className={isOpen ? 'gsis-tr--open' : undefined}>
                            <td className="gsis-td--idx">{i + 1}</td>
                            <td className="gsis-td--code">{r.request_number}</td>
                            <td>
                              <span className={`gsis-badge ${deptClass}`}>
                                <DeptIcon size={11} />{dept}
                              </span>
                            </td>
                            <td className="gsis-td--dim">{new Date(r.created_at || r.date).toLocaleDateString('en-GB')}</td>
                            <td><span className="gsis-count-badge">{r.item_count || (r.items ? (typeof r.items === 'number' ? r.items : r.items.length) : '—')}</span></td>
                            <td><StatusBadge status={r.status} /></td>
                            <td>
                              <button onClick={() => toggleRowDetail(r.id, r.req_type)} className="gsis-view-btn">
                                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {isOpen ? 'View Less' : 'View More'}
                              </button>
                            </td>
                          </tr>
                          {isOpen && (
                            <tr>
                              <td colSpan={7} style={{ padding: 0 }}>
                                <div className="gsis-detail">
                                  <div className="gsis-detail-inner">
                                    {loadingDet ? (
                                      <div className="gsis-detail-loading"><SegmentedSpinner size={18} /> Loading...</div>
                                    ) : det ? (
                                      <>
                                        <div className="gsis-detail-grid">
                                          {[
                                            { label: 'Department', value: dept },
                                            { label: 'Requested By', value: det.requester_name || det.requested_by_name || det.customer_name || '—' },
                                            { label: r.req_type === 'pos' ? 'Sales Manager Sig.' : 'CEO Approved By', value: det.approver_name || det.digital_signature ? '✓ Signed' : '—' },
                                            { label: r.req_type === 'pos' ? 'Store Keeper Sig.' : 'Store Handler', value: det.store_handler_name || det.store_keeper_signature || '—' },
                                          ].map(f => (
                                            <div key={f.label} className="gsis-detail-item">
                                              <div className="gsis-detail-label">{f.label}</div>
                                              <div className="gsis-detail-value">{f.value}</div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="gsis-table-wrap">
                                          <table className="gsis-sub-table">
                                            <thead>
                                              <tr>
                                                {['#', 'Product', 'Qty Requested', 'Qty Released', 'Status'].map(h => (
                                                  <th key={h}>{h}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {(det.items || []).map((it, idx) => (
                                                <tr key={idx}>
                                                  <td>{idx + 1}</td>
                                                  <td style={{ fontWeight: 600 }}>{it.product_name || it.name}</td>
                                                  <td>{it.quantity_requested || it.qty}</td>
                                                  <td style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{it.quantity_shipped ?? '—'}</td>
                                                  <td>
                                                    {it.quantity_shipped ? <span className="gsis-ship-flag">✓ RELEASED</span> : <span className="gsis-ship-pending">—</span>}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="gsis-detail-error">Failed to load details.</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── WAITING REQUESTS MODAL ── */}
      {showWaitingModal && (
        <div
          className="gsis-modal-wrap"
          style={{ alignItems: 'flex-start' }}
          onClick={e => { if (e.target === e.currentTarget) setShowWaitingModal(false); }}
        >
          <div className="gsis-modal gsis-modal--wide">
            <div className="gsis-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24 }}><Shield size={18} /></span>
                <div>
                  <div className="gsis-modal-title">Waiting Requests Queue</div>
                  <div className="gsis-modal-sub">{requests.length + carRequests.length + posRequests.length} pending — click Prepare to auto-fill the form below</div>
                </div>
              </div>
              <button className="gsis-modal-close" onClick={() => setShowWaitingModal(false)} aria-label="Close">✕</button>
            </div>
            <div className="gsis-modal-body">
              {requests.length > 0 && (
                <div className="gsis-group">
                  <div className="gsis-group-head">
                    <span className="gsis-group-tag gsis-group-tag--print"><Package size={18} /> Printing / Office</span>
                    <span className="gsis-group-count">{requests.length} request(s)</span>
                  </div>
                  {requests.map(r => (
                    <div key={r.id} className="gsis-req-row gsis-req-row--print">
                      <div>
                        <div className="gsis-req-title">{r.material_name}</div>
                        <div className="gsis-req-meta">Ref: <strong>{r.request_code}</strong> | Dept: <strong>{r.department || 'Printing'}</strong> | Qty: <strong>{r.quantity_requested} {r.unit}</strong> | By: <strong>{r.created_by_name}</strong></div>
                      </div>
                      <div className="gsis-req-actions">
                        <button onClick={() => handlePrepareShip(r)} className="gsis-prep-btn">✓ Prepare Issue</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {carRequests.length > 0 && (
                <div className="gsis-group">
                  <div className="gsis-group-head">
                    <span className="gsis-group-tag gsis-group-tag--car"><Truck size={18} /> Car & Agri Rental</span>
                    <span className="gsis-group-count">{carRequests.length} request(s)</span>
                  </div>
                  {carRequests.map(r => (
                    <div key={r.id} className="gsis-req-row">
                      <div>
                        <div className="gsis-req-title">Ref: {r.request_code}</div>
                        <div className="gsis-req-meta">Dept: <strong>{r.department || 'Fleet Management'}</strong> | Items: <strong>{(r.items || []).length}</strong> | By: <strong>{r.created_by_name}</strong></div>
                      </div>
                      <div className="gsis-req-actions">
                        <button onClick={() => handlePrepareCar(r)} className="gsis-prep-btn">✓ Prepare Issue</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {posRequests.length > 0 && (
                <div className="gsis-group">
                  <div className="gsis-group-head">
                    <span className="gsis-group-tag gsis-group-tag--pos"><ShoppingCart size={18} /> POS Sales</span>
                    <span className="gsis-group-count">{posRequests.length} request(s) awaiting store release</span>
                  </div>
                  {posRequests.map(r => {
                    let cartItems = [];
                    try { cartItems = JSON.parse(r.cart_items || '[]'); } catch(e) {}
                    if (cartItems.length === 0 && r.product_name) cartItems = [{ name: r.product_name, qty: r.quantity_requested, price: 0 }];
                    const totalQty = cartItems.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
                    return (
                      <div key={r.id} className="gsis-req-row gsis-req-row--pos">
                        <div>
                          <div className="gsis-req-title">{r.customer_name || 'Walk-in Customer'}</div>
                          <div className="gsis-req-meta">Ref: <strong>{r.request_code}</strong> | Qty: <strong>{totalQty} items</strong> | By: <strong>{r.cashier_name || r.requested_by_name || '—'}</strong></div>
                        </div>
                        <div className="gsis-req-actions">
                          <button onClick={() => setPosRejectModal(r)} className="gsis-reject-btn">✕ Reject</button>
                          <button onClick={() => handlePreparePos(r)} className="gsis-prep-btn">✓ Prepare Issue</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {requests.length === 0 && carRequests.length === 0 && posRequests.length === 0 && (
                <div className="gsis-modal-empty">✓… No pending requests at this time.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Reject Reason Modal ── */}
      {posRejectModal && (
        <div className="gsis-modal-wrap">
          <div className="gsis-modal gsis-modal--sm" role="dialog" aria-modal="true">
            <div className="gsis-modal-head">
              <div>
                <div className="gsis-reject-title">Reject Request: {posRejectModal.request_code}</div>
                <div className="gsis-reject-sub">Customer: {posRejectModal.customer_name || 'Walk-in Customer'}</div>
              </div>
              <button className="gsis-modal-close" onClick={() => { setPosRejectModal(null); setPosRejectReason(''); }} aria-label="Close">✕</button>
            </div>
            <div className="gsis-modal-body" style={{ borderRadius: 0 }}>
              <div className="gsis-field">
                <label className="gsis-label">Reason for Rejection *</label>
                <textarea
                  autoFocus
                  value={posRejectReason}
                  onChange={e => setPosRejectReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={4}
                  className="gsis-textarea"
                />
              </div>
            </div>
            <div className="gsis-modal-foot">
              <button
                className="gsis-btn"
                onClick={() => { setPosRejectModal(null); setPosRejectReason(''); }}
              >Cancel</button>
              <button
                className="gsis-btn gsis-btn--danger"
                onClick={async () => {
                  if (!posRejectReason.trim()) return showToast('error', 'Please provide a rejection reason');
                  setPosActionLoading(prev => ({ ...prev, [posRejectModal.id]: true }));
                  try {
                    await api.patch(`/api/v1/store-sales-requests/${posRejectModal.id}/reject`, { rejection_reason: posRejectReason });
                    showToast('success', `Request ${posRejectModal.request_code} rejected.`);
                    setPosRejectModal(null);
                    setPosRejectReason('');
                    load();
                  } catch(e) {
                    showToast('error', e.response?.data?.message || 'Failed to reject');
                  }
                  setPosActionLoading(prev => ({ ...prev, [posRejectModal.id]: false }));
                }}
              >Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className={`gsis-toast gsis-toast--${toast.type}`}>
          <span className="gsis-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

const GSL_CSS = `
  .gsl-logs { box-sizing: border-box; width: 100%; min-height: 100%; background: var(--color-bg-page, #F5F6FA); color: var(--color-text-primary, #111827); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsl-logs *, .gsl-logs *::before, .gsl-logs *::after { box-sizing: border-box; }
  .gsl-logs button, .gsl-logs input, .gsl-logs select { font-family: inherit; }
  .gsl-content { display: flex; flex-direction: column; }

  /* ── Toast ── */
  @keyframes gslToastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .gsl-toast { position: fixed; right: 24px; bottom: 24px; z-index: 10000; max-width: 380px; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; border-left: 4px solid rgba(255,255,255,0.55); background: var(--color-text-primary, #111827); color: #fff; font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.18); animation: gslToastIn 200ms ease; }
  .gsl-toast--success { background: var(--color-success, #16A34A); }
  .gsl-toast--error { background: var(--color-danger, #DC2626); }
  .gsl-toast-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.24); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* ── Header ── */
  .gsl-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0 0 24px 0; }
  .gsl-header-left { display: flex; align-items: center; gap: 14px; }
  .gsl-header-icon { flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #EFF6FF; font-size: 22px; }
  .gsl-title { margin: 0; font-size: 26px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: var(--color-text-primary, #111827); }
  .gsl-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsl-refresh { height: 40px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 8px; background: var(--color-primary, #2563EB); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 150ms ease-in-out, box-shadow 150ms ease-in-out, transform 150ms ease-in-out; }
  .gsl-refresh:hover:not(:disabled) { background: #EAB308; color: #78350F; box-shadow: 0 4px 12px rgba(234,179,8,0.3); transform: translateY(-1px); }
  .gsl-refresh:disabled { opacity: 0.55; cursor: not-allowed; }
  .gsl-refresh:focus-visible { outline: 3px solid rgba(234,179,8,0.45); outline-offset: 2px; }

  /* ── Filters ── */
  .gsl-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; padding: 16px; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 20px; }
  .gsl-filter { display: flex; flex-direction: column; gap: 6px; }
  .gsl-label { font-size: 12px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
  .gsl-select { width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--color-border, #E5E7EB); border-radius: 8px; background: #fff; color: var(--color-text-primary, #111827); font-size: 14px; cursor: pointer; transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out; }
  .gsl-select:focus { outline: none; border-color: #EAB308; box-shadow: 0 0 0 3px rgba(234,179,8,0.18); }

  /* ── Loading / empty ── */
  .gsl-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 64px 0; color: var(--color-text-secondary, #6B7280); font-size: 14px; }
  .gsl-empty-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 48px 16px; text-align: center; }
  .gsl-empty-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--color-info-bg, #E0F2FE); color: var(--color-info, #0284C7); font-size: 22px; }
  .gsl-empty-title { font-size: 14px; font-weight: 600; color: var(--color-text-secondary, #6B7280); }

  /* ── Table (div grid) ── */
  .gsl-table-card { overflow: hidden; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .gsl-table-wrap { overflow-x: auto; }
  .gsl-grid { display: grid; grid-template-columns: 1.1fr 0.85fr 1fr 1.1fr 1.1fr 1fr 1fr 0.7fr 1fr 1fr 1.4fr; min-width: 1180px; width: 100%; align-items: center; }
  .gsl-grid--head { background: #F9FAFB; border-bottom: 1px solid var(--color-border, #E5E7EB); }
  .gsl-cell { padding: 13px 12px; font-size: 13px; color: var(--color-text-primary, #111827); display: flex; align-items: center; min-width: 0; overflow: hidden; white-space: nowrap; }
  .gsl-cell--head { padding: 12px 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); }
  .gsl-cell--head-num { justify-content: flex-end; text-align: right; }
  .gsl-row { border-bottom: 1px solid #F3F4F6; transition: background 150ms ease-in-out; }
  .gsl-row:hover { background: #FEFCE8; }
  .gsl-row:last-child { border-bottom: none; }
  .gsl-cell--date { color: var(--color-text-secondary, #6B7280); font-size: 12px; font-variant-numeric: tabular-nums; }
  .gsl-cell--code { font-weight: 600; font-variant-numeric: tabular-nums; }
  .gsl-cell--action { font-weight: 600; color: var(--color-primary, #2563EB); }
  .gsl-cell--dim { color: var(--color-text-secondary, #6B7280); }
  .gsl-cell--qty { justify-content: flex-end; font-weight: 700; font-variant-numeric: tabular-nums; }
  .gsl-cell--by { color: var(--color-text-secondary, #6B7280); }
  .gsl-cell--notes { color: var(--color-text-secondary, #6B7280); text-overflow: ellipsis; }

  /* ── Badges ── */
  .gsl-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsl-badge--material { background: var(--color-info-bg, #E0F2FE); color: var(--color-info, #0284C7); }
  .gsl-badge--machine { background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); }
  .gsl-badge--default { background: #F3F4F6; color: var(--color-text-secondary, #6B7280); }
  .gsl-dept-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsl-dept-badge--printing { background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); }
  .gsl-dept-badge--car { background: var(--color-info-bg, #E0F2FE); color: var(--color-info, #0284C7); }
  .gsl-dept-badge--agri { background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); }
  .gsl-dept-badge--sales { background: #F3E8FF; color: #7E22CE; }
  .gsl-dept-badge--retail { background: #FCE7F3; color: #DB2777; }
  .gsl-dept-badge--it { background: #EFF6FF; color: #2563EB; }
  .gsl-dept-badge--maintenance { background: var(--color-danger-bg, #FEE2E2); color: var(--color-danger, #DC2626); }
  .gsl-dept-badge--default { background: #F3F4F6; color: var(--color-text-secondary, #6B7280); }
  .gsl-approved { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 9999px; background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsl-pending { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 9999px; background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); font-size: 11px; font-weight: 500; white-space: nowrap; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .gsl-title { font-size: 22px; }
    .gsl-header-icon { width: 40px; height: 40px; }
  }
  @media (max-width: 480px) {
    .gsl-refresh { height: 44px; }
    .gsl-select { height: 44px; }
  }
`;

/* ─── 5. MOVEMENT LOGS ──────────────────────────────────────────────────── */
export const GSLogs = () => {
  const [logs, setLogs]       = useState([]);
  const [dept, setDept]       = useState('');
  const [type, setType]       = useState('');
  const [action, setAction]   = useState('');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dept) params.department = dept;
      if (type) params.item_type = type;
      if (action) params.action_type = action;
      const r = await api.get('/api/v1/printing-assets/log', { params });
      const raw = r?.data?.data !== undefined ? r.data.data : (Array.isArray(r?.data) ? r.data : []);
      setLogs(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to load movement logs:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch movement logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [dept, type, action]);

  useEffect(() => { load(); }, [load]);

  const deptClass = { Printing: 'gsl-dept-badge--printing', 'Car Rental': 'gsl-dept-badge--car', AgriRent: 'gsl-dept-badge--agri', Sales: 'gsl-dept-badge--sales', Retail: 'gsl-dept-badge--retail', 'Retail POS': 'gsl-dept-badge--retail', IT: 'gsl-dept-badge--it', Maintenance: 'gsl-dept-badge--maintenance' };

  const actionStyles = {
    'Issue to Department': { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    'Move to Production':  { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    'Register':            { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
    'Receive':             { bg: '#CCFBF1', color: '#0F766E', border: '#99F6E4' },
    'Return to Store':     { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
    'Value Update':        { bg: '#F3E8FF', color: '#6B21A8', border: '#E9D5FF' },
    'Consume':             { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' },
  };

  const availableActions = Array.from(new Set([
    'Issue to Department',
    'Move to Production',
    'Register',
    'Receive',
    'Return to Store',
    'Consume',
    'Value Update',
    ...logs.map(l => l.action_type).filter(Boolean)
  ]));

  const filteredLogs = logs.filter(l => {
    if (action && l.action_type !== action) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchId = (l.item_id || '').toLowerCase().includes(q);
      const matchNotes = (l.notes || '').toLowerCase().includes(q);
      const matchBy = (l.moved_by || '').toLowerCase().includes(q);
      const matchAction = (l.action_type || '').toLowerCase().includes(q);
      const matchDept = (l.department || '').toLowerCase().includes(q);
      const matchFrom = (l.from_location || '').toLowerCase().includes(q);
      const matchTo = (l.to_location || '').toLowerCase().includes(q);
      if (!matchId && !matchNotes && !matchBy && !matchAction && !matchDept && !matchFrom && !matchTo) return false;
    }
    return true;
  });

  return (
    <div className="gsl-logs">
      <style>{GSL_CSS}</style>

      <div className="gsl-content">
        {/* ── HEADER ── */}
        <div className="gsl-header">
          <div className="gsl-header-left">
            <span className="gsl-header-icon"><ClipboardList size={18} /></span>
            <div>
              <h1 className="gsl-title">Movement Logs</h1>
              <p className="gsl-subtitle">Complete audit trail across all departments ({filteredLogs.length} records)</p>
            </div>
          </div>
          <button className="gsl-refresh" onClick={load} disabled={loading}>
            {loading && <SegmentedSpinner size={16} color="#fff" />}
            <span>Refresh</span>
          </button>
        </div>

        {/* ── FILTERS ── */}
        <div className="gsl-filters">
          <div className="gsl-filter">
            <label className="gsl-label">Department</label>
            <select className="gsl-select" value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="gsl-filter">
            <label className="gsl-label">Item Type</label>
            <select className="gsl-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="">All Types</option>
              <option>Material</option>
              <option>Machine</option>
            </select>
          </div>
          <div className="gsl-filter">
            <label className="gsl-label">Action</label>
            <select className="gsl-select" value={action} onChange={e => setAction(e.target.value)}>
              <option value="">All Actions</option>
              {availableActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="gsl-filter">
            <label className="gsl-label">Search</label>
            <input
              type="text"
              className="gsl-select"
              style={{ cursor: 'text' }}
              placeholder="Filter by item, person, note..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── GRID TABLE ── */}
        {loading ? (
          <div className="gsl-loading">
            <SegmentedSpinner size={28} color="#2563EB" />
            <span>Loading movement logs...</span>
          </div>
        ) : (
          <div className="gsl-table-card">
            <div className="gsl-table-wrap">
              {/* Header Row */}
              <div className="gsl-grid gsl-grid--head">
                {['Date', 'Type', 'Item ID', 'Action', 'Dept', 'From', 'To', 'Qty', 'By', 'Approved', 'Notes'].map((h, i) => (
                  <div key={h} className={`gsl-cell gsl-cell--head${i === 7 ? ' gsl-cell--head-num' : ''}`}>{h}</div>
                ))}
              </div>

              {/* Data Rows */}
              {filteredLogs.length === 0 ? (
                <div className="gsl-empty-card">
                  <div className="gsl-empty-icon"><Search size={18} /></div>
                  <div className="gsl-empty-title">{error ? `Error: ${error}` : 'No movement records found for this filter.'}</div>
                </div>
              ) : filteredLogs.map(l => {
                const actStyle = actionStyles[l.action_type] || { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' };
                return (
                  <div key={l.id} className="gsl-grid gsl-row">
                    <div className="gsl-cell gsl-cell--date">{new Date(l.date_time).toLocaleString()}</div>
                    <div className="gsl-cell"><span className={`gsl-badge gsl-badge--${(l.item_type || '').toLowerCase() || 'default'}`}>{l.item_type}</span></div>
                    <div className="gsl-cell gsl-cell--code">{l.item_id}</div>
                    <div className="gsl-cell">
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: actStyle.bg,
                        color: actStyle.color,
                        border: `1px solid ${actStyle.border}`
                      }}>
                        {l.action_type}
                      </span>
                    </div>
                    <div className="gsl-cell"><span className={`gsl-dept-badge ${deptClass[l.department] || 'gsl-dept-badge--default'}`}>{l.department || '—'}</span></div>
                    <div className="gsl-cell gsl-cell--dim">{l.from_location}</div>
                    <div className="gsl-cell gsl-cell--dim">{l.to_location}</div>
                    <div className="gsl-cell gsl-cell--qty">{l.quantity > 0 ? parseFloat(l.quantity).toLocaleString() : '—'}</div>
                    <div className="gsl-cell gsl-cell--by">{l.moved_by || '—'}</div>
                    <div className="gsl-cell">{l.approved_by ? <span className="gsl-approved">✓ {l.approved_by}</span> : <span className="gsl-pending">Pending</span>}</div>
                    <div className="gsl-cell gsl-cell--notes" title={l.notes}>{l.notes?.replace(' | PENDING_APPROVAL', '').replace(' | APPROVED', '') || '—'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── 6. VALUATION ──────────────────────────────────────────────────────── */
const GSV_CSS = `
  .gsv-valuation { font-family:'Inter','Segoe UI',Roboto,-apple-system,sans-serif; color:var(--color-text-primary,#111827); padding-bottom:40px; }
  .gsv-content { display:flex; flex-direction:column; gap:20px; }

  /* Header */
  .gsv-header { display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
  .gsv-header-left { display:flex; align-items:center; gap:14px; }
  .gsv-header-icon { width:46px; height:46px; border-radius:12px; background:#EFF6FF; color:#2563EB; border:1px solid #BFDBFE; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,.06); }
  .gsv-title { margin:0; font-size:24px; font-weight:700; line-height:1.3; letter-spacing:-0.02em; color:#111827; }
  .gsv-subtitle { margin:4px 0 0; font-size:13px; color:#6B7280; line-height:1.5; }
  .gsv-header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .gsv-btn-action { height:38px; padding:0 14px; border-radius:8px; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:7px; cursor:pointer; transition:all 150ms ease; }
  .gsv-btn-outline { background:#fff; border:1px solid #D1D5DB; color:#374151; }
  .gsv-btn-outline:hover { background:#F9FAFB; border-color:#9CA3AF; color:#111827; }
  .gsv-btn-primary { background:#2563EB; border:1px solid #2563EB; color:#fff; }
  .gsv-btn-primary:hover { background:#1D4ED8; border-color:#1D4ED8; }

  /* KPIs */
  .gsv-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
  .gsv-kpi-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,.05); border-top:3px solid #2563EB; }
  .gsv-kpi-card--green { border-top-color:#16A34A; }
  .gsv-kpi-card--amber { border-top-color:#D97706; }
  .gsv-kpi-card--purple { border-top-color:#7C3AED; }
  .gsv-kpi-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#6B7280; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; }
  .gsv-kpi-val { font-size:24px; font-weight:700; color:#111827; font-variant-numeric:tabular-nums; line-height:1.2; }
  .gsv-kpi-val small { font-size:13px; font-weight:500; color:#6B7280; margin-right:4px; }
  .gsv-kpi-sub { margin-top:6px; font-size:12px; color:#6B7280; }

  /* Toolbar */
  .gsv-toolbar { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)) auto; gap:12px; align-items:flex-end; background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
  .gsv-group { display:flex; flex-direction:column; gap:5px; }
  .gsv-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#6B7280; }
  .gsv-input { height:38px; padding:0 12px; border-radius:8px; border:1px solid #D1D5DB; background:#fff; color:#111827; font-size:13px; font-weight:500; outline:none; transition:all 150ms ease; }
  .gsv-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.12); }
  .gsv-refresh-btn { height:38px; padding:0 16px; border-radius:8px; border:none; background:#2563EB; color:#fff; font-size:13px; font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition:all 150ms ease; }
  .gsv-refresh-btn:hover:not(:disabled) { background:#1D4ED8; }
  .gsv-refresh-btn:disabled { opacity:.6; cursor:not-allowed; }

  /* Distribution Cards */
  .gsv-dist-title { font-size:15px; font-weight:700; color:#111827; display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .gsv-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }
  .gsv-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:16px 18px; box-shadow:0 1px 3px rgba(0,0,0,.04); cursor:pointer; transition:all 150ms ease; position:relative; overflow:hidden; }
  .gsv-card:hover { border-color:#93C5FD; transform:translateY(-1px); box-shadow:0 4px 10px rgba(0,0,0,.06); }
  .gsv-card--active { border-color:#2563EB; background:#F8FAFC; box-shadow:0 0 0 2px rgba(37,99,235,.2); }
  .gsv-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .gsv-card-count { font-size:11px; font-weight:600; color:#6B7280; background:#F3F4F6; border-radius:999px; padding:3px 8px; }
  .gsv-card-value { font-size:20px; font-weight:700; color:#111827; font-variant-numeric:tabular-nums; }
  .gsv-card-bar-bg { height:5px; background:#F3F4F6; border-radius:999px; overflow:hidden; margin-top:10px; }
  .gsv-card-bar-fill { height:100%; background:#2563EB; border-radius:999px; transition:width 300ms ease; }
  .gsv-card-footer { display:flex; justify-content:space-between; margin-top:6px; font-size:11px; color:#6B7280; font-weight:500; }

  /* Table Card */
  .gsv-table-card { background:#fff; border:1px solid #E5E7EB; border-radius:10px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.05); }
  .gsv-table-head-bar { padding:14px 18px; border-bottom:1px solid #E5E7EB; display:flex; justify-content:space-between; align-items:center; background:#FAFAFA; }
  .gsv-table-title { font-size:14px; font-weight:700; color:#111827; }
  .gsv-table-count { font-size:12px; font-weight:500; color:#6B7280; }
  .gsv-table-wrap { overflow-x:auto; width:100%; }
  .gsv-table { width:100%; border-collapse:collapse; font-size:13px; text-align:left; min-width:860px; }
  .gsv-table th { padding:12px 16px; background:#F9FAFB; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#6B7280; border-bottom:1px solid #E5E7EB; white-space:nowrap; }
  .gsv-table td { padding:12px 16px; border-bottom:1px solid #F3F4F6; vertical-align:middle; color:#1F2937; }
  .gsv-table tbody tr { transition:background 100ms ease; }
  .gsv-table tbody tr:hover { background:#F8FAFC; }
  .gsv-th-num, .gsv-td-num { text-align:right !important; font-variant-numeric:tabular-nums; }
  .gsv-code { font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-weight:700; color:#2563EB; font-size:12px; }
  .gsv-name { font-weight:600; color:#111827; }
  .gsv-val-bold { font-weight:700; color:#15803D; font-variant-numeric:tabular-nums; }
  .gsv-badge-type { display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; background:#E0F2FE; color:#0284C7; }
  .gsv-badge-machine { background:#FEF3C7; color:#B45309; }
  .gsv-status-pill { display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; }
  .gsv-status-pill--ok { background:#DCFCE7; color:#15803D; }
  .gsv-status-pill--low { background:#FEE2E2; color:#B91C1C; }

  /* Footer Row */
  .gsv-table-footer { background:#F8FAFC; font-weight:700; border-top:2px solid #E2E8F0; }
  .gsv-table-footer td { padding:14px 16px; color:#111827; font-size:13px; }

  /* Empty & Loading */
  .gsv-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:60px 20px; color:#6B7280; font-size:14px; }
  .gsv-empty { text-align:center; padding:48px 20px; color:#6B7280; display:flex; flex-direction:column; align-items:center; gap:10px; }
  .gsv-empty-icon { width:44px; height:44px; border-radius:50%; background:#EFF6FF; color:#2563EB; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
  .gsv-empty-title { font-size:15px; font-weight:600; color:#111827; }
  .gsv-empty-sub { font-size:13px; color:#6B7280; max-width:320px; }

  /* Error */
  .gsv-error-banner { background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; color:#991B1B; font-size:13px; }

  @media print {
    .gsv-header-actions, .gsv-toolbar, .gsv-refresh-btn { display:none !important; }
    .gsv-valuation { padding:0 !important; }
    .gsv-table-card { border:1px solid #ccc !important; box-shadow:none !important; }
  }
`;

export const GSValuation = () => {
  const [materials, setMaterials] = useState([]);
  const [machines, setMachines]   = useState([]);
  const [dept, setDept]           = useState('');
  const [category, setCategory]   = useState('');
  const [itemType, setItemType]   = useState('All');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const matParams = {};
      const macParams = {};
      if (dept) {
        matParams.department = dept;
        macParams.department = dept;
      }
      const [rMats, rMacs] = await Promise.allSettled([
        api.get('/api/v1/printing-assets/store/materials', { params: matParams }),
        api.get('/api/v1/printing-assets/store/machines', { params: macParams }),
      ]);

      if (rMats.status === 'fulfilled') {
        const d = rMats.value?.data?.data !== undefined ? rMats.value.data.data : (Array.isArray(rMats.value?.data) ? rMats.value.data : []);
        setMaterials(Array.isArray(d) ? d : []);
      } else {
        console.error('Materials load failed:', rMats.reason);
      }

      if (rMacs.status === 'fulfilled') {
        const d = rMacs.value?.data?.data !== undefined ? rMacs.value.data.data : (Array.isArray(rMacs.value?.data) ? rMacs.value.data : []);
        setMachines(Array.isArray(d) ? d : []);
      }

      if (rMats.status === 'rejected' && rMacs.status === 'rejected') {
        throw new Error(rMats.reason?.response?.data?.message || rMats.reason?.message || 'Failed to load valuation data');
      }
    } catch (err) {
      console.error('Valuation load error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to connect to valuation service');
    } finally {
      setLoading(false);
    }
  }, [dept]);

  useEffect(() => { load(); }, [load]);

  // Normalize all items into a unified valuation list
  const unifiedItems = [
    ...materials.map(m => {
      const qty = parseFloat(m.quantity_in_store) || 0;
      const unitVal = parseFloat(m.unit_value) || 0;
      const totalVal = parseFloat(m.total_value) || (qty * unitVal);
      const reorder = parseFloat(m.reorder_level) || 0;
      return {
        id: `mat-${m.id}`,
        rawId: m.id,
        code: m.material_id || `MAT-${m.id}`,
        name: m.material_name || 'Unnamed Material',
        type: 'Material',
        category: m.category || 'Consumable',
        department: m.department || 'Printing',
        quantity: qty,
        unit: m.unit || 'unit',
        unitValue: unitVal,
        totalValue: totalVal,
        reorderLevel: reorder,
        isLow: qty <= reorder,
      };
    }),
    ...machines.map(mc => {
      const val = parseFloat(mc.internal_value) || 0;
      return {
        id: `mac-${mc.id}`,
        rawId: mc.id,
        code: mc.machine_id || `MAC-${mc.id}`,
        name: mc.machine_name || 'Unnamed Machine',
        type: 'Machine',
        category: 'Equipment',
        department: mc.department || 'Printing',
        quantity: 1,
        unit: 'unit',
        unitValue: val,
        totalValue: val,
        reorderLevel: 0,
        isLow: false,
        status: mc.status || 'In Store',
      };
    })
  ];

  // Dynamic filter options
  const allDepartments = Array.from(new Set([
    ...DEPARTMENTS,
    ...unifiedItems.map(i => i.department).filter(Boolean)
  ])).sort();

  const allCategories = Array.from(new Set(
    unifiedItems.map(i => i.category).filter(Boolean)
  )).sort();

  // Filter items
  const filteredItems = unifiedItems.filter(item => {
    if (dept && item.department.toLowerCase() !== dept.toLowerCase()) return false;
    if (category && item.category.toLowerCase() !== category.toLowerCase()) return false;
    if (itemType !== 'All' && item.type !== itemType) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchCode = (item.code || '').toLowerCase().includes(q);
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchCat  = (item.category || '').toLowerCase().includes(q);
      const matchDept = (item.department || '').toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchCat && !matchDept) return false;
    }
    return true;
  });

  // KPI Calculations
  const grandTotal = unifiedItems.reduce((s, i) => s + i.totalValue, 0);
  const materialsVal = unifiedItems.filter(i => i.type === 'Material').reduce((s, i) => s + i.totalValue, 0);
  const machinesVal = unifiedItems.filter(i => i.type === 'Machine').reduce((s, i) => s + i.totalValue, 0);
  const totalStockUnits = unifiedItems.filter(i => i.type === 'Material').reduce((s, i) => s + i.quantity, 0);

  // Grouped by department for summary cards
  const deptSummary = allDepartments.map(d => {
    const inDept = unifiedItems.filter(i => i.department.toLowerCase() === d.toLowerCase());
    const val = inDept.reduce((s, i) => s + i.totalValue, 0);
    const count = inDept.length;
    const units = inDept.reduce((s, i) => s + i.quantity, 0);
    const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
    return { department: d, totalValue: val, count, units, pct };
  }).filter(d => d.count > 0).sort((a, b) => b.totalValue - a.totalValue);

  // Filtered totals
  const filteredTotalValue = filteredItems.reduce((s, i) => s + i.totalValue, 0);
  const filteredTotalQty   = filteredItems.reduce((s, i) => s + i.quantity, 0);

  // CSV Export handler
  const exportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = ['Item Code', 'Item Name', 'Type', 'Category', 'Department', 'Quantity', 'Unit', 'Unit Value (ETB)', 'Total Value (ETB)'];
    const rows = filteredItems.map(i => [
      `"${i.code}"`,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.type}"`,
      `"${i.category}"`,
      `"${i.department}"`,
      i.quantity,
      `"${i.unit}"`,
      i.unitValue.toFixed(2),
      i.totalValue.toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setDept('');
    setCategory('');
    setItemType('All');
    setSearch('');
  };

  return (
    <div className="gsv-valuation">
      <style>{GSV_CSS}</style>

      <div className="gsv-content">
        {/* ── HEADER ── */}
        <div className="gsv-header">
          <div className="gsv-header-left">
            <div className="gsv-header-icon"><DollarSign size={24} /></div>
            <div>
              <h1 className="gsv-title">Inventory Valuation</h1>
              <p className="gsv-subtitle">Real-time stock asset ledger, unit costs, and department valuation breakdown</p>
            </div>
          </div>
          <div className="gsv-header-actions">
            <button className="gsv-btn-action gsv-btn-outline" onClick={() => window.print()}>
              <Printer size={15} /> Print Valuation
            </button>
            <button className="gsv-btn-action gsv-btn-primary" onClick={exportCSV} disabled={filteredItems.length === 0}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div className="gsv-error-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={18} />
              <span><strong>Connection Error:</strong> {error}</span>
            </div>
            <button className="gsv-btn-action gsv-btn-outline" style={{ height: 32, fontSize: 12 }} onClick={load}>
              Retry
            </button>
          </div>
        )}

        {/* ── TOP KPI CARDS ── */}
        <div className="gsv-kpis">
          <div className="gsv-kpi-card gsv-kpi-card--green">
            <div className="gsv-kpi-label">
              <span>Grand Total Valuation</span>
              <DollarSign size={16} color="#16A34A" />
            </div>
            <div className="gsv-kpi-val">
              <small>ETB</small>
              {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="gsv-kpi-sub">{unifiedItems.length} total catalogued assets</div>
          </div>

          <div className="gsv-kpi-card">
            <div className="gsv-kpi-label">
              <span>Consumables Stock</span>
              <Package size={16} color="#2563EB" />
            </div>
            <div className="gsv-kpi-val">
              <small>ETB</small>
              {materialsVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="gsv-kpi-sub">{materials.length} material lines in store</div>
          </div>

          <div className="gsv-kpi-card gsv-kpi-card--amber">
            <div className="gsv-kpi-label">
              <span>Machinery &amp; Equipment</span>
              <Factory size={16} color="#D97706" />
            </div>
            <div className="gsv-kpi-val">
              <small>ETB</small>
              {machinesVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="gsv-kpi-sub">{machines.length} machine units in store</div>
          </div>

          <div className="gsv-kpi-card gsv-kpi-card--purple">
            <div className="gsv-kpi-label">
              <span>Physical Units On Hand</span>
              <ClipboardList size={16} color="#7C3AED" />
            </div>
            <div className="gsv-kpi-val">
              {totalStockUnits.toLocaleString()} <small style={{ fontSize: 14 }}>units</small>
            </div>
            <div className="gsv-kpi-sub">Across all consumable categories</div>
          </div>
        </div>

        {/* ── TOOLBAR / FILTERS ── */}
        <div className="gsv-toolbar">
          <div className="gsv-group">
            <label className="gsv-label">Department</label>
            <select className="gsv-input" value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">All Departments</option>
              {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="gsv-group">
            <label className="gsv-label">Category</label>
            <select className="gsv-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="gsv-group">
            <label className="gsv-label">Asset Type</label>
            <select className="gsv-input" value={itemType} onChange={e => setItemType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Material">Materials / Consumables</option>
              <option value="Machine">Machines / Equipment</option>
            </select>
          </div>

          <div className="gsv-group" style={{ minWidth: 200 }}>
            <label className="gsv-label">Search</label>
            <input
              type="text"
              className="gsv-input"
              placeholder="Search code, name, category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="gsv-refresh-btn" onClick={load} disabled={loading}>
            {loading ? <SegmentedSpinner size={16} color="#fff" /> : <RefreshCw size={15} />}
            <span>Refresh</span>
          </button>
        </div>

        {/* ── DEPARTMENT DISTRIBUTION BREAKDOWN ── */}
        {deptSummary.length > 0 && !dept && (
          <div>
            <div className="gsv-dist-title">
              <span>Department Valuation Distribution</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Click a department to filter</span>
            </div>
            <div className="gsv-cards">
              {deptSummary.map(d => (
                <div
                  key={d.department}
                  className={`gsv-card ${dept === d.department ? 'gsv-card--active' : ''}`}
                  onClick={() => setDept(dept === d.department ? '' : d.department)}
                  title={`Filter by ${d.department}`}
                >
                  <div className="gsv-card-top">
                    <DeptBadge dept={d.department} />
                    <span className="gsv-card-count">{d.count} item{d.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="gsv-card-value">
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', marginRight: 4 }}>ETB</span>
                    {d.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="gsv-card-bar-bg">
                    <div className="gsv-card-bar-fill" style={{ width: `${Math.max(5, d.pct)}%` }} />
                  </div>
                  <div className="gsv-card-footer">
                    <span>{d.units.toLocaleString()} units</span>
                    <span>{d.pct.toFixed(1)}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DETAILED INVENTORY VALUATION TABLE ── */}
        <div className="gsv-table-card">
          <div className="gsv-table-head-bar">
            <div>
              <span className="gsv-table-title">Detailed Stock Valuation Ledger</span>
              <span className="gsv-table-count" style={{ marginLeft: 10 }}>({filteredItems.length} lines)</span>
            </div>
            {(dept || category || itemType !== 'All' || search) && (
              <button
                className="gsv-btn-action gsv-btn-outline"
                style={{ height: 28, fontSize: 12, padding: '0 10px' }}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="gsv-loading">
              <SegmentedSpinner size={28} color="#2563EB" />
              <span>Calculating stock valuation ledger...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="gsv-empty">
              <div className="gsv-empty-icon"><Search size={22} /></div>
              <div className="gsv-empty-title">No inventory items found</div>
              <div className="gsv-empty-sub">
                No stock records match the current filters. Try resetting the department or search query.
              </div>
              <button
                className="gsv-btn-action gsv-btn-primary"
                style={{ marginTop: 8 }}
                onClick={clearFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="gsv-table-wrap">
              <table className="gsv-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Description</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Department</th>
                    <th className="gsv-th-num">Qty in Store</th>
                    <th className="gsv-th-num">Unit Value (ETB)</th>
                    <th className="gsv-th-num">Total Value (ETB)</th>
                    <th>Stock Health</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td><span className="gsv-code">{item.code}</span></td>
                      <td><span className="gsv-name">{item.name}</span></td>
                      <td>
                        <span className={`gsv-badge-type ${item.type === 'Machine' ? 'gsv-badge-machine' : ''}`}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ color: '#4B5563' }}>{item.category}</td>
                      <td><DeptBadge dept={item.department} /></td>
                      <td className="gsv-td-num">
                        <strong>{item.quantity.toLocaleString()}</strong>
                        <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }}>{item.unit}</span>
                      </td>
                      <td className="gsv-td-num">
                        ETB {item.unitValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="gsv-td-num">
                        <span className="gsv-val-bold">
                          ETB {item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        {item.type === 'Machine' ? (
                          <span className="gsv-status-pill gsv-status-pill--ok">{item.status}</span>
                        ) : item.isLow ? (
                          <span className="gsv-status-pill gsv-status-pill--low">Low Stock</span>
                        ) : (
                          <span className="gsv-status-pill gsv-status-pill--ok">Adequate</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="gsv-table-footer">
                    <td colSpan={5}>
                      Filtered Total ({filteredItems.length} lines)
                    </td>
                    <td className="gsv-td-num">
                      {filteredTotalQty.toLocaleString()} units
                    </td>
                    <td className="gsv-td-num" style={{ color: '#6B7280' }}>
                      —
                    </td>
                    <td className="gsv-td-num" style={{ color: '#15803D', fontSize: 15 }}>
                      ETB {filteredTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GSA_CSS = `
  .gsa-alerts { box-sizing: border-box; width: 100%; min-height: 100%; background: var(--color-bg-page, #F5F6FA); color: var(--color-text-primary, #111827); font-family: 'Inter','Segoe UI',system-ui,-apple-system,'Roboto',sans-serif; }
  .gsa-alerts *, .gsa-alerts *::before, .gsa-alerts *::after { box-sizing: border-box; }
  .gsa-alerts button, .gsa-alerts input, .gsa-alerts select { font-family: inherit; }
  .gsa-content { display: flex; flex-direction: column; }

  /* ── Toast ── */
  @keyframes gsaToastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .gsa-toast { position: fixed; right: 24px; bottom: 24px; z-index: 10000; max-width: 380px; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; border-left: 4px solid rgba(255,255,255,0.55); background: var(--color-text-primary, #111827); color: #fff; font-size: 13px; font-weight: 500; box-shadow: 0 8px 24px rgba(0,0,0,0.18); animation: gsaToastIn 200ms ease; }
  .gsa-toast--success { background: var(--color-success, #16A34A); }
  .gsa-toast--error { background: var(--color-danger, #DC2626); }
  .gsa-toast-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.24); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }

  /* ── Header ── */
  .gsa-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0 0 24px 0; }
  .gsa-header-left { display: flex; align-items: center; gap: 14px; }
  .gsa-header-icon { flex-shrink: 0; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: var(--color-warning-bg, #FEF3C7); font-size: 22px; }
  .gsa-title { margin: 0; font-size: 26px; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: var(--color-text-primary, #111827); }
  .gsa-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-secondary, #6B7280); }
  .gsa-count-pill { height: 40px; padding: 0 16px; display: inline-flex; align-items: center; gap: 8px; border-radius: 9999px; background: var(--color-danger-bg, #FEE2E2); color: var(--color-danger, #DC2626); font-size: 14px; font-weight: 500; }
  .gsa-count-pill strong { font-size: 18px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .gsa-count-pill--ok { background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); }

  /* ── Status banner ── */
  .gsa-status { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 20px; }
  .gsa-status-icon { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: #EFF6FF; font-size: 16px; }
  .gsa-status-title { font-size: 13px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsa-status-sub { margin-top: 2px; font-size: 12px; color: var(--color-text-secondary, #6B7280); }

  /* ── Loading / empty ── */
  .gsa-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 64px 0; color: var(--color-text-secondary, #6B7280); font-size: 14px; }
  .gsa-empty-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 56px 16px; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .gsa-empty-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); font-size: 22px; }
  .gsa-empty-title { font-size: 15px; font-weight: 600; color: var(--color-text-primary, #111827); }
  .gsa-empty-sub { font-size: 13px; color: var(--color-text-secondary, #6B7280); }

  /* ── Table (div grid) ── */
  .gsa-table-card { overflow: hidden; background: var(--color-bg-card, #fff); border: 1px solid var(--color-border, #E5E7EB); border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .gsa-table-wrap { overflow-x: auto; }
  .gsa-grid { display: grid; grid-template-columns: 96px 1.8fr 1.2fr 1.2fr 92px 84px; min-width: 720px; width: 100%; align-items: center; }
  .gsa-grid--head { background: #F9FAFB; border-bottom: 1px solid var(--color-border, #E5E7EB); }
  .gsa-cell { padding: 13px 14px; font-size: 13px; color: var(--color-text-primary, #111827); display: flex; align-items: center; min-width: 0; overflow: hidden; }
  .gsa-cell--head { padding: 12px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-secondary, #6B7280); white-space: nowrap; }
  .gsa-cell--head-num { justify-content: flex-end; text-align: right; }
  .gsa-row { border-bottom: 1px solid #F3F4F6; transition: background 150ms ease-in-out; }
  .gsa-row:hover { background: #FEFCE8; }
  .gsa-row:last-child { border-bottom: none; }
  .gsa-cell--id { color: var(--color-text-muted, #9CA3AF); font-variant-numeric: tabular-nums; font-size: 12px; }
  .gsa-cell--name { font-weight: 600; }
  .gsa-cell--cat { color: var(--color-text-secondary, #6B7280); }
  .gsa-cell--qty { justify-content: flex-end; font-weight: 700; color: var(--color-danger, #DC2626); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .gsa-cell--unit { color: var(--color-text-secondary, #6B7280); }

  /* ── Department badges ── */
  .gsa-dept-badge { display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
  .gsa-dept-badge--printing { background: var(--color-success-bg, #DCFCE7); color: var(--color-success, #16A34A); }
  .gsa-dept-badge--car { background: var(--color-info-bg, #E0F2FE); color: var(--color-info, #0284C7); }
  .gsa-dept-badge--agri { background: var(--color-warning-bg, #FEF3C7); color: var(--color-warning, #D97706); }
  .gsa-dept-badge--sales { background: #F3E8FF; color: #7E22CE; }
  .gsa-dept-badge--retail { background: #FCE7F3; color: #DB2777; }
  .gsa-dept-badge--it { background: #EFF6FF; color: #2563EB; }
  .gsa-dept-badge--maintenance { background: var(--color-danger-bg, #FEE2E2); color: var(--color-danger, #DC2626); }
  .gsa-dept-badge--default { background: #F3F4F6; color: var(--color-text-secondary, #6B7280); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .gsa-title { font-size: 22px; }
    .gsa-header-icon { width: 40px; height: 40px; }
  }
  @media (max-width: 480px) {
    .gsa-count-pill { height: 44px; }
    .gsa-status { flex-wrap: wrap; }
  }
`;

/* ─── 7. LOW STOCK ALERTS ───────────────────────────────────────────────── */
export const GSAlerts = () => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/v1/printing-assets/store/materials').then(r => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const low = items.filter(m => parseFloat(m.quantity_in_store) <= parseFloat(m.reorder_level || 10));
  const deptClass = { Printing: 'gsa-dept-badge--printing', 'Car Rental': 'gsa-dept-badge--car', AgriRent: 'gsa-dept-badge--agri', Sales: 'gsa-dept-badge--sales', Retail: 'gsa-dept-badge--retail', 'Retail POS': 'gsa-dept-badge--retail', IT: 'gsa-dept-badge--it', Maintenance: 'gsa-dept-badge--maintenance' };

  return (
    <div className="gsa-alerts">
      <style>{GSA_CSS}</style>

      <div className="gsa-content">
        {/* ── HEADER ── */}
        <div className="gsa-header">
          <div className="gsa-header-left">
            <span className="gsa-header-icon"><AlertTriangle size={18} /></span>
            <div>
              <h1 className="gsa-title">Low Stock Alerts</h1>
              <p className="gsa-subtitle">Items at or below their automatic reorder levels</p>
            </div>
          </div>
          {!loading && (
            low.length > 0
              ? <div className="gsa-count-pill"><strong>{low.length}</strong> items low</div>
              : <div className="gsa-count-pill gsa-count-pill--ok">✓ All well-stocked</div>
          )}
        </div>

        {/* ── STATUS BANNER ── */}
        <div className="gsa-status">
          <span className="gsa-status-icon"><Radio size={18} /></span>
          <div>
            <div className="gsa-status-title">System Status</div>
            <div className="gsa-status-sub">Tracking individual item thresholds automatically.</div>
          </div>
        </div>

        {loading ? (
          <div className="gsa-loading">
            <SegmentedSpinner size={28} color="#2563EB" />
            <span>Loading low-stock alerts...</span>
          </div>
        ) : low.length === 0 ? (
          <div className="gsa-empty-card">
            <div className="gsa-empty-icon">✓</div>
            <div className="gsa-empty-title">All items are well-stocked</div>
            <div className="gsa-empty-sub">No materials are currently at or below their reorder levels.</div>
          </div>
        ) : (
          <div className="gsa-table-card">
            <div className="gsa-table-wrap">
              {/* Header Row */}
              <div className="gsa-grid gsa-grid--head">
                {['ID', 'Item', 'Department', 'Category', 'In Store', 'Unit'].map((h, i) => (
                  <div key={h} className={`gsa-cell gsa-cell--head${i === 4 ? ' gsa-cell--head-num' : ''}`}>{h}</div>
                ))}
              </div>

              {/* Data Rows */}
              {low.map(m => (
                <div key={m.id} className="gsa-grid gsa-row">
                  <div className="gsa-cell gsa-cell--id">{m.material_id}</div>
                  <div className="gsa-cell gsa-cell--name">{m.material_name}</div>
                  <div className="gsa-cell"><span className={`gsa-dept-badge ${deptClass[m.department] || 'gsa-dept-badge--default'}`}>{m.department}</span></div>
                  <div className="gsa-cell gsa-cell--cat">{m.category}</div>
                  <div className="gsa-cell gsa-cell--qty">{parseFloat(m.quantity_in_store).toLocaleString()}</div>
                  <div className="gsa-cell gsa-cell--unit">{m.unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


