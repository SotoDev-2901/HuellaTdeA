import { useEffect, useState, type FormEvent } from 'react';
import { ConsumptionTable } from '../components/organisms/ConsumptionTable';
import {
  ConsumptionFormModal,
  type ConsumptionFormValues,
} from '../components/organisms/ConsumptionFormModal';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog';
import { Button } from '../components/atoms/Button';
import { ApiError } from '../lib/api';
import * as consumptionService from '../services/consumptionService';
import type { ConsumptionRecord } from '../services/consumptionService';
import * as zonesService from '../services/zonesService';
import type { Zone } from '../services/zonesService';
import { useToast } from '../context/ToastContext';

const emptyForm: ConsumptionFormValues = {
  zoneId: '',
  kwh: '',
  recordedAt: '',
};

export function ConsumptionContainer() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; recordId?: string } | null>(null);
  const [formValues, setFormValues] = useState<ConsumptionFormValues>(emptyForm);
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ConsumptionRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [recordsData, zonesData] = await Promise.all([
        consumptionService.listConsumptionRecords(),
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

  function openEdit(record: ConsumptionRecord) {
    setFormValues({
      zoneId: record.zone_id,
      kwh: record.kwh,
      recordedAt: record.recorded_at.slice(0, 10),
    });
    setFormError(undefined);
    setModal({ mode: 'edit', recordId: record.id });
  }

  function handleFormChange<K extends keyof ConsumptionFormValues>(
    field: K,
    value: ConsumptionFormValues[K],
  ) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;

    if (!formValues.zoneId) {
      setFormError('Selecciona una zona');
      return;
    }
    if (formValues.kwh === '' || Number(formValues.kwh) < 0) {
      setFormError('Ingresa un consumo válido');
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
        await consumptionService.createConsumptionRecord({
          zoneId: formValues.zoneId,
          kwh: Number(formValues.kwh),
          recordedAt: formValues.recordedAt,
        });
        showToast('Registro de consumo creado exitosamente');
      } else if (modal.recordId) {
        await consumptionService.updateConsumptionRecord(modal.recordId, {
          zoneId: formValues.zoneId,
          kwh: Number(formValues.kwh),
          recordedAt: formValues.recordedAt,
        });
        showToast('Registro de consumo actualizado exitosamente');
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
      await consumptionService.deleteConsumptionRecord(recordToDelete.id);
      setRecordToDelete(null);
      showToast('Registro de consumo eliminado exitosamente');
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
            + Nuevo registro de consumo
          </Button>
        </div>
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft card-hover">
        <ConsumptionTable
          records={records}
          loading={loading}
          onEdit={openEdit}
          onDelete={setRecordToDelete}
        />
      </div>

      {modal ? (
        <ConsumptionFormModal
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
          title="Eliminar registro de consumo"
          message={`¿Seguro que quieres eliminar el registro de "${recordToDelete.zone_name}"? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRecordToDelete(null)}
        />
      ) : null}
    </div>
  );
}
