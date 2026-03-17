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
import { Loader2, Save, User, BookOpen, Bookmark, MessageCircle, Camera, UserPlus, Check } from "lucide-react";
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
