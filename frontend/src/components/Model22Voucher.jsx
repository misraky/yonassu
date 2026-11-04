import React from 'react';
import { Printer, X } from 'lucide-react';

/**
 * Model 22 - Material Store Issue (የዕቃዎች ወጪ ማድረጊያ ሰነድ)
 * Exact replica of the official Ethiopian institutional store issue pad voucher.
 */
export const Model22Voucher = ({
  voucherNo = '128',
  date = new Date().toLocaleDateString('en-GB'),
  receivingSection = '',
  items = [],
  vatRate = 0.15,
  includeVat = true,
  preparedBy = '',
  checkedBy = '',
  auditedBy = '',
  universityName = 'ሐዋሳ ዩኒቨርሲቲ / Hawassa University',
  enterpriseName = 'ልሳነ ግዮን የወጣቶችና ሴቶች ኢንተርፕራይዝ',
  phone = '0911581255',
  minRows = 14,
  onClose,
  showActions = true,
}) => {
  // Normalize items to compute amounts
  const computedItems = items.map((it, idx) => {
    const qty = parseFloat(it.quantity || it.qty || it.qtyToIssue || 0) || 0;
    const unitPrice = parseFloat(it.unit_price || it.unitPrice || it.unit_cost || it.unit_value || 0) || 0;
    const totalAmount = parseFloat(it.total_amount || (qty * unitPrice) || 0);

    const priceBirr = unitPrice > 0 ? Math.floor(unitPrice) : '';
    const priceCents = unitPrice > 0 ? String(Math.round((unitPrice % 1) * 100)).padStart(2, '0') : '';

    const totalBirr = totalAmount > 0 ? Math.floor(totalAmount) : '';
    const totalCents = totalAmount > 0 ? String(Math.round((totalAmount % 1) * 100)).padStart(2, '0') : '';

    return {
      index: idx + 1,
      description: it.description || it.drug_name || it.material_name || it.product_name || it.name || '',
      codeNo: it.code_no || it.material_id || it.drug_code || it.item_id || it.drug_id || '',
      unit: it.unit || it.unit_of_measure || it.unitOfMeasure || 'Pcs',
      quantity: qty > 0 ? qty : '',
      unitPrice,
      priceBirr,
      priceCents,
      totalAmount,
      totalBirr,
      totalCents,
    };
  });

  const sumTotal = computedItems.reduce((acc, it) => acc + (it.totalAmount || 0), 0);
  const vatAmount = includeVat ? sumTotal * vatRate : 0;
  const grandTotal = sumTotal + vatAmount;

  const splitAmount = (val) => {
    if (!val || val <= 0) return { birr: '—', cents: '—' };
    const birr = Math.floor(val).toLocaleString();
    const cents = String(Math.round((val % 1) * 100)).padStart(2, '0');
    return { birr, cents };
  };

  const sumSplit = splitAmount(sumTotal);
  const vatSplit = splitAmount(vatAmount);
  const grandSplit = splitAmount(grandTotal);

  // Pad empty rows to match the physical booklet pad format
  const fillerRowCount = Math.max(0, minRows - computedItems.length);
  const fillerRows = Array.from({ length: fillerRowCount });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="m22-voucher-root">
      <style>{`
        .m22-voucher-root {
          font-family: 'Nyala', 'Abyssinica SIL', 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #000;
          background: #fff;
        }

        .m22-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #f1f5f9;
          border-radius: 8px 8px 0 0;
          border: 1px solid #cbd5e1;
          border-bottom: none;
          max-width: 820px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .m22-print-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0f172a;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .m22-print-btn:hover {
          background: #1e293b;
        }

        .m22-close-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        }
        .m22-close-btn:hover {
          background: #f8fafc;
        }

        .m22-sheet {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #111;
          padding: 24px 28px;
          box-sizing: border-box;
          position: relative;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06);
        }

        /* Top Header */
        .m22-top-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .m22-org-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .m22-seal {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }

        .m22-org-text {
          line-height: 1.25;
        }

        .m22-org-univ {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .m22-org-ent {
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
        }

        .m22-org-phone {
          font-size: 11px;
          color: #111;
          margin-top: 1px;
        }

        .m22-date-box {
          font-size: 12px;
          font-weight: 600;
          text-align: right;
          padding-top: 4px;
        }

        .m22-date-line {
          display: inline-block;
          min-width: 110px;
          border-bottom: 1px solid #000;
          text-align: center;
          font-weight: 500;
          padding: 0 4px;
        }

        /* Document Title Bar */
        .m22-title-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 8px;
          margin-bottom: 12px;
        }

        .m22-model-tag {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.02em;
          width: 120px;
        }

        .m22-main-title {
          text-align: center;
          flex: 1;
        }

        .m22-title-amharic {
          font-size: 19px;
          font-weight: 900;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
        }

        .m22-title-english {
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
          letter-spacing: 0.03em;
        }

        .m22-serial-no {
          font-size: 15px;
          font-weight: 900;
          text-align: right;
          width: 120px;
          color: #b91c1c;
          font-family: 'Courier New', Courier, monospace;
        }

        /* Receiving Section */
        .m22-recipient-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 700;
        }

        .m22-recipient-label {
          white-space: nowrap;
        }

        .m22-recipient-line {
          flex: 1;
          border-bottom: 1px solid #000;
          min-height: 18px;
          padding-left: 8px;
          font-weight: 600;
          color: #0f172a;
        }

        /* Table */
        .m22-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #000;
          font-size: 11.5px;
        }

        .m22-table th,
        .m22-table td {
          border: 1px solid #000;
          padding: 4px 6px;
          box-sizing: border-box;
        }

        .m22-table th {
          background: #ffffff;
          font-weight: 700;
          text-align: center;
          vertical-align: middle;
          line-height: 1.2;
        }

        .m22-th-sub {
          font-size: 10px;
          font-weight: 500;
          color: #222;
        }

        .m22-row {
          height: 24px;
        }

        .m22-td-center {
          text-align: center;
        }

        .m22-td-right {
          text-align: right;
          padding-right: 6px;
        }

        .m22-td-desc {
          text-align: left;
          font-weight: 600;
        }

        .m22-filler-row {
          height: 23px;
        }

        /* Totals */
        .m22-total-label {
          text-align: right;
          font-weight: 800;
          padding-right: 14px !important;
          letter-spacing: 0.02em;
        }

        .m22-total-val {
          font-weight: 800;
          text-align: right;
          padding-right: 6px !important;
        }

        /* Signatures Footer */
        .m22-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-top: 28px;
          font-size: 12px;
        }

        .m22-sig-col {
          display: flex;
          flex-direction: column;
        }

        .m22-sig-am {
          font-weight: 800;
          margin-bottom: 2px;
        }

        .m22-sig-en {
          font-size: 11px;
          color: #333;
          margin-bottom: 18px;
        }

        .m22-sig-line {
          border-bottom: 1px dotted #000;
          height: 18px;
          margin-bottom: 2px;
          font-weight: 600;
          font-size: 11px;
          padding-left: 2px;
        }

        .m22-distribution {
          margin-top: 22px;
          font-size: 10px;
          color: #444;
          font-style: italic;
        }

        /* Print Specifics */
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          body * {
            visibility: hidden !important;
          }

          .m22-voucher-root,
          .m22-voucher-root * {
            visibility: visible !important;
          }

          .m22-voucher-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: transparent !important;
          }

          .m22-sheet {
            max-width: 100% !important;
            width: 100% !important;
            border: 1.5px solid #000 !important;
            box-shadow: none !important;
            padding: 16px 20px !important;
          }

          .m22-action-bar {
            display: none !important;
          }

          .m22-table th {
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>

      {showActions && (
        <div className="m22-action-bar">
          <button onClick={handlePrint} className="m22-print-btn" type="button">
            <Printer size={16} /> Print Model 22
          </button>
          {onClose && (
            <button onClick={onClose} className="m22-close-btn" type="button">
              <X size={15} /> Close
            </button>
          )}
        </div>
      )}

      <div className="m22-sheet">
        {/* Top Header */}
        <div className="m22-top-header">
          <div className="m22-org-info">
            {/* University Crest Emblem */}
            <svg className="m22-seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="#000" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="39" stroke="#000" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="34" stroke="#000" strokeWidth="1.5" />
              <polygon points="50,22 58,38 76,40 62,52 66,70 50,60 34,70 38,52 24,40 42,38" fill="none" stroke="#000" strokeWidth="1.5" />
              <path d="M 32 74 C 42 68, 58 68, 68 74" stroke="#000" strokeWidth="1.5" fill="none" />
              <path d="M 36 78 C 44 73, 56 73, 64 78" stroke="#000" strokeWidth="1.2" fill="none" />
            </svg>

            <div className="m22-org-text">
              <div className="m22-org-univ">{universityName}</div>
              <div className="m22-org-ent">{enterpriseName}</div>
              <div className="m22-org-phone">☏ {phone}</div>
            </div>
          </div>

          <div className="m22-date-box">
            <div>ቀን / Date: <span className="m22-date-line">{date}</span></div>
          </div>
        </div>

        {/* Title Bar */}
        <div className="m22-title-bar">
          <div className="m22-model-tag">Model 22</div>
          <div className="m22-main-title">
            <div className="m22-title-amharic">የዕቃዎች ወጪ ማድረጊያ ሰነድ</div>
            <div className="m22-title-english">Material Store Issue</div>
          </div>
          <div className="m22-serial-no">No. {voucherNo}</div>
        </div>

        {/* Receiving Section */}
        <div className="m22-recipient-row">
          <div className="m22-recipient-label">
            <span>የተቀባዩ ክፍል</span> / <span>Receiving Section:</span>
          </div>
          <div className="m22-recipient-line">{receivingSection || '________________________________________'}</div>
        </div>

        {/* Table */}
        <table className="m22-table">
          <thead>
            <tr>
              <th rowSpan="2" style={{ width: '5%' }}>
                <div>ተ.ቁ.</div>
                <div className="m22-th-sub">Item No.</div>
              </th>
              <th rowSpan="2" style={{ width: '36%' }}>
                <div>የዕቃው ዝርዝር እና መግለጫ</div>
                <div className="m22-th-sub">Description</div>
              </th>
              <th rowSpan="2" style={{ width: '12%' }}>
                <div>የዕቃ ቁጥር</div>
                <div className="m22-th-sub">Code No.</div>
              </th>
              <th rowSpan="2" style={{ width: '11%' }}>
                <div>መለኪያ</div>
                <div className="m22-th-sub">Unit of Measure</div>
              </th>
              <th rowSpan="2" style={{ width: '8%' }}>
                <div>ብዛት</div>
                <div className="m22-th-sub">Quantity</div>
              </th>
              <th colSpan="2" style={{ width: '14%' }}>
                <div>ነጠላ ዋጋ</div>
                <div className="m22-th-sub">Unit Price</div>
              </th>
              <th colSpan="2" style={{ width: '14%' }}>
                <div>ጠቅላላ ዋጋ</div>
                <div className="m22-th-sub">Total Amount</div>
              </th>
            </tr>
            <tr>
              <th style={{ width: '9%' }}>ብር</th>
              <th style={{ width: '5%' }}>ሳ</th>
              <th style={{ width: '9%' }}>ብር</th>
              <th style={{ width: '5%' }}>ሳ</th>
            </tr>
          </thead>
          <tbody>
            {/* Populated Rows */}
            {computedItems.map((it) => (
              <tr key={it.index} className="m22-row">
                <td className="m22-td-center">{it.index}</td>
                <td className="m22-td-desc">{it.description}</td>
                <td className="m22-td-center" style={{ fontFamily: 'monospace' }}>{it.codeNo || '—'}</td>
                <td className="m22-td-center">{it.unit}</td>
                <td className="m22-td-center" style={{ fontWeight: 700 }}>{it.quantity}</td>
                <td className="m22-td-right">{it.priceBirr}</td>
                <td className="m22-td-center">{it.priceCents}</td>
                <td className="m22-td-right" style={{ fontWeight: 600 }}>{it.totalBirr}</td>
                <td className="m22-td-center" style={{ fontWeight: 600 }}>{it.totalCents}</td>
              </tr>
            ))}

            {/* Ruled Pad Filler Rows */}
            {fillerRows.map((_, i) => (
              <tr key={`filler-${i}`} className="m22-filler-row">
                <td className="m22-td-center">&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}

            {/* Summary Totals */}
            <tr>
              <td colSpan="5" className="m22-total-label">ድምር / SUM TOTAL</td>
              <td colSpan="2"></td>
              <td className="m22-total-val">{sumSplit.birr}</td>
              <td className="m22-td-center" style={{ fontWeight: 800 }}>{sumSplit.cents}</td>
            </tr>
            <tr>
              <td colSpan="5" className="m22-total-label">ተ.እ.ታ / VAT / 15%</td>
              <td colSpan="2"></td>
              <td className="m22-total-val">{includeVat ? vatSplit.birr : '0'}</td>
              <td className="m22-td-center" style={{ fontWeight: 800 }}>{includeVat ? vatSplit.cents : '00'}</td>
            </tr>
            <tr>
              <td colSpan="5" className="m22-total-label">ድምር / TOTAL</td>
              <td colSpan="2"></td>
              <td className="m22-total-val">{grandSplit.birr}</td>
              <td className="m22-td-center" style={{ fontWeight: 800 }}>{grandSplit.cents}</td>
            </tr>
          </tbody>
        </table>

        {/* Signatures & Footer */}
        <div className="m22-signatures">
          <div className="m22-sig-col">
            <div className="m22-sig-am">ያዘጋጀው</div>
            <div className="m22-sig-en">Prepared by</div>
            <div className="m22-sig-line">{preparedBy}</div>
          </div>
          <div className="m22-sig-col">
            <div className="m22-sig-am">ፈቅዶ ያወጣው</div>
            <div className="m22-sig-en">Checked &amp; Issue by</div>
            <div className="m22-sig-line">{checkedBy}</div>
          </div>
          <div className="m22-sig-col">
            <div className="m22-sig-am">ቁጥር የተቆጣጠረው</div>
            <div className="m22-sig-en">Checked &amp; Tester by</div>
            <div className="m22-sig-line">{auditedBy}</div>
          </div>
        </div>

        {/* Carbon copy distribution note */}
        <div className="m22-distribution">
          Distribution: Original-Accounts, 2nd-Issuer, 3rd-Pad
        </div>
      </div>
    </div>
  );
};

export default Model22Voucher;
