"use client";

import { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function Calendar({ meetings }) {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

  const events = meetings.map((m) => ({
    id: m._id,
    title: m.title,
    start: new Date(m.startTime),
    end: new Date(m.endTime),
  }));

  return (
    <div style={{ height: 600 }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        date={date}
        view={view}
        onNavigate={setDate}
        onView={setView}
        onSelectEvent={(event) => router.push(`/meetings/${event.id}`)}
        eventPropGetter={() => ({
          style: {
            background: "linear-gradient(135deg, var(--indigo), var(--purple))",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            padding: "2px 6px",
          },
        })}
      />
    </div>
  );
}
