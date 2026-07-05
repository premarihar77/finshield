import jsPDF from 'jspdf';

const DISCLAIMER = 'FinShield provides risk-based awareness support only. Always verify through official bank channels.';

function lines(value) {
  if (!value) return ['None'];
  if (Array.isArray(value)) return value.length ? value : ['None'];
  return [String(value)];
}

function addWrapped(doc, text, x, y, maxWidth, lineHeight = 7) {
  const wrapped = doc.splitTextToSize(String(text || 'None'), maxWidth);
  doc.text(wrapped, x, y);
  return y + wrapped.length * lineHeight;
}

export function rememberLatestAnalysis(result) {
  if (!result) return;
  localStorage.setItem('finshield_last_analysis', JSON.stringify(result));
  window.dispatchEvent(new CustomEvent('finshield:analysis-context', { detail: result }));
}

export function downloadScamReport(result, inputType = 'Scan', originalText = '') {
  if (!result) return;

  const doc = new jsPDF();
  const margin = 16;
  const width = 178;
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FinShield Scam Risk Report', margin, y);
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 7;
  doc.text(`Input type: ${inputType}`, margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Risk Summary', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  [
    `Risk Score: ${result.risk_score ?? 0}/100`,
    `Trust Score: ${result.trust_score ?? Math.max(0, 100 - (result.risk_score ?? 0))}/100`,
    `Risk Level: ${result.risk_level || 'Unknown'}`,
    `AI Scam Type: ${result.ml_predicted_category || result.scam_category || 'Unknown'}`,
    `ML Confidence: ${result.ml_confidence ?? 0}%`,
  ].forEach((row) => {
    doc.text(row, margin, y);
    y += 6;
  });

  const sections = [
    ['Original / OCR Text', originalText || result.ocr_text || result.input_text || result.summary],
    ['Why This Is Risky', lines(result.explanation || result.detected_signals).map((item) => `- ${item}`).join('\n')],
    ['Recommended Action', result.recommended_action || result.decision],
    ['Extracted URLs', lines(result.extracted_entities?.urls).join(', ')],
    ['Extracted UPI IDs', lines(result.extracted_entities?.upi_ids).join(', ')],
    ['Phone Numbers', lines(result.extracted_entities?.phone_numbers).join(', ')],
    ['Safety Tips', lines(result.safety_tips).map((item) => `- ${item}`).join('\n')],
    ['Disclaimer', result.disclaimer || DISCLAIMER],
  ];

  sections.forEach(([title, text]) => {
    if (y > 260) {
      doc.addPage();
      y = 18;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    y = addWrapped(doc, text, margin, y, width) + 4;
  });

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`finshield-scam-report-${date}.pdf`);
}
