import { prisma } from "@/lib/db";
import { getContent } from "@/lib/content";
import { currentSite } from "@/lib/site";
import EventTabs from "./EventTabs";
import { ContactButtons } from "../Contact";

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

  // Lấy tất cả sự kiện published, sau đó phân loại trên server
  const [allEvents, c] = await Promise.all([
    prisma.event.findMany({
      where: { site, status: "published" },
      orderBy: { date: "asc" },
    }),
    getContent(),
  ]);

  // Phân loại sự kiện dựa trên date (bắt đầu) và endDate (kết thúc)
  const ongoing: typeof allEvents = [];
  const upcoming: typeof allEvents = [];
  const past: typeof allEvents = [];

  for (const ev of allEvents) {
    const start = new Date(ev.date);
    const end = ev.endDate ? new Date(ev.endDate) : null;

    if (start > now) {
      // Chưa bắt đầu → Sắp tới
      upcoming.push(ev);
    } else if (end) {
      // Đã bắt đầu, có endDate
      if (end > now) {
        ongoing.push(ev); // endDate chưa qua → Đang diễn ra
      } else {
        past.push(ev); // endDate đã qua → Đã kết thúc
      }
    } else {
      // Đã bắt đầu, KHÔNG có endDate → coi như sự kiện 1 ngày
      // So sánh ngày (không tính giờ): nếu cùng ngày thì đang diễn ra
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (startDay.getTime() === todayDay.getTime()) {
        ongoing.push(ev);
      } else {
        past.push(ev);
      }
    }
  }

  // Sắp xếp: ongoing & upcoming theo ngày tăng dần, past theo ngày giảm dần
  ongoing.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
            ongoing={JSON.parse(JSON.stringify(ongoing))}
            upcoming={JSON.parse(JSON.stringify(upcoming))}
            past={JSON.parse(JSON.stringify(past))}
          />
        </div>
      </section>

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
