interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-input border px-3.5 py-3 text-sm font-medium capitalize transition-colors ${
        selected
          ? 'border-tdea-green bg-tdea-green/10 text-tdea-green'
          : 'border-tdea-blush-border bg-tdea-blush text-graphite'
      }`}
    >
      {label}
    </button>
  );
}
