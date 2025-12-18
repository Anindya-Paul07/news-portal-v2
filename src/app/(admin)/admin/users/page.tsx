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
      <Card sx={{ borderRadius: 3, boxShadow: 4, mb: 3 }}>
        <CardHeader
          title={editingId ? 'Edit User' : 'New User'}
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
              >
                Cancel edit
              </Button>
            ) : null
          }
        />
        <CardContent>
          <Grid container spacing={2} component="form" onSubmit={onSubmit}>
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Role
              </Typography>
              <Grid container spacing={1}>
                {roles.map((role) => (
                  <Grid key={role} size={{ xs: 'auto' }}>
                    <Chip
                      label={role}
                      color={draft.role === role ? 'primary' : 'default'}
                      onClick={() => setDraft((d) => ({ ...d, role }))}
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
              <Button type="submit">{editingId ? 'Update user' : 'Save user'}</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        User directory
      </Typography>
      {!users && <LoadingBlock lines={3} />}
      {users?.length === 0 && <EmptyState title="No users" description="Create a user to get started." />}
      {users && users.length > 0 && (
        <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, boxShadow: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color="secondary" size="small" />
                  </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="ghost" size="small" onClick={() => handleEdit(user.id)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      sx={{
                        color: 'error.main',
                        borderColor: 'error.main',
                        '&:hover': {
                          borderColor: 'error.dark',
                          backgroundColor: 'rgba(211,47,47,0.08)',
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
