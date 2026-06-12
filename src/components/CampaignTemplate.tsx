import LeadForm from "@/app/LeadForm";
import { ContactButtons } from "@/app/Contact";
import CountdownTimer from "@/components/CountdownTimer";
import EngagementTracker from "@/app/EngagementTracker";
import type { SiteContent } from "@/lib/content";
import styles from "./CampaignTemplate.module.css";

// Event được render bằng template "campaign" — landing page chạy ads.
// Tách field rời để không khoá vào Prisma type (cho phép import từ server component khác site).
export type CampaignEvent = {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string; // JSON array
  date: Date;
  endDate: Date | null;
  location: string;
  ctaText: string;
};

// Mặc định 3 khối nội dung dùng cho mọi campaign mầm non.
// Tương lai có thể đọc từ JSON trong event.description hoặc field riêng nếu cần tuỳ biến.
const BENEFITS = [
  {
    emoji: "🎵",
    title: "Học qua trò chơi – bài hát – vận động",
    desc: "Bé học bằng cả cơ thể, không ngồi yên một chỗ. Tiếp thu nhẹ nhàng, không áp lực.",
  },
  {
    emoji: "👂",
    title: "Phản xạ Nghe – Nói tự nhiên",
    desc: "Tiếp xúc tiếng Anh chuẩn mỗi ngày để hình thành phản xạ ngôn ngữ ngay từ nhỏ.",
  },
  {
    emoji: "💬",
    title: "Tự tin khi giao tiếp",
    desc: "Môi trường English-only giúp bé mạnh dạn nói tiếng Anh, không ngại sai.",
  },
  {
    emoji: "🏫",
    title: "Môi trường học hiện đại",
    desc: "Phòng học sinh động, giáo cụ trực quan, lớp ≤ 10 bé để cô bao quát từng con.",
  },
];

const METHOD = [
  { step: "1", title: "Nghe & Hát", desc: "Bài hát tiếng Anh dễ thuộc giúp bé làm quen âm thanh và ngữ điệu." },
  { step: "2", title: "Chơi & Vận động", desc: "Trò chơi nhóm, role-play, TPR — bé học bằng cả cơ thể, ghi nhớ lâu hơn." },
  { step: "3", title: "Kể chuyện & Sáng tạo", desc: "Kể chuyện tranh, vẽ, thủ công — bé bắt đầu hình thành câu hoàn chỉnh." },
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: "Bé nhà mình 4 tuổi, sau 2 tháng học đã hát được 5–6 bài tiếng Anh và tự chào ông bà mỗi sáng. Rất bất ngờ!",
    name: "Chị Hương",
    role: "Phụ huynh bé Bin (4 tuổi)",
  },
  {
    stars: 5,
    text: "Cô giáo nhiệt tình, lớp ít bé nên con được quan tâm sát sao. Mỗi buổi học con đều háo hức đến lớp.",
    name: "Anh Tuấn",
    role: "Phụ huynh bé Sóc (5 tuổi)",
  },
  {
    stars: 5,
    text: "Con học cùng giáo viên nước ngoài nên phát âm rất chuẩn. Sau 3 tháng con tự tin chào người lạ bằng tiếng Anh.",
    name: "Chị Linh",
    role: "Phụ huynh bé An (5 tuổi)",
  },
];

const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export default function CampaignTemplate({
  event,
  siteContent,
}: {
  event: CampaignEvent;
  siteContent: SiteContent;
}) {
  const c = siteContent;
  const tel = `tel:${c.contact.phone.replace(/\s/g, "")}`;
  const monthLabel = `${MONTHS_VI[event.date.getMonth()]}/${event.date.getFullYear()}`;
  const ctaText = event.ctaText || "Đăng ký học thử miễn phí";

  return (
    <div className={styles.page}>
      <EngagementTracker />

      <header className={styles.topbar}>
        <div className={`wrap ${styles.topbarIn}`}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo.png" alt={c.centerName} />
            <span className={styles.brandText}>{c.centerName}</span>
          </div>
          <a href={tel} className="btn btn-green" style={{ fontSize: "0.85rem" }}>
            📞 {c.contact.phone}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <div className="wrap">
          <span className={styles.kicker}>🎉 Khai giảng {monthLabel}</span>
          <h1 className={styles.h1}>{event.title}</h1>
          {event.description && (
            <p className={styles.sub}>
              {event.description.split("\n")[0]}
            </p>
          )}

          {event.image && (
            <div className={styles.heroImage}>
              <img src={event.image} alt={event.title} />
            </div>
          )}

          <div className={styles.heroCta}>
            <a href="#signup" className={`btn btn-primary ${styles.bigBtn}`}>
              🎁 {ctaText}
            </a>
            <a href="#offer" className={`btn btn-ghost ${styles.bigBtn}`}>
              Xem ưu đãi
            </a>
          </div>
          <div className={styles.trustRow}>
            <span>✅ Giáo viên nước ngoài</span>
            <span>✅ Lớp ≤ 10 bé</span>
            <span>✅ Học phí ưu đãi</span>
          </div>
        </div>
      </section>

      {/* BÉ SẼ HỌC ĐƯỢC GÌ */}
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <h2>Tại {c.centerName}, bé sẽ được gì?</h2>
            <p>Chương trình thiết kế riêng cho lứa tuổi mầm non — vui, nhẹ nhàng, hiệu quả.</p>
          </div>
          <div className={styles.benefitGrid}>
            {BENEFITS.map((b, i) => (
              <div className={styles.benefit} key={i}>
                <span className={styles.emoji}>{b.emoji}</span>
                <div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHT: GIÁO VIÊN NƯỚC NGOÀI */}
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.highlightCard}>
            <div className={styles.highlightBadge}>⭐ ĐẶC BIỆT</div>
            <h2>Học cùng Giáo viên Nước ngoài 🌍</h2>
            <p>
              Bé được tiếp xúc <strong>chuẩn phát âm bản ngữ</strong> ngay từ những năm đầu đời —
              giai đoạn vàng để hình thành phản xạ tiếng Anh tự nhiên như tiếng mẹ đẻ.
            </p>
            <ul className={styles.highlightList}>
              <li>Giáo viên giàu kinh nghiệm với trẻ mầm non</li>
              <li>Phương pháp Immersive — học qua tương tác trực tiếp</li>
              <li>Có trợ giảng Việt Nam hỗ trợ bé khi cần</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PHƯƠNG PHÁP 3 BƯỚC */}
      <section className={styles.section} style={{ background: "rgba(255,255,255,0.6)" }}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <h2>Phương pháp học — 3 bước đơn giản</h2>
            <p>Bé học bằng tất cả các giác quan, không chỉ ngồi yên một chỗ.</p>
          </div>
          <div className={styles.methodGrid}>
            {METHOD.map((m, i) => (
              <div className={styles.methodCard} key={i}>
                <span className={styles.step}>{m.step}</span>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHỤ HUYNH NÓI GÌ */}
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <h2>Phụ huynh nói gì về chúng tôi 💬</h2>
          </div>
          <div className={styles.testGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div className={styles.testCard} key={i}>
                <div className={styles.stars}>{"⭐".repeat(t.stars)}</div>
                <p className={styles.testText}>&quot;{t.text}&quot;</p>
                <div className={styles.testAuthor}>
                  {t.name} <span>· {t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ƯU ĐÃI — đọc nội dung từ event.description (các dòng sau dòng đầu) */}
      <section className={styles.section} id="offer">
        <div className="wrap">
          <div className={styles.offerCard}>
            <span className={styles.offerBadge}>🎁 ƯU ĐÃI KHAI GIẢNG</span>
            <h2>{ctaText}</h2>
            <OfferList description={event.description} />
            <div className={styles.deadlineWrap}>
              <div className={styles.deadlineLabel}>⏳ Ưu đãi kết thúc sau:</div>
              <CountdownTimer />
            </div>
            <a
              href="#signup"
              className="btn btn-ghost"
              style={{ marginTop: "1rem", background: "#fff" }}
            >
              🎯 Đăng ký ngay
            </a>
          </div>
        </div>
      </section>

      {/* INFO GRID */}
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>📅</span>
              <h3>Khai giảng</h3>
              <p>{monthLabel}</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>📍</span>
              <h3>Địa điểm</h3>
              <p>{event.location || c.contact.address}</p>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>👨‍🏫</span>
              <h3>Sĩ số</h3>
              <p>
                ≤ 10 bé/lớp
                <br />
                <small>Số lượng có hạn</small>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className={styles.section} id="signup">
        <div className="wrap">
          <div className={styles.formCard}>
            <h2>Đăng ký giữ chỗ cho bé 🎈</h2>
            <p className={styles.formSub}>
              Lớp giới hạn 10 bé. Để lại thông tin, trung tâm gọi lại trong 24h để xếp lịch học thử miễn phí.
            </p>
            <LeadForm
              ctaText={ctaText}
              initialAgeGroup="3–4 tuổi"
              eventId={event.id}
            />
          </div>
        </div>
      </section>

      <div className={styles.miniFooter}>
        © {new Date().getFullYear()} {c.centerName} · Hotline:{" "}
        <a href={tel} style={{ color: "var(--green-deep)", fontWeight: 700 }}>
          {c.contact.phone}
        </a>
      </div>

      <ContactButtons
        phone={c.contact.phone}
        zalo={c.contact.zalo}
        messenger={c.contact.messenger}
        facebook={c.contact.facebook}
        fbPageId={c.contact.fbPageId}
      />
    </div>
  );
}

// Lấy các dòng sau dòng đầu của description làm danh sách ưu đãi.
// Dòng đầu được dùng làm sub trên hero, các dòng còn lại làm bullet ✅.
function OfferList({ description }: { description: string }) {
  const lines = description
    .split("\n")
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <ul className={styles.offerList}>
        <li>Tặng 2 tuần học trải nghiệm miễn phí</li>
        <li>Học cùng giáo viên nước ngoài</li>
        <li>Miễn phí kiểm tra trình độ đầu vào</li>
      </ul>
    );
  }

  return (
    <ul className={styles.offerList}>
      {lines.map((line, i) => (
        <li key={i}>{line.replace(/^[-•✅✓]\s*/, "")}</li>
      ))}
    </ul>
  );
}
