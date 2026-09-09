import { useEffect, useState } from 'react';
import { ZoneFootprintTable } from '../components/organisms/ZoneFootprintTable';
import { ZoneFootprintChart } from '../components/organisms/ZoneFootprintChart';
import * as reportsService from '../services/reportsService';
import type { ZoneFootprintSummary } from '../services/reportsService';

export function ReportsContainer() {
  const [zones, setZones] = useState<ZoneFootprintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

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

  function handleClear() {
    setFrom('');
    setTo('');
    setLoading(true);
    reportsService.getInstitutionalReport({}).then(setZones).finally(() => setLoading(false));
  }

  const totalKgCo2e = zones.reduce((sum, z) => sum + z.total_kg_co2e, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
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
        {from || to ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-button border border-tdea-blush-border px-4 py-2.5 text-sm font-medium text-graphite hover:bg-tdea-blush"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Huella institucional por zona</h2>
          <p className="text-sm text-graphite">
            Total: <span className="font-semibold text-tdea-green">{totalKgCo2e.toFixed(2)} kg CO2e</span>
          </p>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-graphite">Cargando reporte...</p>
        ) : (
          <ZoneFootprintChart zones={zones} />
        )}
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <ZoneFootprintTable zones={zones} loading={loading} />
      </div>
    </div>
  );
}
