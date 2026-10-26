import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { Zone } from '../../services/zonesService';

interface ZonesTableProps {
  zones: Zone[];
  loading: boolean;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
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
        isActive ? 'bg-tdea-green/15 text-tdea-green' : 'bg-surface-muted text-silver'
      }`}
    >
      {isActive ? 'ACTIVA' : 'INACTIVA'}
    </span>
  );
}

export function ZonesTable({ zones, loading, onEdit, onDelete }: ZonesTableProps) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando zonas...</p>;
  }

  if (zones.length === 0) {
    return <p className="py-8 text-center text-sm text-graphite">Todavía no hay zonas registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
            <th className="py-2 pr-2 sm:pr-4 font-medium">Nombre de la zona</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Tipo de zona</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Estado</th>
            <th className="hidden py-2 pr-2 font-medium sm:table-cell sm:pr-4">Fecha de registro</th>
            <th className="py-2 pr-2 sm:pr-4 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr
              key={zone.id}
              className="border-b border-tdea-blush-border/60 transition-colors hover:bg-tdea-blush"
            >
              <td className="py-3 pr-2 sm:pr-4 font-medium text-ink">{zone.name}</td>
              <td className="py-3 pr-2 sm:pr-4 text-graphite">{typeLabels[zone.type]}</td>
              <td className="py-3 pr-2 sm:pr-4">
                <StatusPill status={zone.status} />
              </td>
              <td className="hidden py-3 pr-2 text-graphite sm:table-cell sm:pr-4">
                {new Date(zone.created_at).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="py-3 pr-2 sm:pr-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(zone)}
                    title="Editar zona"
                    className="text-tdea-green transition-transform hover:scale-125 hover:text-tdea-green-dark"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(zone)}
                    title="Eliminar zona"
                    className="text-danger transition-transform hover:scale-125 hover:brightness-90"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
