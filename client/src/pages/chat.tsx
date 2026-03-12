import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Search, UserPlus, Check, X, MessageCircle, MessageSquare, Reply } from "lucide-react";
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
  replyToId?: string;
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
  const [directChatUser, setDirectChatUser] = useState<SafeUser | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const selectedUserIdRef = useRef<string | null>(selectedUserId);

  // Keep the ref in sync with state so the WS handler always reads the latest value
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // WebSocket setup for real-time messages – only reconnects when user changes,
  // not on every conversation switch, to avoid missed notifications.
  useEffect(() => {
    if (!user) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
          const currentSelectedUserId = selectedUserIdRef.current;
          if (currentSelectedUserId === data.message.senderId) {
            queryClient.invalidateQueries({ queryKey: ["/api/messages", currentSelectedUserId] });
          }
        }
      } catch (e) {
        console.warn("Failed to parse WebSocket message:", e);
      }
    };

    ws.onerror = () => {
      // WebSocket error — the onclose handler will fire next and clean up
    };

    return () => ws.close();
  }, [user, queryClient]);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages/conversations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
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
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!user && !!selectedUserId,
    refetchInterval: selectedUserId ? 5000 : false,
  });

  // Auto-scroll to the latest message whenever messages update or a new
  // conversation is selected.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const payload: Record<string, string> = {
        recipientId: selectedUserId,
        content: messageText.trim(),
      };
      if (replyingTo) {
        payload.replyToId = replyingTo.id;
      }
      const res = await apiRequest("POST", "/api/messages", payload);
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      setReplyingTo(null);
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

  // Select a conversation and cache the user object so selectedUser stays
  // resolved even during conversations-query refetches.
  const selectConversation = useCallback((u: SafeUser) => {
    setSelectedUserId(u.id);
    setDirectChatUser(u);
  }, []);

  const selectedUser =
    friends.find((f) => f.id === selectedUserId) ||
    conversations.find((c) => c.user.id === selectedUserId)?.user ||
    (directChatUser?.id === selectedUserId ? directChatUser : null);

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
                <Search className="w-4 h-4" /> Find People
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-space-dark border-galactic-orange/30 text-white text-sm focus:border-galactic-orange"
                />
              </div>
              {searchQuery.length >= 2 && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
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
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Message"
                            onClick={() => {
                              selectConversation(u);
                              setSearchQuery("");
                            }}
                            className="text-blue-400 hover:text-blue-300 h-7 px-2"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Add Friend"
                            onClick={() => addFriendMutation.mutate(u.id)}
                            disabled={addFriendMutation.isPending}
                            className="text-galactic-orange hover:text-galactic-gold h-7 px-2"
                          >
                            <UserPlus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  {searchResults.filter((u) => u.id !== user.id).length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-2">No users found</p>
                  )}
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
                <MessageCircle className="w-4 h-4" /> Talk
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1">
                {/* Show conversations first */}
                {conversations.map(({ user: u, lastMessage }) => (
                  <button
                    key={u.id}
                    onClick={() => selectConversation(u)}
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
                      onClick={() => selectConversation(f)}
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
                  <Link href={`/profile/${selectedUser.id}`}>
                    <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-galactic-orange transition-all">
                      <AvatarImage src={selectedUser.avatarUrl || ""} />
                      <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange font-orbitron">
                        {(selectedUser.displayName || selectedUser.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/profile/${selectedUser.id}`}>
                      <p className="font-orbitron font-bold text-white hover:text-galactic-orange transition-colors cursor-pointer">
                        {selectedUser.displayName || selectedUser.username}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-400">@{selectedUser.username}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    const repliedToMsg = msg.replyToId
                      ? messages.find((m) => m.id === msg.replyToId)
                      : null;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="flex items-end gap-1">
                          {/* Reply button for received messages */}
                          {!isMe && hoveredMessageId === msg.id && (
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="text-gray-500 hover:text-galactic-orange transition-colors mb-1 shrink-0"
                              title="Reply"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                              isMe
                                ? "bg-galactic-orange text-space-black rounded-br-sm"
                                : "bg-white/10 text-white rounded-bl-sm"
                            }`}
                          >
                            {/* Quoted reply context */}
                            {repliedToMsg && (
                              <div
                                className={`mb-2 px-2 py-1 rounded text-xs border-l-2 ${
                                  isMe
                                    ? "border-space-black/40 bg-space-black/20 text-space-black/70"
                                    : "border-galactic-orange/50 bg-white/5 text-gray-400"
                                }`}
                              >
                                <span className="font-semibold">
                                  {repliedToMsg.senderId === user.id ? "You" : selectedUser?.displayName || selectedUser?.username || "Unknown"}
                                </span>
                                <p className="truncate">{repliedToMsg.content}</p>
                              </div>
                            )}
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? "text-space-black/60" : "text-gray-500"}`}>
                              {format(new Date(msg.createdAt), "HH:mm")}
                            </p>
                          </div>
                          {/* Reply button for sent messages */}
                          {isMe && hoveredMessageId === msg.id && (
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="text-gray-500 hover:text-galactic-orange transition-colors mb-1 shrink-0"
                              title="Reply"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply preview bar */}
                {replyingTo && (
                  <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Reply className="w-4 h-4 text-galactic-orange shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-galactic-orange font-medium">
                          Replying to{" "}
                          {replyingTo.senderId === user.id
                            ? "yourself"
                            : selectedUser?.displayName || selectedUser?.username || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{replyingTo.content}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-500 hover:text-white shrink-0"
                      title="Cancel reply"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-white/10 flex gap-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !sendMessageMutation.isPending) {
                        sendMessageMutation.mutate();
                      }
                    }}
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
                  Search for any user and tap the Message button to chat directly, or add them as a friend first.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
