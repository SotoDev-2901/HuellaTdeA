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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
            <th className="py-2 pr-4 font-medium">Zona</th>
            <th className="py-2 pr-4 font-medium">Consumo total</th>
            <th className="py-2 pr-4 font-medium">Residuos totales</th>
            <th className="py-2 pr-4 font-medium">Huella electricidad</th>
            <th className="py-2 pr-4 font-medium">Huella residuos</th>
            <th className="py-2 pr-4 font-medium">Huella total</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.zone_id} className="border-b border-tdea-blush-border/60">
              <td className="py-3 pr-4 font-medium text-ink">{zone.zone_name}</td>
              <td className="py-3 pr-4 text-graphite">{zone.total_kwh.toFixed(2)} kWh</td>
              <td className="py-3 pr-4 text-graphite">{zone.total_waste_kg.toFixed(2)} kg</td>
              <td className="py-3 pr-4 text-graphite">{zone.electricity_kg_co2e.toFixed(2)} kg</td>
              <td className="py-3 pr-4 text-graphite">{zone.waste_kg_co2e.toFixed(2)} kg</td>
              <td className="py-3 pr-4 font-semibold text-tdea-green">
                {zone.total_kg_co2e.toFixed(2)} kg
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
