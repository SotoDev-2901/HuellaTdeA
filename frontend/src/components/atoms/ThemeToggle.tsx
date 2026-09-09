import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-tdea-blush-border bg-surface text-graphite hover:text-tdea-green ${className}`}
    >
      {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
    </button>
  );
}
