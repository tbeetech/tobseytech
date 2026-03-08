import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Search, UserPlus, Check, X, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface SafeUser {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  role: "user" | "admin";
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  user: SafeUser;
  lastMessage: Message;
}

interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket setup for real-time messages
  useEffect(() => {
    if (!user) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
        if (selectedUserId === data.message.senderId) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
        }
      }
    };

    return () => ws.close();
  }, [user, selectedUserId, queryClient]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUserId]);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages/conversations", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/messages/${selectedUserId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user && !!selectedUserId,
    refetchInterval: selectedUserId ? 5000 : false,
  });

  const { data: friends = [] } = useQuery<SafeUser[]>({
    queryKey: ["/api/friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: friendRequests = [] } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
    queryFn: async () => {
      const res = await fetch("/api/friends/requests", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: searchResults = [] } = useQuery<SafeUser[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: searchQuery.length >= 2,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !messageText.trim()) return;
      const res = await apiRequest("POST", "/api/messages", {
        recipientId: selectedUserId,
        content: messageText.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      const res = await apiRequest("POST", "/api/friends/request", { addresseeId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Friend request sent!" });
      setSearchQuery("");
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to send request", variant: "destructive" });
    },
  });

  const respondRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      const res = await apiRequest("PATCH", `/api/friends/request/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  const selectedUser =
    friends.find((f) => f.id === selectedUserId) ||
    conversations.find((c) => c.user.id === selectedUserId)?.user;

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
          <p className="text-gray-400 mb-4">Sign in to use the chat.</p>
          <Link href="/auth">
            <Button className="bg-galactic-orange text-space-black font-orbitron">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-4 pt-20 pb-4 h-screen flex flex-col">
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 flex flex-col gap-4 overflow-hidden">
            {/* Search users */}
            <div className="glass-effect rounded-xl p-4">
              <h3 className="font-orbitron text-galactic-orange text-sm mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Find Friends
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-space-dark border-galactic-orange/30 text-white text-sm focus:border-galactic-orange"
                />
              </div>
              {searchQuery.length >= 2 && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {searchResults
                    .filter((u) => u.id !== user.id)
                    .map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded bg-space-dark">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={u.avatarUrl || ""} />
                            <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange text-xs">
                              {(u.displayName || u.username).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white truncate">{u.displayName || u.username}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addFriendMutation.mutate(u.id)}
                          disabled={addFriendMutation.isPending}
                          className="text-galactic-orange hover:text-galactic-gold shrink-0 h-7 px-2"
                        >
                          <UserPlus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Friend requests */}
            {friendRequests.length > 0 && (
              <div className="glass-effect rounded-xl p-4">
                <h3 className="font-orbitron text-galactic-orange text-sm mb-3">
                  Friend Requests ({friendRequests.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {friendRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2 rounded bg-space-dark">
                      <span className="text-sm text-white truncate">Request #{req.id.slice(-6)}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => respondRequestMutation.mutate({ id: req.id, status: "accepted" })}
                          className="text-green-400 hover:text-green-300 h-7 w-7 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => respondRequestMutation.mutate({ id: req.id, status: "declined" })}
                          className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations / Friends list */}
            <div className="glass-effect rounded-xl p-4 flex-1 overflow-hidden flex flex-col">
              <h3 className="font-orbitron text-galactic-orange text-sm mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Messages
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1">
                {/* Show conversations first */}
                {conversations.map(({ user: u, lastMessage }) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                      selectedUserId === u.id
                        ? "bg-galactic-orange/20 border border-galactic-orange/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={u.avatarUrl || ""} />
                      <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange text-xs font-orbitron">
                        {(u.displayName || u.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{u.displayName || u.username}</p>
                      <p className="text-xs text-gray-500 truncate">{lastMessage.content}</p>
                    </div>
                  </button>
                ))}
                {/* Friends not yet in conversations */}
                {friends
                  .filter((f) => !conversations.some((c) => c.user.id === f.id))
                  .map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedUserId(f.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                        selectedUserId === f.id
                          ? "bg-galactic-orange/20 border border-galactic-orange/40"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarImage src={f.avatarUrl || ""} />
                        <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange text-xs font-orbitron">
                          {(f.displayName || f.username).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate">{f.displayName || f.username}</p>
                        <p className="text-xs text-gray-500">Friend</p>
                      </div>
                    </button>
                  ))}
                {conversations.length === 0 && friends.length === 0 && (
                  <p className="text-gray-500 text-xs text-center py-4">
                    Add friends to start chatting
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 glass-effect rounded-xl flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedUser.avatarUrl || ""} />
                    <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange font-orbitron">
                      {(selectedUser.displayName || selectedUser.username).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-orbitron font-bold text-white">
                      {selectedUser.displayName || selectedUser.username}
                    </p>
                    <p className="text-xs text-gray-400">@{selectedUser.username}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                            isMe
                              ? "bg-galactic-orange text-space-black rounded-br-sm"
                              : "bg-white/10 text-white rounded-bl-sm"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? "text-space-black/60" : "text-gray-500"}`}>
                            {format(new Date(msg.createdAt), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessageMutation.mutate()}
                    className="flex-1 bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
                  />
                  <Button
                    onClick={() => sendMessageMutation.mutate()}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-galactic-orange text-space-black hover:bg-galactic-gold"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center px-8">
                <MessageCircle className="w-16 h-16 text-galactic-orange/30" />
                <h2 className="text-xl font-orbitron text-galactic-orange/60">Select a conversation</h2>
                <p className="text-gray-500 text-sm">
                  Search for users to add as friends and start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
