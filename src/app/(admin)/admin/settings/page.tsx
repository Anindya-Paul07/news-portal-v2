'use client';

import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/contexts/auth-context';
import { useAlert } from '@/contexts/alert-context';
import { useLayoutSettings, useSaveLayoutSettings } from '@/hooks/api-hooks';
import { getDisplayErrorMessage } from '@/lib/errors';
import { writeLayoutCuration } from '@/lib/layout-curation-store';
import type { LayoutCuration } from '@/lib/types';
import { canAccessAdminArea } from '@/lib/rbac';
import { getLocalizedText } from '@/lib/utils';
import { ErrorState } from '@/components/states/ErrorState';
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

const defaultOnThisDay: NonNullable<LayoutCuration['onThisDay']> = {
  enabled: true,
  description: { en: '', bn: '' },
};

type OnThisDayField = 'description';

const legacyOnThisDayDefaults = new Set([
  'On this day',
  'এই দিনে',
  'A brief note from the archive',
  'আর্কাইভ থেকে সংক্ষিপ্ত নোট',
  'Use this space for a short historical note, anniversary, or newsroom memory.',
  'ইতিহাস, বার্ষিকী বা নিউজরুম স্মৃতি নিয়ে ছোট নোটের জন্য এই জায়গাটি ব্যবহার করুন।',
]);

const cleanOnThisDayText = (value: string) => {
  const trimmed = value.trim();
  return legacyOnThisDayDefaults.has(trimmed) ? '' : value;
};

export default function SettingsPage() {
  useAdminAreaGuard('settings');
  const { changePassword, user } = useAuth();
  const { notify } = useAlert();
  const canEditHomepageSettings = canAccessAdminArea(user?.role, 'settings');
  const { data: layoutSettings } = useLayoutSettings();
  const { mutateAsync: saveLayoutSettings, isPending: isSavingLayout } = useSaveLayoutSettings();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [onThisDayDraft, setOnThisDayDraft] = useState<LayoutCuration['onThisDay'] | null>(null);
  const currentOnThisDay: NonNullable<LayoutCuration['onThisDay']> = {
    ...defaultOnThisDay,
    ...(layoutSettings?.onThisDay ?? {}),
    ...(onThisDayDraft ?? {}),
  };

  const updateOnThisDayText = (field: OnThisDayField, locale: 'en' | 'bn', value: string) => {
    setOnThisDayDraft((current) => ({
      ...currentOnThisDay,
      ...(current ?? {}),
      [field]: {
        ...(typeof currentOnThisDay[field] === 'object' ? currentOnThisDay[field] : {}),
        ...(current && typeof current[field] === 'object' ? current[field] : {}),
        [locale]: value,
      },
    }));
  };

  const getOnThisDayFieldValue = (field: OnThisDayField, locale: 'en' | 'bn') =>
    cleanOnThisDayText(getLocalizedText(currentOnThisDay[field], locale));

  const saveOnThisDay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload: NonNullable<LayoutCuration['onThisDay']> = {
        enabled: currentOnThisDay.enabled ?? true,
        description: {
          en: getOnThisDayFieldValue('description', 'en').trim(),
          bn: getOnThisDayFieldValue('description', 'bn').trim(),
        },
      };
      const saved = await saveLayoutSettings({ onThisDay: payload });
      writeLayoutCuration({ ...(layoutSettings ?? {}), ...saved });
      setOnThisDayDraft(null);
      notify({
        type: 'success',
        title: 'Homepage box updated',
        description: 'The On this day text is now saved in backend layout settings.',
      });
    } catch (error) {
      notify({
        type: 'error',
        title: 'Homepage box update failed',
        description: getDisplayErrorMessage(error, 'default'),
      });
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New password does not match confirmation.');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setStatus('success');
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus('error');
      setMessage(getDisplayErrorMessage(error, 'password'));
    }
  };

  return (
    <AdminShell title="Settings" description="Manage security and public homepage text.">
      {canEditHomepageSettings ? (
        <Card
          elevation={6}
          sx={{
            borderRadius: 4,
            maxWidth: 760,
            mb: 4,
            overflow: 'hidden',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.15)' : 'rgba(226,24,55,0.12)'}`,
          }}
        >
          <CardHeader
            title="Homepage On this day"
            subheader="Edit the small public landing page archive box."
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
            <Stack component="form" spacing={3} onSubmit={saveOnThisDay}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentOnThisDay.enabled ?? true}
                    onChange={(event) =>
                      setOnThisDayDraft((current) => ({
                        ...currentOnThisDay,
                        ...(current ?? {}),
                        enabled: event.target.checked,
                      }))
                    }
                  />
                }
                label="Show On this day box on homepage"
              />
              <Typography variant="body2" color="text.secondary">
                The date is added automatically each day. Add only the short note below.
              </Typography>
              <Textarea
                label="What happened (EN)"
                minRows={2}
                placeholder="A major event happened on this date."
                value={getOnThisDayFieldValue('description', 'en')}
                onChange={(event) => updateOnThisDayText('description', 'en', event.target.value)}
              />
              <Textarea
                label="What happened (BN)"
                minRows={2}
                placeholder="এই দিনে গুরুত্বপূর্ণ একটি ঘটনা ঘটে।"
                value={getOnThisDayFieldValue('description', 'bn')}
                onChange={(event) => updateOnThisDayText('description', 'bn', event.target.value)}
              />
              <Button type="submit" disabled={isSavingLayout} sx={{ alignSelf: 'flex-start', px: 4, py: 1.5, fontWeight: 800 }}>
                {isSavingLayout ? 'Saving...' : 'Save homepage text'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Card 
        elevation={6}
        sx={{ 
          borderRadius: 4, 
          maxWidth: 520,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.15)' : 'rgba(226,24,55,0.12)'}`,
        }}
      >
        <CardHeader 
          title="🔐 Password Security" 
          subheader="Keep your backoffice secure."
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
          <Stack component="form" spacing={3} onSubmit={onSubmit}>
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              sx={{ 
                alignSelf: 'flex-start',
                px: 4,
                py: 1.5,
                fontWeight: 800,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
              }}
            >
              🔒 Update password
            </Button>
            {status === 'success' && (
              <Typography variant="body2" color="success.main">
                {message}
              </Typography>
            )}
            {status === 'error' && <ErrorState title={message} />}
          </Stack>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
