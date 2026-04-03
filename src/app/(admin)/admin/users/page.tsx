'use client';

import { useState, type FormEvent } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSaveUser, useUsers, useDeleteUser } from '@/hooks/api-hooks';
import { Role } from '@/lib/types';
import { EmptyState } from '@/components/states/EmptyState';
import { LoadingBlock } from '@/components/states/LoadingBlock';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

const roles: Role[] = ['super_admin', 'admin', 'editorial', 'journalist', 'reader'];

export default function UsersPage() {
  useAdminAreaGuard('users');
  const { data: users } = useUsers();
  const { mutateAsync: saveUser } = useSaveUser();
  const { mutateAsync: deleteUser } = useDeleteUser();
  const [draft, setDraft] = useState<{ name: string; email: string; role: Role; password: string }>({
    name: '',
    email: '',
    role: 'editorial',
    password: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...draft, id: editingId || undefined };
    if (!payload.password) {
      delete (payload as Partial<typeof payload>).password;
    }
    await saveUser(payload);
    setDraft({ name: '', email: '', role: 'editorial' as const, password: '' });
    setEditingId(null);
  };

  const handleEdit = (userId: string) => {
    const user = users?.find((item) => item.id === userId);
    if (!user) return;
    setEditingId(user.id);
    setDraft({ name: user.name, email: user.email, role: user.role, password: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(userId);
    if (editingId === userId) {
      setEditingId(null);
      setDraft({ name: '', email: '', role: 'editorial' as const, password: '' });
    }
  };

  return (
    <AdminShell title="Users" description="Assign roles, toggle activation, and reset credentials.">
      <Card 
        elevation={6}
        sx={{ 
          borderRadius: 4, 
          mb: 5,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.15)' : 'rgba(226,24,55,0.12)'}`,
        }}
      >
        <CardHeader
          title={editingId ? '✏️ Edit User' : '👤 New User'}
          subheader="Create accounts, assign roles, or update credentials."
          action={
            editingId ? (
              <Button
                variant="ghost"
                size="small"
                onClick={() => {
                  setEditingId(null);
                  setDraft({ name: '', email: '', role: 'editorial', password: '' });
                }}
                sx={{
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Cancel edit
              </Button>
            ) : null
          }
          sx={{
            background: (theme) => 
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,107,129,0.08) 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(226,24,55,0.04) 100%)`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            '& .MuiCardHeader-title': {
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: 0.5,
            },
            '& .MuiCardHeader-subheader': {
              fontStyle: 'italic',
              mt: 0.5,
            },
          }}
        />
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Grid container spacing={3} component="form" onSubmit={onSubmit}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Input
                label="Name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Input
                label="Email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, letterSpacing: 0.5 }}>
                Role Assignment
              </Typography>
              <Grid container spacing={1}>
                {roles.map((role) => (
                  <Grid key={role} size={{ xs: 'auto' }}>
                    <Chip
                      label={role}
                      color={draft.role === role ? 'primary' : 'default'}
                      onClick={() => setDraft((d) => ({ ...d, role }))}
                      sx={{
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Input
                label="Temp password"
                type="password"
                value={draft.password}
                onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button 
                type="submit"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 6,
                  },
                }}
              >
                {editingId ? '💾 Update user' : '✨ Save user'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 900, 
          mb: 3,
          letterSpacing: 0.5,
          background: (theme) => 
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #ff6b81 0%, #a7abb0 100%)'
              : 'linear-gradient(90deg, #e21837 0%, #5b5f63 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        👥 User Directory
      </Typography>
      {!users && <LoadingBlock lines={3} />}
      {users?.length === 0 && <EmptyState title="No users" description="Create a user to get started." />}
      {users && users.length > 0 && (
        <Paper 
          elevation={3}
          sx={{ 
            overflow: 'hidden', 
            borderRadius: 3,
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.1)' : 'rgba(226,24,55,0.08)'}`,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  background: (theme) => 
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,107,129,0.05)'
                      : 'rgba(226,24,55,0.03)',
                }}
              >
                <TableCell sx={{ fontWeight: 800, letterSpacing: 0.5 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 800, letterSpacing: 0.5 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 800, letterSpacing: 0.5 }}>Role</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id} 
                  hover
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,107,129,0.03)'
                          : 'rgba(226,24,55,0.02)',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color="secondary" 
                      size="small"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button 
                      variant="ghost" 
                      size="small" 
                      onClick={() => handleEdit(user.id)}
                      sx={{
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(2px)',
                        },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      sx={{
                        color: 'error.main',
                        borderColor: 'error.main',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'error.dark',
                          backgroundColor: 'rgba(211,47,47,0.08)',
                          transform: 'translateX(2px)',
                        },
                      }}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Paper>
      )}
    </AdminShell>
  );
}
