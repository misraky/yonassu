import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { playSound, sendPushNotification } from '../../services/notificationManager';
import { useToast } from '../../components/Toast';
import CEOStampSignature from '../../components/CEOStampSignature';
import { Truck, Printer, CheckCircle } from 'lucide-react';
import Model22Voucher from '../../components/Model22Voucher';

const STATUS_BADGES = {
  DRAFT:     { bg: '#F1F5F9', color: '#475569', text: 'Draft' },
  ISSUED:    { bg: '#F3E8FF', color: '#6B21A8', text: 'Issued' },
  RECEIVED:  { bg: '#DBEAFE', color: '#1E40AF', text: 'Received' },
  COMPLETED: { bg: '#D1FAE5', color: '#065F46', text: 'Completed' },
};

const IssueNote = () => {
  const { id, approvalId } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [issueForm, setIssueForm] = useState({ quantityIssued: '', batchNumber: '', expiryDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVouchers();
    if (approvalId && !id) setupFromApproval(approvalId);
    if (id) loadVoucher(parseInt(id));
  }, [id, approvalId]);

  const setupFromApproval = async (aprId) => {
    try {
      const res = await apiClient.post(`/erp/issue-vouchers/create/${aprId}`);
      if (res.status === 'success') {
        setSelectedVoucher(res.data);
        setIssueForm(f => ({ ...f, quantityIssued: String(res.data.quantity_approved) }));
      }
    } catch (e) { showToast(e.response?.data?.message || 'Failed to create issue voucher', 'error'); }
  };

  const loadVouchers = async () => {
    try {
      const res = await apiClient.get('/erp/issue-vouchers');
      if (res.status === 'success') setVouchers(res.data || []);
    } catch (e) { console.error(e); }
  };

  const loadVoucher = async (vId) => {
    try {
      const res = await apiClient.get(`/erp/issue-vouchers/${vId}`);
      if (res.status === 'success') {
        setSelectedVoucher(res.data);
        setIssueForm(f => ({ ...f, quantityIssued: String(res.data.quantity_approved) }));
      }
    } catch (e) { console.error(e); }
  };

  const handleIssue = async () => {
    if (!issueForm.quantityIssued || parseInt(issueForm.quantityIssued) < 1) {
      showToast('Enter a valid quantity', 'warning'); return;
    }
    setLoading(true);
    try {
      const res = await apiClient.patch(`/erp/issue-vouchers/${selectedVoucher.id}/issue`, issueForm);
      if (res.status === 'success') {
        showToast(`Issued ${issueForm.quantityIssued} units from Store to Pharmacy`, 'success');
        playSound('info');
        sendPushNotification('Items Dispatched', `${selectedVoucher.drug_name} — ${issueForm.quantityIssued} units shipped to Pharmacy`, `/pharmacy/grn`);
        loadVoucher(selectedVoucher.id);
        loadVouchers();
      }
    } catch (e) { showToast(e.response?.data?.message || 'Issue failed', 'error'); }
    finally { setLoading(false); }
  };

  const pendingCount = vouchers.filter(v => v.status === 'DRAFT').length;

  const voucherItems = selectedVoucher ? [{
    description: selectedVoucher.drug_name,
    codeNo: selectedVoucher.drug_code || (selectedVoucher.drug_id ? `CD-${selectedVoucher.drug_id}` : ''),
    unit: selectedVoucher.unit_of_measure || 'Units',
    quantity: parseFloat(selectedVoucher.quantity_issued || selectedVoucher.quantity_approved || 0),
    unit_price: parseFloat(selectedVoucher.unit_cost || selectedVoucher.unit_price || 0),
    total_amount: parseFloat(selectedVoucher.quantity_issued || selectedVoucher.quantity_approved || 0) * parseFloat(selectedVoucher.unit_cost || selectedVoucher.unit_price || 0),
    batchNumber: selectedVoucher.batch_number || '',
  }] : [];

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <ToastContainer />

      {/* Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', alignItems: 'center' }}>
        <Truck size={20} color="#6B21A8" />
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: 24, fontWeight: 700 }}>Goods Issue (Model 22)</h2>
        {pendingCount > 0 && (
          <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Split screen */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* LEFT: voucher list */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', maxHeight: '82vh', overflow: 'auto' }}>
          {vouchers.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No issue vouchers found</div>
          ) : vouchers.map(v => {
            const badge = STATUS_BADGES[v.status] || {};
            const isSelected = selectedVoucher && selectedVoucher.id === v.id;
            return (
              <div key={v.id} onClick={() => loadVoucher(v.id)} style={{
                padding: '14px 18px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer',
                background: isSelected ? '#FAF5FF' : 'white',
                borderLeft: isSelected ? '3px solid #6B21A8' : '3px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: '#1E293B' }}>{v.iss_no}</strong>
                  <span style={{ background: badge.bg, color: badge.color, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{badge.text}</span>
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>{v.drug_name}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: '#64748B' }}>
                  <span>Qty: {v.quantity_issued || v.quantity_approved}</span>
                  <span>{new Date(v.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Model 22 Authentic Voucher & Actions */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', position: 'relative', minHeight: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          {!selectedVoucher ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flex: 1, color: '#94A3B8', fontSize: 13 }}>
              Select an issue voucher to view Model 22
            </div>
          ) : (
            <div style={{ padding: '1.25rem', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

              {/* Action panel for DRAFT vouchers */}
              {selectedVoucher.status === 'DRAFT' && (
                <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '16px', border: '1px solid #E2E8F0', marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Truck size={18} color="#6B21A8" /> Issue Items &amp; Deduct Stock
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Quantity to Issue *</label>
                      <input type="number" min="1" max={selectedVoucher.quantity_approved}
                        value={issueForm.quantityIssued}
                        onChange={e => setIssueForm(f => ({ ...f, quantityIssued: e.target.value }))}
                        style={inputStyle} />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Max: {selectedVoucher.quantity_approved}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Batch Number</label>
                      <input value={issueForm.batchNumber}
                        onChange={e => setIssueForm(f => ({ ...f, batchNumber: e.target.value }))}
                        style={inputStyle} placeholder="Optional" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Expiry Date</label>
                    <input type="date" value={issueForm.expiryDate}
                      onChange={e => setIssueForm(f => ({ ...f, expiryDate: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <button onClick={handleIssue} disabled={loading} style={{
                    width: '100%', padding: '12px 24px', background: '#6B21A8', color: 'white',
                    border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}>
                    <Truck size={18} /> {loading ? 'Processing...' : 'ISSUE ITEMS & DEDUCT STOCK'}
                  </button>
                </div>
              )}

              {/* Exact Model 22 Form */}
              <Model22Voucher
                voucherNo={selectedVoucher.iss_no}
                date={new Date(selectedVoucher.issued_at || selectedVoucher.created_at).toLocaleDateString('en-GB')}
                receivingSection="Pharmacy Department"
                items={voucherItems}
                preparedBy={selectedVoucher.req_no ? `Req #${selectedVoucher.req_no}` : 'Pharmacy Requester'}
                checkedBy={selectedVoucher.issued_by_name || 'Store Manager'}
                auditedBy={selectedVoucher.apr_no ? `Apr #${selectedVoucher.apr_no}` : 'Auditor / Controller'}
                minRows={10}
                showActions={true}
              />

              {/* Issued stamp */}
              {selectedVoucher.status !== 'DRAFT' && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6B21A8' }}>
                    <CheckCircle size={24} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Issued by: {selectedVoucher.issued_by_name || 'Store Manager'}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>Stock: {selectedVoucher.store_stock_before} → {selectedVoucher.store_stock_after}</div>
                    </div>
                  </div>
                  {selectedVoucher.stamp_id && (
                    <CEOStampSignature
                      stamp={{ stamp_id: selectedVoucher.stamp_id, approved_by_name: selectedVoucher.issued_by_name, role: 'Store Manager', timestamp: selectedVoucher.issued_at, document_id: selectedVoucher.id }}
                      signerName={selectedVoucher.issued_by_name}
                      label="ISSUED"
                    />
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' };

export default IssueNote;
