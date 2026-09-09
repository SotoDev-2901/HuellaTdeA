import type { FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Zone } from '../../services/zonesService';

export interface ConsumptionFormValues {
  zoneId: string;
  kwh: string;
  recordedAt: string;
}

interface ConsumptionFormModalProps {
  mode: 'create' | 'edit';
  values: ConsumptionFormValues;
  zones: Zone[];
  error?: string;
  loading: boolean;
  onChange: <K extends keyof ConsumptionFormValues>(field: K, value: ConsumptionFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function ConsumptionFormModal({
  mode,
  values,
  zones,
  error,
  loading,
  onChange,
  onSubmit,
  onClose,
}: ConsumptionFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-display text-xl font-bold text-ink">
          {mode === 'create' ? 'Nuevo registro de consumo' : 'Editar registro de consumo'}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {error ? (
            <p className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-graphite" htmlFor="zone-select">
              Zona
            </label>
            <select
              id="zone-select"
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

          <Input
            label="Consumo (kWh)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 350.75"
            value={values.kwh}
            onChange={(e) => onChange('kwh', e.target.value)}
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
