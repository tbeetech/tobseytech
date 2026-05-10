import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Zap, Bell, Database, Save } from "lucide-react";

interface SettingsSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
        <Icon className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminSpeedCrackerSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    enableNsfwFilter: true,
    enableDuplicateFilter: true,
    autoApprove: false,
    notifyOnPending: true,
    maxItemsPerCampaign: 100,
    defaultApprovalMode: "manual",
    publishToVlogByDefault: false,
    publishToBlogByDefault: true,
    enableAiReshaping: true,
    defaultRewriteIntensity: 5,
    enableSeoOptimization: true,
    enableViralOptimization: false,
  });

  const set = (key: keyof typeof settings, value: boolean | number | string) => {
    setSettings((p) => ({ ...p, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Speed Cracker settings have been updated.",
    });
  };

  if (user?.role !== "admin") return null;

  return (
    <SpeedCrackerLayout title="Settings" subtitle="Configure Speed Cracker system behaviour">
      {/* Content Moderation */}
      <SettingsSection title="Content Moderation" icon={Shield}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">NSFW Filter</Label>
              <p className="text-xs text-gray-400">Automatically filter out explicit content</p>
            </div>
            <Switch
              checked={settings.enableNsfwFilter}
              onCheckedChange={(v) => set("enableNsfwFilter", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Duplicate Filter</Label>
              <p className="text-xs text-gray-400">Prevent the same content from being published twice</p>
            </div>
            <Switch
              checked={settings.enableDuplicateFilter}
              onCheckedChange={(v) => set("enableDuplicateFilter", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Auto-Approve Content</Label>
              <p className="text-xs text-gray-400 text-red-300">⚠ Bypasses manual review — use with caution</p>
            </div>
            <Switch
              checked={settings.autoApprove}
              onCheckedChange={(v) => set("autoApprove", v)}
            />
          </div>
        </div>
      </SettingsSection>

      {/* AI Configuration */}
      <SettingsSection title="AI Reshaping" icon={Zap}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Enable AI Reshaping</Label>
              <p className="text-xs text-gray-400">Use Gemini AI to rewrite content automatically</p>
            </div>
            <Switch
              checked={settings.enableAiReshaping}
              onCheckedChange={(v) => set("enableAiReshaping", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">SEO Optimization</Label>
              <p className="text-xs text-gray-400">Add SEO-friendly titles, meta descriptions and keywords</p>
            </div>
            <Switch
              checked={settings.enableSeoOptimization}
              onCheckedChange={(v) => set("enableSeoOptimization", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Viral Optimization</Label>
              <p className="text-xs text-gray-400">Optimize content for maximum engagement and virality</p>
            </div>
            <Switch
              checked={settings.enableViralOptimization}
              onCheckedChange={(v) => set("enableViralOptimization", v)}
            />
          </div>
          <div>
            <Label className="text-white text-sm">Default Rewrite Intensity</Label>
            <p className="text-xs text-gray-400 mb-2">1 = light touch, 10 = full rewrite</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={settings.defaultRewriteIntensity}
                onChange={(e) => set("defaultRewriteIntensity", Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white text-sm font-bold w-4">{settings.defaultRewriteIntensity}</span>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Publishing defaults */}
      <SettingsSection title="Publishing Defaults" icon={Database}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Auto-create Blog Draft</Label>
              <p className="text-xs text-gray-400">Automatically create a blog draft when content is approved</p>
            </div>
            <Switch
              checked={settings.publishToBlogByDefault}
              onCheckedChange={(v) => set("publishToBlogByDefault", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Auto-create Vlog Entry</Label>
              <p className="text-xs text-gray-400">Automatically create a vlog entry for video content</p>
            </div>
            <Switch
              checked={settings.publishToVlogByDefault}
              onCheckedChange={(v) => set("publishToVlogByDefault", v)}
            />
          </div>
          <div>
            <Label className="text-white text-sm">Default Approval Mode</Label>
            <select
              value={settings.defaultApprovalMode}
              onChange={(e) => set("defaultApprovalMode", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 mt-1 text-sm"
            >
              <option value="manual">Manual — admin reviews each item</option>
              <option value="semi_automatic">Semi-automatic — AI scores, admin approves above threshold</option>
              <option value="fully_automatic">Fully automatic — AI approves immediately</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" icon={Bell}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Notify on Pending Content</Label>
              <p className="text-xs text-gray-400">Send admin notification when content is queued for review</p>
            </div>
            <Switch
              checked={settings.notifyOnPending}
              onCheckedChange={(v) => set("notifyOnPending", v)}
            />
          </div>
        </div>
      </SettingsSection>

      <Button
        onClick={handleSave}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Settings
      </Button>
    </SpeedCrackerLayout>
  );
}
