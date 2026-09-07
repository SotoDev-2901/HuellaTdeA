import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('muestra el mensaje de error cuando se pasa la prop error', () => {
    render(<Input label="Correo" error="Correo inválido" onChange={() => {}} value="" />);
    expect(screen.getByText('Correo inválido')).toBeInTheDocument();
  });

  it('alterna entre ocultar y mostrar la contraseña al hacer clic en el ícono', async () => {
    const user = userEvent.setup();
    render(<Input label="Contraseña" type="password" onChange={() => {}} value="secreta123" />);

    const input = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(input.type).toBe('password');

    await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
    expect(input.type).toBe('text');

    await user.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
    expect(input.type).toBe('password');
  });

  it('no muestra el botón de mostrar/ocultar en inputs que no son de contraseña', () => {
    render(<Input label="Nombre" onChange={() => {}} value="" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
