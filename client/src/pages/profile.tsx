import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, User, BookOpen, Bookmark, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      // Update local auth context by re-fetching
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
            <Button className="bg-galactic-orange text-space-black font-orbitron">Sign In</Button>
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
        <div className="mb-10 flex items-center gap-6">
          <Avatar className="w-24 h-24 border-2 border-galactic-orange">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange text-2xl font-orbitron">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-orbitron font-bold gradient-text">
              {user.displayName || user.username}
            </h1>
            <p className="text-gray-400 mt-1">@{user.username}</p>
            <Badge className="mt-2 bg-galactic-orange/20 text-galactic-orange border-galactic-orange/30 font-orbitron text-xs">
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Profile form */}
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
              <Label className="text-galactic-orange font-orbitron text-sm">Avatar URL</Label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
              />
            </div>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold"
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

        {/* Quick links */}
        <div className="flex flex-wrap gap-3">
          <Link href="/blog/new">
            <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-sm">
              <BookOpen className="w-4 h-4 mr-2" /> Write a Post
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-sm">
              <MessageCircle className="w-4 h-4 mr-2" /> Messages
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
