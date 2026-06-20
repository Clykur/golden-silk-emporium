"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HelpCircle,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { supportApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import type { SupportTicket } from "@/lib/types";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-muted text-muted-foreground border-border",
};

export default function AdminSupport() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: supportApi.adminListTickets,
    refetchInterval: 60000,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      supportApi.updateTicketStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Ticket status updated");
      setEditingStatus(null);
    },
    onError: (e: any) => toast.error(e.message || "Failed to update status"),
  });

  const replyMut = useMutation({
    mutationFn: ({ ticketId }: { ticketId: string }) =>
      supportApi.addMessage(ticketId, {
        ticket_id: ticketId,
        sender_type: "admin",
        sender_id: user?.id || null,
        sender_name: user?.name || "Drapeva Support",
        message: replyMsg,
        attachments: [],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("Reply sent to customer");
      setReplyMsg("");
    },
    onError: (e: any) => toast.error(e.message || "Failed to send reply"),
  });

  const filtered =
    filterStatus === "all"
      ? tickets
      : tickets.filter((t: SupportTicket) => t.status === filterStatus);

  const counts: Record<string, number> = { all: tickets.length };
  STATUS_OPTIONS.forEach((s) => {
    counts[s] = tickets.filter((t: SupportTicket) => t.status === s).length;
  });

  return (
    <AdminLayout title="Support Tickets" subtitle="Customer support requests">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-colors ${
              filterStatus === s
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-4 h-20 animate-pulse bg-champagne/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border">
          <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket: SupportTicket) => {
            const expanded = expandedId === ticket.id;
            const statusColor =
              STATUS_COLORS[ticket.status] || "bg-muted text-muted-foreground border-border";
            return (
              <div key={ticket.id} className="border border-border">
                <div
                  className="flex items-start justify-between gap-4 p-5 cursor-pointer hover:bg-champagne/5 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : ticket.id)}
                >
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded ${statusColor}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                        {ticket.category.replace("_", " ")}
                      </span>
                    </div>
                    <p className="font-medium text-sm mt-1">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {ticket.customer_name} ({ticket.customer_email}){" · "}
                      {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {ticket.messages && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.messages.length}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status selector */}
                    <select
                      value={ticket.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStatusMut.mutate({ id: ticket.id, status: e.target.value });
                      }}
                      className="border border-border bg-background text-xs px-2 py-1 focus:outline-none focus:border-foreground"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-border bg-champagne/5 p-5 space-y-4">
                    {/* Messages */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {(ticket.messages || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded text-sm ${
                            msg.sender_type === "customer"
                              ? "bg-background border border-border mr-12"
                              : "bg-gold/10 border border-gold/20 ml-12"
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {msg.sender_type === "customer"
                              ? `Customer — ${msg.sender_name}`
                              : `Drapeva Support — ${msg.sender_name}`}
                            {" · "}
                            {new Date(msg.created_at).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                          <p className="text-muted-foreground leading-relaxed">{msg.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply area */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Reply to Customer
                      </p>
                      <div className="flex gap-2">
                        <textarea
                          value={replyMsg}
                          onChange={(e) => setReplyMsg(e.target.value)}
                          placeholder="Type your reply..."
                          rows={3}
                          className="flex-1 border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-foreground resize-none"
                        />
                        <button
                          onClick={() => {
                            if (!replyMsg.trim()) return;
                            replyMut.mutate({ ticketId: ticket.id });
                          }}
                          disabled={replyMut.isPending || !replyMsg.trim()}
                          className="bg-foreground text-background px-4 text-xs uppercase tracking-wider hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
