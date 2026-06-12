"use client";

import { useState } from "react";

type Event = {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  endDate: string | null;
  location: string;
  ctaText: string;
  ctaLink: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
}

type EventStatus = "ongoing" | "upcoming" | "past";

function EventCard({ event, status }: { event: Event; status: EventStatus }) {
  const isPast = status === "past";
  const isOngoing = status === "ongoing";

  return (
    <a href={`/su-kien/${event.id}`} className="ev-card-link">
      <div className={`ev-card${isPast ? " ev-past" : ""}${isOngoing ? " ev-ongoing" : ""}`}>
        {event.image && (
          <div className="ev-img">
            <img src={event.image} alt={event.title} />
            {isPast && <span className="ev-badge-past">Đã kết thúc</span>}
            {isOngoing && <span className="ev-badge-ongoing">🔴 Đang diễn ra</span>}
          </div>
        )}
        <div className="ev-body">
          <div className="ev-date">
            📅 {formatDate(event.date)}
            {event.endDate && ` — ${formatDate(event.endDate)}`}
          </div>
          <h3 className="ev-title">{event.title}</h3>
          {event.description && <p className="ev-desc">{event.description}</p>}
          {event.location && <p className="ev-loc">📍 {event.location}</p>}
          {!isPast && event.ctaLink && (
            <span className="btn btn-primary ev-cta" style={{ display: "inline-block" }}>
              {event.ctaText || "Đăng ký tham gia"} →
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function EventTabs({
  ongoing,
  upcoming,
  past,
}: {
  ongoing: Event[];
  upcoming: Event[];
  past: Event[];
}) {
  type TabKey = "ongoing" | "upcoming" | "past";

  // Mặc định hiện tab "đang diễn ra" nếu có, không thì "sắp tới"
  const defaultTab: TabKey = ongoing.length > 0 ? "ongoing" : "upcoming";
  const [tab, setTab] = useState<TabKey>(defaultTab);

  const tabConfig: { key: TabKey; label: string; count: number }[] = [
    { key: "ongoing", label: "Đang diễn ra", count: ongoing.length },
    { key: "upcoming", label: "Sắp tới", count: upcoming.length },
    { key: "past", label: "Đã kết thúc", count: past.length },
  ];

  const eventsMap: Record<TabKey, Event[]> = { ongoing, upcoming, past };
  const events = eventsMap[tab];

  const emptyMessages: Record<TabKey, string> = {
    ongoing: "Hiện không có sự kiện nào đang diễn ra.",
    upcoming: "Hiện chưa có sự kiện nào sắp tới. Hãy theo dõi để cập nhật!",
    past: "Chưa có sự kiện nào đã kết thúc.",
  };

  return (
    <>
      <div className="ev-tabs">
        {tabConfig.map((t) => (
          <button
            key={t.key}
            className={`ev-tab${tab === t.key ? " ev-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <p className="ev-empty">{emptyMessages[tab]}</p>
      ) : (
        <div className="ev-list">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} status={tab} />
          ))}
        </div>
      )}
    </>
  );
}
