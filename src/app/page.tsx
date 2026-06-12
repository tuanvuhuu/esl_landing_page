import type { Metadata } from "next";
import Image from "next/image";
import { getContent } from "@/lib/content";
import { currentSite } from "@/lib/site";
import { prisma } from "@/lib/db";
import LeadForm from "./LeadForm";
import { ContactLink, ContactButtons } from "./Contact";
import EngagementTracker from "./EngagementTracker";
import FaqSection from "./FaqSection";
import EventCarousel from "./EventCarousel";
import SocialChatWidgets from "@/components/SocialChatWidgets";
import ChatbotWidget from "@/components/ChatbotWidget";
import ScrollReveal from "@/components/ScrollReveal";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import CountdownTimer from "@/components/CountdownTimer";
import ExitPopup from "@/components/ExitPopup";
import CountUp from "@/components/CountUp";
import WaveDivider from "@/components/WaveDivider";
import TestimonialSlider from "@/components/TestimonialSlider";
import FeaturedEvent from "@/components/FeaturedEvent";
import ScrollTopOnLoad from "@/components/ScrollTopOnLoad";
import CardSlider from "@/components/CardSlider";
import ScrollProgress from "@/components/ScrollProgress";
import PromoBar from "@/components/PromoBar";
import SocialProofToast from "@/components/SocialProofToast";
import RouteQuiz from "@/components/RouteQuiz";
import LuckyWheel from "@/components/LuckyWheel";

export const dynamic = "force-dynamic";

// Người dùng có thể dán cả đoạn <iframe ... src="..."> hoặc chỉ link.
// Lấy ra đúng URL để nhúng bản đồ.
function mapSrc(embed: string): string {
  const m = embed.match(/src=["']([^"']+)["']/i);
  return (m ? m[1] : embed).trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: `${c.centerName} — Học tiếng Anh cho bé 3–15 tuổi`,
    description: c.hero.subtitle,
    openGraph: {
      title: `${c.centerName} — ${c.hero.title}`,
      description: c.hero.subtitle,
      type: "website",
      locale: "vi_VN",
      ...(c.hero.image ? { images: [{ url: c.hero.image, width: 1200, height: 630 }] } : {}),
    },
  };
}

/* ---- Icon vẽ riêng theo phong cách logo (phẳng, xanh lá + cam) ---- */
function CapIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 4L22 8.5 12 13 2 8.5z" fill="#80B848" />
      <path d="M6.5 11v3.4c0 1.6 2.5 2.7 5.5 2.7s5.5-1.1 5.5-2.7V11L12 13.4z" fill="#5F8F2E" />
      <path d="M22 8.5v4.1" stroke="#F58220" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="22" cy="13.3" r="1.3" fill="#F58220" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5.5c2.6-.6 5-.3 7.2 1.2v11.8c-2.2-1.5-4.6-1.8-7.2-1.2z" fill="#80B848" />
      <path d="M20 5.5c-2.6-.6-5-.3-7.2 1.2v11.8c2.2-1.5 4.6-1.8 7.2-1.2z" fill="#F58220" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z" fill="#F58220" />
    </svg>
  );
}
function SpeechIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M4 5h16a1.6 1.6 0 0 1 1.6 1.6v7a1.6 1.6 0 0 1-1.6 1.6h-9l-4 3v-3H4A1.6 1.6 0 0 1 2.4 13.6V6.6A1.6 1.6 0 0 1 4 5z" fill="#80B848" />
      <circle cx="8.5" cy="10.1" r="1.1" fill="#fff" />
      <circle cx="12" cy="10.1" r="1.1" fill="#fff" />
      <circle cx="15.5" cy="10.1" r="1.1" fill="#fff" />
    </svg>
  );
}
function GroupIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="8" cy="8" r="3" fill="#80B848" />
      <circle cx="16" cy="8" r="3" fill="#A6C940" />
      <path d="M2.5 19c0-3 2.2-5 5.5-5s5.5 2 5.5 5z" fill="#80B848" />
      <path d="M10.5 19c0-3 2.2-5 5.5-5s5.5 2 5.5 5z" fill="#A6C940" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 7.5c-1.2-1.7-3.8-2-5.3 0-1.7 2.2-1 6.3 1 8.3 1 1 1.6 1.2 4.3 1.2s3.3-.2 4.3-1.2c2-2 2.7-6.1 1-8.3-1.5-2-4.1-1.7-5.3 0z" fill="#F58220" />
      <path d="M12 7.5c0-1.6.9-2.7 2.2-3.2" stroke="#80B848" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" fill="#80B848" />
      <path d="M8 12.2l2.6 2.6L16 9.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckMini() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--green)" />
      <path d="M7.5 12.3l3 3 6-6.3" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PROGRAM_ICONS = [CapIcon, BookIcon, StarIcon];
const FEATURE_ICONS = [SpeechIcon, GroupIcon, AppleIcon, CheckIcon];

const CERTS = [
  "🏆 Cambridge English",
  "🎓 Chứng chỉ TESOL",
  "🎓 Chứng chỉ CELTA",
  "🧩 Phương pháp Immersive",
  "👶 Lớp ≤ 10 bé",
  "🌏 Giáo viên bản ngữ",
  "⭐ 99% phụ huynh hài lòng",
];

export default async function Home() {
  const c = await getContent();
  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Sự kiện: lấy tất cả published, phân loại theo date + endDate
  const now = new Date();
  const site = currentSite();
  const allEvents = await prisma.event.findMany({
    where: { site, status: "published" },
    orderBy: { date: "asc" },
  });

  // Phân loại: upcoming (chưa bắt đầu) + ongoing (đang diễn ra) = hiện tại; past = đã kết thúc
  const activeEvents: typeof allEvents = []; // ongoing + upcoming
  const pastEvents: typeof allEvents = [];

  for (const ev of allEvents) {
    const start = new Date(ev.date);
    const end = ev.endDate ? new Date(ev.endDate) : null;

    if (start > now) {
      activeEvents.push(ev); // Chưa bắt đầu → Sắp tới
    } else if (end) {
      if (end > now) {
        activeEvents.push(ev); // Đang diễn ra
      } else {
        pastEvents.push(ev); // Đã kết thúc
      }
    } else {
      // Không có endDate → sự kiện 1 ngày
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (startDay.getTime() === todayDay.getTime()) {
        activeEvents.push(ev); // Đang diễn ra trong ngày
      } else {
        pastEvents.push(ev);
      }
    }
  }

  // Sắp xếp: active theo ngày tăng dần, past theo ngày giảm dần (lấy tối đa 6)
  activeEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingEvents = activeEvents;
  const limitedPastEvents = pastEvents.slice(0, 6);

  const fmtEventDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  const upcomingCards = upcomingEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    description: ev.description,
    image: ev.image,
    dateLabel: fmtEventDate(ev.date) + (ev.endDate ? ` — ${fmtEventDate(ev.endDate)}` : ""),
    dateISO: ev.date.toISOString(),
    endDateISO: ev.endDate ? ev.endDate.toISOString() : null,
    location: ev.location,
    locations: ev.locations,
    ctaText: ev.ctaText,
    ctaLink: ev.ctaLink,
  }));

  const pastCards = limitedPastEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    image: ev.image,
    dateLabel: fmtEventDate(ev.date),
    dateISO: ev.date.toISOString(),
    location: ev.location,
  }));

  // Sự kiện nổi bật = sự kiện active gần nhất (đang diễn ra hoặc sắp tới)
  const featuredEvent = upcomingCards[0];
  const restUpcoming = upcomingCards.slice(1);

  // Kiểm tra xem featured event đang diễn ra hay sắp tới
  const featuredIsOngoing = featuredEvent
    ? new Date(featuredEvent.dateISO).getTime() <= now.getTime()
    : false;

  return (
    <>
      <ScrollTopOnLoad />
      <ScrollProgress />
      <JsonLd content={c} siteUrl={siteUrl} />
      <EngagementTracker />
      <ScrollReveal />

      <PromoBar />

      <header className="nav">
        <div className="wrap nav-in">
          <span className="logo">
            <img src="/logo.png" alt={c.centerName} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </span>
          <div className="nav-right">
            <ContactLink href={tel} method="phone" className="nav-phone">📞 {c.contact.phone}</ContactLink>
            <a href="#offer" className="btn btn-primary">🎁 Ưu đãi</a>
          </div>
        </div>
      </header>

      <section className="hero">
        <span className="hero-blob hb1" aria-hidden="true" />
        <span className="hero-blob hb2" aria-hidden="true" />
        <span className="hero-blob hb3" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">{c.hero.eyebrow}</span>
            <h1 className="hero-title-gradient">{c.hero.title}</h1>
            <p className="lead">{c.hero.subtitle}</p>
            <div className="hero-cta">
              <a href="#programs" className="btn btn-primary">Xem chương trình</a>
              <a href="#offer" className="btn btn-ghost">🎁 Xem ưu đãi</a>
            </div>
            <ul className="hero-trust">
              <li><CheckMini /> Giáo viên bản ngữ &amp; TESOL/CELTA</li>
              <li><CheckMini /> Lộ trình chuẩn Cambridge</li>
              <li><CheckMini /> Lớp nhỏ ≤ 10 bé</li>
            </ul>
          </div>
          <div className="hero-art">
            <div className="badge-ring">
              <div className="badge-ring-img">
                <Image
                  src={c.hero.image || "/logo.png"}
                  alt={c.centerName}
                  fill
                  sizes="(max-width: 860px) 80vw, 340px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
            {(c.heroChips ?? []).map((chip, i) => (
              <span key={i} className={`chip c${(i % 4) + 1}`}>
                <span className="d" style={{ background: chip.color }} /> {chip.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="wrap stat-grid">
          {c.stats.map((s, i) => (
            <div className="stat reveal" key={i}>
              <div className="num"><CountUp value={s.num} /></div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="wrap">
        <div className="cert-marquee" aria-label="Chứng nhận và phương pháp">
          <div className="cert-track">
            {CERTS.concat(CERTS).map((label, i) => (
              <span className="cert-pill" key={i}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <section className="programs" id="programs">
        <div className="wrap">
          <div className="head">
            <span className="kicker">Chương trình học</span>
            <h2>Lộ trình theo từng độ tuổi</h2>
          </div>
          <CardSlider className="prog-slider" autoMs={5000}>
            {c.programs.map((p, i) => {
              const Icon = PROGRAM_ICONS[i % PROGRAM_ICONS.length];
              return (
                <div className="prog" key={i}>
                  <span className="prog-step">{i + 1}</span>
                  <div className="pico"><Icon /></div>
                  <span className="age">{p.age}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              );
            })}
          </CardSlider>
        </div>
      </section>

      <WaveDivider color="var(--green-soft)" />

      <section className="why" id="why">
        <div className="wrap">
          <div className="head">
            <span className="kicker">Vì sao chọn chúng tôi</span>
            <h2>Điều khiến phụ huynh yên tâm</h2>
          </div>
          <div className="why-grid">
            {c.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <div className="feature reveal" key={i}>
                  <span className="fico"><Icon /></span>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="quiz-section">
        <div className="wrap">
          <div className="head reveal">
            <span className="kicker">Tư vấn nhanh</span>
            <h2>Tìm lộ trình phù hợp cho bé trong 30 giây 🧭</h2>
          </div>
          <RouteQuiz />
        </div>
      </section>

      {c.testimonials.length > 0 && (
        <section className="testimonials">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Phụ huynh nói gì</span>
              <h2>Hàng nghìn gia đình đã tin tưởng 💬</h2>
            </div>
            <TestimonialSlider items={c.testimonials} />
          </div>
        </section>
      )}

      {featuredEvent && (
        <section className="events-section events-highlight" id="events">
          <span className="ev-deco ev-deco-1" aria-hidden="true">🎈</span>
          <span className="ev-deco ev-deco-2" aria-hidden="true">🎉</span>
          <div className="wrap">
            <div className="head reveal">
              <span className="kicker">{featuredIsOngoing ? "Đang diễn ra" : "Sự kiện sắp tới"}</span>
              <h2>{featuredIsOngoing ? "Sự kiện đang diễn ra — tham gia ngay! 🔴" : "Đừng bỏ lỡ các hoạt động hấp dẫn 🎉"}</h2>
            </div>
            <FeaturedEvent event={featuredEvent} />
            {restUpcoming.length > 0 && (
              <EventCarousel events={restUpcoming} variant="full" />
            )}
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <a href="/su-kien" className="btn btn-ghost">Xem tất cả sự kiện →</a>
            </div>
          </div>
        </section>
      )}

      {pastCards.length > 0 && (
        <section className="events-section events-past">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Lịch sử</span>
              <h2>Sự kiện vừa diễn ra 📸</h2>
            </div>
            <EventCarousel events={pastCards} variant="history" />
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <a href="/su-kien" className="btn btn-ghost">Xem tất cả sự kiện →</a>
            </div>
          </div>
        </section>
      )}

      {c.gallery.length > 0 && (
        <section className="gallery">
          <div className="wrap">
            <div className="head">
              <span className="kicker">Không gian học tập</span>
              <h2>Một ngày ở {c.centerName} 📸</h2>
            </div>
            <Gallery images={c.gallery} centerName={c.centerName} />
          </div>
        </section>
      )}

      {c.faq.length > 0 && (
        <section className="faq-section">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: c.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }}
          />
          <div className="wrap">
            <div className="head">
              <span className="kicker">Câu hỏi thường gặp</span>
              <h2>Ba mẹ hay hỏi về điều gì?</h2>
            </div>
            <div className="faq-inner">
              <FaqSection items={c.faq} />
            </div>
          </div>
        </section>
      )}

      <section className="offer" id="offer">
        <div className="wrap">
          <div className="offer-card reveal">
            <span className="badge-free">🎁 ƯU ĐÃI</span>
            <h2>{c.promo.title}</h2>
            <p>{c.promo.desc}</p>
            <div className="offer-deadline">
              <div className="offer-deadline-label">⏳ Ưu đãi kết thúc sau:</div>
              <CountdownTimer />
            </div>
            <a href="#signup" className="btn btn-primary" style={{ marginTop: "1.4rem" }}>🎁 {c.hero.ctaText} →</a>
          </div>
        </div>
      </section>

      {c.wheel.enabled && c.wheel.prizes.length > 0 && (
        <section className="wheel-section">
          <div className="wrap">
            <div className="head reveal">
              <span className="kicker">Quay số trúng quà</span>
              <h2>Vòng quay may mắn 🎡</h2>
            </div>
            <LuckyWheel prizes={c.wheel.prizes} />
          </div>
        </section>
      )}

      {c.branches.some((b) => b.mapEmbed) && (
        <section className="locations" id="locations">
          <div className="wrap">
            <div className="head reveal">
              <span className="kicker">Ghé thăm chúng tôi</span>
              <h2>Hệ thống cơ sở 📍</h2>
            </div>
            <div className="loc-grid">
              {c.branches.map((b, i) => (
                <div className="loc-card reveal" key={i}>
                  {b.mapEmbed && (
                    <div className="loc-map">
                      <iframe
                        src={mapSrc(b.mapEmbed)}
                        loading="lazy"
                        title={`Bản đồ ${b.name}`}
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="loc-body">
                    <strong>{b.name}</strong>
                    {b.address && <span>{b.address}</span>}
                    {b.phone && <a href={`tel:${b.phone.replace(/\s/g, "")}`}>📞 {b.phone}</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="signup" id="signup">
        <div className="wrap">
          <div className="form-card reveal">
            <h2>Đăng ký học thử miễn phí 🎈</h2>
            <p className="sub">Để lại thông tin, trung tâm sẽ gọi lại để xếp lịch học thử cho bé.</p>
            <LeadForm ctaText={c.hero.ctaText} />
          </div>
        </div>
      </section>

      <WaveDivider color="#fcfbfa" />

      <footer>
        {/* Upper: Logo + tagline */}
        <div className="f-upper">
          <div className="wrap f-upper-in">
            <span className="logo">
              <img src="/logo.png" alt={c.centerName} style={{ background: "#fff", borderRadius: "50%", padding: 3 }} />
              <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
            </span>
            <p className="f-tagline">Chương trình tiếng Anh chuẩn quốc tế cho trẻ 3–15 tuổi.<br />Nền tảng vững chắc — bé tự tin giao tiếp toàn cầu.</p>
            <div className="f-socials">
              {c.contact.facebook && (
                <a href={c.contact.facebook} target="_blank" rel="noreferrer" className="f-soc f-facebook" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                </a>
              )}
              {c.contact.zalo && (
                <a href={c.contact.zalo.startsWith("http") ? c.contact.zalo : `https://zalo.me/${c.contact.zalo.replace(/\s/g, "")}`} target="_blank" rel="noreferrer" className="f-soc f-zalo" aria-label="Zalo">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 2C6.48 2 2 5.8 2 10.5c0 2.8 1.6 5.3 4 6.8-.2.7-.6 2.3-.6 2.3s1.9-1 2.8-1.4c1.2.3 2.5.4 3.8.4 5.52 0 10-3.8 10-8.5S17.52 2 12 2zm2.1 12.6H9.4v-1.1l3.1-3.9H9.4V8.5h4.7v1.1l-3.1 3.9h3.1v1.1z" />
                  </svg>
                </a>
              )}
              {c.contact.messenger && (
                <a href={c.contact.messenger} target="_blank" rel="noreferrer" className="f-soc f-messenger" aria-label="Messenger">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9a11 11 0 0 0 2.9.4c5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1.1 12.4-2.5-2.7L5.3 14.4l5.7-6.1 2.5 2.7 5.2-2.7z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Lower: 3 info columns */}
        <div className="f-lower">
          <div className="wrap f-cols">
            <div className="f-col">
              <h5 className="f-label">Về chúng tôi</h5>
              <p>ESL Academy đồng hành cùng phụ huynh xây dựng nền tiếng Anh vững chắc cho trẻ từ mầm non đến trung học cơ sở, với phương pháp immersive và giáo viên bản ngữ.</p>
            </div>
            {c.branches.length > 0 && (
              <div className="f-col">
                <h5 className="f-label">Hệ thống cơ sở</h5>
                {c.branches.map((b, i) => (
                  <div className="f-entry" key={i}>
                    <strong>{b.name}</strong>
                    <span>{b.address}</span>
                    {b.phone && <a href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a>}
                  </div>
                ))}
              </div>
            )}
            <div className="f-col">
              <h5 className="f-label">Liên hệ</h5>
              <div className="f-entry">
                <strong>Hotline</strong>
                <a href={tel}>{c.contact.phone}</a>
              </div>
              <div className="f-entry">
                <strong>Email</strong>
                <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
              </div>
              <div className="f-entry">
                <strong>Trụ sở</strong>
                <span>{c.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="f-bar">
          <div className="wrap">
            © {new Date().getFullYear()} {c.centerName}. All rights reserved.
            {" · "}
            <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>
          </div>
        </div>
      </footer>

      <div className="mobile-cta">
        <a href={tel} className="mcta-call">📞 Gọi ngay</a>
        <a href="#signup" className="mcta-reg btn btn-primary">🎁 Đăng ký</a>
      </div>

      <SocialChatWidgets fbPageId={c.contact.fbPageId} zaloOAId={c.contact.zaloOAId} />

      <ChatbotWidget config={c.chatbot} faq={c.faq} />

      <ContactButtons
        phone={c.contact.phone}
        zalo={c.contact.zalo}
        messenger={c.contact.messenger}
        facebook={c.contact.facebook}
        fbPageId={c.contact.fbPageId}
      />

      <ExitPopup title={c.promo.title} desc={c.promo.desc} />
      {c.socialProof.enabled && c.socialProof.items.length > 0 && (
        <SocialProofToast items={c.socialProof.items} />
      )}
    </>
  );
}
