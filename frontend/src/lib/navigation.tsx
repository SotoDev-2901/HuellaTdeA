import { FiBarChart2, FiClipboard, FiClock, FiEdit3, FiGrid, FiHome } from 'react-icons/fi';
import type { NavItem } from '../components/organisms/AppShell';
import type { UserRole } from '../services/authService';

const communityNav: NavItem[] = [
  { label: 'Dashboard', icon: FiHome, to: '/dashboard' },
  { label: 'Cuestionario', icon: FiEdit3, to: '/cuestionario' },
  { label: 'Historial', icon: FiClock, to: '/historial' },
  { label: 'Huella TdeA', icon: FiBarChart2, to: '/reportes' },
];

const adminNav: NavItem[] = [
  { label: 'Panel Administrativo', icon: FiGrid, to: '/panel-administrativo' },
  { label: 'Registro de Emisiones', icon: FiClipboard, to: '/consumo' },
  { label: 'Reportes', icon: FiBarChart2, to: '/reportes' },
];

/** Menú lateral para las páginas transversales (cuenta, metodología) según el rol. */
export function navFor(role: UserRole | undefined): { items: NavItem[]; brand?: { title: string } } {
  return role === 'administrador' ? { items: adminNav } : { items: communityNav, brand: { title: 'TDEA HUELLA' } };
}
