'use client';

import { Dashboard as DashboardIcon, People as PeopleIcon } from '@mui/icons-material';
import type { ReactNode } from 'react';

export interface MenuItem {
  label: string;
  icon: ReactNode;
  href: string;
}

export const mainMenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, href: '/' },
  { label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/users' },
];
