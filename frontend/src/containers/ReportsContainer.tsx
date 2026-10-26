import { useEffect, useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import { InstitutionalSummaryContainer } from './InstitutionalSummaryContainer';
import { ZoneFootprintTable } from '../components/organisms/ZoneFootprintTable';
import { Logo } from '../components/atoms/Logo';
import { downloadCsv } from '../lib/csv';
import { formatEmission } from '../lib/format';
import * as reportsService from '../services/reportsService';
import type { ZoneFootprintSummary } from '../services/reportsService';

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Mismo periodo que el resumen institucional de arriba (últimos 12 meses), para que las cifras coincidan. */
function last12Months(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setUTCMonth(from.getUTCMonth() - 12);
  return { from: isoDate(from), to: isoDate(now) };
}

export function ReportsContainer() {
  const [zones, setZones] = useState<ZoneFootprintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => last12Months().from);
  const [to, setTo] = useState(() => last12Months().to);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await reportsService.getInstitutionalReport({
        from: from || undefined,
        to: to || undefined,
      });
      setZones(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilter() {
    loadReport();
  }

  function applyRange(nextFrom: string, nextTo: string) {
    setFrom(nextFrom);
    setTo(nextTo);
    setLoading(true);
    reportsService
      .getInstitutionalReport({ from: nextFrom || undefined, to: nextTo || undefined })
      .then(setZones)
      .finally(() => setLoading(false));
  }

  function handleLast12Months() {
    const range = last12Months();
    applyRange(range.from, range.to);
  }

  function handleAllHistory() {
    applyRange('', '');
  }

  const defaults = last12Months();
  const periodLabel =
    !from && !to
      ? 'histórico completo'
      : from === defaults.from && to === defaults.to
        ? 'últimos 12 meses'
        : `${from || 'inicio'} a ${to || 'hoy'}`;

  const totalKgCo2e = zones.reduce((sum, z) => sum + z.total_kg_co2e, 0);

  function handleExportCsv() {
    downloadCsv(
      `huella-tdea-por-zona-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Zona', 'Consumo (kWh)', 'Residuos (kg)', 'Huella electricidad (kg CO2e)', 'Huella residuos (kg CO2e)', 'Huella total (kg CO2e)'],
      zones.map((z) => [
        z.zone_name,
        z.total_kwh.toFixed(2),
        z.total_waste_kg.toFixed(2),
        z.electricity_kg_co2e.toFixed(2),
        z.waste_kg_co2e.toFixed(2),
        z.total_kg_co2e.toFixed(2),
      ]),
    );
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="print-hide flex justify-end gap-3">
        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-2 rounded-button border border-tdea-blush-border px-4 py-2 text-sm font-medium text-graphite hover:bg-tdea-blush"
        >
          <FiDownload size={16} /> Exportar CSV
        </button>
        <button
          type="button"
          onClick={handleExportPdf}
          className="flex items-center gap-2 rounded-button border border-tdea-blush-border px-4 py-2 text-sm font-medium text-graphite hover:bg-tdea-blush"
        >
          <FiPrinter size={16} /> Exportar PDF
        </button>
      </div>

      <div className="hidden print:mb-6 print:flex print:items-center print:gap-3 print:border-b print:border-tdea-blush-border print:pb-4">
        <Logo compact />
        <div>
          <p className="font-display text-base font-bold text-ink">Huella de Carbono de TdeA — Reporte Institucional</p>
          <p className="text-xs text-graphite">
            Generado el{' '}
            {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <InstitutionalSummaryContainer />

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-ink">Detalle por Zona</h2>

        <div className="print-hide flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-graphite" htmlFor="report-from">
              Desde
            </label>
            <input
              id="report-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-input border border-tdea-blush-border bg-tdea-blush px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-tdea-green/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-graphite" htmlFor="report-to">
              Hasta
            </label>
            <input
              id="report-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-input border border-tdea-blush-border bg-tdea-blush px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-tdea-green/40"
            />
          </div>
          <button
            type="button"
            onClick={handleFilter}
            className="rounded-button bg-tdea-green px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleLast12Months}
            className="rounded-button border border-tdea-blush-border px-4 py-2.5 text-sm font-medium text-graphite hover:bg-tdea-blush"
          >
            Últimos 12 meses
          </button>
          <button
            type="button"
            onClick={handleAllHistory}
            className="rounded-button border border-tdea-blush-border px-4 py-2.5 text-sm font-medium text-graphite hover:bg-tdea-blush"
          >
            Histórico completo
          </button>
        </div>

        <p className="text-sm text-graphite">
          Periodo mostrado: <span className="font-medium text-ink">{periodLabel}</span>
        </p>

        <div className="rounded-card bg-surface p-6 shadow-soft card-hover">
          <div className="mb-1 flex items-baseline justify-between">
            <p className="text-sm text-graphite">Huella por zona (electricidad + residuos)</p>
            <p className="text-sm text-graphite">
              Total: <span className="font-semibold text-tdea-green">{formatEmission(totalKgCo2e)}</span>
            </p>
          </div>
          <ZoneFootprintTable zones={zones} loading={loading} />
        </div>

        <p className="hidden print:block print:mt-4 print:border-t print:border-tdea-blush-border print:pt-4 print:text-xs print:text-silver">
          Metodología: factor eléctrico UPME (0.199 kgCO2e/kWh, Sistema Interconectado Nacional). Residuos
          según Directrices del IPCC (2006) para Inventarios Nacionales de GEI, vía MVC Colombia (1.54
          kgCO2e/kg, relleno sanitario gestionado anaeróbico). El transporte institucional se estima como la
          suma del transporte reportado en la última respuesta del cuestionario individual de cada usuario
          (supuesto de alcance mixto, declarado). Sistema de Gestión de Huella de Carbono — Tecnológico de
          Antioquia.
        </p>
      </div>
    </div>
  );
}
