import type { Zone } from '../../services/zonesService';

interface ZonesTableProps {
  zones: Zone[];
  loading: boolean;
  onEdit: (zone: Zone) => void;
}

const typeLabels: Record<Zone['type'], string> = {
  academica: 'Académica',
  administrativa: 'Administrativa',
};

function StatusPill({ status }: { status: Zone['status'] }) {
  const isActive = status === 'activa';
  return (
    <span
      className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
        isActive ? 'bg-tdea-green/15 text-tdea-green' : 'bg-black/5 text-silver'
      }`}
    >
      {isActive ? 'ACTIVA' : 'INACTIVA'}
    </span>
  );
}

export function ZonesTable({ zones, loading, onEdit }: ZonesTableProps) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando zonas...</p>;
  }

  if (zones.length === 0) {
    return <p className="py-8 text-center text-sm text-graphite">Todavía no hay zonas registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
            <th className="py-2 pr-4 font-medium">Nombre de la zona</th>
            <th className="py-2 pr-4 font-medium">Tipo de zona</th>
            <th className="py-2 pr-4 font-medium">Estado</th>
            <th className="py-2 pr-4 font-medium">Fecha de registro</th>
            <th className="py-2 pr-4 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id} className="border-b border-tdea-blush-border/60">
              <td className="py-3 pr-4 font-medium text-ink">{zone.name}</td>
              <td className="py-3 pr-4 text-graphite">{typeLabels[zone.type]}</td>
              <td className="py-3 pr-4">
                <StatusPill status={zone.status} />
              </td>
              <td className="py-3 pr-4 text-graphite">
                {new Date(zone.created_at).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="py-3 pr-4">
                <button
                  onClick={() => onEdit(zone)}
                  className="text-sm font-medium text-tdea-green hover:underline"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
