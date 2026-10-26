import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Controles de paginación en cliente (listas de cientos de filas). La página es 1-indexada. */
export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-input border border-tdea-blush-border text-graphite transition-colors hover:bg-tdea-blush disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <nav aria-label="Paginación" className="mt-4 flex items-center justify-between text-xs text-graphite">
      <span>
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Página anterior" className={buttonClass} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <FiChevronLeft size={16} />
        </button>
        <span aria-live="polite">
          Página {page} de {totalPages}
        </span>
        <button type="button" aria-label="Página siguiente" className={buttonClass} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <FiChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
