import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Lock,
  Users,
  FileText,
  Mail,
  LayoutDashboard,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  BarChart3,
  RefreshCw,
  Search,
  Share2,
  Rss,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { SharePostDialog } from "@/components/share-post-dialog";
import PostFetcherTab from "@/components/PostFetcherTab";

interface SafeUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  role: "user" | "admin";
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  authorName: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  status: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalContacts: number;
  newContacts: number;
}

interface EditSuggestion {
  id: string;
  postId: string;
  username: string;
  suggestedTitle?: string;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [dashPassword, setDashPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Verify admin dashboard password
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await apiRequest("POST", "/api/admin/verify-password", { password: dashPassword });
      setIsVerified(true);
    } catch (err: any) {
      toast({ title: "Access Denied", description: err.message || "Invalid dashboard password", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  // Dashboard data queries (only fetched when verified)
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isVerified,
  });

  const { data: allUsers = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isVerified,
  });

  const { data: allPosts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/all"],
    queryFn: async () => {
      const res = await fetch("/api/blog/all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isVerified,
  });

  const { data: contacts = [], isLoading: contactsLoading, refetch: refetchContacts } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    queryFn: async () => {
      const res = await fetch("/api/admin/contacts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isVerified,
  });

  const { data: suggestions = [], isLoading: suggestionsLoading, refetch: refetchSuggestions } = useQuery<EditSuggestion[]>({
    queryKey: ["/api/admin/suggestions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/suggestions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isVerified,
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "user" | "admin" }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated!" });
    },
    onError: () => toast({ title: "Failed to update role", variant: "destructive" }),
  });

  const publishPostMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await apiRequest("PATCH", `/api/blog/${id}`, { published });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Post updated!" });
    },
    onError: () => toast({ title: "Failed to update post", variant: "destructive" }),
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/blog/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Post deleted!" });
    },
    onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
  });

  const updateContactStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/contacts/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Status updated!" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const reviewSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const res = await apiRequest("PATCH", `/api/suggestions/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/suggestions"] });
      toast({ title: "Suggestion reviewed!" });
    },
    onError: () => toast({ title: "Failed to review suggestion", variant: "destructive" }),
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-28 text-center">
          <p className="text-gray-400 mb-4">You need to be signed in.</p>
          <Link href="/auth">
            <Button className="bg-galactic-orange text-space-black font-orbitron">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Not admin
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-28 text-center">
          <Shield className="w-16 h-16 text-galactic-orange/30 mx-auto mb-4" />
          <h1 className="text-2xl font-orbitron font-bold text-galactic-orange mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Only administrators can access the dashboard.</p>
          <Link href="/">
            <Button className="bg-galactic-orange text-space-black font-orbitron">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Admin password gate
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 border-2 border-galactic-orange rounded-full flex items-center justify-center bg-gradient-to-br from-galactic-orange to-galactic-gold mx-auto mb-4 shadow-[0_0_30px_rgba(255,165,0,0.5)]">
                <LayoutDashboard className="w-8 h-8 text-space-black" />
              </div>
              <h1 className="text-3xl font-orbitron font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-gray-400 mt-2">Enter the dashboard access password</p>
            </div>
            <div className="glass-effect rounded-2xl p-8">
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-galactic-orange font-orbitron text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Dashboard Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={dashPassword}
                      onChange={(e) => setDashPassword(e.target.value)}
                      required
                      className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11 pr-10"
                      placeholder="Enter dashboard password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-galactic-orange transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={verifying}
                  className="w-full h-11 bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all"
                >
                  {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Dashboard
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold gradient-text flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-galactic-orange" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user.displayName || user.username}</p>
          </div>
          <Badge className="bg-galactic-orange/20 text-galactic-orange border-galactic-orange/30 font-orbitron">
            <Shield className="w-3 h-3 mr-1" /> Admin
          </Badge>
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
              { label: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-purple-400" },
              { label: "Published", value: stats.publishedPosts, icon: CheckCircle, color: "text-green-400" },
              { label: "Drafts", value: stats.draftPosts, icon: FileText, color: "text-yellow-400" },
              { label: "Contacts", value: stats.totalContacts, icon: Mail, color: "text-pink-400" },
              { label: "New Leads", value: stats.newContacts, icon: BarChart3, color: "text-galactic-orange" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-effect rounded-xl p-4 text-center">
                <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                <p className={`text-2xl font-orbitron font-bold ${color}`}>{value}</p>
                <p className="text-gray-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="bg-space-dark rounded-xl mb-6 flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="posts" className="font-orbitron text-sm rounded-lg">
              <FileText className="w-4 h-4 mr-1" /> Posts
            </TabsTrigger>
            <TabsTrigger value="users" className="font-orbitron text-sm rounded-lg">
              <Users className="w-4 h-4 mr-1" /> Users
            </TabsTrigger>
            <TabsTrigger value="contacts" className="font-orbitron text-sm rounded-lg">
              <Mail className="w-4 h-4 mr-1" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="font-orbitron text-sm rounded-lg">
              <FileText className="w-4 h-4 mr-1" /> Suggestions
            </TabsTrigger>
            <TabsTrigger value="fetcher" className="font-orbitron text-sm rounded-lg">
              <Rss className="w-4 h-4 mr-1" /> Post Fetcher
            </TabsTrigger>
          </TabsList>

          {/* ── Posts Tab ── */}
          <TabsContent value="posts">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-orbitron font-bold text-galactic-orange flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Blog Posts
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => refetchPosts()}
                    className="text-galactic-orange hover:text-galactic-gold"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Link href="/blog/new">
                    <Button size="sm" className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold">
                      + New Post
                    </Button>
                  </Link>
                </div>
              </div>
              {postsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-galactic-orange" /></div>
              ) : allPosts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No posts yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10">
                        <th className="text-left pb-3 font-orbitron text-xs">Title</th>
                        <th className="text-left pb-3 font-orbitron text-xs hidden md:table-cell">Author</th>
                        <th className="text-left pb-3 font-orbitron text-xs hidden sm:table-cell">Date</th>
                        <th className="text-left pb-3 font-orbitron text-xs">Status</th>
                        <th className="text-right pb-3 font-orbitron text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allPosts.map((post) => (
                        <tr key={post.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-4">
                            <Link href={`/blog/${post.slug}`}>
                              <span className="text-white hover:text-galactic-orange transition-colors cursor-pointer line-clamp-1 max-w-xs block">
                                {post.title}
                              </span>
                            </Link>
                            <span className="text-gray-500 text-xs">{post.category}</span>
                          </td>
                          <td className="py-3 pr-4 hidden md:table-cell text-gray-400">{post.authorName}</td>
                          <td className="py-3 pr-4 hidden sm:table-cell text-gray-500 text-xs">
                            {format(new Date(post.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              className={post.published
                                ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"}
                            >
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1 justify-end">
                              {post.published && (
                                <SharePostDialog
                                  postSlug={post.slug}
                                  postTitle={post.title}
                                  trigger={
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-galactic-orange hover:text-galactic-gold h-7 px-2 text-xs"
                                      title="Share"
                                    >
                                      <Share2 className="w-3 h-3" />
                                    </Button>
                                  }
                                />
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => publishPostMutation.mutate({ id: post.id, published: !post.published })}
                                disabled={publishPostMutation.isPending}
                                className="text-galactic-orange hover:text-galactic-gold h-7 px-2 text-xs"
                                title={post.published ? "Unpublish" : "Publish"}
                              >
                                {post.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </Button>
                              <Link href={`/blog/edit/${post.id}`}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-400 hover:text-blue-300 h-7 px-2 text-xs"
                                >
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Delete "${post.title}"?`)) {
                                    deletePostMutation.mutate(post.id);
                                  }
                                }}
                                disabled={deletePostMutation.isPending}
                                className="text-red-400 hover:text-red-300 h-7 px-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Users Tab ── */}
          <TabsContent value="users">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-orbitron font-bold text-galactic-orange flex items-center gap-2">
                  <Users className="w-5 h-5" /> Users
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => refetchUsers()}
                  className="text-galactic-orange hover:text-galactic-gold"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              {/* User search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by username, display name, or email…"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-9 bg-space-dark border-galactic-orange/30 text-white text-sm focus:border-galactic-orange"
                />
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-galactic-orange" /></div>
              ) : allUsers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No users found.</p>
              ) : (
                (() => {
                  const q = userSearchQuery.toLowerCase().trim();
                  const filteredUsers = q
                    ? allUsers.filter(
                        (u) =>
                          u.username.toLowerCase().includes(q) ||
                          (u.displayName && u.displayName.toLowerCase().includes(q)) ||
                          (u.email && u.email.toLowerCase().includes(q))
                      )
                    : allUsers;
                  return filteredUsers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No users match "{userSearchQuery}".</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="text-left pb-3 font-orbitron text-xs">Username</th>
                            <th className="text-left pb-3 font-orbitron text-xs hidden md:table-cell">Display Name</th>
                            <th className="text-left pb-3 font-orbitron text-xs hidden sm:table-cell">Joined</th>
                            <th className="text-left pb-3 font-orbitron text-xs">Role</th>
                            <th className="text-right pb-3 font-orbitron text-xs">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                              <td className="py-3 pr-4">
                                <Link href={`/profile/${u.id}`}>
                                  <span className="text-white hover:text-galactic-orange transition-colors cursor-pointer">
                                    @{u.username}
                                  </span>
                                </Link>
                              </td>
                              <td className="py-3 pr-4 hidden md:table-cell text-gray-400">
                                {u.displayName || "—"}
                              </td>
                              <td className="py-3 pr-4 hidden sm:table-cell text-gray-500 text-xs">
                                {format(new Date(u.createdAt), "MMM d, yyyy")}
                              </td>
                              <td className="py-3 pr-4">
                                <Badge
                                  className={u.role === "admin"
                                    ? "bg-galactic-orange/20 text-galactic-orange border-galactic-orange/30 text-xs"
                                    : "bg-white/10 text-gray-300 border-white/20 text-xs"}
                                >
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1 justify-end">
                                  {u.id !== user.id && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        updateRoleMutation.mutate({
                                          id: u.id,
                                          role: u.role === "admin" ? "user" : "admin",
                                        })
                                      }
                                      disabled={updateRoleMutation.isPending}
                                      className="text-galactic-orange hover:text-galactic-gold h-7 px-2 text-xs font-orbitron"
                                    >
                                      {u.role === "admin" ? "Demote" : "Make Admin"}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>
          </TabsContent>

          {/* ── Contacts Tab ── */}
          <TabsContent value="contacts">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-orbitron font-bold text-galactic-orange flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Contact Submissions
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => refetchContacts()}
                  className="text-galactic-orange hover:text-galactic-gold"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              {contactsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-galactic-orange" /></div>
              ) : contacts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No contact submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="bg-space-dark rounded-xl p-5 border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-white">{contact.name}</p>
                          <p className="text-galactic-orange text-sm">{contact.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              contact.status === "new"
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
                                : contact.status === "in_progress"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"
                                : "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                            }
                          >
                            {contact.status}
                          </Badge>
                          <span className="text-gray-500 text-xs">
                            {format(new Date(contact.createdAt), "MMM d")}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{contact.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-white/10 text-gray-300 border-white/20 text-xs">
                          {contact.projectType}
                        </Badge>
                        {contact.status === "new" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateContactStatusMutation.mutate({ id: contact.id, status: "in_progress" })}
                            disabled={updateContactStatusMutation.isPending}
                            className="text-yellow-400 hover:text-yellow-300 h-6 px-2 text-xs"
                          >
                            Mark In Progress
                          </Button>
                        )}
                        {contact.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateContactStatusMutation.mutate({ id: contact.id, status: "resolved" })}
                            disabled={updateContactStatusMutation.isPending}
                            className="text-green-400 hover:text-green-300 h-6 px-2 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Suggestions Tab ── */}
          <TabsContent value="suggestions">
            <div className="glass-effect rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-orbitron font-bold text-galactic-orange flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Edit Suggestions
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => refetchSuggestions()}
                  className="text-galactic-orange hover:text-galactic-gold"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              {suggestionsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-galactic-orange" /></div>
              ) : suggestions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No edit suggestions yet.</p>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-space-dark rounded-xl p-5 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium">
                          By <span className="text-galactic-orange">@{suggestion.username}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              suggestion.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs"
                                : suggestion.status === "accepted"
                                ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                                : "bg-red-500/20 text-red-400 border-red-500/30 text-xs"
                            }
                          >
                            {suggestion.status}
                          </Badge>
                          <span className="text-gray-500 text-xs">
                            {format(new Date(suggestion.createdAt), "MMM d")}
                          </span>
                        </div>
                      </div>
                      {suggestion.suggestedTitle && (
                        <p className="text-gray-300 text-sm mb-1">
                          <span className="text-gray-500">Suggested title:</span> {suggestion.suggestedTitle}
                        </p>
                      )}
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        <span className="text-gray-500">Reason:</span> {suggestion.reason}
                      </p>
                      {suggestion.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reviewSuggestionMutation.mutate({ id: suggestion.id, status: "accepted" })}
                            disabled={reviewSuggestionMutation.isPending}
                            className="text-green-400 hover:text-green-300 h-7 px-3 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reviewSuggestionMutation.mutate({ id: suggestion.id, status: "rejected" })}
                            disabled={reviewSuggestionMutation.isPending}
                            className="text-red-400 hover:text-red-300 h-7 px-3 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Post Fetcher Tab ── */}
          <TabsContent value="fetcher">
            <PostFetcherTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
