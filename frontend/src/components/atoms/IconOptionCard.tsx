import type { IconType } from 'react-icons';

interface IconOptionCardProps {
  icon: IconType;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function IconOptionCard({ icon: Icon, label, selected, onClick }: IconOptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-input border px-3 py-3 text-xs font-medium transition-colors ${
        selected
          ? 'border-tdea-green bg-tdea-green/10 text-tdea-green'
          : 'border-tdea-blush-border bg-tdea-blush text-graphite'
      }`}
    >
      <Icon size={22} />
      {label}
    </button>
  );
}
