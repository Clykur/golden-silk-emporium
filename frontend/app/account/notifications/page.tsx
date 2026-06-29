"use client";

import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  Truck,
  CreditCard,
  MessageSquare,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const TYPE_ICONS: Record<string, any> = {
  order_placed: Package,
  order_processing: Package,
  order_shipped: Truck,
  order_delivered: Check,
  order_cancelled: Package,
  payment_success: CreditCard,
  payment_failed: CreditCard,
  ticket_reply: MessageSquare,
  account_update: Info,
  promo: Info,
  system: Info,
};

const TYPE_COLORS: Record<string, string> = {
  order_placed: "bg-blue-50 text-blue-600",
  order_processing: "bg-indigo-50 text-indigo-600",
  order_shipped: "bg-purple-50 text-purple-600",
  order_delivered: "bg-emerald-50 text-emerald-600",
  order_cancelled: "bg-red-50 text-red-600",
  payment_success: "bg-emerald-50 text-emerald-600",
  payment_failed: "bg-red-50 text-red-600",
  ticket_reply: "bg-amber-50 text-amber-600",
  account_update: "bg-gold/10 text-gold",
  promo: "bg-rose-50 text-rose-600",
  system: "bg-muted text-muted-foreground",
};

export default function Notifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["my-notifications", user?.id],
    queryFn: () => (user ? notificationsApi.list(user.id) : Promise.resolve([])),
    enabled: !!user,
    refetchInterval: 4000,
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["my-notifications", user?.id] });
      await qc.cancelQueries({ queryKey: ["unread-notifications-count", user?.id] });

      const previousNotifications = qc.getQueryData(["my-notifications", user?.id]);
      const previousUnreadCount = qc.getQueryData(["unread-notifications-count", user?.id]);

      if (previousNotifications) {
        qc.setQueryData(["my-notifications", user?.id], (old: any) =>
          old?.map((n: any) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      }

      if (typeof previousUnreadCount === "number") {
        qc.setQueryData(
          ["unread-notifications-count", user?.id],
          Math.max(0, previousUnreadCount - 1),
        );
      }

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_err, _id, context: any) => {
      if (context) {
        qc.setQueryData(["my-notifications", user?.id], context.previousNotifications);
        qc.setQueryData(["unread-notifications-count", user?.id], context.previousUnreadCount);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
      qc.invalidateQueries({ queryKey: ["unread-notifications-count", user?.id] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: () => notificationsApi.markAllRead(user!.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["my-notifications", user?.id] });
      await qc.cancelQueries({ queryKey: ["unread-notifications-count", user?.id] });

      const previousNotifications = qc.getQueryData(["my-notifications", user?.id]);
      const previousUnreadCount = qc.getQueryData(["unread-notifications-count", user?.id]);

      if (previousNotifications) {
        qc.setQueryData(["my-notifications", user?.id], (old: any) =>
          old?.map((n: any) => ({ ...n, is_read: true })),
        );
      }
      qc.setQueryData(["unread-notifications-count", user?.id], 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_err, _variables, context: any) => {
      if (context) {
        qc.setQueryData(["my-notifications", user?.id], context.previousNotifications);
        qc.setQueryData(["unread-notifications-count", user?.id], context.previousUnreadCount);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
      qc.invalidateQueries({ queryKey: ["unread-notifications-count", user?.id] });
      toast.success("All notifications marked as read");
    },
  });

  const unread = notifications.filter((n: Notification) => !n.is_read).length;

  return (
    <DashboardLayout title="Notifications" subtitle="Updates & Alerts">
      <div className="flex items-center justify-between">
        {unread > 0 && (
          <p className="text-sm text-muted-foreground">
            {unread} unread notification{unread !== 1 ? "s" : ""}
          </p>
        )}
        {unread > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-dashed border-muted-foreground pb-0.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4 animate-pulse h-16 bg-champagne/5" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Order updates and alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border">
          {notifications.map((n: Notification) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            const colorClass = TYPE_COLORS[n.type] || "bg-muted text-muted-foreground";
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markReadMut.mutate(n.id)}
                className={`flex gap-4 items-start p-4 transition-colors cursor-pointer ${
                  !n.is_read ? "bg-gold/3 hover:bg-champagne/20" : "hover:bg-champagne/10"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full grid place-items-center shrink-0 ${colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-medium ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 opacity-60">
                    {new Date(n.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
