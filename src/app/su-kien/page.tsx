import { prisma } from "@/lib/db";
import { getContent } from "@/lib/content";
import { currentSite } from "@/lib/site";
import EventTabs from "./EventTabs";
import { ContactLink, ContactButtons } from "../Contact";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const c = await getContent();
  return {
    title: `Sự kiện — ${c.centerName}`,
    description: `Các sự kiện, hoạt động sắp tới và đã diễn ra tại ${c.centerName}.`,
  };
}

export default async function EventsPage() {
  const now = new Date();

  const site = currentSite();
  const [upcoming, past, c] = await Promise.all([
    prisma.event.findMany({
      where: { site, status: "published", date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { site, status: "published", date: { lt: now } },
      orderBy: { date: "desc" },
    }),
    getContent(),
  ]);

  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="/" className="logo">
            <img src="/logo.png" alt={c.centerName} />
            <span className="wm">{c.centerName}<small>English as a Second Language</small></span>
          </a>
          <div className="nav-right">
            <a href="/" className="btn btn-ghost">← Trang chủ</a>
          </div>
        </div>
      </header>

      <section className="ev-page">
        <div className="wrap">
          <div className="head">
            <span className="kicker">Sự kiện</span>
            <h1>Hoạt động tại trung tâm 🎉</h1>
          </div>
          <EventTabs
            upcoming={JSON.parse(JSON.stringify(upcoming))}
            past={JSON.parse(JSON.stringify(past))}
          />
        </div>
      </section>

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
