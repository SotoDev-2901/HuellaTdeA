import { emissionUnitLabel, formatDecimal, formatEmissionNumber, pickEmissionUnit } from '../../lib/format';
import type { ZoneFootprintSummary } from '../../services/reportsService';

interface ZoneFootprintTableProps {
  zones: ZoneFootprintSummary[];
  loading: boolean;
}

export function ZoneFootprintTable({ zones, loading }: ZoneFootprintTableProps) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando reporte...</p>;
  }

  if (zones.length === 0) {
    return <p className="py-8 text-center text-sm text-graphite">Todavía no hay zonas registradas.</p>;
  }

  const unit = pickEmissionUnit(...zones.map((z) => z.total_kg_co2e));
  const unitLabel = emissionUnitLabel(unit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
            <th className="py-2 pr-2 sm:pr-4 font-medium">Zona</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Consumo total</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Residuos totales</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Huella electricidad ({unitLabel})</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Huella residuos ({unitLabel})</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Huella total ({unitLabel})</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr
              key={zone.zone_id}
              className="border-b border-tdea-blush-border/60 transition-colors hover:bg-tdea-blush"
            >
              <td className="py-3 pr-2 sm:pr-4 font-medium text-ink">{zone.zone_name}</td>
              <td className="py-3 pr-2 sm:pr-4 text-graphite">{formatDecimal(zone.total_kwh)} kWh</td>
              <td className="py-3 pr-2 sm:pr-4 text-graphite">{formatDecimal(zone.total_waste_kg)} kg</td>
              <td className="py-3 pr-2 sm:pr-4 text-graphite">{formatEmissionNumber(zone.electricity_kg_co2e, unit)}</td>
              <td className="py-3 pr-2 sm:pr-4 text-graphite">{formatEmissionNumber(zone.waste_kg_co2e, unit)}</td>
              <td className="py-3 pr-2 sm:pr-4 font-semibold text-tdea-green">
                {formatEmissionNumber(zone.total_kg_co2e, unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
