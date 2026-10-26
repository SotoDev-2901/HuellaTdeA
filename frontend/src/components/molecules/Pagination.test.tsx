import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('no se muestra cuando todo cabe en una página', () => {
    const { container } = render(<Pagination page={1} pageSize={20} total={15} onPageChange={() => undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el rango y deshabilita "anterior" en la primera página', () => {
    render(<Pagination page={1} pageSize={20} total={45} onPageChange={() => undefined} />);
    expect(screen.getByText('Mostrando 1–20 de 45')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
  });

  it('avanza y retrocede con los botones y deshabilita "siguiente" en la última', async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination page={2} pageSize={20} total={45} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText('Página siguiente'));
    expect(onPageChange).toHaveBeenCalledWith(3);
    await userEvent.click(screen.getByLabelText('Página anterior'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    rerender(<Pagination page={3} pageSize={20} total={45} onPageChange={onPageChange} />);
    expect(screen.getByText('Mostrando 41–45 de 45')).toBeInTheDocument();
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled();
  });
});
