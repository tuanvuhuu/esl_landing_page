"use client";

import Image from "next/image";
import CountdownTimer from "./CountdownTimer";

export type FeaturedEventData = {
  id: number;
  title: string;
  description?: string;
  image?: string;
  dateLabel: string;
  dateISO: string;
  endDateISO?: string | null;
  location?: string;
  locations?: string;
  ctaText?: string;
};

/** Banner sự kiện nổi bật — tự nhận biết "đang diễn ra" hay "sắp tới". */
export default function FeaturedEvent({ event }: { event: FeaturedEventData }) {
  const startMs = new Date(event.dateISO).getTime();
  const endMs = event.endDateISO ? new Date(event.endDateISO).getTime() : null;
  const nowMs = Date.now();
  const href = `/su-kien/${event.id}`;

  // Xác định trạng thái
  const isOngoing = startMs <= nowMs && (endMs ? endMs > nowMs : false);

  // Đếm ngược: đang diễn ra → đếm tới endDate, sắp tới → đếm tới startDate
  const countdownTarget = isOngoing && endMs ? endMs : startMs;
  const countdownLabel = isOngoing ? "🔴 Kết thúc sau:" : "⏳ Diễn ra sau:";

  // Chỉ hiện countdown nếu target còn trong tương lai
  const showCountdown = countdownTarget > nowMs;

  return (
    <div className={`featured-event reveal${isOngoing ? " fe-ongoing" : ""}`}>
      <div className="fe-media">
        {event.image ? (
          <Image src={event.image} alt={event.title} fill sizes="(max-width: 860px) 92vw, 480px" style={{ objectFit: "cover" }} />
        ) : (
          <div className="fe-media-fallback">🎉</div>
        )}
        <span className="fe-tag">
          {isOngoing ? "🔴 Đang diễn ra" : "🌟 Sự kiện nổi bật"}
        </span>
      </div>

      <div className="fe-body">
        <div className="fe-meta">
          <div className="fe-meta-date">📅 {event.dateLabel}</div>
        </div>
        <h3 className="fe-title"><a href={href}>{event.title}</a></h3>
        {event.description && <p className="fe-desc">{event.description}</p>}

        {showCountdown && (
          <div className="fe-count">
            <span className="fe-count-label">{countdownLabel}</span>
            <CountdownTimer deadline={countdownTarget} />
          </div>
        )}

        <div className="fe-cta">
          <a href={href} className="btn btn-primary">
            {event.ctaText || "Đăng ký tham gia"} →
          </a>
          <a href="/su-kien" className="btn btn-ghost">
            Tất cả sự kiện
          </a>
        </div>
      </div>
    </div>
  );
}
