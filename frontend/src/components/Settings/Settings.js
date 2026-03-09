import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth0();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    notifications: true,
    language: 'pl',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <Sidebar />
      <main className='flex-1 overflow-auto ml-64' style={{ marginTop: 'var(--header-height)' }}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="mt-8">
            <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
            <p className="text-muted-foreground">{t('settings.description')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
          <CardHeader>
            <CardTitle>{t('settings.userProfile')}</CardTitle>
            <CardDescription>
              {t('settings.userProfileDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('settings.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.nameManagedByAuth0')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.emailManagedByAuth0')}
              </p>
            </div>
          </CardContent>
            </Card>

            <Card>
          <CardHeader>
            <CardTitle>{t('settings.preferences')}</CardTitle>
            <CardDescription>
              {t('settings.preferencesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.notifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notificationsDescription')}
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => updateFormData('notifications', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => updateFormData('language', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="pl">{t('settings.polish')}</option>
                <option value="en">{t('settings.english')}</option>
              </select>
            </div>
          </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? t('settings.saving') : saved ? t('settings.saved') : t('settings.saveChanges')}
          </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;

