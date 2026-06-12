import { getContent } from "@/lib/content";
import ThankYouTracker from "./ThankYouTracker";

export const dynamic = "force-dynamic";

export const metadata = { title: "Cảm ơn bạn đã đăng ký — ESL Academy" };

export default async function ThankYou() {
  const c = await getContent();
  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;

  return (
    <main className="ty-wrap">
      <ThankYouTracker />
      <div className="ty-card">
        <img src="/logo.png" alt={c.centerName} className="ty-logo" />
        <div className="ty-emoji">🎉</div>
        <h1>Đăng ký thành công!</h1>
        <p>
          Cảm ơn ba mẹ đã đăng ký cho bé học thử tại <b>{c.centerName}</b>. Bộ phận tư vấn sẽ
          liên hệ trong vòng <b>24 giờ</b> để xếp lịch học thử phù hợp cho bé.
        </p>
        <p className="ty-sub">Trong lúc chờ, ba mẹ có thể liên hệ ngay với trung tâm:</p>
        <div className="ty-actions" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          <a className="btn btn-primary" href={tel} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
            </svg>
            Gọi {c.contact.phone}
          </a>
          {c.contact.zalo && (
            <a
              className="btn"
              style={{ background: "#0068ff", color: "#fff", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              href={c.contact.zalo.startsWith("http") ? c.contact.zalo : `https://zalo.me/${c.contact.zalo.replace(/\s/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.48 2 2 5.8 2 10.5c0 2.8 1.6 5.3 4 6.8-.2.7-.6 2.3-.6 2.3s1.9-1 2.8-1.4c1.2.3 2.5.4 3.8.4 5.52 0 10-3.8 10-8.5S17.52 2 12 2zm2.1 12.6H9.4v-1.1l3.1-3.9H9.4V8.5h4.7v1.1l-3.1 3.9h3.1v1.1z" />
              </svg>
              Nhắn Zalo
            </a>
          )}
          {c.contact.messenger && (
            <a
              className="btn"
              style={{ background: "linear-gradient(135deg, #006aff, #00c6ff)", color: "#fff", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              href={c.contact.messenger.startsWith("http") ? c.contact.messenger : `https://m.me/${c.contact.messenger}`}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.15 5.54 3.03 7.46.15.15.24.36.24.58l-.02 1.84c0 .4.44.68.8.48l2.06-1.15c.18-.1.4-.1.58-.04 1.02.28 2.1.43 3.3.43 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.22 12.18l-2.44-2.6-4.76 2.6 5.22-5.55 2.44 2.6 4.76-2.6-5.22 5.55z" />
              </svg>
              Messenger
            </a>
          )}
          {c.contact.facebook && (
            <a
              className="btn"
              style={{ background: "#1877f2", color: "#fff", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              href={c.contact.facebook}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
              Fanpage Facebook
            </a>
          )}
          <a className="btn btn-ghost" href="/" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            Về trang chủ
          </a>
        </div>
      </div>
    </main>
  );
}
