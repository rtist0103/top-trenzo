"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Save, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent }
from "@/components/ui/tabs";
import { Textarea }
from "@/components/ui/textarea";

type Setting = {
  key: string;
  label: string;
  category: string;
  value: string | null;
  input_type: string;
};

type Props = {
  settings: Setting[];

  saveSettings: (
    formData: FormData,
  ) => Promise<{
    success: boolean;
  }>;
};

export function SettingsForm({
  settings,
  saveSettings,
}: Props) {
  const [pending, startTransition] =
    useTransition();

  const grouped = settings.reduce(
  (
    acc: Record<
      string,
      Setting[]
    >,
    setting,
  ) => {
    const category =
      setting.category;

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(
      setting,
    );

    return acc;
  },
  {},
);

  async function action(
    formData: FormData,
  ) {
    startTransition(async () => {
      try {
        const result = await saveSettings(formData);

        if (result.success) {
          toast.success(
            "Settings saved successfully",
          );
        } else {
          toast.error(
            "Failed to save settings",
          );
        }
      } catch {
        toast.error(
          "Failed to save settings",
        );
      }
    });
  }

  function renderField(
    setting: Setting,
  ) {
    const common = {
      id: setting.key,
      name: setting.key,
      defaultValue:
        setting.value ?? "",
    };

    switch (
      setting.input_type
    ) {
      case "textarea":
        return (
          <Textarea
            {...common}
            rows={4}
            className="resize-none"
          />
        );

      case "color":
        return (
          <div className="flex items-center gap-3">
            <Input
              {...common}
              type="color"
              className="w-20 h-10 cursor-pointer"
            />
            <Input
              {...common}
              type="text"
              placeholder="#000000"
              className="flex-1 font-mono text-sm"
            />
          </div>
        );

      default:
        return (
          <Input
            {...common}
            type={
              setting.input_type
            }
          />
        );
    }
  }

  const categoryInfo: Record<string, { title: string; description: string; icon: typeof Settings2 }> = {
    general: { title: "General", description: "Basic site information", icon: Settings2 },
    seo: { title: "SEO", description: "Search engine optimization", icon: Settings2 },
    social: { title: "Social", description: "Social media integration", icon: Settings2 },
    homepage: { title: "Homepage", description: "Homepage configuration", icon: Settings2 },
    theme: { title: "Theme", description: "Visual appearance", icon: Settings2 },
    analytics: { title: "Analytics", description: "Tracking and analytics", icon: Settings2 },
  };

  return (
    <form
      action={action}
      className="space-y-6"
    >
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          {Object.keys(grouped).map((category) => {
            const info = categoryInfo[category] || { title: category, description: "" };
            return (
              <TabsTrigger key={category} value={category} className="whitespace-nowrap">
                {info.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(grouped)
          .map(([category, items]) => {
            const info = categoryInfo[category] || { title: category, description: "" };
            return (
              <TabsContent
                key={category}
                value={category}
                className="space-y-0"
              >
                <Card>
                  <div className="p-5 border-b">
                    <h2 className="font-semibold text-base">{info.title}</h2>
                    {info.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {info.description}
                      </p>
                    )}
                  </div>

                  <div className="p-6 space-y-6">
                    {items?.map(
                      (setting) => (
                        <div
                          key={
                            setting.key
                          }
                          className="space-y-2"
                        >
                          <Label htmlFor={setting.key} className="text-sm font-medium">
                            {
                              setting.label
                            }
                          </Label>

                          {renderField(
                            setting,
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </Card>
              </TabsContent>
            );
          })}
      </Tabs>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          Changes will be applied immediately after saving.
        </p>
        <Button
          type="submit"
          disabled={pending}
          size="default"
        >
          <Save className="mr-2 h-4 w-4" />
          {pending
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}