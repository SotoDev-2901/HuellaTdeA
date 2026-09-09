import { useState } from 'react';
import { FiBell } from 'react-icons/fi';

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Notificaciones"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-tdea-blush-border bg-surface text-graphite hover:text-tdea-green"
      >
        <FiBell size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-10 w-56 rounded-input bg-surface p-3 text-sm text-graphite shadow-soft">
          No tienes notificaciones nuevas.
        </div>
      ) : null}
    </div>
  );
}
