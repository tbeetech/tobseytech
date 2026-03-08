import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, User, BookOpen, Bookmark, MessageCircle, PenLine } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["/api/user/bookmarks"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch("/api/user/bookmarks", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/user/profile", {
        displayName: displayName || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      window.location.reload();
      toast({ title: "Profile updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  if (authLoading) {
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
          <p className="text-gray-400 mb-4">You need to be signed in to view your profile.</p>
          <Link href="/auth">
            <Button className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = (user.displayName || user.username).slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">

        {/* Avatar + name header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-2 border-galactic-orange/40 animate-glow overflow-hidden">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={user.avatarUrl || ""} className="object-cover" />
                <AvatarFallback
                  className="rounded-none text-2xl font-orbitron font-bold"
                  style={{ background: "rgba(255,165,0,0.15)", color: "var(--galactic-orange)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Decorative ring */}
            <div className="absolute -inset-2 rounded-2xl border border-galactic-orange/15 animate-pulse-slow pointer-events-none" />
          </div>
          <div>
            <h1 className="text-3xl font-orbitron font-bold gradient-text">
              {user.displayName || user.username}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">@{user.username}</p>
            <span className="badge-neon badge-orange mt-2 inline-block">{user.role}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="stat-card">
            <p className="text-2xl font-orbitron font-bold text-galactic-orange">
              {bookmarks.length}
            </p>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-wide">Bookmarks</p>
          </div>
          <div className="stat-card">
            <p className="text-2xl font-orbitron font-bold text-neon-cyan">∞</p>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-wide">Posts Read</p>
          </div>
          <div className="stat-card col-span-2 sm:col-span-1">
            <p className="text-2xl font-orbitron font-bold text-galactic-gold capitalize">{user.role}</p>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-wide">Account Type</p>
          </div>
        </div>

        {/* Edit Profile form */}
        <div className="glass-effect rounded-xl p-7 mb-6">
          <h2 className="text-lg font-orbitron font-bold text-galactic-orange mb-6 flex items-center gap-2">
            <User className="w-5 h-5" /> Edit Profile
          </h2>
          <div className="space-y-5">
            <div className="space-y-1.5 input-glow">
              <Label className="text-galactic-orange/80 font-orbitron text-xs uppercase tracking-wide">
                Display Name
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={user.username}
                className="border-galactic-orange/20 text-white"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>
            <div className="space-y-1.5 input-glow">
              <Label className="text-galactic-orange/80 font-orbitron text-xs uppercase tracking-wide">
                Bio
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                rows={4}
                className="border-galactic-orange/20 text-white resize-none"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>
            <div className="space-y-1.5 input-glow">
              <Label className="text-galactic-orange/80 font-orbitron text-xs uppercase tracking-wide">
                Avatar URL
              </Label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="border-galactic-orange/20 text-white"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold hover:shadow-[0_0_20px_rgba(255,165,0,0.3)] transition-all"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Bookmarks section */}
        <div className="glass-effect rounded-xl p-7 mb-6">
          <h2 className="text-lg font-orbitron font-bold text-galactic-orange mb-6 flex items-center gap-2">
            <Bookmark className="w-5 h-5" /> Saved Posts
            <span className="badge-neon badge-orange ml-1">{bookmarks.length}</span>
          </h2>
          {bookmarks.length === 0 ? (
            <div className="text-center py-6">
              <Bookmark className="w-8 h-8 text-galactic-orange/20 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No bookmarks yet.{" "}
                <Link href="/blog" className="text-galactic-orange hover:text-galactic-gold transition-colors">
                  Browse the blog
                </Link>{" "}
                to save posts.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div className="comment-card flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-galactic-orange transition-colors line-clamp-1">
                        {post.title}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{post.category}</p>
                    </div>
                    <BookOpen className="w-4 h-4 text-galactic-orange/40 group-hover:text-galactic-orange transition-colors flex-shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3">
          <Link href="/blog/new">
            <button className="action-btn">
              <PenLine className="w-4 h-4" /> Write a Post
            </button>
          </Link>
          <Link href="/chat">
            <button className="action-btn">
              <MessageCircle className="w-4 h-4" /> Messages
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
