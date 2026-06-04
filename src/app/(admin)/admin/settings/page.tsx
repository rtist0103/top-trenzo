import {
  getSiteSettings,
} from "@/features/settings/repositories/settings.repositories";

import {
  saveSettings,
} from "@/features/settings/actions/settings.actions";

import {
  SettingsForm,
} from "@/features/settings/components/settings-form";

export default async function SettingsPage() {
  const settings =
    await getSiteSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your site configuration and preferences.
        </p>
      </div>

      <SettingsForm
        settings={settings}
        saveSettings={
          saveSettings
        }
      />
    </div>
  );
}