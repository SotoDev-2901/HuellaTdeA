import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { WasteRecord } from '../../services/wasteService';

interface WasteTableProps {
  records: WasteRecord[];
  loading: boolean;
  onEdit: (record: WasteRecord) => void;
  onDelete: (record: WasteRecord) => void;
}

const wasteTypeLabels: Record<WasteRecord['waste_type'], string> = {
  plastico: 'Plástico',
  papel: 'Papel',
  organico: 'Orgánico',
};

export function WasteTable({ records, loading, onEdit, onDelete }: WasteTableProps) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-graphite">Cargando registros...</p>;
  }

  if (records.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-graphite">
        Todavía no hay residuos registrados.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-tdea-blush-border text-xs uppercase text-silver">
            <th className="py-2 pr-4 font-medium">Zona</th>
            <th className="py-2 pr-4 font-medium">Tipo de residuo</th>
            <th className="py-2 pr-4 font-medium">Peso (kg)</th>
            <th className="py-2 pr-4 font-medium">Fecha registrada</th>
            <th className="py-2 pr-4 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b border-tdea-blush-border/60 transition-colors hover:bg-tdea-blush"
            >
              <td className="py-3 pr-4 font-medium text-ink">{record.zone_name}</td>
              <td className="py-3 pr-4 text-graphite">{wasteTypeLabels[record.waste_type]}</td>
              <td className="py-3 pr-4 text-graphite">{Number(record.kg).toFixed(2)} kg</td>
              <td className="py-3 pr-4 text-graphite">
                {new Date(record.recorded_at).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(record)}
                    title="Editar registro"
                    className="text-tdea-green hover:text-tdea-green-dark"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    title="Eliminar registro"
                    className="text-danger hover:brightness-90"
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
