'use client';

import {
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  Language as LanguageIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import type { ReactNode } from 'react';

export interface MenuItem {
  label: string;
  icon: ReactNode;
  href: string;
}

export const mainMenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, href: '/' },
  { label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/users' },
  { label: 'Companies', icon: <BusinessIcon fontSize="small" />, href: '/companies' },
  { label: 'Countries', icon: <LanguageIcon fontSize="small" />, href: '/countries' },
];
