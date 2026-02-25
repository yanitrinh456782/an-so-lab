"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type IndexKey = "lifePath" | "destiny" | "soul" | "personalYear2026";
type IndexResult = { lifePath: number; destiny: number; soul: number; personalYear2026: number };

const PRICE_SINGLE = 31000;
const PRICE_COMBO = 91000;

const BANK_NAME = "MB Bank";
const BANK_ACCOUNT = "456728687";

function money(v: number) {
  return v.toLocaleString("vi-VN") + "đ";
}

function reduceNumber(n: number): number {
  if ([11, 22, 33].includes(n)) return n;
  while (n > 9) {
    n = n
      .toString()
      .split("")
      .reduce((a, b) => a + parseInt(b, 10), 0);
    if ([11, 22, 33].includes(n)) return n;
  }
  return n;
}

function digitsSumFromString(s: string): number {
  return s
    .replaceAll(/[^0-9]/g, "")
    .split("")
    .filter(Boolean)
    .reduce((acc, ch) => acc + parseInt(ch, 10), 0);
}

// Pythagorean mapping
const letterValue: Record<string, number> = {
  A: 1,
  J: 1,
  S: 1,
  B: 2,
  K: 2,
  T: 2,
  C: 3,
  L: 3,
  U: 3,
  D: 4,
  M: 4,
  V: 4,
  E: 5,
  N: 5,
  W: 5,
  F: 6,
  O: 6,
  X: 6,
  G: 7,
  P: 7,
  Y: 7,
  H: 8,
  Q: 8,
  Z: 8,
  I: 9,
  R: 9,
};

const vowels = new Set(["A", "E", "I", "O", "U", "Y"]);

function normalizeName(raw: string): string {
  return raw
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, (m) => (m === "đ" ? "d" : "D"))
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sumName(name: string, onlyVowels: boolean): number {
  const clean = normalizeName(name);
  if (!clean) return 0;

  let sum = 0;
  for (const ch of clean) {
    if (ch === " ") continue;
    const v = letterValue[ch] ?? 0;
    if (!v) continue;

    const isVowel = vowels.has(ch);
    if (onlyVowels && !isVowel) continue;

    sum += v;
  }
  return sum;
}

const keywords: Record<number, string[]> = {
  1: ["Bắt đầu", "Tự chủ", "Dẫn dắt", "Rõ ràng", "Quyết đoán", "Tự tin"],
  2: ["Tinh tế", "Kết nối", "Lắng nghe", "Hòa hợp", "Nhạy cảm", "Thấu hiểu"],
  3: ["Sáng tạo", "Giao tiếp", "Niềm vui", "Lan tỏa", "Biểu đạt", "Tươi mới"],
  4: ["Nền tảng", "Kỷ luật", "Bền bỉ", "Ổn định", "Chắc chắn", "Từng bước"],
  5: ["Tự do", "Trải nghiệm", "Thay đổi", "Linh hoạt", "Khám phá", "Phiêu lưu"],
  6: ["Chăm sóc", "Gia đình", "Trách nhiệm", "Chữa lành", "Yêu thương", "An toàn"],
  7: ["Nội tâm", "Học sâu", "Chiêm nghiệm", "Phân tích", "Tĩnh lặng", "Trí tuệ"],
  8: ["Mục tiêu", "Thành tựu", "Tài chính", "Quản trị", "Quyền lực", "Bản lĩnh"],
  9: ["Nhân văn", "Bao dung", "Cho đi", "Lan tỏa", "Phụng sự", "Ý nghĩa"],
  11: ["Trực giác", "Tinh tế", "Cảm hứng", "Dẫn đường", "Tâm linh", "Nhạy bén"],
  22: ["Kiến tạo", "Hệ thống", "Tầm nhìn", "Bền vững", "Làm lớn", "Hiện thực"],
  33: ["Chữa lành", "Tình thương", "Nâng đỡ", "Cho đi", "Lan tỏa", "Phụng sự"],
};

const oneLiner: Record<number, string> = {
  1: "Bạn hợp khởi đầu: càng rõ ràng, bạn càng sáng.",
  2: "Bạn hợp kết nối: càng mềm, bạn càng mạnh.",
  3: "Bạn hợp lan tỏa: càng vui, bạn càng đúng đường.",
  4: "Bạn hợp nền tảng: càng đều, bạn càng bền.",
  5: "Bạn hợp tự do: càng linh hoạt, bạn càng nở ra.",
  6: "Bạn hợp chữa lành: càng yêu thương, bạn càng ổn.",
  7: "Bạn hợp tĩnh: càng sâu, bạn càng sáng.",
  8: "Bạn hợp mục tiêu: càng rõ, bạn càng mạnh.",
  9: "Bạn hợp ý nghĩa: càng cho đi, bạn càng đầy.",
  11: "Bạn hợp trực giác: càng tin cảm nhận, bạn càng mở.",
  22: "Bạn hợp kiến tạo: càng có hệ thống, bạn càng làm lớn.",
  33: "Bạn hợp nâng đỡ: càng tử tế, bạn càng dẫn đường.",
};

/* =========================
   UI bits
========================= */
function GlowChip({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 850,
        color: "rgba(255,255,255,0.92)",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {text}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.58)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 80,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 820,
          maxWidth: "100%",
          borderRadius: 20,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 26px 70px rgba(0,0,0,0.45)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 16, display: "flex",
flexDirection: "column",, justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 950, color: "white" }}>{title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 4 }}>
              Chuyển khoản xong bấm “Tôi đã chuyển khoản” để mở khóa.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid rgba(255,255,255,0.20)",
              background: "rgba(255,255,255,0.10)",
              color: "white",
              borderRadius: 12,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
              height: 36,
            }}
          >
            Đóng
          </button>
        </div>
        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.12)" }}>{children}</div>
      </div>
    </div>
  );
}

function SoftDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex",
flexDirection: "column",, alignItems: "center", gap: 10, margin: "18px 0 10px" }}>
      <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.68)", fontWeight: 800 }}>{label}</div>
      <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }} />
    </div>
  );
}

function CopyButton({
  label,
  textToCopy,
  onCopied,
}: {
  label: string;
  textToCopy: string;
  onCopied: () => void;
}) {
  const copy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const ta = document.createElement("textarea");
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      onCopied();
    } catch {
      onCopied();
    }
  };

  return (
    <button
      onClick={copy}
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.20)",
        cursor: "pointer",
        fontWeight: 950,
        color: "white",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      {label}
    </button>
  );
}

function TeaserCard({
  title,
  excerpt,
  locked,
  onUnlock,
}: {
  title: string;
  excerpt: string;
  locked: boolean;
  onUnlock: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 16,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.20)",
        position: "relative",
        overflow: "hidden",
        minHeight: 182,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 14 }}>{title}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.82)",
          whiteSpace: "pre-line",
          filter: locked ? "blur(6px)" : "none",
          opacity: locked ? 0.55 : 1,
          userSelect: locked ? "none" : "text",
        }}
      >
        {excerpt}
      </div>

      {locked ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 14 }}>
          <div
            style={{
              width: "100%",
              borderRadius: 16,
              background: "rgba(9, 14, 28, 0.72)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: 14,
              textAlign: "center",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontWeight: 950, color: "white" }}>Chạm nhẹ để đọc tiếp</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
              Đây là phần “chuyên sâu” — mở 1 chỉ số {money(PRICE_SINGLE)} hoặc combo {money(PRICE_COMBO)}.
            </div>
            <button
              onClick={onUnlock}
              style={{
                marginTop: 10,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontWeight: 950,
                color: "#061021",
                background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
                boxShadow: "0 14px 28px rgba(52,214,255,0.22)",
              }}
            >
              Mở khóa để đọc tiếp
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* =========================
   DEEP ENGINE (không lặp ý)
========================= */
type DeepPack = {
  title: string;
  vibe: string;
  bright: string;
  shadow: string;
  love: string;
  work: string;
  selfCare: string;
  mantra: string;
  action7d: string;
};

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pickUnique(pool: string[], seed: number, used: Set<string>) {
  if (!pool.length) return "";
  for (let i = 0; i < pool.length; i++) {
    const s = pool[(seed + i) % pool.length];
    if (!used.has(s)) {
      used.add(s);
      return s;
    }
  }
  const fallback = pool[seed % pool.length];
  used.add(fallback);
  return fallback;
}

type LensPools = {
  vibe: string[];
  bright: string[];
  shadow: string[];
  love: string[];
  work: string[];
  selfCare: string[];
  mantra: string[];
  action7d_even: string[];
  action7d_odd: string[];
};

const lensPoolsByKey: Record<IndexKey, LensPools> = {
  lifePath: {
    vibe: [
      "Đường đời là nhịp tổng thể: bạn hợp đi kiểu nào thì đời trôi kiểu đó.",
      "Đường đời giống “nhạc nền” — không bắt bạn đổi người, chỉ nhắc bạn đổi nhịp.",
      "Đường đời nói về hướng dài hạn: thứ gì làm bạn bền, thứ gì làm bạn hao.",
      "Đường đời không chấm điểm đúng sai. Nó chỉ chỉ ra nơi bạn dễ lệch nhịp nhất.",
    ],
    bright: [
      "Bạn có năng lực tự kéo mình quay lại đường chính khi đã quyết.",
      "Bạn mạnh ở chỗ: càng rõ ưu tiên, bạn càng bình tĩnh mà hiệu quả.",
      "Bạn có lực “tự dựng lại”: ngã đâu, bạn học ở đó và đi tiếp.",
      "Bạn hợp bền hơn hợp nhanh: khi bạn đều tay, bạn thắng chắc.",
    ],
    shadow: [
      "Bạn dễ hụt hơi khi ôm quá nhiều “vai” cùng lúc.",
      "Bạn dễ tự ép mình phải ổn, rồi âm thầm mệt vì không cho phép nghỉ.",
      "Bạn dễ căng khi mọi thứ không theo kế hoạch, dù lỗi không ở bạn.",
      "Bạn dễ bị kéo bởi kỳ vọng người khác rồi quên mất nhịp của mình.",
    ],
    love: [
      "Bạn yêu tốt nhất khi được tôn trọng nhịp sống và ranh giới cá nhân.",
      "Trong tình cảm, bạn cần sự rõ ràng hơn là lời hứa đẹp.",
      "Bạn hợp người giao tiếp thẳng, không thử lòng, không chơi trò im lặng.",
      "Bạn nở ra khi được tin cậy: ít kiểm soát, nhiều đồng hành.",
    ],
    work: [
      "Bạn hợp công việc có mục tiêu rõ + quy trình đủ gọn để bạn thở.",
      "Bạn làm tốt khi được trao quyền trong phạm vi rõ ràng.",
      "Bạn hợp môi trường đánh giá bằng kết quả thật, không bằng cảm tính.",
      "Bạn cần một nhịp làm việc ổn định hơn là bùng nổ rồi kiệt.",
    ],
    selfCare: [
      "Điều cứu bạn là nhịp nền: ngủ đủ, ăn đúng, đi bộ đều.",
      "Bạn cần khoảng lặng mỗi ngày để dọn nhiễu và về lại thân thể.",
      "Bạn nên chăm bằng “đều”: 15–20 phút mỗi ngày còn hơn 2 giờ rồi bỏ.",
      "Bạn cần giảm so sánh: càng so, càng lệch nhịp.",
    ],
    mantra: [
      "Mình không cần chứng minh. Mình cần bền.",
      "Mình chọn đúng nhịp, không chọn đúng vai diễn.",
      "Mình làm ít lại để sâu hơn.",
      "Mình được phép nghỉ trước khi gãy.",
    ],
    action7d_even: [
      "Ngày 1–2: viết 3 ưu tiên thật (không quá 3).\nNgày 3–4: bỏ 1 việc khiến bạn hao.\nNgày 5–7: mỗi ngày làm 20 phút cho ưu tiên #1.",
      "Ngày 1: dọn 1 góc nhỏ (bàn/giường).\nNgày 2–3: ngủ trước 23:30.\nNgày 4–7: mỗi ngày nói “không” 1 lần với thứ không cần.",
      "Ngày 1: chọn 1 thói quen nền (ngủ/đi bộ/uống nước).\nNgày 2–7: giữ nó đều.\nCuối tuần: ghi 5 dòng bạn thấy mình ổn hơn ở đâu.",
    ],
    action7d_odd: [
      "Ngày 1: chốt 1 mục tiêu tuần.\nNgày 2–3: chia thành 3 bước.\nNgày 4–7: làm đúng bước 1 (không thêm việc mới).",
      "Ngày 1–2: giảm 1 nguồn nhiễu (tin tức/so sánh).\nNgày 3–5: làm sâu 1 việc.\nNgày 6–7: nghỉ thật 1 buổi (không bù).",
      "Ngày 1: đặt lịch ‘thở’ 10 phút/ngày.\nNgày 2–7: giữ lịch.\nMỗi tối: 1 câu “hôm nay mình đã cố gắng ở…”.",
    ],
  },

  destiny: {
    vibe: [
      "Sứ mệnh là “vai” bạn chơi tốt nhất khi thôi xin phép.",
      "Sứ mệnh không phải làm nhiều — là làm đúng chỗ mình có lực.",
      "Sứ mệnh là hướng phát triển: càng đi càng sáng, càng làm càng chắc.",
      "Sứ mệnh là nơi bạn tạo giá trị cho người khác mà vẫn không mất mình.",
    ],
    bright: [
      "Bạn bật rất nhanh khi chọn đúng vai và tập trung một đường.",
      "Bạn có khả năng ‘đóng vai’ chuyên nghiệp: học nhanh, lên form nhanh.",
      "Bạn hợp làm đường dài: thứ có hệ thống, có tiêu chuẩn, có nâng cấp.",
      "Bạn có duyên tạo uy tín: làm đều, nói ít, kết quả nói hộ.",
    ],
    shadow: [
      "Bạn dễ lạc khi chạy theo vai ‘được khen’ hơn là vai ‘hợp mình’.",
      "Bạn dễ kẹt ở “chuẩn bị mãi” vì sợ sai, sợ bị chê.",
      "Bạn dễ phân thân: việc nào cũng nhận, cuối cùng việc nào cũng dở dang.",
      "Bạn dễ mang áp lực thành tích vào mọi thứ, làm niềm vui bị teo lại.",
    ],
    love: [
      "Bạn cần một người không biến bạn thành dự án phải hoàn hảo.",
      "Bạn hợp tình yêu biết cổ vũ nhưng không kiểm soát.",
      "Bạn cần sự tôn trọng tham vọng: yêu bạn nhưng vẫn để bạn lớn.",
      "Bạn hợp người nói rõ kỳ vọng và chơi ‘đội’ với bạn.",
    ],
    work: [
      "Bạn hợp vai có trách nhiệm rõ: leader/owner/đầu mối một mảng.",
      "Bạn nên chọn 1 trục kỹ năng để lên ‘hệ’: làm sâu, làm chuẩn.",
      "Bạn hợp công việc có thước đo: KPI rõ, quy trình gọn, feedback nhanh.",
      "Bạn nên ưu tiên sản phẩm/portfolio: để người ta thấy năng lực thật.",
    ],
    selfCare: [
      "Bạn cần ranh giới với công việc: xong là thôi, đừng mang về tim.",
      "Bạn cần lịch phục hồi: 1 buổi/tuần không mục tiêu.",
      "Bạn nên chăm bằng ‘kỷ luật nhẹ’: đều nhưng không gồng.",
      "Bạn cần giảm ‘tự phán’: làm rồi rút kinh nghiệm, đừng tự kết án.",
    ],
    mantra: [
      "Mình chọn vai hợp, không chọn vai để vừa mắt ai.",
      "Làm ít lại, chuẩn hơn.",
      "Mình đi đường dài, không cần thắng vội.",
      "Mình có quyền thử và sửa.",
    ],
    action7d_even: [
      "Ngày 1: chọn 1 vai bạn muốn giỏi.\nNgày 2–4: mỗi ngày tạo 1 sản phẩm nhỏ.\nNgày 5–7: đưa ra ngoài nhận phản hồi thật.",
      "Ngày 1–2: đặt KPI nhẹ (1 việc chính/ngày).\nNgày 3–5: làm theo checklist.\nNgày 6–7: tổng kết 10 dòng: cái gì hợp – cái gì không.",
      "Ngày 1: viết 1 câu định vị (mình giúp ai, bằng gì).\nNgày 2–7: mỗi ngày 20 phút xây thứ chứng minh câu đó.",
    ],
    action7d_odd: [
      "Ngày 1: bỏ 1 việc không thuộc ‘vai chính’.\nNgày 2–3: dồn lực cho 1 đầu việc.\nNgày 4–7: hoàn thành và đóng gói thành 1 mẫu để lặp.",
      "Ngày 1: liệt kê 3 kỹ năng lõi.\nNgày 2–6: mỗi ngày luyện 1 kỹ năng 25 phút.\nNgày 7: gom lại thành 1 trang tổng kết/portfolio.",
      "Ngày 1–2: đặt lịch làm sâu 45 phút/ngày.\nNgày 3–7: giữ lịch.\nCuối tuần: chốt 1 thứ bạn sẽ ‘làm chuẩn’ trong tháng.",
    ],
  },

  soul: {
    vibe: [
      "Linh hồn nói về cái bạn cần để thấy ‘đủ’ từ bên trong.",
      "Linh hồn không đòi bạn cố. Nó đòi bạn thật và được thở.",
      "Linh hồn là nơi bạn chạm vào cảm xúc sâu nhất của mình mà không né.",
      "Linh hồn là nhu cầu tinh thần: khi thiếu, bạn vẫn làm được nhưng không vui.",
    ],
    bright: [
      "Bạn có khả năng chạm sâu: hiểu người, hiểu mình, hiểu tầng nghĩa.",
      "Bạn có sự tinh tế cảm xúc — đó là năng lực, không phải yếu đuối.",
      "Bạn hồi phục nhanh khi được ở môi trường ấm và chân thật.",
      "Bạn có trực giác tốt khi bạn ngủ đủ và bớt nhiễu.",
    ],
    shadow: [
      "Bạn dễ mệt vì ‘cảm thay’ quá nhiều cho người khác.",
      "Bạn dễ tự cô lập khi thấy không ai hiểu đúng mình.",
      "Bạn dễ nuốt cảm xúc để yên chuyện, rồi về sau mới đau.",
      "Bạn dễ nghi ngờ chính mình khi bị người khác ‘định nghĩa hộ’.",
    ],
    love: [
      "Bạn hợp tình yêu chậm, ấm, thật — không cần kịch tính.",
      "Bạn cần người biết lắng nghe mà không sửa bạn ngay lập tức.",
      "Bạn hợp người có mặt khi khó, không chỉ khi vui.",
      "Bạn cần an toàn cảm xúc: nói ra không bị cười, không bị coi nhẹ.",
    ],
    work: [
      "Bạn hợp việc có ý nghĩa cá nhân: làm xong thấy ‘đúng’, không chỉ thấy ‘được’.",
      "Bạn hợp môi trường tử tế: giao tiếp rõ, ít toxic, có ranh giới.",
      "Bạn làm tốt khi cảm xúc ổn định: cảm xúc là nhiên liệu của bạn.",
      "Bạn hợp vai cần chiều sâu: tư vấn, viết, dạy, nghiên cứu, chăm sóc.",
    ],
    selfCare: [
      "Bạn cần chăm bằng thân thể: ngủ đủ, nước đủ, nắng đủ.",
      "Bạn cần ‘dọn nhiễu’: bớt tin tức, bớt so sánh, bớt người làm bạn hụt.",
      "Bạn cần thói quen nói thật 1 câu/ngày: ‘hôm nay mình đang…’.",
      "Bạn cần kết nối dịu: 1 người an toàn còn hơn 10 người xã giao.",
    ],
    mantra: ["Mình được phép mềm.", "Mình không cần gồng để xứng đáng.", "Mình chọn nơi an toàn cho tim.", "Mình tin cảm nhận của mình."],
    action7d_even: [
      "Ngày 1–3: mỗi tối 5 phút viết: ‘Hôm nay mình cần…’.\nNgày 4–5: đi bộ 20 phút không nghe gì.\nNgày 6–7: nhắn 1 người: ‘Mình muốn được lắng nghe’.",
      "Ngày 1: cắt 1 nguồn gây nhiễu.\nNgày 2–4: ngủ đủ + uống đủ nước.\nNgày 5–7: làm 1 việc dịu: đọc, nấu, dọn, tắm nắng.",
      "Ngày 1: chọn 1 ‘góc an toàn’ trong nhà.\nNgày 2–7: mỗi ngày 10 phút ở đó (thở/nhạc nhẹ/viết).",
    ],
    action7d_odd: [
      "Ngày 1: viết 3 điều làm bạn tổn thương gần đây.\nNgày 2–3: chọn 1 điều bạn sẽ nói ra.\nNgày 4–7: nói ra theo cách tử tế (ngắn, rõ).",
      "Ngày 1–2: bỏ 1 mối quan hệ làm bạn cạn.\nNgày 3–5: tăng 1 mối quan hệ làm bạn ấm.\nNgày 6–7: làm 1 việc cho riêng mình (không xin phép).",
      "Ngày 1: ngủ sớm 30 phút.\nNgày 2–7: giữ.\nCuối tuần: viết 5 dòng bạn thấy mình dịu hơn ở đâu.",
    ],
  },

  personalYear2026: {
    vibe: [
      "Năm cá nhân là “chủ đề năm”: bài học, nhịp độ và trọng tâm.",
      "2026 giống một mùa: mùa nào thì làm việc của mùa đó.",
      "Năm cá nhân cho biết bạn nên dồn lực vào đâu để ít tốn sức nhất.",
      "2026 là năm bạn nên chọn một nhịp có thể giữ lâu, không đua nước rút.",
    ],
    bright: [
      "Bạn sẽ ‘mở’ khi làm ít lại nhưng sâu hơn và đều hơn.",
      "2026 thuận cho việc chốt lại một hướng, làm ra kết quả thật.",
      "Năm này hợp tối ưu: bỏ thừa, giữ tinh, tăng chất lượng.",
      "Bạn tiến nhanh khi bạn dám cắt nhiễu và chọn một ưu tiên.",
    ],
    shadow: [
      "2026 sẽ ‘đóng’ nếu bạn chia mình quá mỏng và đổi hướng liên tục.",
      "Bạn dễ mệt nếu cố làm cho kịp người khác thay vì kịp cơ thể mình.",
      "Bạn dễ hụt vì đặt quá nhiều mục tiêu, mục tiêu nào cũng nửa vời.",
      "Bạn dễ căng vì ôm trách nhiệm người khác vào kế hoạch của mình.",
    ],
    love: [
      "2026 hợp yêu trưởng thành: rõ ranh giới, rõ kỳ vọng, rõ cam kết.",
      "Năm này nên ưu tiên người cho bạn bình yên, không phải hồi hộp.",
      "Tình cảm bền khi bạn nói thẳng nhu cầu thay vì đoán mò.",
      "2026: yêu là hợp tác, không phải chịu đựng.",
    ],
    work: [
      "Công việc/tiền: nên chốt 1 trục chính, xây hệ thống nhỏ rồi tăng dần.",
      "2026 hợp làm sâu 1 kỹ năng để tăng giá trị và tăng thu nhập.",
      "Năm này hợp tối ưu quy trình: làm ít bước hơn nhưng chuẩn hơn.",
      "Nếu có bán hàng/kinh doanh: tập trung 1 sản phẩm chủ lực trước.",
    ],
    selfCare: [
      "Sức khỏe: ưu tiên ngủ và nhịp sinh hoạt đều — đó là ‘đòn bẩy’ của 2026.",
      "2026: cơ thể là nền. Nền ổn thì mọi thứ mới lên.",
      "Bạn cần lịch nghỉ có kế hoạch, đừng đợi kiệt mới nghỉ.",
      "2026 hợp kỷ luật nhẹ: đều nhưng không căng.",
    ],
    mantra: ["2026: bền là đẹp.", "2026: chọn một đường rồi đi.", "2026: ít mà chất.", "2026: giữ nền trước khi mở rộng."],
    action7d_even: [
      "Ngày 1: chọn 1 mục tiêu năm (1 câu).\nNgày 2–3: chia thành 3 bước.\nNgày 4–7: mỗi ngày 20 phút đúng bước 1 (không mở thêm).",
      "Ngày 1–2: dọn lịch: bỏ 1 cam kết không cần.\nNgày 3–5: làm sâu 1 việc.\nNgày 6–7: nghỉ thật 1 buổi (không guilt).",
      "Ngày 1: chốt 1 thói quen nền (ngủ/đi bộ).\nNgày 2–7: giữ đều.\nCuối tuần: viết 5 dòng về thay đổi bạn thấy rõ.",
    ],
    action7d_odd: [
      "Ngày 1: liệt kê 5 việc đang kéo bạn.\nNgày 2: bỏ 1 việc.\nNgày 3–7: dồn lực cho 1 việc còn lại (mỗi ngày 25 phút).",
      "Ngày 1: chọn 1 kỹ năng tăng thu nhập.\nNgày 2–6: luyện 30 phút/ngày.\nNgày 7: đóng gói thành 1 sản phẩm/1 bài đăng/1 trang portfolio.",
      "Ngày 1–2: làm sạch môi trường (bàn làm việc/điện thoại).\nNgày 3–7: giữ ‘không gian sạch’ để đầu óc nhẹ hơn.",
    ],
  },
};

function deepPack(key: IndexKey, n: number, name: string): DeepPack {
  const nm = (name || "Bạn").trim();
  const used = new Set<string>();
  const seed = hashSeed(`${key}|${n}|${nm}`);

  const pools = lensPoolsByKey[key];
  const vibe = pickUnique(pools.vibe, seed + 1, used);
  const bright = pickUnique(pools.bright, seed + 2, used);
  const shadow = pickUnique(pools.shadow, seed + 3, used);
  const love = pickUnique(pools.love, seed + 4, used);
  const work = pickUnique(pools.work, seed + 5, used);
  const selfCare = pickUnique(pools.selfCare, seed + 6, used);
  const mantra = pickUnique(pools.mantra, seed + 7, used);
  const actionPool = n % 2 === 0 ? pools.action7d_even : pools.action7d_odd;
  const action7d = pickUnique(actionPool, seed + 8, used);

  const title =
    key === "lifePath"
      ? `Chuyên sâu Đường đời ${n}`
      : key === "destiny"
      ? `Chuyên sâu Sứ mệnh ${n}`
      : key === "soul"
      ? `Chuyên sâu Linh hồn ${n}`
      : `Chuyên sâu Năm cá nhân 2026 • ${n}`;

  return {
    title,
    vibe: `${nm} ơi, ${vibe}`,
    bright,
    shadow,
    love,
    work,
    selfCare,
    mantra,
    action7d,
  };
}

function deepNarrative(key: IndexKey, n: number, name: string) {
  const pack = deepPack(key, n, name);
  const ks = keywords[n] ?? [];

  if (key === "lifePath") {
    return [
      `🌿 ${pack.vibe}`,
      ``,
      `🧩 Từ khóa nổi bật: ${ks.slice(0, 6).join(" • ") || "—"}`,
      ``,
      `✅ Khi bạn đi đúng nhịp:`,
      `- ${pack.bright}`,
      ``,
      `⚠️ Khi bạn lệch nhịp:`,
      `- ${pack.shadow}`,
      ``,
      `💛 Tình cảm: ${pack.love}`,
      `💼 Công việc: ${pack.work}`,
      `🫧 Tự chăm: ${pack.selfCare}`,
      ``,
      `🪞 Câu nhắc: “${pack.mantra}”`,
      ``,
      `📌 7 ngày chỉnh nhịp (thực tế – dễ làm):`,
      pack.action7d,
    ].join("\n");
  }

  if (key === "destiny") {
    return [
      `🎯 ${pack.vibe}`,
      ``,
      `🔑 Từ khóa hợp vai: ${ks.slice(0, 5).join(" • ") || "—"}`,
      ``,
      `🚀 Lực bật của bạn: ${pack.bright}`,
      `🧱 Điểm dễ kẹt: ${pack.shadow}`,
      ``,
      `💼 Hướng làm việc hợp bạn:`,
      `- ${pack.work}`,
      ``,
      `💛 Khi yêu (để không tự ép mình):`,
      `- ${pack.love}`,
      ``,
      `🫧 Nhịp chăm để đi đường dài:`,
      `- ${pack.selfCare}`,
      ``,
      `🪞 Câu chốt vai: “${pack.mantra}”`,
      ``,
      `✅ 7 ngày “lên form” sứ mệnh:`,
      pack.action7d,
    ].join("\n");
  }

  if (key === "soul") {
    return [
      `🫶 ${pack.vibe}`,
      ``,
      `🌙 Từ khóa nuôi tâm: ${ks.slice(0, 6).join(" • ") || "—"}`,
      ``,
      `🌤️ Khi được nuôi đúng: ${pack.bright}`,
      `🌧️ Khi bị bỏ quên: ${pack.shadow}`,
      ``,
      `💛 Tình cảm hợp bạn: ${pack.love}`,
      ``,
      `💼 Công việc hợp năng lượng:`,
      `- ${pack.work}`,
      ``,
      `🫧 Điều làm bạn hồi phục nhanh nhất:`,
      `- ${pack.selfCare}`,
      ``,
      `🪞 Nhắc nhẹ: “${pack.mantra}”`,
      ``,
      `✅ 7 ngày dịu lại:`,
      pack.action7d,
    ].join("\n");
  }

  return [
    `🗓️ ${pack.vibe}`,
    ``,
    `📌 Chủ đề năm ${n}: ${ks.slice(0, 6).join(" • ") || "—"}`,
    ``,
    `✅ Nên làm để năm này “mở”: ${pack.bright}`,
    `⚠️ Tránh để không “đóng”: ${pack.shadow}`,
    ``,
    `💼 Công việc/tiền: ${pack.work}`,
    `💛 Tình cảm: ${pack.love}`,
    `🫧 Sức khỏe – nền năm: ${pack.selfCare}`,
    ``,
    `🪞 Câu nhắc 2026: “${pack.mantra}”`,
    ``,
    `✅ 7 ngày vào nhịp 2026:`,
    pack.action7d,
  ].join("\n");
}

/* =========================
   TEASER (PHẦN GỢI MỞ) — TÁCH GIỌNG RIÊNG, KHÔNG TRÙNG
========================= */
function teaserText(key: IndexKey, n: number | null) {
  if (!n) return "Nhập thông tin để xem phần gợi mở.";
  const ks = (keywords[n] ?? []).slice(0, 6);
  const joinK = (arr: string[]) => arr.filter(Boolean).join(", ");
  const seed = hashSeed(`${key}|${n}`);

  if (key === "lifePath") {
    const open = [
      "Đường đời là cái “nhịp nền” bạn mang theo: đi đúng thì nhẹ, lệch là biết liền.",
      "Có người càng cố càng mệt — vì họ đang gồng sai nhịp của đường đời.",
      "Đường đời không bắt bạn giỏi hơn ai. Nó chỉ bắt bạn bền hơn chính mình hôm qua.",
      "Đường đời giống la bàn: không ép bạn chạy, chỉ nhắc bạn đổi hướng cho đỡ hao.",
      "Bạn có thể làm được nhiều thứ. Nhưng đường đời sẽ chỉ ra thứ làm bạn ‘cạn’ nhanh nhất.",
      "Đường đời hay lộ ra qua cơ thể: mất ngủ, căng, bồn chồn… là dấu hiệu lệch nhịp.",
    ];
    const q = [
      "Bạn đang chịu đựng điều gì quá lâu chỉ vì nghĩ ‘ai cũng vậy’?",
      "Bạn đang cố mạnh ở chỗ nào mà thật ra không cần gồng?",
      "Nếu giảm 1 thứ để nhẹ người, bạn muốn giảm điều gì trước?",
      "Bạn đang chạy nhanh vì mục tiêu… hay vì sợ bị bỏ lại?",
      "Điều bạn cần nhất hiện tại là nghỉ, hay là được sống đúng nhịp?",
      "Bạn đang sống theo nhịp của mình, hay nhịp của người khác?",
    ];
    return `${open[seed % open.length]}
Với Đường đời ${n}, nhịp tự nhiên thường nghiêng về: ${joinK(ks)}.

Chuyên sâu sẽ soi:
• “Điểm bền” của bạn (đúng nhịp là sáng)
• “Điểm hao” của bạn (lệch nhịp là mệt)
• 7 ngày chỉnh nhịp để quay về nền vững

Câu hỏi tự soi: “${q[(seed + 2) % q.length]}”`;
  }

  if (key === "destiny") {
    const open = [
      "Sứ mệnh là “vai chính” của bạn: đứng đúng vai thì mọi thứ chạy trơn hơn.",
      "Bạn không thiếu năng lực. Bạn chỉ đang đứng ở vai không hợp nên thấy nặng.",
      "Sứ mệnh là cách bạn tạo giá trị: đúng chỗ thì ít làm mà ra kết quả.",
      "Có người làm 10 việc vẫn mờ. Có người chốt đúng vai là bật.",
      "Sứ mệnh giúp bạn lọc tiếng ồn: cái gì là của mình, cái gì chỉ là kỳ vọng.",
      "Sứ mệnh không phải định mệnh. Nó là hướng bạn lớn lên mạnh nhất.",
    ];
    const q = [
      "Bạn đang làm để được công nhận… hay làm vì bạn thật sự hợp?",
      "Bạn đang nhận quá nhiều việc vì sợ bị đánh giá, đúng không?",
      "Vai nào bạn làm tốt nhưng lại hay né vì sợ trách nhiệm?",
      "Bạn ‘chuẩn bị mãi’ vì sợ sai ở điểm nào?",
      "Nếu chỉ chọn 1 trục để nâng cấp, bạn chọn trục gì?",
      "Bạn đang sống theo định vị của mình, hay theo định vị người khác gắn cho?",
    ];
    return `${open[seed % open.length]}
Với Sứ mệnh ${n}, năng lượng thường bộc lộ qua: ${joinK(ks)}.

Chuyên sâu sẽ cho bạn:
• 1 kiểu vai phù hợp nhất để bật
• 1 điểm khiến bạn hay kẹt (và cách tháo)
• Kế hoạch 7 ngày để “lên form” đúng vai

Câu hỏi để chốt hướng: “${q[(seed + 3) % q.length]}”`;
  }

  if (key === "soul") {
    const open = [
      "Linh hồn không nói bằng logic. Nó nói bằng cảm giác ‘mình có đang được sống không’.",
      "Có kiểu thiếu: không thiếu việc, không thiếu trách nhiệm — nhưng thiếu bình yên.",
      "Linh hồn là nhu cầu sâu: thiếu nó, bạn vẫn chạy được… chỉ là không muốn chạy.",
      "Bạn có thể mạnh ngoài mặt, nhưng linh hồn sẽ chỉ ra nơi bạn đang âm thầm cạn.",
      "Linh hồn không đòi bạn làm thêm. Nó đòi bạn quay về.",
      "Một số mệt mỏi không giải bằng cố gắng — nó giải bằng dịu lại.",
    ];
    const q = [
      "Bạn đang nuốt cảm xúc nào để yên chuyện?",
      "Bạn đang cần được hiểu, hay đang cần được nghỉ?",
      "Điều gì khiến bạn thấy ‘ấm’ mà lâu rồi bạn không chạm tới?",
      "Bạn đang cố tỏ ra ổn với ai?",
      "Bạn đã bỏ quên nhu cầu nào của mình lâu nhất?",
      "Bạn có đang sống dịu với chính mình không?",
    ];
    return `${open[seed % open.length]}
Với Linh hồn ${n}, “món ăn tinh thần” thường là: ${joinK(ks)}.

Chuyên sâu sẽ dẫn bạn tới:
• Nơi bạn dễ cạn (vì sao lại cạn)
• Cách bạn hồi phục nhanh nhất
• 7 ngày dịu lại (không gồng, không ép)

Câu hỏi để tự ôm mình: “${q[(seed + 1) % q.length]}”`;
  }

  // personalYear2026
  const open = [
    "Năm cá nhân giống một mùa: mùa nào thì làm việc của mùa đó.",
    "2026 không cần bạn chạy nhanh. Nó cần bạn chọn đúng trọng tâm.",
    "Năm cá nhân cho biết: dồn lực vào đâu để ít hao nhất trong năm.",
    "2026 hợp tối ưu: bỏ thừa, giữ tinh, tăng chất lượng.",
    "Năm nay hợp ‘đi đường dài’ hơn là bùng nổ ngắn hạn.",
    "2026 sẽ thưởng cho người biết giữ nền: sức khỏe, kỷ luật nhẹ, hướng rõ.",
  ];
  const q = [
    "Bạn đang cố mở rộng quá sớm ở điểm nào?",
    "Nếu chỉ giữ 1 ưu tiên, bạn sẽ giữ điều gì?",
    "Bạn đang chia mình mỏng vì tham, hay vì sợ bỏ lỡ?",
    "Điều gì cần được tối ưu trước khi bạn làm thêm?",
    "Bạn đang muốn kết quả nhanh… hay muốn bền?",
    "Bạn đang sống theo kế hoạch, hay theo cảm xúc mỗi ngày?",
  ];
  return `${open[seed % open.length]}
Với Năm cá nhân 2026 ${n}, chủ đề thường xoay quanh: ${joinK(ks)}.

Chuyên sâu sẽ chỉ rõ:
• Nên làm gì để năm này “mở”
• Tránh gì để không “đóng”
• 7 ngày vào nhịp 2026 (dễ làm, giữ được)

Câu hỏi để chọn nhịp: “${q[(seed + 4) % q.length]}”`;
}

/* =========================
   MAIN
========================= */
export default function Home() {
  const [fullName, setFullName] = useState("Trịnh Hồng Ân");
  const [dob, setDob] = useState("1997-05-26");

  const [result, setResult] = useState<IndexResult | null>(null);
  const [error, setError] = useState("");

  const [unlockedDeep, setUnlockedDeep] = useState<Record<IndexKey, boolean>>({
    lifePath: false,
    destiny: false,
    soul: false,
    personalYear2026: false,
  });
  const [comboDeepUnlocked, setComboDeepUnlocked] = useState(false);

  const [openPay, setOpenPay] = useState(false);
  const [payMode, setPayMode] = useState<"single" | "combo">("combo");
  const [payTarget, setPayTarget] = useState<IndexKey>("lifePath");

  const [showFloatCTA, setShowFloatCTA] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);

  const teaserRef = useRef<HTMLDivElement | null>(null);
  const [teaserSeen, setTeaserSeen] = useState(false);

  const normalizedName = useMemo(() => normalizeName(fullName), [fullName]);
  const transferNote = useMemo(() => `TSH ${normalizedName || "TEN"} ${dob}`, [normalizedName, dob]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1700);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setShowFloatCTA(y > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = teaserRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) setTeaserSeen(true);
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!result) return;
    if (!teaserSeen) return;
    if (comboDeepUnlocked) return;
    if (Object.values(unlockedDeep).some(Boolean)) return;
    if (showNudge) return;

    const t = setTimeout(() => setShowNudge(true), 10000);
    return () => clearTimeout(t);
  }, [result, teaserSeen, comboDeepUnlocked, unlockedDeep, showNudge]);

  const compute = () => {
    setError("");
    if (!fullName.trim()) return setError("Bạn nhập họ tên trước nha.");
    if (!dob) return setError("Bạn chọn ngày sinh trước nha.");

    const lifePath = reduceNumber(digitsSumFromString(dob));
    const destiny = reduceNumber(sumName(fullName, false));
    const soul = reduceNumber(sumName(fullName, true));

    const [, mmS, ddS] = dob.split("-");
    const mm = parseInt(mmS, 10) || 0;
    const dd = parseInt(ddS, 10) || 0;
    const personalYear2026 = reduceNumber(dd + mm + (2 + 0 + 2 + 6));

    setResult({ lifePath, destiny, soul, personalYear2026 });
  };

  const openSinglePay = (k: IndexKey) => {
    setPayMode("single");
    setPayTarget(k);
    setOpenPay(true);
  };

  const openComboPay = () => {
    setPayMode("combo");
    setOpenPay(true);
  };

  const confirmTransfer = () => {
    if (payMode === "combo") {
      setComboDeepUnlocked(true);
      setUnlockedDeep({ lifePath: true, destiny: true, soul: true, personalYear2026: true });
    } else {
      setUnlockedDeep((p) => ({ ...p, [payTarget]: true }));
    }
    setOpenPay(false);
    setShowNudge(false);
  };

  const isDeepLocked = (k: IndexKey) => !(comboDeepUnlocked || unlockedDeep[k]);

  const cardValue = (k: IndexKey) => {
    if (!result) return null;
    if (k === "lifePath") return result.lifePath;
    if (k === "destiny") return result.destiny;
    if (k === "soul") return result.soul;
    return result.personalYear2026;
  };

  const freeWords = (n: number | null) => (n ? (keywords[n] ?? []).slice(0, 3) : []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 18,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
        color: "white",
        background:
          "radial-gradient(1200px 520px at 20% 0%, rgba(124,92,255,0.45), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(52,214,255,0.40), transparent 60%), linear-gradient(180deg, #070A1A, #060A14)",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.12,
        }}
      />

      {toast ? (
        <div
          style={{
            position: "fixed",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 90,
            padding: "10px 12px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            fontWeight: 900,
            fontSize: 12,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {toast}
        </div>
      ) : null}

      {/* Floating CTA */}
      {showFloatCTA ? (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 75,
            width: 320,
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <div
            style={{
              borderRadius: 18,
              padding: 12,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.40)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 13 }}>Bạn đang chạm tới phần chuyên sâu ✨</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
              Mở để đọc tiếp: {money(PRICE_SINGLE)}/chỉ số hoặc combo {money(PRICE_COMBO)}.
            </div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                onClick={openComboPay}
                style={{
                  padding: "10px 10px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 950,
                  color: "#061021",
                  background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
                }}
              >
                Mở combo
              </button>
              <button
                onClick={() => openSinglePay("lifePath")}
                style={{
                  padding: "10px 10px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.20)",
                  cursor: "pointer",
                  fontWeight: 950,
                  color: "white",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                Mở 1 chỉ số
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        {/* HERO */}
        <div
          style={{
            borderRadius: 22,
            padding: 18,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 26px 70px rgba(0,0,0,0.38)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -2,
              background:
                "radial-gradient(520px 260px at 10% 0%, rgba(52,214,255,0.35), transparent 60%), radial-gradient(520px 260px at 90% 0%, rgba(124,92,255,0.35), transparent 60%)",
              opacity: 0.9,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.6 }}>Numerology • Premium</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.5 }}>
              <b>Chỉ số chính FREE</b> (con số + 3 từ khóa). Kéo xuống sẽ có phần gợi mở và chuyên sâu.
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
              }}
            >
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Trịnh Hồng Ân"
                style={{
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.07)",
                  color: "white",
                  outline: "none",
                  fontWeight: 750,
                }}
              />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.07)",
                  color: "white",
                  outline: "none",
                  fontWeight: 750,
                }}
              />
              <button
                onClick={compute}
                style={{
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 950,
                  color: "#061021",
                  background: "linear-gradient(90deg, #34D6FF, #00FFA8)",
                  boxShadow: "0 18px 34px rgba(0,255,168,0.18)",
                }}
              >
                TÍNH
              </button>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
              Tên chuẩn hóa: <b>{normalizedName || "—"}</b>
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid rgba(255, 94, 94, 0.30)",
                  background: "rgba(255, 94, 94, 0.10)",
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 850,
                }}
              >
                {error}
              </div>
            ) : null}
          </div>
        </div>

        {/* FREE */}
        <SoftDivider label="PHẦN 1 — CHỈ SỐ CHÍNH (FREE)" />
        <div
  style={{
    marginTop: 6,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  }}
>
          {(
            [
              ["Đường đời", "lifePath", "Path of Life", "rgba(52,214,255,0.85)"],
              ["Sứ mệnh", "destiny", "Mission / Destiny", "rgba(124,92,255,0.85)"],
              ["Linh hồn", "soul", "Soul", "rgba(0,255,168,0.85)"],
              ["Năm cá nhân 2026", "personalYear2026", "Individual Year", "rgba(255,199,0,0.75)"],
            ] as Array<[string, IndexKey, string, string]>
          ).map(([title, key, sub, accent]) => {
            const v = cardValue(key);
            const words = freeWords(v);
            return (
              <div
                key={key}
                style={{
                  position: "relative",
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
                  overflow: "hidden",
                  minHeight: 150,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -2,
                    background: `radial-gradient(220px 160px at 20% 0%, ${accent}, transparent 60%)`,
                    opacity: 0.30,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 14, fontWeight: 950 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 2 }}>{sub}</div>

                  <div style={{ marginTop: 12, display: "flex",
flexDirection: "column", alignItems: "baseline", gap: 10 }}>
                    <div style={{ fontSize: 46, fontWeight: 950, lineHeight: 1, color: "white" }}>{v ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                      {v ? oneLiner[v] ?? "" : "Nhập thông tin để xem"}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {words.map((w) => (
                      <GlowChip key={w} text={w} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STORY */}
        <SoftDivider label="PHẦN 2 — GỢI MỞ (KÉO XUỐNG TỪ TỪ)" />
        <div
          style={{
            borderRadius: 22,
            padding: 16,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 26px 70px rgba(0,0,0,0.34)",
            marginTop: 10,
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 16 }}>Một đoạn nhỏ để bạn “thở”</div>
          <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.80)", lineHeight: 1.75 }}>
            Có khi bạn không cần thêm lời khuyên. Bạn chỉ cần một thứ gì đó nói đúng cảm giác bên trong.
            <br />
            Con số không quyết định bạn là ai — nó chỉ là <b>tấm gương</b> để bạn nhìn rõ nhịp sống của mình:
            bạn đang chạy quá nhanh, hay đang bỏ quên điều mình thật sự cần?
          </div>
        </div>

        {/* TEASER */}
        <div
  ref={teaserRef}
  style={{
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr), 1fr))",
    gap: 12,
  }}
>
          {(
            [
              ["Gợi mở Đường đời", "lifePath"],
              ["Gợi mở Sứ mệnh", "destiny"],
              ["Gợi mở Linh hồn", "soul"],
              ["Gợi mở Năm cá nhân 2026", "personalYear2026"],
            ] as Array<[string, IndexKey]>
          ).map(([label, key]) => {
            const v = cardValue(key);
            const locked = !result || isDeepLocked(key);
            return (
              <TeaserCard
                key={key}
                title={label}
                excerpt={teaserText(key, v)}
                locked={locked}
                onUnlock={() => openSinglePay(key)}
              />
            );
          })}
        </div>

        {/* PRICING */}
        <SoftDivider label="PHẦN 3 — MỞ KHÓA CHUYÊN SÂU" />
        <div
          style={{
            borderRadius: 22,
            padding: 16,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 26px 70px rgba(0,0,0,0.34)",
            marginTop: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, fontSize: 18 }}>Chuyên sâu để “đọc ra mình”</div>
              <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.80)", lineHeight: 1.7 }}>
                • <b>Chỉ số chính</b> là FREE. <br />• <b>Chuyên sâu</b> mới có nội dung dài + gợi ý hành động theo bạn.
              </div>
            </div>

            <div style={{ minWidth: 260 }}>
              <button
                onClick={openComboPay}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 950,
                  color: "#061021",
                  background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
                  boxShadow: "0 18px 34px rgba(124,92,255,0.22)",
                }}
              >
                Mở combo chuyên sâu • {money(PRICE_COMBO)}
              </button>
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                Hoặc mở 1 chỉ số: {money(PRICE_SINGLE)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              padding: 14,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <div style={{ fontWeight: 950 }}>Chuyển khoản</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.86)" }}>
              <b>{BANK_NAME}</b> • STK: <b>{BANK_ACCOUNT}</b> <br />
              Nội dung gợi ý: <b>{transferNote}</b>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CopyButton label="Copy STK" textToCopy={BANK_ACCOUNT} onCopied={() => setToast("Đã copy số tài khoản ✅")} />
              <CopyButton
                label="Copy nội dung CK"
                textToCopy={transferNote}
                onCopied={() => setToast("Đã copy nội dung chuyển khoản ✅")}
              />
            </div>

            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={openComboPay}
                style={{
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 950,
                  color: "#061021",
                  background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
                }}
              >
                Tôi muốn combo • {money(PRICE_COMBO)}
              </button>
              <button
                onClick={() => openSinglePay("lifePath")}
                style={{
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.20)",
                  cursor: "pointer",
                  fontWeight: 950,
                  color: "white",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                Mở 1 chỉ số • {money(PRICE_SINGLE)}
              </button>
            </div>
          </div>
        </div>

        {/* DEEP */}
        <SoftDivider label="PHẦN 4 — NỘI DUNG CHUYÊN SÂU (SAU KHI MỞ KHÓA)" />
        <div
  style={{
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr), 1fr))",
    gap: 12,
  }
>
          {(
            [
              ["Chuyên sâu Đường đời", "lifePath"],
              ["Chuyên sâu Sứ mệnh", "destiny"],
              ["Chuyên sâu Linh hồn", "soul"],
              ["Chuyên sâu Năm cá nhân 2026", "personalYear2026"],
            ] as Array<[string, IndexKey]>
          ).map(([label, key]) => {
            const v = cardValue(key);
            const locked = !result || isDeepLocked(key);

            const content =
              v && !locked ? deepNarrative(key, v, fullName.trim()) : "Phần này sẽ hiện sau khi bạn mở khóa chuyên sâu.";

            return (
              <div
                key={key}
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.20)",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 220,
                }}
              >
                <div style={{ fontWeight: 950, fontSize: 14 }}>{label}</div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.86)",
                    whiteSpace: "pre-line",
                    filter: locked ? "blur(7px)" : "none",
                    opacity: locked ? 0.40 : 1,
                    userSelect: locked ? "none" : "text",
                  }}
                >
                  {content}
                </div>

                {locked ? (
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 14 }}>
                    <div
                      style={{
                        width: "100%",
                        borderRadius: 16,
                        background: "rgba(9, 14, 28, 0.72)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        padding: 14,
                        textAlign: "center",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <div style={{ fontWeight: 950, color: "white" }}>Nội dung chuyên sâu đang khóa</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
                        Mở 1 chỉ số {money(PRICE_SINGLE)} hoặc mở combo {money(PRICE_COMBO)} để xem đầy đủ.
                      </div>
                      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <button
                          onClick={() => openSinglePay(key)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 14,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 950,
                            color: "#061021",
                            background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
                          }}
                        >
                          Mở chỉ số này • {money(PRICE_SINGLE)}
                        </button>
                        <button
                          onClick={openComboPay}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.20)",
                            cursor: "pointer",
                            fontWeight: 950,
                            color: "white",
                            background: "rgba(255,255,255,0.08)",
                          }}
                        >
                          Mở combo • {money(PRICE_COMBO)}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* Popup nudge */}
      <Modal open={showNudge} title="Bạn đang chạm tới phần ‘đọc ra mình’ ✨" onClose={() => setShowNudge(false)}>
        <div style={{ color: "rgba(255,255,255,0.90)", lineHeight: 1.7, fontSize: 13 }}>
          <div style={{ fontWeight: 950, fontSize: 14 }}>Nếu bạn muốn đọc tiếp phần chuyên sâu…</div>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.82)" }}>
            Mở <b>1 chỉ số</b> {money(PRICE_SINGLE)} hoặc <b>combo</b> {money(PRICE_COMBO)} để xem đầy đủ.
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <div>
              <b>MB Bank</b> • STK: <b>{BANK_ACCOUNT}</b>
            </div>
            <div style={{ marginTop: 6 }}>
              Nội dung: <b>{transferNote}</b>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CopyButton label="Copy STK" textToCopy={BANK_ACCOUNT} onCopied={() => setToast("Đã copy số tài khoản ✅")} />
              <CopyButton
                label="Copy nội dung CK"
                textToCopy={transferNote}
                onCopied={() => setToast("Đã copy nội dung chuyển khoản ✅")}
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={() => {
                setPayMode("combo");
                setOpenPay(true);
              }}
              style={{
                padding: "12px 12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontWeight: 950,
                color: "#061021",
                background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
              }}
            >
              Mở combo • {money(PRICE_COMBO)}
            </button>
            <button
              onClick={() => {
                setPayMode("single");
                setPayTarget("lifePath");
                setOpenPay(true);
              }}
              style={{
                padding: "12px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.20)",
                cursor: "pointer",
                fontWeight: 950,
                color: "white",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              Mở 1 chỉ số • {money(PRICE_SINGLE)}
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
            *Bản demo: sau khi chuyển khoản, bấm “Tôi đã chuyển khoản” để mở khóa.
          </div>
        </div>
      </Modal>

      {/* Payment modal */}
      <Modal
        open={openPay}
        title={payMode === "combo" ? `Mở combo chuyên sâu • ${money(PRICE_COMBO)}` : `Mở chuyên sâu 1 chỉ số • ${money(PRICE_SINGLE)}`}
        onClose={() => setOpenPay(false)}
      >
        <div style={{ color: "rgba(255,255,255,0.90)", lineHeight: 1.7, fontSize: 13 }}>
          <div style={{ fontWeight: 950, fontSize: 14 }}>Chuyển khoản {BANK_NAME} để mở khóa</div>

          <div
            style={{
              marginTop: 10,
              borderRadius: 16,
              padding: 12,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <div>
              <b>Số tài khoản:</b> {BANK_ACCOUNT}
            </div>
            <div>
              <b>Ngân hàng:</b> {BANK_NAME}
            </div>
            <div style={{ marginTop: 6 }}>
              <b>Nội dung:</b> {transferNote}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CopyButton label="Copy STK" textToCopy={BANK_ACCOUNT} onCopied={() => setToast("Đã copy số tài khoản ✅")} />
              <CopyButton
                label="Copy nội dung CK"
                textToCopy={transferNote}
                onCopied={() => setToast("Đã copy nội dung chuyển khoản ✅")}
              />
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12.5, color: "rgba(255,255,255,0.80)" }}>
            Chuyển khoản xong bấm <b>“Tôi đã chuyển khoản”</b> để mở khóa chuyên sâu.
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={confirmTransfer}
              style={{
                padding: "12px 12px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontWeight: 950,
                color: "#061021",
                background: "linear-gradient(90deg, #34D6FF, #7C5CFF)",
              }}
            >
              Tôi đã chuyển khoản • Mở khóa
            </button>
            <button
              onClick={() => setOpenPay(false)}
              style={{
                padding: "12px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.20)",
                cursor: "pointer",
                fontWeight: 950,
                color: "white",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              Để sau
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.70)" }}>
            *Hiện tại là demo “mở khóa sau khi bạn xác nhận”.
          </div>
        </div>
      </Modal>
    </main>
  );
}