"use client";
import { useEffect, useState } from "react";

export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (evt: { title: string; description?: string; date: string }) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evt),
    });
    if (res.ok) {
      const created = await res.json();
      setEvents((prev) => [...prev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      return created;
    } else {
      throw new Error("No se pudo crear el evento");
    }
  };

  const deleteEvent = async (evt: { title: string; description?: string; date: string }) => {
    const res = await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evt),
    });
    if (res.ok) {
      const created = await res.json();
      setEvents((prev) => [...prev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      return created;
    } else {
      throw new Error("No se pudo crear el evento");
    }
  };
  return { events, addEvent, refetch: fetchEvents };
}
