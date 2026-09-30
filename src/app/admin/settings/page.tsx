'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CATEGORY_CONFIG, CATEGORY_DEPARTMENT_MAP } from '@/lib/constants';
import { IssueCategory } from '@/lib/types';

const categories = Object.keys(CATEGORY_CONFIG) as IssueCategory[];

export default function SettingsPage() {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [mappings, setMappings] = useState<Record<IssueCategory, string>>(CATEGORY_DEPARTMENT_MAP);
  const [originalMappings, setOriginalMappings] = useState<Record<IssueCategory, string>>(CATEGORY_DEPARTMENT_MAP);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings/mappings').then(response => response.ok ? response.json() : null).then(data => {
      if (!data) return;
      const validMappings = Object.fromEntries(categories.map(category => [
        category,
        data.mappings[category] || CATEGORY_DEPARTMENT_MAP[category],
      ])) as Record<IssueCategory, string>;
      setMappings(validMappings);
      setOriginalMappings(validMappings);
      setDepartments(data.departments || []);
    }).catch(() => undefined);
  }, []);

  const saveMappings = async () => {
    setSaveError('');
    const response = await fetch('/api/admin/settings/mappings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mappings }),
    });
    const result = await response.json();
    if (!response.ok) {
      setSaveError(result.error || 'Unable to save category mappings.');
      return;
    }
    setOriginalMappings(mappings);
    setIsEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  const cancelEditing = () => {
    setMappings(originalMappings);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600">Configure global platform preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category to Department Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category} className="grid grid-cols-1 sm:grid-cols-[1fr_minmax(220px,320px)] items-center gap-3 py-3 border-b border-slate-100">
                <span className="font-medium text-slate-700">{CATEGORY_CONFIG[category].label}</span>
                {isEditing ? (
                  <Select
                    aria-label={`Department for ${CATEGORY_CONFIG[category].label}`}
                    value={mappings[category]}
                    onChange={event => setMappings(current => ({ ...current, [category]: event.target.value }))}
                    options={departments.map(department => ({ value: department.id, label: department.name }))}
                  />
                ) : (
                  <span className="justify-self-start sm:justify-self-end text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded">
                    {departments.find(department => department.id === mappings[category])?.name || 'Department'}
                  </span>
                )}
              </div>
            ))}
            {isEditing ? (
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
                <Button variant="primary" onClick={saveMappings}>Save Mappings</Button>
              </div>
            ) : (
              <div className="pt-3">
                {saved && <p role="status" className="mb-3 text-sm text-green-700">Category mappings saved. New reports will use these departments.</p>}
                {saveError && <p role="alert" className="mb-3 text-sm text-red-700">{saveError}</p>}
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>Edit Mappings</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" defaultChecked />
              <span className="text-sm text-slate-700">Email admins on Critical issues</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" defaultChecked />
              <span className="text-sm text-slate-700">Daily summary report</span>
            </label>
            <Button variant="primary" className="mt-4">Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
