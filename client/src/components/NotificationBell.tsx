import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Bell, BellOff, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Notification } from "@shared/schema";
import { cn } from "@/lib/utils";

const MAX_NOTIFICATIONS = 50;

const TYPE_ICONS: Record<string, string> = {
  friend_request_received: "👤",
  friend_request_accepted: "🤝",
  friend_request_declined: "❌",
  post_saved_draft: "📝",
  post_published: "🚀",
  post_updated: "✏️",
  post_new: "📰",
  chat_message: "💬",
  chat_reply: "↩️",
  post_comment: "🗨️",
  edit_suggestion_received: "🔍",
  edit_suggestion_reviewed: "✅",
};

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread/count"],
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const unreadCount = countData?.count ?? 0;

  // WebSocket subscription for real-time notification pushes
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "notification") {
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      ws.close();
    };
  }, [user, queryClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread/count"] });
    },
  });

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markReadMutation.mutate(notification.id);
      }
      setOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    },
    [markReadMutation, navigate]
  );

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => {
          // Don't open an empty panel — only toggle when there is something to show
          if (notifications.length === 0 && unreadCount === 0) return;
          setOpen((o) => !o);
        }}
        className="relative hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange"
        aria-label="Notifications"
        data-testid="notification-bell"
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5 opacity-60" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-galactic-orange text-space-black text-[10px] font-bold px-1 leading-none shadow-[0_0_8px_rgba(255,165,0,0.6)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[480px] flex flex-col glass-effect-strong rounded-xl border border-galactic-orange/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-galactic-orange/15">
            <span className="font-orbitron font-bold text-sm text-galactic-gold tracking-wide">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-galactic-orange/70">({unreadCount} new)</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  title="Mark all as read"
                  className="p-1 rounded hover:bg-galactic-orange/10 text-galactic-orange/70 hover:text-galactic-gold transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-galactic-orange/10 text-galactic-orange/50 hover:text-galactic-gold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1 divide-y divide-galactic-orange/10">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-galactic-orange/40">
                <BellOff className="w-8 h-8 mb-2" />
                <span className="font-orbitron text-xs">No notifications yet</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleNotificationClick}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (n: Notification) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  const icon = TYPE_ICONS[notification.type] ?? "🔔";

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer",
        notification.read
          ? "hover:bg-white/5"
          : "bg-galactic-orange/5 hover:bg-galactic-orange/10"
      )}
      onClick={() => onRead(notification)}
    >
      {/* Icon */}
      <span className="mt-0.5 text-base flex-shrink-0 leading-none">{icon}</span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs font-semibold leading-snug truncate",
            notification.read ? "text-galactic-orange/60" : "text-galactic-gold"
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-galactic-orange/50 mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-galactic-orange/30 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            title="Mark as read"
            className="p-0.5 rounded hover:bg-galactic-orange/20 text-galactic-orange/50 hover:text-galactic-gold"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification);
            }}
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        <button
          title="Delete"
          className="p-0.5 rounded hover:bg-red-500/20 text-galactic-orange/50 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
