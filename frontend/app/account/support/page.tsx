"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HelpCircle,
  Plus,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { supportApi, ordersApi } from "@/lib/api";
import type { SupportTicket } from "@/lib/types";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const TICKET_STATUS_CONFIG = {
  open: { label: "Open", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  in_progress: {
    label: "In Progress",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    color: "bg-muted text-muted-foreground border-border",
    icon: CheckCircle2,
  },
};

const CATEGORIES = [
  { value: "order_issue", label: "Order Issue" },
  { value: "payment", label: "Payment" },
  { value: "return_refund", label: "Return / Refund" },
  { value: "product_query", label: "Product Query" },
  { value: "delivery", label: "Delivery" },
  { value: "account", label: "Account" },
  { value: "other", label: "Other" },
];

export default function Support() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [form, setForm] = useState({
    subject: "",
    category: "order_issue",
    order_id: "",
    message: "",
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-support-tickets", user?.id],
    queryFn: () => (user ? supportApi.listUserTickets(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => (user ? ordersApi.getUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const createMut = useMutation({
    mutationFn: () =>
      supportApi.createTicket({
        user_id: user!.id,
        order_id: form.order_id || undefined,
        subject: form.subject,
        category: form.category,
        customer_name: user!.name || user!.email,
        customer_email: user!.email,
        message: form.message,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-support-tickets"] });
      toast.success("Support ticket created. We'll respond within 24 hours.");
      setShowForm(false);
      setForm({ subject: "", category: "order_issue", order_id: "", message: "" });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create ticket"),
  });

  const replyMut = useMutation({
    mutationFn: ({ ticketId }: { ticketId: string }) =>
      supportApi.addMessage(ticketId, {
        ticket_id: ticketId,
        sender_type: "customer",
        sender_id: user!.id,
        sender_name: user!.name || user!.email,
        message: replyMsg,
        attachments: [],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-support-tickets"] });
      toast.success("Reply sent");
      setReplyMsg("");
    },
    onError: (e: any) => toast.error(e.message || "Failed to send reply"),
  });

  return (
    <DashboardLayout title="Support" subtitle="Help & Support">
      {/* New Ticket Button */}
      {!showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-xs uppercase tracking-wider font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Support Ticket
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="border border-border p-6 space-y-5 bg-champagne/10"
        >
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="font-display text-xl">New Support Ticket</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>

          <label className="block">
            <span className="eyebrow mb-1 block">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          {orders.length > 0 && (
            <label className="block">
              <span className="eyebrow mb-1 block">
                Related Order <span className="normal-case text-muted-foreground">(optional)</span>
              </span>
              <select
                value={form.order_id}
                onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value }))}
                className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
              >
                <option value="">— Select an order —</option>
                {orders.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    #{o.id.slice(0, 8).toUpperCase()} —{" "}
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="eyebrow mb-1 block">Subject</span>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground"
            />
          </label>

          <label className="block">
            <span className="eyebrow mb-1 block">Message</span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Please describe your issue in detail..."
              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground resize-none"
            />
          </label>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-3 text-xs uppercase tracking-wider border border-border text-muted-foreground hover:border-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="bg-foreground text-background px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50"
            >
              {createMut.isPending ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      )}

      {/* Tickets List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-border p-4 h-20 animate-pulse bg-champagne/5" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border">
          <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground stroke-1 mb-4" />
          <p className="font-display text-xl">No support tickets</p>
          <p className="text-sm text-muted-foreground mt-2">
            Need help? Create a ticket and we'll respond within 24 hours.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: SupportTicket) => {
            const cfg = TICKET_STATUS_CONFIG[ticket.status] || TICKET_STATUS_CONFIG.open;
            const expanded = expandedId === ticket.id;
            return (
              <div key={ticket.id} className="border border-border">
                <div
                  onClick={() => setExpandedId(expanded ? null : ticket.id)}
                  className="flex items-start justify-between gap-4 p-5 cursor-pointer hover:bg-champagne/5 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider rounded inline-flex items-center gap-1 ${cfg.color}`}
                      >
                        <cfg.icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-medium text-sm mt-1">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {CATEGORIES.find((c) => c.value === ticket.category)?.label}
                      {" · "}
                      {new Date(ticket.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {ticket.messages && ticket.messages.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {ticket.messages.length}
                      </span>
                    )}
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
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {(ticket.messages || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded text-sm ${
                            msg.sender_type === "customer"
                              ? "bg-champagne/30 ml-4"
                              : "bg-gold/10 mr-4"
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {msg.sender_type === "customer" ? "You" : "Drapeva Support"}
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

                    {/* Reply */}
                    {ticket.status !== "closed" && (
                      <div className="border-t border-border pt-4">
                        <div className="flex gap-2">
                          <textarea
                            value={replyMsg}
                            onChange={(e) => setReplyMsg(e.target.value)}
                            placeholder="Type your reply..."
                            rows={2}
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
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
