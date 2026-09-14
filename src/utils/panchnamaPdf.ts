// src/utils/panchnamaPdf.ts
// jsPDF Section 52 NDPS Act Form 'F' Seizure Panchnama PDF builder

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PanchnamaForm } from '@/types/panchnama';

export function generatePanchnamaPDF(form: PanchnamaForm): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addLine = (h = 6) => { y += h; };
  const checkPage = (needed = 20) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
      addHeader();
    }
  };

  const addHeader = () => {

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(23, 55, 94);
    doc.text('GOVERNMENT OF INDIA', pageW / 2, y, { align: 'center' });
    addLine(5);
    doc.setFontSize(11);
    doc.text('NARCOTICS CONTROL BUREAU', pageW / 2, y, { align: 'center' });
    addLine(5);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Ministry of Home Affairs | Government of India', pageW / 2, y, { align: 'center' });
    addLine(6);

    // Form title
    doc.setDrawColor(23, 55, 94);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    addLine(4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 47);
    doc.text(`SEIZURE PANCHNAMA — ${form.ndpsSection} NDPS ACT, 1985`, pageW / 2, y, { align: 'center' });
    addLine(3);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('FORM F — STATUTORY SEIZURE MEMORANDUM', pageW / 2, y, { align: 'center' });
    addLine(4);
    doc.line(margin, y, pageW - margin, y);
    addLine(6);
  };

  // ── Page 1: Header ───────────────────────────────────────────
  addHeader();

  // Case info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 25, 47);

  const infoRows = [
    ['Case Number:', form.caseNumber, 'Form Number:', form.formNumber],
    ['Seizure Date:', form.seizureDate, 'Seizure Time:', form.seizureTime],
    ['NCB Section:', form.ndpsSection, 'Status:', form.status.toUpperCase()],
  ];

  for (const row of infoRows) {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], margin + 35, y);
    doc.setFont('helvetica', 'bold');
    doc.text(row[2], pageW / 2 + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(row[3], pageW / 2 + 40, y);
    addLine(6);
  }

  addLine(4);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageW - margin, y);
  addLine(6);

  // ── Seizure Location ─────────────────────────────────────────
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 55, 94);
  doc.text('1. SEIZURE LOCATION DETAILS', margin, y);
  addLine(6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Location: ${form.seizureLocation.description}`, margin, y); addLine(5);
  doc.text(`District: ${form.seizureLocation.district} | State: ${form.seizureLocation.state}`, margin, y); addLine(5);
  doc.text(`GPS Coordinates: ${form.seizureLocation.latitude.toFixed(6)}°N, ${form.seizureLocation.longitude.toFixed(6)}°E`, margin, y); addLine(5);
  if (form.seizureLocation.nearestLandmark) {
    doc.text(`Nearest Landmark: ${form.seizureLocation.nearestLandmark}`, margin, y); addLine(5);
  }
  if (form.seizureLocation.highwayRoute) {
    doc.text(`Highway/Route: ${form.seizureLocation.highwayRoute}`, margin, y); addLine(5);
  }
  addLine(4);

  // ── Accused Details ──────────────────────────────────────────
  checkPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 55, 94);
  doc.text('2. DETAILS OF ACCUSED PERSONS', margin, y);
  addLine(6);

  if (form.accused.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Full Name', 'Age/Gender', 'Address', 'ID Document']],
      body: form.accused.map((acc, i) => [
        i + 1,
        acc.fullName,
        `${acc.age} / ${acc.gender}`,
        `${acc.address}, ${acc.district}, ${acc.state}`,
        `${acc.idType.toUpperCase()}: ${acc.idNumber}`,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [23, 55, 94], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Seized Substances ────────────────────────────────────────
  checkPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 55, 94);
  doc.text('3. SEIZED SUBSTANCES / CONTRABAND', margin, y);
  addLine(6);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Substance', 'Form', 'Net Wt. (g)', 'Packets', 'Reagent Test', 'Sample Drawn']],
    body: form.seizureItems.map(item => [
      item.substanceName,
      item.apparentForm,
      item.netWeightGrams.toFixed(2),
      item.numberOfPackets,
      item.reagentTestResult,
      item.sampleDrawn ? 'Yes' : 'No',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [254, 242, 242] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Evidence Photo Hashes ────────────────────────────────────
  if (form.evidencePhotoHashes.length > 0) {
    checkPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(23, 55, 94);
    doc.text('4. EVIDENCE PHOTO SHA-256 HASHES (Tamper-Proof Seals)', margin, y);
    addLine(6);

    for (let i = 0; i < form.evidencePhotoHashes.length; i++) {
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`[${i + 1}] ${form.evidencePhotoHashes[i]}`, margin, y);
      addLine(5);
    }
    addLine(4);
  }

  // ── Narrative ────────────────────────────────────────────────
  checkPage(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 55, 94);
  doc.text('5. NARRATIVE OF SEIZURE / REMARKS', margin, y);
  addLine(6);

  const narrativeLines = doc.splitTextToSize(form.remarksNarrative, contentW);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  for (const line of narrativeLines) {
    checkPage(6);
    doc.text(line, margin, y);
    addLine(5);
  }
  addLine(4);

  // ── Legal Sections ───────────────────────────────────────────
  checkPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 55, 94);
  doc.text('6. APPLICABLE LEGAL SECTIONS', margin, y);
  addLine(6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(form.legalSections.join(' | '), margin, y);
  addLine(10);

  // ── Officer & Witness Signatures ─────────────────────────────
  checkPage(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 55, 94);
  doc.text('7. INVESTIGATING OFFICER & WITNESS SIGNATURES', margin, y);
  addLine(8);

  // IO Box
  doc.setDrawColor(23, 55, 94);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW / 2 - 5, 35);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Investigating Officer', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${form.investigatingOfficer.name}`, margin + 3, y + 12);
  doc.text(`Badge: ${form.investigatingOfficer.badgeNumber}`, margin + 3, y + 17);
  doc.text(`Designation: ${form.investigatingOfficer.designation}`, margin + 3, y + 22);
  doc.text('Signature: ________________', margin + 3, y + 30);

  // Witness Boxes
  const wBoxX = margin + contentW / 2 + 5;
  doc.rect(wBoxX, y, contentW / 2 - 5, 35);
  doc.setFont('helvetica', 'bold');
  doc.text('Witnesses', wBoxX + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  form.witnesses.slice(0, 2).forEach((w, i) => {
    const wy = y + 12 + i * 10;
    doc.text(`${i + 1}. ${w.name} (${w.designation})`, wBoxX + 3, wy);
    doc.text('Sig: ____________', wBoxX + 3, wy + 5);
  });

  addLine(42);

  // ── Footer ───────────────────────────────────────────────────
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`DRUG-SEAL AI | NCB | Generated: ${new Date().toISOString()} | Page ${p} of ${totalPages}`, pageW / 2, footY, { align: 'center' });
    doc.text('This document is computer-generated and is valid only with authorized signature and NCB seal.', pageW / 2, footY - 4, { align: 'center' });
  }

  doc.save(`Panchnama_${form.caseNumber}_${form.seizureDate}.pdf`);
}
