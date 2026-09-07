import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RegisterContainer } from './RegisterContainer';
import * as authService from '../services/authService';

vi.mock('../services/authService');

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']} future={routerFuture}>
      <Routes>
        <Route path="/register" element={<RegisterContainer />} />
        <Route path="/revisa-tu-correo" element={<div>pantalla de revisa tu correo</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillValidFormExcept(user: ReturnType<typeof userEvent.setup>, skip: string[] = []) {
  if (!skip.includes('name')) {
    await user.type(screen.getByLabelText('Nombre completo'), 'Carlos Ruiz');
  }
  if (!skip.includes('email')) {
    await user.type(screen.getByLabelText('Correo institucional'), 'carlos@correo.tdea.edu.co');
  }
  if (!skip.includes('password')) {
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
  }
  if (!skip.includes('confirmPassword')) {
    await user.type(screen.getByLabelText('Confirmar'), 'password123');
  }
  if (!skip.includes('terms')) {
    await user.click(screen.getByRole('checkbox'));
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe('RegisterContainer', () => {
  it('rechaza un correo que no sea del dominio institucional', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, ['email']);
    await user.type(screen.getByLabelText('Correo institucional'), 'carlos@gmail.com');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText(/correo debe ser institucional/i)).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('rechaza cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, ['confirmPassword']);
    await user.type(screen.getByLabelText('Confirmar'), 'otra-diferente');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('exige aceptar los términos antes de enviar', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, ['terms']);
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText(/aceptar los términos/i)).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('envía el formulario y redirige a "revisa tu correo" sin iniciar sesión', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      user: { id: '1', name: 'Carlos Ruiz', email: 'carlos@correo.tdea.edu.co', role: 'estudiante' },
      message: 'Cuenta creada.',
    });

    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user);
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Carlos Ruiz',
        email: 'carlos@correo.tdea.edu.co',
        password: 'password123',
        role: 'estudiante',
      });
    });
    expect(await screen.findByText('pantalla de revisa tu correo')).toBeInTheDocument();
    expect(localStorage.getItem('huellatdea.session')).toBeNull();
  });
});
