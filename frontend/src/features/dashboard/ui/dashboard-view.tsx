'use client';

import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import Link from 'next/link';

const features = [
  {
    icon: <DashboardIcon sx={{ fontSize: 48 }} />,
    title: 'Dashboard',
    description: 'View overview and analytics',
    href: '/',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 48 }} />,
    title: 'Users Management',
    description: 'Create, read, update, and delete users with full CRUD operations',
    href: '/users',
  },
  {
    icon: <SettingsIcon sx={{ fontSize: 48 }} />,
    title: 'Settings',
    description: 'Configure application preferences and settings',
    href: '/settings',
  },
];

const techStack = [
  {
    label: 'Frontend',
    items: ['Next.js 16', 'React 19', 'Material-UI', 'Zustand', 'Syncfusion'],
  },
  {
    label: 'Backend',
    items: ['FastAPI', 'Python 3.11', 'SQLAlchemy', 'Pydantic', 'Uvicorn'],
  },
  {
    label: 'Tools',
    items: ['TypeScript', 'Zod', 'ESLint', 'Prettier', 'Git'],
  },
  {
    label: 'Architecture',
    items: [
      'Hexagonal (Backend)',
      'Feature-based DDD (Frontend)',
      'Full-stack Feature Parity',
      'Type-safe throughout',
    ],
  },
];

export function DashboardView(): JSX.Element {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Welcome to AiTemplate
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          A modern full-stack application with Next.js frontend and FastAPI backend
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 8 }}>
        {features.map((feature) => (
          <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Link href={feature.href} style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 },
                }}
              >
                <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  <Button variant="contained" color="primary">
                    Go to {feature.title}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ p: 4, backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Technology Stack
        </Typography>
        <Grid container spacing={2}>
          {techStack.map((stack) => (
            <Grid key={stack.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {stack.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stack.items.map((item, i) => (
                  <span key={i}>
                    • {item}
                    {i < stack.items.length - 1 && <br />}
                  </span>
                ))}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
