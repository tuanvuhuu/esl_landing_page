import { prisma } from "@/lib/db";
import { getContent } from "@/lib/content";
import { currentSite } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { ContactLink, ContactButtons } from "../../Contact";
import LeadForm from "../../LeadForm";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await prisma.event.findFirst({ where: { id: Number(params.id), site: currentSite() } });
  if (!ev) return { title: "Không tìm thấy sự kiện" };
  const c = await getContent();
  return {
    title: `${ev.title} — ${c.centerName}`,
    description: ev.description?.slice(0, 150) || `Sự kiện tại ${c.centerName}`,
    openGraph: ev.image ? { images: [ev.image] } : undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const [ev, c] = await Promise.all([
    prisma.event.findFirst({ where: { id: Number(params.id), site: currentSite() } }),
    getContent(),
  ]);

  if (!ev || ev.status !== "published") notFound();

  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;
  const isPast = ev.date < new Date();

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="/" className="logo">
            <img src="/logo.png" alt={c.centerName} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </a>
          <div className="nav-right" style={{ gap: "0.6rem" }}>
            <a href="/" className="btn btn-ghost">Trang chủ</a>
            <a href="/su-kien" className="btn btn-ghost">← Tất cả sự kiện</a>
          </div>
        </div>
      </header>

      <main className="ev-detail-page">
        <div className="wrap ev-detail-wrap">

          {/* Ảnh bìa */}
          {ev.image && (
            <div className="ev-detail-img">
              <Image
                src={ev.image}
                alt={ev.title}
                fill
                sizes="(max-width: 820px) 92vw, 780px"
                style={{ objectFit: "cover" }}
                priority
              />
              {isPast && <span className="ev-badge-past">Đã diễn ra</span>}
            </div>
          )}

          {/* Nội dung */}
          <div className="ev-detail-body">
            <div className="ev-date" style={{ fontSize: "0.95rem", marginBottom: "0.6rem" }}>
              📅 {fmtDate(ev.date)}
              {ev.endDate && ` – ${fmtDate(ev.endDate)}`}
            </div>

            <h1 className="ev-detail-title">{ev.title}</h1>

            {ev.location && (
              <p className="ev-detail-meta">📍 {ev.location}</p>
            )}

            {ev.description && (
              <div className="ev-detail-desc">
                {ev.description.split("\n").map((line, i) =>
                  line.trim() === "" ? <br key={i} /> : <p key={i}>{line}</p>
                )}
              </div>
            )}

            {/* Gallery ảnh phụ */}
            {(() => {
              let imgs: string[] = [];
              try { imgs = JSON.parse((ev as Record<string, unknown>).images as string ?? "[]"); } catch { imgs = []; }
              if (!imgs.length) return null;
              return (
                <div className="ev-detail-gallery-wrap">
                  <Gallery images={imgs} centerName={ev.title} />
                </div>
              );
            })()}

            {/* CTA */}
            {!isPast && ev.ctaLink && ev.ctaLink !== "#signup" && (
              <div className="ev-detail-cta">
                <a
                  href={ev.ctaLink}
                  className="btn btn-primary"
                  target={ev.ctaLink.startsWith("http") ? "_blank" : undefined}
                  rel={ev.ctaLink.startsWith("http") ? "noreferrer" : undefined}
                >
                  {ev.ctaText || "Đăng ký tham gia"} →
                </a>
                <a href={tel} className="btn btn-ghost">
                  📞 Gọi ngay {c.contact.phone}
                </a>
              </div>
            )}

            {isPast && (
              <div className="ev-detail-cta">
                <a href="/#signup" className="btn btn-primary">
                  🎁 Đăng ký khoá học tiếp theo →
                </a>
              </div>
            )}

            {/* Form đăng ký trực tiếp ngay trên trang sự kiện */}
            {(!ev.ctaLink || ev.ctaLink === "#signup") && !isPast && (
              <div id="register" className="ev-register-section" style={{ marginTop: "2.5rem", padding: "1.5rem", background: "#fbfaf7", borderRadius: 16, border: "1px solid #e2dfd5" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Đăng ký tham gia sự kiện</h3>
                <p style={{ fontSize: "0.88rem", color: "#6b6480", marginBottom: "1.2rem" }}>
                  Ba mẹ vui lòng để lại thông tin dưới đây, trung tâm sẽ liên hệ xác nhận trong thời gian sớm nhất.
                </p>
                <LeadForm
                  ctaText={ev.ctaText || "Đăng ký tham gia"}
                  initialAgeGroup={`Sự kiện: ${ev.title}`}
                  hideAgeSelect={true}
                  eventId={ev.id}
                />
              </div>
            )}
          </div>

        </div>
      </main>

      <footer>
        <div className="wrap">
          <span className="logo">
            <img src="/logo.png" alt={c.centerName} style={{ background: "#fff", borderRadius: "50%", padding: 3 }} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </span>
          <p className="row"><ContactLink href={tel} method="phone">📞 {c.contact.phone}</ContactLink></p>
          <p className="row">📍 {c.contact.address}</p>
          <p className="row">✉️ {c.contact.email}</p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {c.contact.facebook && (
              <a href={c.contact.facebook} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#3b5998", fontWeight: 700, fontSize: "0.95rem" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
                Facebook
              </a>
            )}
            {c.contact.zalo && (
              <a href={c.contact.zalo.startsWith("http") ? c.contact.zalo : `https://zalo.me/${c.contact.zalo.replace(/\s/g, "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#0068ff", fontWeight: 700, fontSize: "0.95rem" }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2C6.48 2 2 5.8 2 10.5c0 2.8 1.6 5.3 4 6.8-.2.7-.6 2.3-.6 2.3s1.9-1 2.8-1.4c1.2.3 2.5.4 3.8.4 5.52 0 10-3.8 10-8.5S17.52 2 12 2zm2.1 12.6H9.4v-1.1l3.1-3.9H9.4V8.5h4.7v1.1l-3.1 3.9h3.1v1.1z"/>
                </svg>
                Zalo
              </a>
            )}
            {c.contact.messenger && (
              <a href={c.contact.messenger} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#00b2ff", fontWeight: 700, fontSize: "0.95rem" }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9a11 11 0 0 0 2.9.4c5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1.1 12.4-2.5-2.7L5.3 14.4l5.7-6.1 2.5 2.7 5.2-2.7z"/>
                </svg>
                Messenger
              </a>
            )}
          </div>

          <p className="row" style={{ marginTop: "1.5rem", fontSize: "0.85rem", opacity: 0.6 }}>
            © {new Date().getFullYear()} {c.centerName}
          </p>
        </div>
      </footer>

      <div className="mobile-cta">
        {c.contact.zalo && (
          <a
            href={c.contact.zalo.startsWith("http") ? c.contact.zalo : `https://zalo.me/${c.contact.zalo.replace(/\s/g, "")}`}
            className="mcta-zalo"
            target="_blank"
            rel="noreferrer"
          >
            💬 Zalo
          </a>
        )}
        <a href={tel} className="mcta-call">📞 Gọi ngay</a>
        <a href="/#signup" className="mcta-reg btn btn-primary">🎁 Đăng ký</a>
      </div>

      <ContactButtons
        phone={c.contact.phone}
        zalo={c.contact.zalo}
        messenger={c.contact.messenger}
        facebook={c.contact.facebook}
      />
    </>
  );
}
