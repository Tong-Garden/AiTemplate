'use client';

import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainMenuItems } from './drawer-menu';

const DRAWER_WIDTH = 240;

export function DrawerContent() {
  const pathname = usePathname();

  const itemSx = {
    px: 3,
    py: 1.25,
    '& .MuiListItemText-primary': { fontSize: '0.9rem' },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            AiTemplate
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Happy Vibe Coding
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List disablePadding sx={{ flex: 1, pt: 0.5 }}>
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemButton
                selected={isActive}
                sx={{
                  ...itemSx,
                  '&.Mui-selected': { backgroundColor: 'action.selected' },
                  '&.Mui-selected:hover': { backgroundColor: 'action.selected' },
                  '& .MuiListItemIcon-root': {
                    minWidth: 34,
                    color: isActive ? 'primary.main' : 'text.secondary',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </Link>
          );
        })}
      </List>

      <Divider />

      <List disablePadding>
        <ListItemButton
          sx={{
            ...itemSx,
            color: 'error.main',
            '& .MuiListItemIcon-root': { minWidth: 34, color: 'error.main' },
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>
      </List>

      <Typography
        variant="caption"
        sx={{ textAlign: 'center', color: 'text.disabled', py: 1.5, display: 'block' }}
      >
        v1.0.0
      </Typography>
    </Box>
  );
}

export { DRAWER_WIDTH };
