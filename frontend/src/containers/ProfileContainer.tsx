import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../lib/api';
import * as accountService from '../services/accountService';
import type { AccountProfile } from '../services/accountService';

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  administrador: 'Administrador institucional',
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-4 sm:p-6 shadow-soft">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-graphite">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ProfileContainer() {
  const { user, updateUser, clearSession } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    accountService
      .getProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name);
      })
      .catch(() => undefined);
  }, []);

  const isAdmin = user?.role === 'administrador';

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setNameError('');
    setSavingName(true);
    try {
      const updated = await accountService.updateName(name);
      setProfile(updated);
      setName(updated.name);
      updateUser({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
      showToast('Nombre actualizado');
    } catch (err) {
      setNameError(errorMessage(err, 'No se pudo actualizar el nombre'));
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) return setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
    if (newPassword !== confirmPassword) return setPasswordError('Las contraseñas nuevas no coinciden');
    setSavingPassword(true);
    try {
      await accountService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Contraseña actualizada');
    } catch (err) {
      setPasswordError(errorMessage(err, 'No se pudo cambiar la contraseña'));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await accountService.deleteAccount(deletePassword);
      showToast('Tu cuenta fue eliminada');
      clearSession();
    } catch (err) {
      setDeleteError(errorMessage(err, 'No se pudo eliminar la cuenta'));
      setDeleteLoading(false);
    }
  }

  return (
    <div className="grid max-w-3xl gap-4">
      <Card title="Mis datos" description="Tu correo institucional identifica tu cuenta y no se puede cambiar.">
        <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-silver">Correo</dt>
            <dd className="mt-0.5 break-all text-ink">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-silver">Perfil</dt>
            <dd className="mt-0.5 text-ink">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-silver">Miembro desde</dt>
            <dd className="mt-0.5 text-ink">
              {profile ? new Date(profile.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
            </dd>
          </div>
        </dl>
        <form onSubmit={handleSaveName} className="flex flex-col gap-3">
          <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} error={nameError} />
          <Button type="submit" loading={savingName} disabled={name.trim() === user?.name} className="sm:w-auto">
            Guardar nombre
          </Button>
        </form>
      </Card>

      <Card title="Cambiar contraseña" description="Usa al menos 8 caracteres. Se te pedirá la contraseña actual para confirmar.">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <Input label="Contraseña actual" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="Nueva contraseña" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Confirmar nueva contraseña" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={passwordError} />
          <Button type="submit" loading={savingPassword} disabled={!currentPassword || !newPassword} className="sm:w-auto">
            Cambiar contraseña
          </Button>
        </form>
      </Card>

      <section className="rounded-card border border-danger/40 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-danger">Eliminar mi cuenta</h2>
        {isAdmin ? (
          <p className="mt-1 text-sm text-graphite">
            La cuenta de administrador no se puede eliminar desde la aplicación para no dejar el sistema sin quien gestione las zonas y los registros.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-graphite">
              Se borrarán tu cuenta y todas tus respuestas del cuestionario. Esta acción no se puede deshacer.
            </p>
            {deleting ? (
              <form onSubmit={handleDelete} className="mt-4 flex flex-col gap-3">
                <Input label="Confirma con tu contraseña" type="password" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} error={deleteError} />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleting(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    className="flex-1 rounded-button border border-tdea-blush-border px-4 py-2.5 text-sm font-medium text-graphite hover:bg-tdea-blush"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!deletePassword || deleteLoading}
                    className="flex-1 rounded-button bg-danger px-4 py-2.5 text-sm font-bold text-white hover:brightness-90 disabled:opacity-60"
                  >
                    {deleteLoading ? 'Eliminando...' : 'Eliminar definitivamente'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setDeleting(true)}
                className="mt-4 rounded-button border border-danger px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger-bg"
              >
                Eliminar mi cuenta
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
