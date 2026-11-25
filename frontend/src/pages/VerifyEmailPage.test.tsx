import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VerifyEmailPage } from './VerifyEmailPage';
import { ThemeProvider } from '../context/ThemeContext';
import { ApiError } from '../lib/api';
import * as authService from '../services/authService';

vi.mock('../services/authService');

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function renderPage(url = '/verificar-correo?token=abc123') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[url]} future={routerFuture}>
        <Routes>
          <Route path="/verificar-correo" element={<VerifyEmailPage />} />
          <Route path="/login" element={<div>pantalla de inicio de sesión</div>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VerifyEmailPage', () => {
  it('no verifica el correo al cargar la página: espera a que la persona confirme', () => {
    renderPage();

    expect(authService.verifyEmail).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Confirmar mi correo' })).toBeInTheDocument();
  });

  it('verifica con el token al presionar el botón y ofrece ir a iniciar sesión', async () => {
    vi.mocked(authService.verifyEmail).mockResolvedValue({ message: 'Correo verificado correctamente' });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Confirmar mi correo' }));

    expect(authService.verifyEmail).toHaveBeenCalledWith('abc123');
    expect(await screen.findByText('Correo verificado correctamente')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar mi correo' })).not.toBeInTheDocument();
  });

  it('muestra el mensaje del servidor si el enlace es inválido o expiró', async () => {
    vi.mocked(authService.verifyEmail).mockRejectedValue(
      new ApiError('El enlace de verificación es inválido o expiró', 400),
    );
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Confirmar mi correo' }));

    expect(await screen.findByText('El enlace de verificación es inválido o expiró')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toBeInTheDocument();
  });

  it('sin token indica que el enlace no es válido y no ofrece el botón', () => {
    renderPage('/verificar-correo');

    expect(screen.getByText('El enlace de verificación no es válido.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar mi correo' })).not.toBeInTheDocument();
    expect(authService.verifyEmail).not.toHaveBeenCalled();
  });
});
