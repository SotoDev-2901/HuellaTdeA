import type { FormEvent } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { ZoneStatus, ZoneType } from '../../services/zonesService';

export interface ZoneFormValues {
  name: string;
  description: string;
  type: ZoneType;
  status: ZoneStatus;
}

interface ZoneFormModalProps {
  mode: 'create' | 'edit';
  values: ZoneFormValues;
  error?: string;
  loading: boolean;
  onChange: <K extends keyof ZoneFormValues>(field: K, value: ZoneFormValues[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export function ZoneFormModal({
  mode,
  values,
  error,
  loading,
  onChange,
  onSubmit,
  onClose,
}: ZoneFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-card bg-surface p-4 sm:p-6 shadow-soft">
        <h2 className="mb-4 font-display text-xl font-bold text-ink">
          {mode === 'create' ? 'Nueva zona' : 'Editar zona'}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {error ? (
            <p className="rounded-input bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
          ) : null}

          <Input
            label="Nombre de la zona"
            placeholder="Ej. Biblioteca Central"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
          />

          <Input
            label="Descripción (opcional)"
            placeholder="Ej. Edificio principal, 3 pisos"
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-graphite">Tipo de zona</label>
            <div className="flex gap-3">
              {(['academica', 'administrativa'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => onChange('type', type)}
                  className={`flex-1 rounded-input border px-3.5 py-2.5 text-sm font-medium capitalize transition-colors ${
                    values.type === type
                      ? 'border-tdea-green bg-tdea-green/10 text-tdea-green'
                      : 'border-tdea-blush-border bg-tdea-blush text-graphite'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {mode === 'edit' ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-graphite">Estado</label>
              <div className="flex gap-3">
                {(['activa', 'inactiva'] as const).map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => onChange('status', status)}
                    className={`flex-1 rounded-input border px-3.5 py-2.5 text-sm font-medium capitalize transition-colors ${
                      values.status === status
                        ? 'border-tdea-green bg-tdea-green/10 text-tdea-green'
                        : 'border-tdea-blush-border bg-tdea-blush text-graphite'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

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
