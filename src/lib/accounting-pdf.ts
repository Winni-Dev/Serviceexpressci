import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Attendance } from '@/types';
import {
  computeTotals,
  formatFcfa,
  getPeriodLabel,
  getRecordProfit,
  getWorkerLifetimeStats,
  type PeriodFilter,
} from '@/lib/accounting';

interface ExportAccountingPdfOptions {
  records: Attendance[];
  periodFilter: PeriodFilter;
  workerId: string | null;
  workerName?: string;
  allRecords: Attendance[];
}

export function exportAccountingPdf({
  records,
  periodFilter,
  workerId,
  workerName,
  allRecords,
}: ExportAccountingPdfOptions) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const totals = computeTotals(records);
  const periodLabel = getPeriodLabel(periodFilter);
  const generatedAt = format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(10, 34, 64);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Express CI', 14, 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport de comptabilité', 14, 22);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Période : ${periodLabel}`, 14, 42);
  doc.text(`Généré le : ${generatedAt}`, 14, 48);
  if (workerName) {
    doc.text(`Travailleur : ${workerName}`, 14, 54);
  }

  let y = workerName ? 62 : 56;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 34, 64);
  doc.text('Résumé', 14, y);
  y += 6;

  const summaryRows = [
    ['Montant total reçu (clients)', formatFcfa(totals.totalReceived)],
    ['Montant payé aux travailleurs', formatFcfa(totals.totalPaid)],
    ['Bénéfice net', formatFcfa(totals.profit)],
    ['Nombre de pointages', String(totals.count)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Indicateur', 'Valeur']],
    body: summaryRows,
    theme: 'grid',
    headStyles: { fillColor: [255, 102, 0], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (workerId && workerName) {
    const lifetime = getWorkerLifetimeStats(allRecords, workerId);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 34, 64);
    doc.text(`Statistiques globales — ${workerName}`, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Indicateur (depuis sa présence)', 'Valeur']],
      body: [
        ['Total reçu pour ses tâches', formatFcfa(lifetime.totalReceived)],
        ['Total payé au travailleur', formatFcfa(lifetime.totalPaid)],
        ['Bénéfice rapporté', formatFcfa(lifetime.profit)],
        ['Nombre de pointages', String(lifetime.count)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [10, 34, 64], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 90 }, 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 34, 64);
  doc.text('Détail des pointages', 14, y);
  y += 4;

  const tableBody =
    records.length === 0
      ? [['—', '—', '—', '—', '—', '—']]
      : records.map((record) => [
          format(new Date(record.date), 'dd/MM/yyyy', { locale: fr }),
          record.workers?.name ?? '—',
          record.description,
          formatFcfa(record.total_received ?? 0),
          formatFcfa(record.amount),
          formatFcfa(getRecordProfit(record)),
        ]);

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Travailleur', 'Description', 'Reçu', 'Payé', 'Bénéfice']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [255, 102, 0], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 45 },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Service Express CI — Page ${i}/${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  const safePeriod = periodLabel.replace(/\s+/g, '-').toLowerCase();
  const fileName = workerName
    ? `comptabilite-${workerName.replace(/\s+/g, '-')}-${safePeriod}.pdf`
    : `comptabilite-${safePeriod}.pdf`;

  doc.save(fileName);
}
