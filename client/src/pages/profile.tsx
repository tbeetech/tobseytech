import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import AchievementBadges from "@/components/AchievementBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Loader2, Save, User, BookOpen, Bookmark, MessageCircle, Camera, UserPlus, Check,
  Shield, Lock, Eye, EyeOff, AlertTriangle, LogOut, ChevronDown, ChevronUp, Database, Bell, Activity,
} from "lucide-react";
import { Link, useRoute } from "wouter";

interface SafeUser {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  role: "user" | "admin";
  createdAt: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we're viewing a specific user's profile
  const [, paramsUser] = useRoute("/profile/:userId");
  const profileUserId = paramsUser?.userId ?? user?.id;
  const isOwnProfile = !paramsUser?.userId || paramsUser.userId === user?.id;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Privacy & Security state
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [activePrivacyTab, setActivePrivacyTab] = useState<"security" | "privacy" | "data">("security");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [profilePublic, setProfilePublic] = useState(() => {
    try { return localStorage.getItem("tobseytech_profilePublic") !== "false"; } catch { return true; }
  });
  const [activityVisible, setActivityVisible] = useState(() => {
    try { return localStorage.getItem("tobseytech_activityVisible") !== "false"; } catch { return true; }
  });
  const [emailNotifications, setEmailNotifications] = useState(() => {
    try { return localStorage.getItem("tobseytech_emailNotifications") !== "false"; } catch { return true; }
  });
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  // Fetch profile of the viewed user
  const { data: viewedUser, isLoading: viewedLoading } = useQuery<SafeUser>({
    queryKey: ["/api/users", profileUserId],
    queryFn: async () => {
      if (!profileUserId) return undefined;
      const res = await fetch(`/api/users/${profileUserId}`, { credentials: "include" });
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!profileUserId && !!user,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["/api/user/bookmarks"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/user/bookmarks", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && isOwnProfile,
  });

  const { data: friendshipStatus } = useQuery({
    queryKey: ["/api/friends/status", profileUserId],
    queryFn: async () => {
      if (!profileUserId) return null;
      const res = await fetch(`/api/friends/status/${profileUserId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!profileUserId && !!user && !isOwnProfile,
  });

  const addFriendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/friends/request", { addresseeId: profileUserId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Friend request sent!" });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/status", profileUserId] });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to send request", variant: "destructive" });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/user/profile", {
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarPreview || avatarUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileUserId] });
      setAvatarPreview(null);
      toast({ title: "Profile updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/change-password", { currentPassword, newPassword });
      return res.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password changed successfully!" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to change password", variant: "destructive" });
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate();
  };

  const handlePrivacyToggle = (key: string, value: boolean) => {
    try { localStorage.setItem(`tobseytech_${key}`, String(value)); } catch { /* ignore */ }
    if (key === "profilePublic") setProfilePublic(value);
    if (key === "activityVisible") setActivityVisible(value);
    if (key === "emailNotifications") setEmailNotifications(value);
  };

  const handleSignOutAllDevices = () => {
    if (!signOutConfirm) { setSignOutConfirm(true); return; }
    logout();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please select an image under 2MB", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
      setUploadingAvatar(false);
    };
    reader.onerror = () => {
      toast({ title: "Failed to read file", variant: "destructive" });
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  if (authLoading || (!!profileUserId && viewedLoading && !isOwnProfile)) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-28 text-center">
          <p className="text-gray-400 mb-4">You need to be signed in to view profiles.</p>
          <Link href="/auth">
            <Button className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayedUser: SafeUser | undefined = isOwnProfile
    ? ({ ...user, createdAt: (user as any).createdAt ?? "" } as SafeUser)
    : viewedUser;

  if (!displayedUser) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-28 text-center">
          <p className="text-gray-400">User not found.</p>
        </div>
      </div>
    );
  }

  const initials = (displayedUser.displayName || displayedUser.username).slice(0, 2).toUpperCase();
  const currentAvatarSrc = isOwnProfile
    ? (avatarPreview || user.avatarUrl || "")
    : (displayedUser.avatarUrl || "");

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">
        {/* Profile header */}
        <div className="mb-10 flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-galactic-orange">
              <AvatarImage src={currentAvatarSrc} />
              <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange text-2xl font-orbitron">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Change avatar"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-galactic-orange" />
                  ) : (
                    <Camera className="w-6 h-6 text-galactic-orange" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-orbitron font-bold gradient-text">
              {displayedUser.displayName || displayedUser.username}
            </h1>
            <p className="text-gray-400 mt-1">@{displayedUser.username}</p>
            <Badge className="mt-2 bg-galactic-orange/20 text-galactic-orange border-galactic-orange/30 font-orbitron text-xs">
              {displayedUser.role}
            </Badge>
            {displayedUser.bio && !isOwnProfile && (
              <p className="text-gray-300 text-sm mt-2 max-w-md">{displayedUser.bio}</p>
            )}
          </div>
        </div>

        {/* Other user: action buttons */}
        {!isOwnProfile && (
          <div className="flex gap-3 mb-8">
            <Link href="/chat">
              <Button
                variant="outline"
                className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Message
              </Button>
            </Link>
            {!friendshipStatus && (
              <Button
                onClick={() => addFriendMutation.mutate()}
                disabled={addFriendMutation.isPending}
                className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold text-sm"
              >
                {addFriendMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Add Friend
              </Button>
            )}
            {friendshipStatus?.status === "pending" && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-3 py-1">
                Request Pending
              </Badge>
            )}
            {friendshipStatus?.status === "accepted" && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Friends
              </Badge>
            )}
          </div>
        )}

        {/* Own profile: edit form */}
        {isOwnProfile && (
          <div className="glass-effect rounded-xl p-8 mb-8">
            <h2 className="text-xl font-orbitron font-bold text-galactic-orange mb-6 flex items-center gap-2">
              <User className="w-5 h-5" /> Edit Profile
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-galactic-orange font-orbitron text-sm">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={user.username}
                  className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-galactic-orange font-orbitron text-sm">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself..."
                  rows={4}
                  className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-galactic-orange font-orbitron text-sm">Avatar URL (optional)</Label>
                <p className="text-gray-500 text-xs">Or hover over your avatar above to upload a photo directly</p>
                <Input
                  value={avatarUrl}
                  onChange={(e) => { setAvatarUrl(e.target.value); setAvatarPreview(null); }}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
                />
              </div>
              {avatarPreview && (
                <p className="text-green-400 text-xs flex items-center gap-1">
                  <Camera className="w-3 h-3" /> New photo selected — click Save Changes to apply
                </p>
              )}
              <Button
                onClick={() => profileMutation.mutate()}
                disabled={profileMutation.isPending}
                className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold"
              >
                {profileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* ──────────── Privacy & Security (own profile only) ──────────── */}
        {isOwnProfile && (
          <div id="privacy-security" className="glass-effect rounded-xl mb-8 overflow-hidden">
            {/* Section header — acts as collapsible toggle */}
            <button
              onClick={() => setPrivacyOpen((v) => !v)}
              className="w-full flex items-center justify-between p-6 text-left group"
            >
              <h2 className="text-xl font-orbitron font-bold text-galactic-orange flex items-center gap-2">
                <Shield className="w-5 h-5" /> Privacy &amp; Security
              </h2>
              <span className="text-galactic-orange/60 group-hover:text-galactic-orange transition-colors">
                {privacyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </span>
            </button>

            {privacyOpen && (
              <div className="px-6 pb-6">
                {/* Tab navigation */}
                <div className="flex gap-1 mb-6 bg-space-dark rounded-lg p-1">
                  {(["security", "privacy", "data"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePrivacyTab(tab)}
                      className={`flex-1 py-2 px-3 rounded-md font-orbitron text-xs transition-all capitalize ${
                        activePrivacyTab === tab
                          ? "bg-galactic-orange text-space-black font-bold"
                          : "text-galactic-orange/60 hover:text-galactic-orange"
                      }`}
                    >
                      {tab === "security" && <Lock className="w-3 h-3 inline mr-1" />}
                      {tab === "privacy" && <Eye className="w-3 h-3 inline mr-1" />}
                      {tab === "data" && <Database className="w-3 h-3 inline mr-1" />}
                      {tab}
                    </button>
                  ))}
                </div>

                {/* ── Security tab ── */}
                {activePrivacyTab === "security" && (
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div className="bg-space-dark rounded-xl p-5 border border-galactic-orange/10">
                      <h3 className="font-orbitron font-bold text-white mb-1 flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4 text-galactic-orange" /> Change Password
                      </h3>
                      <p className="text-gray-500 text-xs mb-4">
                        Use a strong, unique password you don't use anywhere else.
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-gray-400 text-xs">Current Password</Label>
                          <div className="relative">
                            <Input
                              type={showCurrentPw ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                              className="bg-space-black border-galactic-orange/20 text-white focus:border-galactic-orange pr-10 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-galactic-orange"
                            >
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-400 text-xs">New Password</Label>
                          <div className="relative">
                            <Input
                              type={showNewPw ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min. 6 characters"
                              className="bg-space-black border-galactic-orange/20 text-white focus:border-galactic-orange pr-10 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-galactic-orange"
                            >
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-400 text-xs">Confirm New Password</Label>
                          <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="bg-space-black border-galactic-orange/20 text-white focus:border-galactic-orange text-sm"
                          />
                        </div>
                        <Button
                          onClick={handleChangePassword}
                          disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                          size="sm"
                          className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold text-xs"
                        >
                          {changePasswordMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Lock className="w-3 h-3 mr-1" />
                          )}
                          Update Password
                        </Button>
                      </div>
                    </div>

                    {/* Active Session */}
                    <div className="bg-space-dark rounded-xl p-5 border border-galactic-orange/10">
                      <h3 className="font-orbitron font-bold text-white mb-1 flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-galactic-orange" /> Active Session
                      </h3>
                      <p className="text-gray-500 text-xs mb-4">
                        You are currently signed in on this device. Sign out to end your session everywhere.
                      </p>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-green-400 text-xs font-orbitron">Current session — active now</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">This device</Badge>
                      </div>
                      <Button
                        onClick={handleSignOutAllDevices}
                        variant="outline"
                        size="sm"
                        className={`font-orbitron text-xs border-red-500/40 hover:bg-red-500/10 transition-colors ${signOutConfirm ? "text-red-400 border-red-500" : "text-galactic-orange/70"}`}
                      >
                        <LogOut className="w-3 h-3 mr-1" />
                        {signOutConfirm ? "Confirm — Sign Out Now?" : "Sign Out of All Devices"}
                      </Button>
                      {signOutConfirm && (
                        <button
                          onClick={() => setSignOutConfirm(false)}
                          className="ml-3 text-gray-500 text-xs hover:text-white"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Privacy tab ── */}
                {activePrivacyTab === "privacy" && (
                  <div className="space-y-4">
                    {/* Profile Visibility */}
                    <div className="bg-space-dark rounded-xl p-5 border border-galactic-orange/10">
                      <h3 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-galactic-orange" /> Profile Visibility
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Public Profile</p>
                            <p className="text-gray-500 text-xs mt-0.5">Allow other members to view your profile and bio</p>
                          </div>
                          <Switch
                            checked={profilePublic}
                            onCheckedChange={(v) => handlePrivacyToggle("profilePublic", v)}
                            className="data-[state=checked]:bg-galactic-orange"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Activity Visibility</p>
                            <p className="text-gray-500 text-xs mt-0.5">Show your posts and interactions to other members</p>
                          </div>
                          <Switch
                            checked={activityVisible}
                            onCheckedChange={(v) => handlePrivacyToggle("activityVisible", v)}
                            className="data-[state=checked]:bg-galactic-orange"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">Email Notifications</p>
                            <p className="text-gray-500 text-xs mt-0.5">Receive platform updates and activity alerts by email</p>
                          </div>
                          <Switch
                            checked={emailNotifications}
                            onCheckedChange={(v) => handlePrivacyToggle("emailNotifications", v)}
                            className="data-[state=checked]:bg-galactic-orange"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Friend Requests */}
                    <div className="bg-space-dark rounded-xl p-5 border border-galactic-orange/10">
                      <h3 className="font-orbitron font-bold text-white mb-1 flex items-center gap-2 text-sm">
                        <Bell className="w-4 h-4 text-galactic-orange" /> Communication Preferences
                      </h3>
                      <p className="text-gray-500 text-xs mb-3">
                        You control who can connect and message you. Friend requests require your approval before
                        anyone can reach your inbox.
                      </p>
                      <Badge className="bg-galactic-orange/10 text-galactic-orange border-galactic-orange/30 text-xs">
                        Friend-request approval: enabled by default
                      </Badge>
                    </div>
                  </div>
                )}

                {/* ── Data tab ── */}
                {activePrivacyTab === "data" && (
                  <div className="space-y-4">
                    <div className="bg-space-dark rounded-xl p-5 border border-galactic-orange/10">
                      <h3 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2 text-sm">
                        <Database className="w-4 h-4 text-galactic-orange" /> Data We Collect
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-400">
                        {[
                          { label: "Account info", detail: "Username, email, display name, bio, avatar" },
                          { label: "Content you create", detail: "Blog posts, comments, messages you send" },
                          { label: "Platform activity", detail: "Likes, bookmarks, friend connections" },
                          { label: "Session data", detail: "Temporary session cookie to keep you signed in — cleared on logout" },
                        ].map(({ label, detail }) => (
                          <li key={label} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-galactic-orange shrink-0 mt-0.5" />
                            <span><span className="text-white font-medium">{label}:</span> {detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-space-dark rounded-xl p-5 border border-galactic-orange/10">
                      <h3 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-galactic-orange" /> What We Don't Do
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-400">
                        {[
                          "We do not sell your personal data to third parties",
                          "We do not use behavioral advertising or tracking pixels",
                          "We do not share your email with outside organizations",
                          "Passwords are hashed with bcrypt — we never store them in plain text",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="text-galactic-orange shrink-0 mt-0.5">✕</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/20">
                      <h3 className="font-orbitron font-bold text-red-400 mb-1 flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4" /> Danger Zone
                      </h3>
                      <p className="text-gray-500 text-xs mb-3">
                        Want to close your account? Contact support or sign out and stop using the platform.
                        Your public posts may be retained for platform integrity unless you manually delete them first.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logout()}
                        className="font-orbitron text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-3 h-3 mr-1" /> Sign Out Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks section (own profile only) */}
        {isOwnProfile && (
          <div className="glass-effect rounded-xl p-8 mb-8">
            <h2 className="text-xl font-orbitron font-bold text-galactic-orange mb-6 flex items-center gap-2">
              <Bookmark className="w-5 h-5" /> Saved Posts ({bookmarks.length})
            </h2>
            {bookmarks.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No bookmarks yet.{" "}
                <Link href="/blog" className="text-galactic-orange hover:underline">
                  Browse the blog
                </Link>{" "}
                to save posts.
              </p>
            ) : (
              <div className="space-y-3">
                {bookmarks.map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-space-dark hover:bg-galactic-orange/10 transition-colors group cursor-pointer">
                      <div>
                        <p className="text-white font-medium group-hover:text-galactic-orange transition-colors line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{post.category}</p>
                      </div>
                      <BookOpen className="w-4 h-4 text-galactic-orange/50 group-hover:text-galactic-orange transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Achievement Badges (Feature 11) */}
        <div className="glass-effect rounded-xl p-8 mb-8">
          <AchievementBadges />
        </div>

        {/* Quick links (own profile) */}
        {isOwnProfile && (
          <div className="flex flex-wrap gap-3">
            <Link href="/blog/new">
              <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-sm">
                <BookOpen className="w-4 h-4 mr-2" /> Write a Post
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-sm">
                <MessageCircle className="w-4 h-4 mr-2" /> Talk
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
