import { useRef, useEffect } from "react";
import { Calendar } from "@fullcalendar/core";
import adaptivePlugin from "@fullcalendar/adaptive";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import { Card } from "../ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/api";

export interface EventResponse {
  resources: Resource[]
  events: Event[]
}

export interface Resource {
  id: number
  title: string
}

export interface Event {
  id: number
  resourceId: number
  start: string
  end: string
  title: string
  status: string
}


const statusColour = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    case "cancelled":
      return "red";
    default:
      return "blue";
  }
};

export default function CalendarEvents() {
  const { user } = useAuth();
  const calendarEl = useRef<HTMLDivElement>(null);

  const getEvents = useQuery<EventResponse>({
    queryKey: ["GetEvents", user?.userId],
    queryFn: () =>
      api
        .get(`/game/slots/event-data/${user?.userId}`)
        .then(res => res.data),
    enabled: !!user?.userId,
  });

  useEffect(() => {
    if (!calendarEl.current) return;

    const calendar = new Calendar(calendarEl.current, {
      plugins: [
        adaptivePlugin,
        interactionPlugin,
        dayGridPlugin,
        listPlugin,
        timeGridPlugin,
        resourceTimelinePlugin,
      ],
      schedulerLicenseKey: "XXX",
      now: new Date(),
      editable: false,
      aspectRatio: 0.1,
      scrollTime: "07:00",
      headerToolbar: {
        left: "today prev,next",
        center: "title",
        right:
          "resourceTimelineDay,resourceTimelineThreeDays,timeGridWeek,dayGridMonth,listWeek",
      },
      initialView: "listWeek",
      views: {
        resourceTimelineThreeDays: {
          type: "resourceTimeline",
          duration: { days: 3 },
          buttonText: "3 day",
        },
      },
      resourceAreaHeaderContent: "Events",
      resources: getEvents.data?.resources ?? [] as any,
      events:
        (getEvents.data?.events ?? []).map(ev => ({
          ...ev,
          color: statusColour(ev.status),
        })) as any,
    });

    calendar.render();
    return () => calendar.destroy();
  }, [getEvents.data]);

  return (
    <Card
      className="max-h-full p-5 border shadow-md border-gray-400"
      id="calendar"
      ref={calendarEl}
    />
  );
}