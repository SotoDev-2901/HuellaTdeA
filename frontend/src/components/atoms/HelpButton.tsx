import { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Ayuda"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-tdea-blush-border bg-surface text-graphite hover:text-tdea-green"
      >
        <FiHelpCircle size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-10 w-56 rounded-input bg-surface p-3 text-sm text-graphite shadow-soft">
          Centro de ayuda disponible próximamente.
        </div>
      ) : null}
    </div>
  );
}
