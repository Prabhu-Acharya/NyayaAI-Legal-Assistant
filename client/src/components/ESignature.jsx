/**
 * client/src/components/ESignature.jsx
 * Week 9 — draw signature → embed as PNG in PDF export
 *
 * Props:
 *   onSign(dataUrl: string) — called when user confirms signature
 *   onClear()               — called when canvas cleared
 *
 * Usage:
 *   <ESignature onSign={(url) => setSignatureDataUrl(url)} />
 *
 * Install dependency first:
 *   cd client && npm install react-signature-canvas
 */

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const S = {
  wrapper: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '12px',
    padding: '20px',
    fontFamily: 'sans-serif',
  },
  label: {
    fontSize: '13px',
    color: '#a0917a',
    marginBottom: '10px',
    display: 'block',
  },
  canvasWrapper: {
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(201,168,76,0.4)',
    cursor: 'crosshair',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '8px 20px',
    background: '#c9a84c',
    color: '#0f0c29',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '8px 20px',
    background: 'transparent',
    color: '#a0917a',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  confirmed: {
    marginTop: '10px',
    fontSize: '13px',
    color: '#4ade80',
  },
};

export default function ESignature({ onSign, onClear }) {
  const sigRef  = useRef(null);
  const [signed, setSigned] = useState(false);

  const handleConfirm = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
    setSigned(true);
    onSign?.(dataUrl);
  };

  const handleClear = () => {
    sigRef.current?.clear();
    setSigned(false);
    onClear?.();
  };

  return (
    <div style={S.wrapper}>
      <span style={S.label}>✍️ Draw your signature below</span>
      <div style={S.canvasWrapper}>
        <SignatureCanvas
          ref={sigRef}
          penColor='#1a1a2e'
          canvasProps={{ width: 500, height: 140, style: { display: 'block' } }}
        />
      </div>
      <div style={S.btnRow}>
        <button style={S.btnPrimary} onClick={handleConfirm}>
          ✅ Confirm Signature
        </button>
        <button style={S.btnSecondary} onClick={handleClear}>
          🗑 Clear
        </button>
      </div>
      {signed && <p style={S.confirmed}>Signature captured — will be embedded in PDF export.</p>}
    </div>
  );
}
