"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, GraduationCap, ArrowRight, CalendarIcon, Clock } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import Navbar from "@/components/Navbar";
import EnforceTheme from "@/components/EnforceTheme";
import { courses, LEVELS } from "@/lib/courses";
import { createDemoRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MORNING_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
];

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = startOfDay(new Date());

  async function action(formData: FormData) {
    setError(null);
    if (!selectedDate) { setError("Please pick a date for your demo."); return; }
    if (!selectedTime) { setError("Please pick a time slot."); return; }
    const preferredSlot = `${format(selectedDate, "EEEE, MMMM d, yyyy")} at ${selectedTime}`;
    formData.append("preferred_times", preferredSlot);
    const subjectSlug = String(formData.get("subject_slug") ?? "");
    const course = courses.find((c) => c.slug === subjectSlug);
    if (course) formData.set("subject_name", course.name);
    setLoading(true);
    const res = await createDemoRequest(formData);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-xl">
        {done ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Demo Requested!</h1>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
              Thank you. Our team will review your chosen slot, assign a teacher, and email you a Google Meet link for your free demo class.
            </p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90">
              Back to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary grid place-items-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold">Book a Free Demo Class</h1>
              <p className="text-muted-foreground text-sm mt-1">Try a live class before you enroll — no payment required.</p>
            </div>

            <form action={action} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label htmlFor="full_name">Full Name *</Label><Input id="full_name" name="full_name" required placeholder="Ali Ahmed" /></div>
                <div className="space-y-1.5"><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" required placeholder="you@example.com" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label htmlFor="phone">Phone / WhatsApp</Label><Input id="phone" name="phone" type="tel" placeholder="+92 300 1234567" /></div>
                <div className="space-y-1.5">
                  <Label htmlFor="education_level">Level</Label>
                  <select id="education_level" name="education_level" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {LEVELS.filter((l) => l !== "All").map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject_slug">Subject</Label>
                <select id="subject_slug" name="subject_slug" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Any / not sure</option>
                  {courses.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              {/* Date picker */}
              <div className="space-y-1.5">
                <Label>Preferred date *</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full flex items-center gap-2 h-10 rounded-md border border-input bg-background px-3 text-sm text-left transition-colors hover:border-primary/50 ${!selectedDate ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      <CalendarIcon className="w-4 h-4 shrink-0" />
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => { setSelectedDate(date); setCalendarOpen(false); }}
                      disabled={(date) => isBefore(startOfDay(date), today)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time slots */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Morning time slot *
                  <span className="text-muted-foreground font-normal">(9 AM – 12 PM)</span>
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {MORNING_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`text-center text-xs px-2 py-2.5 rounded-lg border font-medium transition-colors ${
                        selectedTime === slot
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Anything else? (optional)</Label>
                <textarea id="message" name="message" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Tell us about your goals" />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full font-bold">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Request Free Demo
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
