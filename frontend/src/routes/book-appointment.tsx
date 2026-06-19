import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Calendar, Video, Clock, Check } from "lucide-react";

export const Route = createFileRoute("/book-appointment")({
  head: () => ({
    meta: [
      { title: "Schedule Saree Styling & Consultation — Drapeva" },
      {
        name: "description",
        content:
          "Book a video bridal saree consultation or personal atelier visit with our master stylists.",
      },
    ],
  }),
  component: BookAppointment,
});

const TIME_SLOTS = [
  "11:00 AM - 12:00 PM",
  "12:30 PM - 01:30 PM",
  "03:00 PM - 04:00 PM",
  "04:30 PM - 05:30 PM",
  "06:00 PM - 07:00 PM",
];

function BookAppointment() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [type, setType] = useState<"IN_PERSON" | "VIDEO">("VIDEO");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlot) return toast.error("Please select a time slot");
    setLoading(true);

    try {
      await api.appointments.create({
        name,
        email,
        phone,
        date: new Date(date).toISOString(),
        timeSlot,
        type,
        notes,
      });
      setConfirmed(true);
      toast.success("Consultation successfully scheduled!");
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="container-luxe py-24 text-center max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-gold mb-6">
          <Check className="h-7 w-7" />
        </div>
        <p className="eyebrow text-gold">Confirmed</p>
        <h1 className="mt-3 font-display text-4xl">Session Booked</h1>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          Thank you, {name}. A calendar invite has been sent to your email. Our design concierge
          will reach out to you via WhatsApp to finalize saree customization requirements.
        </p>
        <Link to="/" className="mt-10 inline-block border-b border-foreground pb-0.5 eyebrow">
          Back to Atelier
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">Services</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Book Consultation</h1>
          <span className="gold-divider mt-4 block mx-auto" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground leading-relaxed">
            Schedule a session with our master drapers. Available via video call or physical studio
            visit in South Mumbai.
          </p>
        </div>
      </div>

      <div className="container-luxe py-16 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl border border-border p-6 md:p-10 bg-champagne/10 space-y-6 shadow-soft"
        >
          <h2 className="font-display text-2xl border-b border-border pb-3">
            Saree Trousseau Consultation Form
          </h2>

          {/* Consultation Type */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType("VIDEO")}
              className={`flex flex-col items-center justify-center p-4 border transition-all ${
                type === "VIDEO"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border bg-background hover:border-foreground"
              }`}
            >
              <Video className="h-6 w-6 stroke-1 mb-2" />
              <span className="eyebrow text-[10px]">Video Call</span>
            </button>
            <button
              type="button"
              onClick={() => setType("IN_PERSON")}
              className={`flex flex-col items-center justify-center p-4 border transition-all ${
                type === "IN_PERSON"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border bg-background hover:border-foreground"
              }`}
            >
              <Calendar className="h-6 w-6 stroke-1 mb-2" />
              <span className="eyebrow text-[10px]">In-Person visit</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-2 block">Your Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                placeholder="e.g. Aishwarya Sen"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block">Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                placeholder="e.g. aishwarya@example.com"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-2 block">WhatsApp Phone</span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                placeholder="e.g. +91 98765 43210"
              />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block">Select Date</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
                min={new Date().toISOString().split("T")[0]}
              />
            </label>
          </div>

          {/* Time Slot Selector */}
          <div>
            <span className="eyebrow mb-3 block">Available Time Slots</span>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`px-3 py-2 border text-xs tracking-wider transition-colors ${
                    timeSlot === slot
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:border-foreground"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 inline mr-1 stroke-1" /> {slot}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="eyebrow mb-2 block">Style Details & Custom Requests (Optional)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-border bg-background px-4 py-2.5 text-sm focus:outline-none"
              placeholder="Let us know if you have specific collections, weaves, color customization, or monogramming requests in mind..."
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-4 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
          >
            {loading ? "Scheduling slot..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
