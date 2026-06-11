import { cache } from "react";
import { prisma } from "@/lib/db";
import { currentSite, normalizeSite } from "@/lib/site";

export type Program = { age: string; title: string; desc: string };
export type Testimonial = { name: string; role: string; text: string; rating: number; avatar: string };
export type FaqItem = { q: string; a: string };
export type Stat = { num: string; lbl: string };
export type Feature = { title: string; desc: string };
export type ChatTopic = { label: string; answer: string };
export type Branch = { name: string; address: string; phone: string; mapEmbed: string };
export type WheelPrize = { short: string; full: string; color: string };
export type SocialProofItem = { name: string; area: string };
export type HeroChip = { label: string; color: string };
export type Chatbot = {
  enabled: boolean;
  title: string;
  greeting: string;
  topics: ChatTopic[];
  includeFaq: boolean;
  leadEnabled: boolean;
  leadButtonLabel: string;
  leadPrompt: string;
  leadAskName: string;
  leadAskPhone: string;
  leadSuccess: string;
};

export type SiteContent = {
  centerName: string;
  hero: { title: string; subtitle: string; ctaText: string; image: string; eyebrow: string };
  heroChips: HeroChip[];
  stats: Stat[];
  programs: Program[];
  features: Feature[];
  testimonials: Testimonial[];
  gallery: string[];
  faq: FaqItem[];
  promo: { title: string; desc: string };
  contact: { phone: string; address: string; email: string; zalo: string; messenger: string; facebook: string; fbPageId: string; zaloOAId: string };
  branches: Branch[];
  chatbot: Chatbot;
  wheel: { enabled: boolean; prizes: WheelPrize[] };
  socialProof: { enabled: boolean; items: SocialProofItem[] };
};

export const defaultContent: SiteContent = {
  centerName: "ESL Academy",
  hero: {
    title: "Cho bé yêu tiếng Anh ngay từ nhỏ",
    subtitle:
      "Chương trình English as a Second Language cho bé 3–15 tuổi: học qua trò chơi, bài hát cùng giáo viên bản ngữ. Lớp nhỏ, chăm sóc từng bé.",
    ctaText: "Đăng ký học thử",
    image: "",
    eyebrow: "🎓 Đang nhận học viên kỳ mới",
  },
  heroChips: [
    { label: "Giáo viên bản ngữ", color: "#80B848" },
    { label: "Lớp ≤ 10 bé", color: "#F58220" },
  ],
  stats: [
    { num: "2.000+", lbl: "Học viên" },
    { num: "8 năm", lbl: "Kinh nghiệm" },
    { num: "99%", lbl: "Phụ huynh hài lòng" },
    { num: "≤ 10", lbl: "Bé mỗi lớp" },
  ],
  programs: [
    { age: "3–4 tuổi", title: "Mầm non làm quen", desc: "Tiếp xúc tiếng Anh tự nhiên qua bài hát, câu chuyện và trò chơi vận động." },
    { age: "5–7 tuổi", title: "Khám phá tiểu học", desc: "Xây nền phát âm chuẩn, bắt đầu đọc – viết và giao tiếp theo chủ đề." },
    { age: "8–10 tuổi", title: "Tự tin hội nhập", desc: "Thành thạo 4 kỹ năng, luyện thi Cambridge Starters/Movers/Flyers." },
  ],
  features: [
    { title: "Giáo viên bản ngữ & Việt Nam", desc: "Đội ngũ giàu kinh nghiệm với trẻ nhỏ, có chứng chỉ TESOL/CELTA, kiên nhẫn và yêu trẻ." },
    { title: "Lớp nhỏ tối đa 10 bé", desc: "Mỗi bé được quan tâm sát sao, giáo viên nắm rõ tiến độ và tính cách từng em." },
    { title: "Học mà chơi, chơi mà học", desc: "Phương pháp lấy trẻ làm trung tâm, học qua trò chơi nên bé thích đến lớp." },
    { title: "Báo cáo cho phụ huynh", desc: "Cập nhật hình ảnh và tiến độ học tập của bé đều đặn qua nhóm Zalo riêng." },
  ],
  testimonials: [
    { name: "Chị Nguyễn Thị Lan", role: "Mẹ của bé Minh Khôi, 5 tuổi", text: "Bé nhà mình nhút nhát lắm, nhưng sau 3 tháng học ở đây đã tự tin nói tiếng Anh với cô rồi. Cô giáo rất kiên nhẫn và yêu trẻ!", rating: 5, avatar: "" },
    { name: "Anh Trần Văn Hùng", role: "Ba của bé Bảo Châu, 7 tuổi", text: "Lớp nhỏ nên con được chú ý sát hơn. Mỗi tuần có báo cáo tiến độ qua Zalo, ba mẹ nắm được con đang học đến đâu.", rating: 5, avatar: "" },
    { name: "Chị Lê Hồng Hạnh", role: "Mẹ của bé Ngọc Anh, 4 tuổi", text: "Chương trình mầm non rất hay, học qua bài hát và trò chơi nên bé không chán. Con thích đến lớp hơn cả đi học mẫu giáo!", rating: 5, avatar: "" },
  ],
  gallery: [],
  faq: [
    { q: "Trung tâm nhận bé từ mấy tuổi?", a: "Chúng tôi nhận bé từ 3 tuổi trở lên và có chương trình riêng cho từng độ tuổi: 3–4, 5–7 và 8–10 tuổi." },
    { q: "Một buổi học thử có mất phí không?", a: "Hoàn toàn miễn phí! Ba mẹ chỉ cần đăng ký, trung tâm sẽ liên hệ xếp lịch và bé được trải nghiệm 1 buổi học thực tế." },
    { q: "Lịch học như thế nào?", a: "Lớp học diễn ra 2–3 buổi/tuần, mỗi buổi 60–90 phút. Ba mẹ có thể chọn ca sáng, chiều hoặc tối phù hợp." },
    { q: "Giáo viên có chứng chỉ quốc tế không?", a: "Tất cả giáo viên đều có chứng chỉ TESOL hoặc CELTA và ít nhất 2 năm kinh nghiệm dạy trẻ em." },
    { q: "Trung tâm theo dõi tiến độ của bé như thế nào?", a: "Mỗi tháng có đánh giá tiến độ gửi qua Zalo. Nhóm Zalo lớp học cũng cập nhật hình ảnh hoạt động hàng tuần." },
  ],
  promo: {
    title: "Tặng 1 buổi học thử + quà cho bé",
    desc: "Đăng ký hôm nay, bé được trải nghiệm 1 buổi học miễn phí và nhận quà từ ESL Academy.",
  },
  contact: {
    phone: "0900 000 000",
    address: "123 Đường ABC, Quận XYZ",
    email: "hello@eslacademy.edu.vn",
    zalo: "",
    messenger: "",
    facebook: "",
    fbPageId: "",
    zaloOAId: "",
  },
  branches: [
    {
      name: "Cơ sở 1 — Quận 1",
      address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
      phone: "0900 000 001",
      mapEmbed: "",
    },
    {
      name: "Cơ sở 2 — Quận 7",
      address: "456 Đường DEF, Phường UVW, Quận 7, TP.HCM",
      phone: "0900 000 002",
      mapEmbed: "",
    },
  ],
  chatbot: {
    enabled: true,
    title: "Trợ lý ESL 🤖",
    greeting: "Xin chào ba mẹ! 👋 Em là trợ lý của ESL Academy. Ba mẹ muốn tìm hiểu điều gì ạ?",
    topics: [
      { label: "🎓 Các khóa học", answer: "Trung tâm có 3 chương trình theo độ tuổi: Mầm non làm quen (3–4 tuổi), Khám phá tiểu học (5–7 tuổi) và Tự tin hội nhập (8–10 tuổi). Ba mẹ muốn tư vấn lớp phù hợp cho bé không ạ?" },
      { label: "💰 Học phí", answer: "Học phí tùy theo độ tuổi và lịch học. Ba mẹ để lại số điện thoại, trung tâm sẽ gọi lại báo học phí chi tiết và ưu đãi hiện có nhé!" },
      { label: "🕐 Lịch học", answer: "Lớp học 2–3 buổi/tuần, mỗi buổi 60–90 phút, có ca sáng/chiều/tối linh hoạt. Ba mẹ chọn được khung giờ phù hợp với bé ạ." },
      { label: "🎁 Học thử miễn phí", answer: "Trung tâm tặng 1 buổi học thử miễn phí + quà cho bé! Ba mẹ bấm 'Đăng ký tư vấn' để em xếp lịch ngay nhé." },
    ],
    includeFaq: true,
    leadEnabled: true,
    leadButtonLabel: "📝 Đăng ký tư vấn",
    leadPrompt: "Ba mẹ để lại thông tin, trung tâm sẽ liên hệ tư vấn miễn phí nhé!",
    leadAskName: "Cho em xin tên của ba/mẹ với ạ?",
    leadAskPhone: "Ba mẹ cho em xin số điện thoại để trung tâm liên hệ lại nhé?",
    leadSuccess: "Cảm ơn ba mẹ! 💚 Trung tâm sẽ liên hệ trong thời gian sớm nhất ạ.",
  },
  wheel: {
    enabled: true,
    prizes: [
      { short: "Giảm 10%", full: "Giảm 10% học phí", color: "#80b848" },
      { short: "Buổi học thử", full: "Tặng 1 buổi học thử miễn phí", color: "#f58220" },
      { short: "Voucher 200k", full: "Voucher 200.000đ", color: "#a6c940" },
      { short: "Bộ học cụ", full: "Tặng bộ học cụ cho bé", color: "#e2710e" },
      { short: "Giảm 5%", full: "Giảm 5% học phí", color: "#5f8f2e" },
      { short: "Tặng sách", full: "Tặng sách Tiếng Anh", color: "#f9a94d" },
    ],
  },
  socialProof: {
    enabled: true,
    items: [
      { name: "Chị Hương", area: "Quận 7" },
      { name: "Anh Tuấn", area: "Quận 1" },
      { name: "Chị Mai", area: "Thủ Đức" },
      { name: "Chị Lan", area: "Bình Thạnh" },
      { name: "Anh Dũng", area: "Quận 3" },
      { name: "Chị Thảo", area: "Gò Vấp" },
      { name: "Chị Ngọc", area: "Quận 10" },
      { name: "Anh Hải", area: "Tân Bình" },
    ],
  },
};

export const getContent = cache(async (site?: string): Promise<SiteContent> => {
  const key = normalizeSite(site || currentSite());
  const row = await prisma.siteContent.findUnique({ where: { site: key } });
  if (!row) return defaultContent;
  try {
    const parsed = JSON.parse(row.data) as Partial<SiteContent>;
    return {
      ...defaultContent,
      ...parsed,
      hero: { ...defaultContent.hero, ...parsed.hero },
      heroChips: parsed.heroChips ?? defaultContent.heroChips,
      contact: { ...defaultContent.contact, ...parsed.contact },
      chatbot: { ...defaultContent.chatbot, ...parsed.chatbot },
      wheel: {
        ...defaultContent.wheel,
        ...parsed.wheel,
        prizes: parsed.wheel?.prizes ?? defaultContent.wheel.prizes,
      },
      socialProof: {
        ...defaultContent.socialProof,
        ...parsed.socialProof,
        items: parsed.socialProof?.items ?? defaultContent.socialProof.items,
      },
      stats: parsed.stats ?? defaultContent.stats,
      features: parsed.features ?? defaultContent.features,
      testimonials: parsed.testimonials ?? defaultContent.testimonials,
      faq: parsed.faq ?? defaultContent.faq,
      branches: parsed.branches ?? defaultContent.branches,
    };
  } catch {
    return defaultContent;
  }
});
