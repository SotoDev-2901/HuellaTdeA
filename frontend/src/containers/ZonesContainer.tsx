import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ZonesTable } from '../components/organisms/ZonesTable';
import { ZoneFormModal, type ZoneFormValues } from '../components/organisms/ZoneFormModal';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { Button } from '../components/atoms/Button';
import { ApiError } from '../lib/api';
import * as zonesService from '../services/zonesService';
import type { Zone } from '../services/zonesService';
import { useToast } from '../context/ToastContext';

const emptyForm: ZoneFormValues = {
  name: '',
  description: '',
  type: 'academica',
  status: 'activa',
};

export function ZonesContainer() {
  const { showToast } = useToast();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; zoneId?: string } | null>(null);
  const [formValues, setFormValues] = useState<ZoneFormValues>(emptyForm);
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadZones() {
    setLoading(true);
    try {
      const data = await zonesService.listZones();
      setZones(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadZones();
  }, []);

  const filteredZones = useMemo(
    () => zones.filter((z) => z.name.toLowerCase().includes(search.toLowerCase())),
    [zones, search],
  );

  function openCreate() {
    setFormValues(emptyForm);
    setFormError(undefined);
    setModal({ mode: 'create' });
  }

  function openEdit(zone: Zone) {
    setFormValues({
      name: zone.name,
      description: zone.description ?? '',
      type: zone.type,
      status: zone.status,
    });
    setFormError(undefined);
    setModal({ mode: 'edit', zoneId: zone.id });
  }

  function handleFormChange<K extends keyof ZoneFormValues>(field: K, value: ZoneFormValues[K]) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;

    if (formValues.name.trim().length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setSaving(true);
    setFormError(undefined);
    try {
      if (modal.mode === 'create') {
        await zonesService.createZone({
          name: formValues.name,
          description: formValues.description || undefined,
          type: formValues.type,
        });
        showToast('Zona creada exitosamente');
      } else if (modal.zoneId) {
        await zonesService.updateZone(modal.zoneId, {
          name: formValues.name,
          description: formValues.description || undefined,
          type: formValues.type,
          status: formValues.status,
        });
        showToast('Zona actualizada exitosamente');
      }
      setModal(null);
      await loadZones();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la zona');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!zoneToDelete) return;
    setDeleting(true);
    try {
      await zonesService.deleteZone(zoneToDelete.id);
      setZoneToDelete(null);
      showToast('Zona eliminada exitosamente');
      await loadZones();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar zona por nombre..."
          className="w-full max-w-xs rounded-input border border-tdea-blush-border bg-surface px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tdea-green/40"
        />
        <div className="w-40">
          <Button type="button" onClick={openCreate}>
            + Nueva zona
          </Button>
        </div>
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <ZonesTable
          zones={filteredZones}
          loading={loading}
          onEdit={openEdit}
          onDelete={setZoneToDelete}
        />
      </div>

      {modal ? (
        <ZoneFormModal
          mode={modal.mode}
          values={formValues}
          error={formError}
          loading={saving}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      ) : null}

      {zoneToDelete ? (
        <ConfirmDialog
          title="Eliminar zona"
          message={`¿Seguro que quieres eliminar "${zoneToDelete.name}"? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setZoneToDelete(null)}
        />
      ) : null}
    </div>
  );
}
