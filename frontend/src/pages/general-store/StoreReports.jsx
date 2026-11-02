import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

/* ─── Color Palette & Constants ─────────────────────────────────────────── */
const G = {
  forest: '#228B22', dark: '#1B5E20', emerald: '#2E8B57', leaf: '#4CAF50',
  sage: '#A5D6A7', olive: '#6B8E23', lime: '#8BC34A', brown: '#8D6E63',
  sky: '#87CEEB', white: '#FFFFFF', light: '#F5F5F5', darkGray: '#424242',
  orange: '#FF9800', red: '#F44336', purple: '#7C3AED',
};

const DEPARTMENTS = ['All', 'Printing', 'Car Rental', 'AgriRent', 'Sales', 'Retail', 'IT', 'Maintenance'];
const TABS = ['Current Stock', 'Issued Items', 'Low Stock', 'Movements', 'Audit Log'];

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

/* ─── Shared UI & Animations ────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    :root {
      --color-primary: #2563EB;
      --color-primary-hover: #1D4ED8;
      --color-bg-page: #F5F6FA;
      --color-bg-card: #FFFFFF;
      --color-border: #E5E7EB;
      --color-text-primary: #111827;
      --color-text-secondary: #6B7280;
      --color-text-muted: #9CA3AF;
      --color-success: #16A34A;
      --color-warning: #D97706;
      --color-danger: #DC2626;
      --color-info: #0284C7;
    }

    @keyframes rowIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    /* Layout & Spacing */
    .report-wrapper {
      padding: 24px;
      font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
      color: var(--color-text-primary);
      background-color: var(--color-bg-page);
      min-height: 100vh;
    }
    @media (max-width: 1024px) { .report-wrapper { padding: 16px; } }
    @media (max-width: 768px) { .report-wrapper { padding: 12px; } }

    /* Cards */
    .card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: transform 150ms ease, box-shadow 150ms ease;
    }
    .card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    /* Tables */
    .table-container {
      overflow-x: auto;
      min-width: 700px;
      margin: 0 -24px;
    }
    .css-table {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .css-table-header {
      display: grid;
      background: #F9FAFB;
      color: var(--color-text-muted);
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 2;
    }
    .css-table-row {
      display: grid;
      align-items: center;
      min-height: 48px;
      font-size: 14px;
      border-bottom: 1px solid var(--color-border);
      transition: background-color 150ms ease;
      animation: rowIn 0.3s ease forwards;
    }
    .css-table-row:hover {
      background-color: #FEF3C7;
    }
    .css-table-row:last-child {
      border-bottom: none;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 36px;
      padding: 0 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease-in-out;
      border: none;
    }
    .btn-primary {
      background: var(--color-primary);
      color: white;
    }
    .btn-primary:hover {
      background: var(--color-primary-hover);
    }

    /* Tabs */
    .tabs-container {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
      scroll-snap-type: x mandatory;
    }
    .tabs-container::-webkit-scrollbar { display: none; }
    .tab-btn {
      padding: 0 16px;
      height: 38px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--color-border);
      background: #fff;
      color: var(--color-text-secondary);
      transition: all 150ms ease;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tab-btn:hover {
      background: #FEF3C7;
      color: var(--color-warning);
    }
    .tab-btn.active {
      background: #EFF6FF;
      color: var(--color-primary);
      border-color: rgba(37,99,235,0.4);
      font-weight: 600;
    }

    .tab-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 999px;
      background: #E5E7EB;
      color: #374151;
    }
    .tab-btn.active .tab-badge {
      background: #DBEAFE;
      color: #1D4ED8;
    }
    .tab-badge--alert {
      background: #FEE2E2 !important;
      color: #DC2626 !important;
    }
    
    /* Segmented Spinner */
    .segmented-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      border-style: dashed;
      animation: spin 1.2s linear infinite;
      margin: 40px auto;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Page title */
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.3;
    }

    /* Outline button */
    .btn-outline {
      background: #fff;
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      height: 36px;
      padding: 0 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 150ms ease;
      white-space: nowrap;
    }
    .btn-outline:hover {
      background: #FEF3C7;
      border-color: var(--color-warning);
      color: var(--color-warning);
    }

    /* Form select and inputs */
    .form-select, .form-input {
      height: 38px;
      padding: 0 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 14px;
      color: var(--color-text-primary);
      background: #fff;
      outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    .form-select:focus, .form-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }

    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 14px 20px;
      margin-bottom: 20px;
    }
  `}</style>
);

const DeptBadge = ({ dept }) => {
  const colors = { Printing: G.forest, 'Car Rental': G.sky, AgriRent: G.lime, Sales: G.orange, Retail: G.purple, IT: G.emerald, Maintenance: G.brown };
  const c = colors[dept] || G.olive;
  return <span style={{ background: c, color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{dept}</span>;
};

const StoreReports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [materials, setMaterials] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Derive role and permissions
  const roleStr = useMemo(() => {
    const rolesArr = Array.isArray(user?.roles) ? user.roles : [];
    return (rolesArr.join(',') || user?.role_names || '').toLowerCase();
  }, [user]);

  const isCEO          = roleStr.includes('ceo') || roleStr.includes('owner');
  const isFinance      = roleStr.includes('finance');
  const isSupervisor   = roleStr.includes('supervisor') || roleStr.includes('head');
  const isSuperAdmin   = roleStr.includes('super admin') || roleStr.includes('admin');
  const isStoreManager = roleStr.includes('store manager') || roleStr.includes('general store') || roleStr.includes('store keeper') || roleStr.includes('store');
  const canViewValues  = isFinance || isCEO || isSuperAdmin || isStoreManager;

  const deptContext = user?.departmentName || user?.department_name || user?.department || 'General Store';
  const displayRole = (Array.isArray(user?.roles) ? user.roles[0] : (user?.role_names || '')) ||
    (isSuperAdmin ? 'Admin' : isCEO ? 'CEO' : isFinance ? 'Finance' : isSupervisor ? 'Supervisor' : isStoreManager ? 'Store Manager' : 'General Store Keeper');

  const filteredDept = isSupervisor ? deptContext : (selectedDept !== 'All' ? selectedDept : '');

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const matParams = {};
      if (filteredDept) matParams.department = filteredDept;
      const rMat = await api.get('/api/v1/printing-assets/store/materials', { params: matParams });
      setMaterials(rMat.data?.data || rMat.data || []);

      const logParams = {};
      if (filteredDept) logParams.department = filteredDept;
      const rLog = await api.get('/api/v1/printing-assets/log', { params: logParams });
      setLogs(rLog.data?.data || rLog.data || []);
    } catch (e) {
      console.error('Failed to load store report data:', e);
      setErrorMsg(e.response?.data?.message || e.message || 'Failed to load report data from the server.');
    }
    setLoading(false);
  }, [filteredDept]);

  useEffect(() => { loadData(); }, [loadData]);

  // In-memory filtered items
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchDept = selectedDept === 'All' || (m.department && m.department.toLowerCase() === selectedDept.toLowerCase());
      const s = searchTerm.trim().toLowerCase();
      const matchSearch = !s || (
        (m.material_name && m.material_name.toLowerCase().includes(s)) ||
        (m.material_id && String(m.material_id).toLowerCase().includes(s)) ||
        (m.category && m.category.toLowerCase().includes(s))
      );
      return matchDept && matchSearch;
    });
  }, [materials, selectedDept, searchTerm]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchDept = selectedDept === 'All' || (l.department && l.department.toLowerCase() === selectedDept.toLowerCase());
      const s = searchTerm.trim().toLowerCase();
      const matchSearch = !s || (
        (l.item_id && String(l.item_id).toLowerCase().includes(s)) ||
        (l.item_type && l.item_type.toLowerCase().includes(s)) ||
        (l.action_type && l.action_type.toLowerCase().includes(s)) ||
        (l.moved_by && l.moved_by.toLowerCase().includes(s)) ||
        (l.notes && l.notes.toLowerCase().includes(s))
      );
      return matchDept && matchSearch;
    });
  }, [logs, selectedDept, searchTerm]);

  const issuesList = useMemo(() => filteredLogs.filter(l => l.action_type === 'Issue to Department'), [filteredLogs]);
  const lowStockList = useMemo(() => filteredMaterials.filter(m => parseFloat(m.quantity_in_store) <= parseFloat(m.reorder_level || 10)), [filteredMaterials]);
  const movesList = useMemo(() => filteredLogs.filter(l => ['Move to Production', 'Consume', 'Return to Store', 'Issue to Department', 'Register', 'Receive', 'Value Update'].includes(l.action_type)), [filteredLogs]);

  // Tab counts
  const tabCounts = {
    'Current Stock': filteredMaterials.length,
    'Issued Items':  issuesList.length,
    'Low Stock':     lowStockList.length,
    'Movements':     movesList.length,
    'Audit Log':     filteredLogs.length,
  };

  // View Renders
  const renderCurrentStock = () => {
    const grouped = filteredMaterials.reduce((acc, m) => {
      const d = m.department || 'General Store';
      if (!acc[d]) acc[d] = { items: [], count: 0, totalValue: 0 };
      acc[d].items.push(m);
      acc[d].count += parseFloat(m.quantity_in_store || 0);
      acc[d].totalValue += parseFloat(m.total_value || 0);
      return acc;
    }, {});

    const grandTotalValue = filteredMaterials.reduce((sum, m) => sum + parseFloat(m.total_value || 0), 0);
    const grandTotalQty   = filteredMaterials.reduce((sum, m) => sum + parseFloat(m.quantity_in_store || 0), 0);

    return (
      <div>
        {canViewValues && (
          <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 16, background: "var(--color-bg-card)", borderLeft: "4px solid var(--color-primary)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: "var(--color-text-secondary)" }}>
                Stock Overview {selectedDept !== 'All' ? `(${selectedDept} Dept)` : '(All Departments)'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Total Items in Store: <strong>{grandTotalQty.toLocaleString()}</strong> across <strong>{filteredMaterials.length}</strong> SKUs
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Estimated Valuation</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-primary)' }}>
                ETB {grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}

        {filteredMaterials.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>No stock items found</p>
            <p style={{ fontSize: 13, margin: 0 }}>Try clearing your search query or choosing another department.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([d, g]) => (
            <div key={d} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text-primary)", textTransform: 'uppercase' }}>
                  {d} Department
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Total Items: {g.count.toLocaleString()}
                  {canViewValues && ` | Value: ETB ${g.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
              </div>
              
              <div className="table-container">
                <div className="css-table">
                  <div className="css-table-header" style={{ gridTemplateColumns: canViewValues ? "2fr 1fr 1fr 1fr 1fr 1fr" : "3fr 1fr 1fr 1fr" }}>
                    <div style={{ padding: '12px 16px' }}>Item Name</div>
                    <div style={{ padding: '12px 16px' }}>Category</div>
                    <div style={{ padding: '12px 16px' }}>Quantity</div>
                    <div style={{ padding: '12px 16px' }}>Unit</div>
                    {canViewValues && <div style={{ padding: '12px 16px' }}>Unit Value</div>}
                    {canViewValues && <div style={{ padding: '12px 16px' }}>Total Value</div>}
                  </div>

                  {g.items.map((m) => (
                    <div key={m.id} className="css-table-row" style={{ gridTemplateColumns: canViewValues ? '2fr 1fr 1fr 1fr 1fr 1fr' : '3fr 1fr 1fr 1fr' }}>
                      <div style={{ padding: '12px 16px', fontWeight: 700 }}>
                        {m.material_name}
                        {m.material_id && <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 6 }}>({m.material_id})</span>}
                      </div>
                      <div style={{ padding: '12px 16px' }}>{m.category || 'General'}</div>
                      <div style={{ padding: '12px 16px', fontWeight: 800, color: parseFloat(m.quantity_in_store) <= parseFloat(m.reorder_level || 10) ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {parseFloat(m.quantity_in_store).toLocaleString()}
                      </div>
                      <div style={{ padding: '12px 16px' }}>{m.unit}</div>
                      {canViewValues && <div style={{ padding: '12px 16px' }}>ETB {parseFloat(m.unit_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
                      {canViewValues && <div style={{ padding: '12px 16px', fontWeight: 800 }}>ETB {parseFloat(m.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderIssuedItems = () => {
    return (
      <div className="card">
        <div className="table-container">
          <div className="css-table">
            <div className="css-table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr' }}>
              <div style={{ padding: '12px 16px' }}>Date</div>
              <div style={{ padding: '12px 16px' }}>Item ID</div>
              <div style={{ padding: '12px 16px' }}>Quantity</div>
              <div style={{ padding: '12px 16px' }}>Department</div>
              <div style={{ padding: '12px 16px' }}>Issued By</div>
              <div style={{ padding: '12px 16px' }}>Notes (Req/Job)</div>
            </div>
            {issuesList.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: "var(--color-text-muted)", fontWeight: 600 }}>
                No items issued yet for the selected filters.
              </div>
            ) : (
              issuesList.map((l) => (
                <div key={l.id} className="css-table-row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr' }}>
                  <div style={{ padding: '12px 16px', fontWeight: 700 }}>{new Date(l.date_time).toLocaleString()}</div>
                  <div style={{ padding: '12px 16px' }}>{l.item_id}</div>
                  <div style={{ padding: '12px 16px', fontWeight: 800, color: "var(--color-warning)" }}>{l.quantity}</div>
                  <div style={{ padding: '12px 16px' }}><DeptBadge dept={l.department} /></div>
                  <div style={{ padding: '12px 16px' }}>{l.moved_by}</div>
                  <div style={{ padding: '12px 16px', fontSize: 12 }}>{l.notes}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLowStock = () => {
    return (
      <div className="card">
        <div className="table-container">
          <div className="css-table">
            <div className="css-table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
              <div style={{ padding: '12px 16px' }}>Item Name</div>
              <div style={{ padding: '12px 16px' }}>Department</div>
              <div style={{ padding: '12px 16px' }}>Current Qty</div>
              <div style={{ padding: '12px 16px' }}>Reorder Level</div>
              <div style={{ padding: '12px 16px' }}>Status</div>
            </div>
            {lowStockList.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: "var(--color-text-muted)", fontWeight: 600 }}>
                ✓ All stock levels are healthy! No items below reorder threshold.
              </div>
            ) : (
              lowStockList.map((m) => (
                <div key={m.id} className="css-table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>
                  <div style={{ padding: '12px 16px', fontWeight: 700 }}>{m.material_name}</div>
                  <div style={{ padding: '12px 16px' }}><DeptBadge dept={m.department} /></div>
                  <div style={{ padding: '12px 16px', fontWeight: 900, color: "var(--color-danger)" }}>
                    {parseFloat(m.quantity_in_store).toLocaleString()} {m.unit}
                  </div>
                  <div style={{ padding: '12px 16px', fontWeight: 700 }}>{m.reorder_level || 10} {m.unit}</div>
                  <div style={{ padding: '12px 16px', color: "var(--color-danger)", fontWeight: 800 }}>⚠️ Reorder Needed</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMovements = () => {
    return (
      <div className="card">
        <div className="table-container">
          <div className="css-table">
            <div className="css-table-header" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1.2fr 1fr 1fr 0.8fr 1fr 1fr 1.5fr' }}>
              <div style={{ padding: '12px 10px' }}>Date</div>
              <div style={{ padding: '12px 10px' }}>Type</div>
              <div style={{ padding: '12px 10px' }}>Item ID</div>
              <div style={{ padding: '12px 10px' }}>Action</div>
              <div style={{ padding: '12px 10px' }}>Dept</div>
              <div style={{ padding: '12px 10px' }}>From</div>
              <div style={{ padding: '12px 10px' }}>To</div>
              <div style={{ padding: '12px 10px' }}>Qty</div>
              <div style={{ padding: '12px 10px' }}>Moved By</div>
              <div style={{ padding: '12px 10px' }}>Approved</div>
              <div style={{ padding: '12px 10px' }}>Notes</div>
            </div>
            {movesList.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: "var(--color-text-muted)", fontWeight: 600 }}>
                No movement records found for the current filter.
              </div>
            ) : (
              movesList.map((l) => (
                <div key={l.id} className="css-table-row" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1.2fr 1fr 1fr 0.8fr 1fr 1fr 1.5fr' }}>
                  <div style={{ padding: '12px 10px', fontWeight: 700 }}>{new Date(l.date_time).toLocaleDateString()}</div>
                  <div style={{ padding: '12px 10px' }}>{l.item_type}</div>
                  <div style={{ padding: '12px 10px', fontWeight: 600 }}>{l.item_id}</div>
                  <div style={{ padding: '12px 10px', fontWeight: 700, color: "var(--color-primary)" }}>{l.action_type}</div>
                  <div style={{ padding: '12px 10px' }}><DeptBadge dept={l.department} /></div>
                  <div style={{ padding: '12px 10px', fontSize: 12 }}>{l.from_location}</div>
                  <div style={{ padding: '12px 10px', fontSize: 12 }}>{l.to_location}</div>
                  <div style={{ padding: '12px 10px', fontWeight: 800, color: "var(--color-warning)" }}>{l.quantity || '-'}</div>
                  <div style={{ padding: '12px 10px', fontSize: 12 }}>{l.moved_by}</div>
                  <div style={{ padding: '12px 10px', fontSize: 12 }}>{l.approved_by || '-'}</div>
                  <div style={{ padding: '12px 10px', fontSize: 11 }}>{l.notes}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAuditLog = () => {
    return (
      <div className="card">
        <div className="table-container">
          <div className="css-table">
            <div className="css-table-header" style={{ gridTemplateColumns: '0.6fr 1.2fr 1.5fr 1fr 1fr 0.6fr 1fr 1.8fr' }}>
              <div style={{ padding: '12px 10px' }}>Log #</div>
              <div style={{ padding: '12px 10px' }}>Date / Time</div>
              <div style={{ padding: '12px 10px' }}>Action Type</div>
              <div style={{ padding: '12px 10px' }}>Item ID</div>
              <div style={{ padding: '12px 10px' }}>Department</div>
              <div style={{ padding: '12px 10px' }}>Qty</div>
              <div style={{ padding: '12px 10px' }}>User</div>
              <div style={{ padding: '12px 10px' }}>Notes</div>
            </div>
            {filteredLogs.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: "var(--color-text-muted)", fontWeight: 600 }}>
                Log is empty for the current filter.
              </div>
            ) : (
              filteredLogs.map((l) => (
                <div key={l.id} className="css-table-row" style={{ gridTemplateColumns: '0.6fr 1.2fr 1.5fr 1fr 1fr 0.6fr 1fr 1.8fr' }}>
                  <div style={{ padding: '12px 10px', fontWeight: 800, color: "var(--color-text-secondary)" }}>#{l.id}</div>
                  <div style={{ padding: '12px 10px', fontSize: 12 }}>{new Date(l.date_time).toLocaleString()}</div>
                  <div style={{ padding: '12px 10px', fontWeight: 700, color: "var(--color-success)" }}>{l.action_type}</div>
                  <div style={{ padding: '12px 10px', fontWeight: 600 }}>{l.item_id}</div>
                  <div style={{ padding: '12px 10px' }}><DeptBadge dept={l.department} /></div>
                  <div style={{ padding: '12px 10px', fontWeight: 800 }}>{l.quantity || '-'}</div>
                  <div style={{ padding: '12px 10px', fontSize: 12 }}>{l.moved_by}</div>
                  <div style={{ padding: '12px 10px', fontSize: 11, fontStyle: 'italic' }}>{l.notes}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Please allow popups to print reports.'); return; }

    const dt = new Date().toLocaleString();
    const th = (t) => `<th>${t}</th>`;
    const td = (t) => `<td>${t ?? '-'}</td>`;
    const fmt = (n) => parseFloat(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let bodyHtml = '';

    if (activeTab === 'Current Stock') {
      const grouped = filteredMaterials.reduce((acc, m) => { const d = m.department || 'General Store'; if (!acc[d]) acc[d] = []; acc[d].push(m); return acc; }, {});
      const grand = filteredMaterials.reduce((s, m) => s + parseFloat(m.total_value || 0), 0);
      if (canViewValues) bodyHtml += `<p style="font-size:15px;font-weight:bold;margin:0 0 12px;color:#1B5E20">Grand Total Value: ETB ${fmt(grand)}</p>`;
      Object.entries(grouped).forEach(([dept, items]) => {
        const sub = items.reduce((s, m) => s + parseFloat(m.total_value || 0), 0);
        bodyHtml += `<h3 style="background:#c8e6c9;padding:8px 12px;margin:20px 0 0;font-size:13px">${dept}${canViewValues ? ` — ETB ${fmt(sub)}` : ''}</h3>`;
        bodyHtml += `<table><thead><tr>${th('Item Name')}${th('Category')}${th('Qty')}${th('Unit')}${canViewValues ? th('Unit Value') + th('Total Value') : ''}</tr></thead><tbody>`;
        items.forEach(m => { bodyHtml += `<tr>${td(m.material_name)}${td(m.category)}${td(parseFloat(m.quantity_in_store).toLocaleString())}${td(m.unit)}${canViewValues ? td('ETB ' + fmt(m.unit_value)) + td('ETB ' + fmt(m.total_value)) : ''}</tr>`; });
        bodyHtml += `</tbody></table>`;
      });
    } else if (activeTab === 'Issued Items') {
      bodyHtml += `<p style="font-weight:bold;margin:0 0 8px">Total Issued Records: ${issuesList.length}</p>`;
      bodyHtml += `<table><thead><tr>${th('Date & Time')}${th('Item ID')}${th('Qty')}${th('Department')}${th('Issued By')}${th('Notes')}</tr></thead><tbody>`;
      issuesList.forEach(l => { bodyHtml += `<tr>${td(new Date(l.date_time).toLocaleString())}${td(l.item_id)}${td(l.quantity)}${td(l.department)}${td(l.moved_by)}${td(l.notes)}</tr>`; });
      bodyHtml += `</tbody></table>`;
    } else if (activeTab === 'Low Stock') {
      bodyHtml += `<p style="font-weight:bold;color:#c62828;margin:0 0 8px">⚠️ ${lowStockList.length} item(s) below reorder threshold</p>`;
      bodyHtml += `<table><thead><tr>${th('Item Name')}${th('Department')}${th('Current Qty')}${th('Unit')}${th('Reorder Level')}${th('Status')}</tr></thead><tbody>`;
      lowStockList.forEach(m => { bodyHtml += `<tr>${td(m.material_name)}${td(m.department)}${td(parseFloat(m.quantity_in_store).toLocaleString())}${td(m.unit)}${td(m.reorder_level)}<td style="color:#c62828;font-weight:bold">Reorder Needed</td></tr>`; });
      bodyHtml += `</tbody></table>`;
    } else if (activeTab === 'Movements') {
      bodyHtml += `<p style="font-weight:bold;margin:0 0 8px">Total Movement Records: ${movesList.length}</p>`;
      bodyHtml += `<table><thead><tr>${th('Date & Time')}${th('Type')}${th('Item ID')}${th('Action')}${th('Dept')}${th('From')}${th('To')}${th('Qty')}${th('By')}${th('Approved')}${th('Notes')}</tr></thead><tbody>`;
      movesList.forEach(l => { bodyHtml += `<tr>${td(new Date(l.date_time).toLocaleString())}${td(l.item_type)}${td(l.item_id)}${td(l.action_type)}${td(l.department)}${td(l.from_location)}${td(l.to_location)}${td(l.quantity)}${td(l.moved_by)}${td(l.approved_by)}${td(l.notes)}</tr>`; });
      bodyHtml += `</tbody></table>`;
    } else if (activeTab === 'Audit Log') {
      bodyHtml += `<p style="font-weight:bold;margin:0 0 8px">Total Audit Entries: ${filteredLogs.length}</p>`;
      bodyHtml += `<table><thead><tr>${th('#')}${th('Date & Time')}${th('Action Type')}${th('Item Type')}${th('Item ID')}${th('Qty')}${th('Department')}${th('Performed By')}${th('Approved By')}${th('Notes')}</tr></thead><tbody>`;
      filteredLogs.forEach(l => { bodyHtml += `<tr>${td(l.id)}${td(new Date(l.date_time).toLocaleString())}${td(l.action_type)}${td(l.item_type)}${td(l.item_id)}${td(l.quantity)}${td(l.department)}${td(l.moved_by)}${td(l.approved_by)}${td(l.notes)}</tr>`; });
      bodyHtml += `</tbody></table>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>General Store — ${activeTab} Report</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
            h1 { font-size: 20px; color: #111827; text-transform: uppercase; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 4px; }
            h3 { font-size: 13px; }
            .meta { display: flex; justify-content: space-between; font-size: 11px; color: #555; margin-bottom: 18px; padding-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 4px; page-break-inside: auto; }
            thead { background: #F9FAFB; color: #6B7280; }
            th { padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #aaa; }
            td { padding: 7px 10px; border: 1px solid #ddd; font-size: 11px; word-break: break-word; }
            tr:nth-child(even) td { background: #F9FAFB; }
            tr { page-break-inside: avoid; }
            @page { margin: 15mm; }
          </style>
        </head>
        <body>
          <h1>General Store — ${activeTab} Report</h1>
          <div class="meta">
            <span>Generated: ${dt}</span>
            <span>Role: ${displayRole}${isSupervisor ? ` (${deptContext})` : ''}</span>
            <span>Department Filter: ${selectedDept}</span>
          </div>
          ${bodyHtml}
          <script>window.onload = function() { window.print(); };<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="report-wrapper">
      <GlobalStyles />
      
      {/* ── HEADER ── */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize: 36 }}>📊</span>
            <div>
              <h2 className="page-title">Reports & Audit Log</h2>
              <p style={{ color: "var(--color-text-secondary)", fontSize: 14, margin: '4px 0 0' }}>
                Comprehensive stock valuation, departmental distributions, movement ledger, and accountability tracking
              </p>
            </div>
          </div>
          
          <button onClick={handlePrint} className="btn btn-outline">
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Department:</span>
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="form-select"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%' }}
            placeholder="Search items, SKU, category, user, action..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-outline"
              style={{ height: 38, padding: '0 10px', fontSize: 12 }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-outline"
          style={{ height: 38 }}
          title="Refresh Data"
        >
          🔄 Refresh
        </button>
      </div>

      {errorMsg && (
        <div className="card" style={{ background: '#FEE2E2', borderColor: '#FCA5A5', color: '#991B1B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ {errorMsg}</span>
          <button onClick={loadData} className="btn btn-primary" style={{ height: 30, fontSize: 12 }}>
            Retry
          </button>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="tabs-container">
        {TABS.map(t => {
          const count = tabCounts[t] ?? 0;
          const isAlert = t === 'Low Stock' && count > 0;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
            >
              {t}
              <span className={`tab-badge ${isAlert ? 'tab-badge--alert' : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      {loading ? (
        <div className="segmented-spinner" />
      ) : (
        <div id="report-print-area">
          {activeTab === 'Current Stock' && renderCurrentStock()}
          {activeTab === 'Issued Items'  && renderIssuedItems()}
          {activeTab === 'Low Stock'     && renderLowStock()}
          {activeTab === 'Movements'     && renderMovements()}
          {activeTab === 'Audit Log'     && renderAuditLog()}
        </div>
      )}
    </div>
  );
};

export default StoreReports;
