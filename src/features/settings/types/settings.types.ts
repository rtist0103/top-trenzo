export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;

  label: string;
  description?: string | null;

  category: string;
  input_type: string;

  is_public: boolean;
}

export type SettingsMap =
  Record<string, string>;