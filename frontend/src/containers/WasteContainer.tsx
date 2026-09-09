import { useEffect, useState, type FormEvent } from 'react';
import { WasteTable } from '../components/organisms/WasteTable';
import { WasteFormModal, type WasteFormValues } from '../components/organisms/WasteFormModal';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { Button } from '../components/atoms/Button';
import { ApiError } from '../lib/api';
import * as wasteService from '../services/wasteService';
import type { WasteRecord } from '../services/wasteService';
import * as zonesService from '../services/zonesService';
import type { Zone } from '../services/zonesService';
import { useToast } from '../context/ToastContext';

const emptyForm: WasteFormValues = {
  zoneId: '',
  wasteType: '',
  kg: '',
  recordedAt: '',
};

export function WasteContainer() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; recordId?: string } | null>(null);
  const [formValues, setFormValues] = useState<WasteFormValues>(emptyForm);
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<WasteRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [recordsData, zonesData] = await Promise.all([
        wasteService.listWasteRecords(),
        zonesService.listZones(),
      ]);
      setRecords(recordsData);
      setZones(zonesData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreate() {
    setFormValues(emptyForm);
    setFormError(undefined);
    setModal({ mode: 'create' });
  }

  function openEdit(record: WasteRecord) {
    setFormValues({
      zoneId: record.zone_id,
      wasteType: record.waste_type,
      kg: record.kg,
      recordedAt: record.recorded_at.slice(0, 10),
    });
    setFormError(undefined);
    setModal({ mode: 'edit', recordId: record.id });
  }

  function handleFormChange<K extends keyof WasteFormValues>(field: K, value: WasteFormValues[K]) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;

    if (!formValues.zoneId) {
      setFormError('Selecciona una zona');
      return;
    }
    if (!formValues.wasteType) {
      setFormError('Selecciona un tipo de residuo');
      return;
    }
    if (formValues.kg === '' || Number(formValues.kg) < 0) {
      setFormError('Ingresa un peso válido');
      return;
    }
    if (!formValues.recordedAt) {
      setFormError('Selecciona una fecha');
      return;
    }

    setSaving(true);
    setFormError(undefined);
    try {
      if (modal.mode === 'create') {
        await wasteService.createWasteRecord({
          zoneId: formValues.zoneId,
          wasteType: formValues.wasteType,
          kg: Number(formValues.kg),
          recordedAt: formValues.recordedAt,
        });
        showToast('Registro de residuos creado exitosamente');
      } else if (modal.recordId) {
        await wasteService.updateWasteRecord(modal.recordId, {
          zoneId: formValues.zoneId,
          wasteType: formValues.wasteType,
          kg: Number(formValues.kg),
          recordedAt: formValues.recordedAt,
        });
        showToast('Registro de residuos actualizado exitosamente');
      }
      setModal(null);
      await loadData();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await wasteService.deleteWasteRecord(recordToDelete.id);
      setRecordToDelete(null);
      showToast('Registro de residuos eliminado exitosamente');
      await loadData();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-4">
        <div className="w-56">
          <Button type="button" onClick={openCreate}>
            + Nuevo registro de residuos
          </Button>
        </div>
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <WasteTable
          records={records}
          loading={loading}
          onEdit={openEdit}
          onDelete={setRecordToDelete}
        />
      </div>

      {modal ? (
        <WasteFormModal
          mode={modal.mode}
          values={formValues}
          zones={zones}
          error={formError}
          loading={saving}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
        />
      ) : null}

      {recordToDelete ? (
        <ConfirmDialog
          title="Eliminar registro de residuos"
          message={`¿Seguro que quieres eliminar el registro de "${recordToDelete.zone_name}"? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRecordToDelete(null)}
        />
      ) : null}
    </div>
  );
}
