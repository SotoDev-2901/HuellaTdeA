import type { FormEvent } from 'react';
import { PiRecycleBold, PiNewspaperClippingBold, PiLeafBold } from 'react-icons/pi';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Zone } from '../../services/zonesService';
import type { WasteType } from '../../services/wasteService';

export interface WasteFormValues {
  zoneId: string;
  wasteType: WasteType | '';
  kg: string;
  recordedAt: string;
}

interface WasteFormModalProps {
  mode: 'create' | 'edit';
  values: WasteFormValues;
  zones: Zone[];
  error?: string;
  loading: boolean;
  onChange: <K extends keyof WasteFormValues>(field: K, value: WasteFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

const WASTE_TYPES: { value: WasteType; label: string; icon: typeof PiRecycleBold }[] = [
  { value: 'plastico', label: 'Plástico', icon: PiRecycleBold },
  { value: 'papel', label: 'Papel', icon: PiNewspaperClippingBold },
  { value: 'organico', label: 'Orgánico', icon: PiLeafBold },
];

export function WasteFormModal({
  mode,
  values,
  zones,
  error,
  loading,
  onChange,
  onSubmit,
  onClose,
}: WasteFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-xl font-bold text-ink">
          {mode === 'create' ? 'Nuevo registro de residuos' : 'Editar registro de residuos'}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {error ? (
            <p className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-graphite" htmlFor="waste-zone-select">
              Zona
            </label>
            <select
              id="waste-zone-select"
              value={values.zoneId}
              onChange={(e) => onChange('zoneId', e.target.value)}
              className="w-full rounded-input border border-tdea-blush-border bg-tdea-blush px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-tdea-green/40"
            >
              <option value="" disabled>
                Selecciona una zona
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">Tipo de residuo</label>
            <div className="grid grid-cols-3 gap-2">
              {WASTE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => onChange('wasteType', type.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-input border px-2.5 py-3 text-xs font-medium transition-colors ${
                    values.wasteType === type.value
                      ? 'border-tdea-green bg-tdea-green/10 text-tdea-green'
                      : 'border-tdea-blush-border bg-tdea-blush text-graphite'
                  }`}
                >
                  <type.icon size={20} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Peso (kg)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 42.30"
            value={values.kg}
            onChange={(e) => onChange('kg', e.target.value)}
          />

          <Input
            label="Fecha de la lectura"
            type="date"
            value={values.recordedAt}
            onChange={(e) => onChange('recordedAt', e.target.value)}
          />

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-button border border-tdea-blush-border px-4 py-2.5 text-sm font-medium text-graphite hover:bg-tdea-blush"
            >
              Cancelar
            </button>
            <div className="flex-1">
              <Button type="submit" loading={loading}>
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
