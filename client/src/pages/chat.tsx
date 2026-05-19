import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  Search,
  UserPlus,
  Check,
  CheckCheck,
  X,
  MessageCircle,
  MessageSquare,
  Reply,
  ArrowLeft,
} from "lucide-react";
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
  /** client-only: marks an optimistically inserted message */
  _pending?: true;
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

// ── Reconnecting WebSocket hook ──────────────────────────────────────────────

function useReconnectingWebSocket(
  url: string | null,
  onMessage: (data: unknown) => void,
  onOpen?: () => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const retryDelayRef = useRef(1000);
  const unmountedRef = useRef(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
  });

  useEffect(() => {
    if (!url) return;
    unmountedRef.current = false;
    retryDelayRef.current = 1000;

    function connect() {
      if (unmountedRef.current) return;
      const ws = new WebSocket(url as string);
      wsRef.current = ws;

      ws.onopen = () => {
        retryDelayRef.current = 1000; // reset back-off on successful connect
        onOpenRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data));
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        // Exponential back-off capped at 30 s
        const delay = Math.min(retryDelayRef.current, 30_000);
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30_000);
        setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      wsRef.current?.close();
    };
  }, [url]);

  return wsRef;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [directChatUser, setDirectChatUser] = useState<SafeUser | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  // mobile: which panel is visible, "list" | "chat"
  const [mobilePanel, setMobilePanel] = useState<"list" | "chat">("list");
  // typing indicators: set of userIds currently typing to us
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  // optimistic messages keyed by temp id
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  // track which sent messages have been read
  const [readByUserId, setReadByUserId] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedUserIdRef = useRef<string | null>(selectedUserId);
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const typingSentRef = useRef(false);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  // Build the WebSocket URL once auth is ready
  const wsUrl = user
    ? (() => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        return `${protocol}//${window.location.host}/ws`;
      })()
    : null;

  const wsRef = useReconnectingWebSocket(
    wsUrl,
    (data: any) => {
      if (data.type === "auth_ok") return;

      if (data.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
        const currentId = selectedUserIdRef.current;
        if (currentId === data.message?.senderId) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", currentId] });
        }
      }

      if (data.type === "typing_indicator" && data.fromUserId) {
        const uid = String(data.fromUserId);
        setTypingUserIds((prev) => {
          const next = new Set(prev);
          if (data.isTyping) {
            next.add(uid);
          } else {
            next.delete(uid);
          }
          return next;
        });
        // Auto-clear after 4 s in case "stop" event is missed
        if (data.isTyping) {
          clearTimeout(typingTimersRef.current[uid]);
          typingTimersRef.current[uid] = setTimeout(() => {
            setTypingUserIds((prev) => {
              const next = new Set(prev);
              next.delete(uid);
              return next;
            });
          }, 4000);
        }
      }

      if (data.type === "messages_read" && data.byUserId) {
        setReadByUserId((prev) => {
          const next = new Set(prev);
          next.add(String(data.byUserId));
          return next;
        });
      }
    },
    // onOpen: re-authenticate whenever the socket (re)connects
    user ? () => {
      wsRef.current?.send(JSON.stringify({ type: "auth", userId: user.id }));
    } : undefined
  );

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages/conversations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 3000,
  });

  const { data: serverMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/messages/${selectedUserId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!user && !!selectedUserId,
    refetchInterval: selectedUserId ? 3000 : false,
  });

  // Merge server messages with pending (optimistic) ones, deduplicating by id
  const messages = [
    ...serverMessages,
    ...pendingMessages.filter((p) => !serverMessages.some((s) => s.id === p.id)),
  ];

  // Clear pending messages whose server counterpart has arrived
  useEffect(() => {
    setPendingMessages((prev) =>
      prev.filter((p) => !serverMessages.some((s) => s.id === p.id))
    );
  }, [serverMessages]);

  // Auto-scroll
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

  // ── Mutations ──────────────────────────────────────────────────────────────

  const sendMessageMutation = useMutation({
    mutationFn: async (vars: { recipientId: string; content: string; replyToId?: string }) => {
      const res = await apiRequest("POST", "/api/messages", vars);
      return res.json() as Promise<Message>;
    },
    onMutate: (vars) => {
      if (!user) return;
      // Optimistic insert
      const tempMsg: Message = {
        id: `pending-${crypto.randomUUID()}`,
        senderId: user.id,
        recipientId: vars.recipientId,
        content: vars.content,
        read: false,
        replyToId: vars.replyToId,
        createdAt: new Date().toISOString(),
        _pending: true,
      };
      setPendingMessages((prev) => [...prev, tempMsg]);
      return { tempId: tempMsg.id };
    },
    onSuccess: (_data, _vars, ctx) => {
      if (ctx?.tempId) {
        setPendingMessages((prev) => prev.filter((p) => p.id !== ctx.tempId));
      }
      setMessageText("");
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.tempId) {
        setPendingMessages((prev) => prev.filter((p) => p.id !== ctx.tempId));
      }
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

  // ── Helpers ────────────────────────────────────────────────────────────────

  const selectConversation = useCallback((u: SafeUser) => {
    setSelectedUserId(u.id);
    setDirectChatUser(u);
    setReadByUserId(new Set()); // reset read state for new conversation
    if (isMobile) setMobilePanel("chat");
  }, [isMobile]);

  const handleBack = useCallback(() => {
    setMobilePanel("list");
    setSelectedUserId(null);
  }, []);

  const sendTypingEvent = useCallback((isTyping: boolean) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !selectedUserIdRef.current) return;
    ws.send(JSON.stringify({ type: "typing", recipientId: selectedUserIdRef.current, isTyping }));
  }, [wsRef]);

  const handleMessageInput = useCallback((value: string) => {
    setMessageText(value);
    if (!typingSentRef.current && value.length > 0) {
      typingSentRef.current = true;
      sendTypingEvent(true);
    }
    if (value.length === 0 && typingSentRef.current) {
      typingSentRef.current = false;
      sendTypingEvent(false);
    }
  }, [sendTypingEvent]);

  const handleSend = useCallback(() => {
    if (!selectedUserId || !messageText.trim() || sendMessageMutation.isPending) return;
    typingSentRef.current = false;
    sendTypingEvent(false);
    sendMessageMutation.mutate({
      recipientId: selectedUserId,
      content: messageText.trim(),
      replyToId: replyingTo?.id,
    });
  }, [selectedUserId, messageText, replyingTo, sendMessageMutation, sendTypingEvent]);

  const selectedUser =
    friends.find((f) => f.id === selectedUserId) ||
    conversations.find((c) => c.user.id === selectedUserId)?.user ||
    (directChatUser?.id === selectedUserId ? directChatUser : null);

  const selectedUserIsTyping = selectedUserId ? typingUserIds.has(selectedUserId) : false;

  // Unread counts: messages in a conversation where last message is from them and unread
  const unreadCounts = Object.fromEntries(
    conversations
      .filter(
        ({ lastMessage }) =>
          lastMessage &&
          !lastMessage.read &&
          user &&
          lastMessage.senderId !== user.id
      )
      .map(({ user: u }) => [u.id, 1] as [string, number])
  );

  // ── Early returns ──────────────────────────────────────────────────────────

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

  // ── Sidebar panel ──────────────────────────────────────────────────────────

  const sidebarPanel = (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
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
          {conversations.map(({ user: u, lastMessage }) => (
            <button
              key={u.id}
              onClick={() => selectConversation(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                selectedUserId === u.id
                  ? "bg-galactic-orange/20 border border-galactic-orange/40"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.avatarUrl || ""} />
                  <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange text-xs font-orbitron">
                    {(u.displayName || u.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {unreadCounts[u.id] ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-galactic-orange text-space-black text-[10px] font-bold flex items-center justify-center">
                    {unreadCounts[u.id]}
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium truncate">{u.displayName || u.username}</p>
                <p className={`text-xs truncate ${unreadCounts[u.id] ? "text-white font-medium" : "text-gray-500"}`}>
                  {lastMessage.content}
                </p>
              </div>
              {lastMessage.createdAt && (
                <span className="text-[10px] text-gray-600 shrink-0">
                  {format(new Date(lastMessage.createdAt), "HH:mm")}
                </span>
              )}
            </button>
          ))}
          {/* Friends not yet in conversations */}
          {friends
            .filter((f) => !conversations.some((c) => c.user.id === f.id))
            .map((f) => (
              <button
                key={f.id}
                onClick={() => selectConversation(f)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  selectedUserId === f.id
                    ? "bg-galactic-orange/20 border border-galactic-orange/40"
                    : "hover:bg-white/5"
                }`}
              >
                <Avatar className="w-10 h-10 shrink-0">
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
  );

  // ── Chat panel ─────────────────────────────────────────────────────────────

  const chatPanel = (
    <div className="flex-1 glass-effect rounded-xl flex flex-col overflow-hidden">
      {selectedUser ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            {isMobile && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white mr-1 shrink-0"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link href={`/profile/${selectedUser.id}`}>
              <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-galactic-orange transition-all shrink-0">
                <AvatarImage src={selectedUser.avatarUrl || ""} />
                <AvatarFallback className="bg-galactic-orange/20 text-galactic-orange font-orbitron">
                  {(selectedUser.displayName || selectedUser.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${selectedUser.id}`}>
                <p className="font-orbitron font-bold text-white hover:text-galactic-orange transition-colors cursor-pointer truncate">
                  {selectedUser.displayName || selectedUser.username}
                </p>
              </Link>
              <p className="text-xs text-gray-400">
                {selectedUserIsTyping ? (
                  <span className="text-galactic-orange animate-pulse">typing…</span>
                ) : (
                  `@${selectedUser.username}`
                )}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === user.id;
              const repliedToMsg = msg.replyToId
                ? messages.find((m) => m.id === msg.replyToId)
                : null;
              const isPending = !!msg._pending;
              // A sent message is read if the recipient has opened the conversation
              const isReadByRecipient = isMe && selectedUserId ? readByUserId.has(selectedUserId) : false;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                  onTouchStart={() => setHoveredMessageId(msg.id)}
                >
                  <div className="flex items-end gap-1 max-w-[85%] lg:max-w-[65%]">
                    {/* Reply button, received */}
                    {!isMe && hoveredMessageId === msg.id && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-gray-500 hover:text-galactic-orange transition-colors mb-1 shrink-0 p-1"
                        title="Reply"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    )}

                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? isPending
                            ? "bg-galactic-orange/60 text-space-black rounded-br-sm"
                            : "bg-galactic-orange text-space-black rounded-br-sm"
                          : "bg-white/10 text-white rounded-bl-sm"
                      }`}
                    >
                      {/* Quoted reply */}
                      {repliedToMsg && (
                        <div
                          className={`mb-2 px-2 py-1 rounded text-xs border-l-2 ${
                            isMe
                              ? "border-space-black/40 bg-space-black/20 text-space-black/70"
                              : "border-galactic-orange/50 bg-white/5 text-gray-400"
                          }`}
                        >
                          <span className="font-semibold">
                            {repliedToMsg.senderId === user.id
                              ? "You"
                              : selectedUser?.displayName || selectedUser?.username || "Unknown"}
                          </span>
                          <p className="truncate">{repliedToMsg.content}</p>
                        </div>
                      )}

                      <p>{msg.content}</p>

                      <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                        <span className={`text-xs ${isMe ? "text-space-black/60" : "text-gray-500"}`}>
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </span>
                        {/* Read receipt icon */}
                        {isMe && !isPending && (
                          isReadByRecipient
                            ? <CheckCheck className="w-3 h-3 text-blue-400" />
                            : <Check className="w-3 h-3 text-space-black/50" />
                        )}
                        {isPending && (
                          <Loader2 className="w-3 h-3 animate-spin text-space-black/40" />
                        )}
                      </div>
                    </div>

                    {/* Reply button, sent */}
                    {isMe && hoveredMessageId === msg.id && (
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-gray-500 hover:text-galactic-orange transition-colors mb-1 shrink-0 p-1"
                        title="Reply"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator bubble */}
            {selectedUserIsTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-bl-sm text-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Reply preview */}
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
                className="text-gray-500 hover:text-white shrink-0 p-1"
                title="Cancel reply"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="p-3 md:p-4 border-t border-white/10 flex gap-2 md:gap-3">
            <Input
              value={messageText}
              onChange={(e) => handleMessageInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange text-base md:text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="bg-galactic-orange text-space-black hover:bg-galactic-gold h-10 w-10 md:h-9 md:w-auto md:px-4 p-0 shrink-0"
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
  );

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-3 md:px-4 pt-20 pb-4 h-screen flex flex-col">
        {isMobile ? (
          // Mobile: show one panel at a time
          <div className="flex-1 overflow-hidden flex flex-col">
            {mobilePanel === "list" ? (
              sidebarPanel
            ) : (
              chatPanel
            )}
          </div>
        ) : (
          // Desktop: side-by-side
          <div className="flex-1 flex gap-4 overflow-hidden">
            <div className="w-80 flex flex-col gap-4 overflow-hidden">
              {sidebarPanel}
            </div>
            {chatPanel}
          </div>
        )}
      </div>
    </div>
  );
}
