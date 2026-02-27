"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   TYPES + CONFIG
========================= */
type IndexKey = "lifePath" | "destiny" | "soul" | "personalYear2026";
type IndexResult = {
  lifePath: number;
  destiny: number;
  soul: number;
  personalYear2026: number;
};

const PRICE_SINGLE = 31000;
const PRICE_COMBO = 91000;

const BANK_NAME = "MB Bank";
const BANK_ACCOUNT = "456728687";

/* =========================
   UTILS
========================= */
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

/* =========================
   KEYWORDS + ONE LINERS
========================= */
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
   UI PRIMITIVES
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

function SoftDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "18px 0 10px",
      }}
    >
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

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.58)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 860,
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
        <div
          style={{
            padding: 16,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
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
              flexShrink: 0,
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

/* =========================
   DEEP CONTENT ENGINE (DÀI + KHÔNG LẶP)
   (ngắn gọn cho code, vẫn đủ sâu)
========================= */
type LensPools = {
  hook: string[];
  vibe: string[];
  mirror: string[];
  bright: string[];
  shadow: string[];
  love: string[];
  work: string[];
  money: string[];
  selfCare: string[];
  mantra: string[];
  action7d_even: string[];
  action7d_odd: string[];
  journaling: string[];
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

const lensPoolsByKey: Record<IndexKey, LensPools> = {
  lifePath: {
    hook: [
      "Có khi bạn không cần thêm lời khuyên. Bạn chỉ cần một câu nói đúng cái mệt mà bạn đang giấu.",
      "Bạn vẫn làm được. Nhưng bạn làm trong trạng thái… không còn vui như trước.",
      "Bạn không hề yếu. Chỉ là bạn đang cố sống bằng nhịp của người khác quá lâu.",
      "Bạn có cảm giác mình đang chạy — nhưng không chắc mình đang chạy về đâu.",
      "Bạn ổn, theo kiểu người ta nhìn thấy. Còn bên trong thì… bạn tự biết.",
    ],
    vibe: [
      "Đường đời là nhịp tổng thể bạn mang theo. Đi đúng nhịp thì nhẹ, lệch nhịp thì hao — cơ thể sẽ báo trước lý trí.",
      "Đường đời giống la bàn: không phán đúng sai, chỉ chỉ ra nơi bạn dễ lạc và nơi bạn dễ nở.",
      "Đường đời là cách bạn đi đường dài: chọn nhịp đều, hay bùng nổ rồi kiệt.",
    ],
    mirror: [
      "Bạn thường có 2 chế độ: hoặc làm rất nhiệt, hoặc tắt hẳn. Và bạn tự trách mình vì không ‘ổn định’ như người khác.",
      "Bạn hay gồng để làm cho tròn vai. Nhưng khi một mình, bạn chỉ muốn im lặng, tách ra, thở.",
      "Bạn hay thấy mình ‘chưa đủ’ dù đã cố. Vì bạn đang đo mình bằng thước của người khác.",
    ],
    bright: [
      "Khi bạn đã rõ ưu tiên, bạn rất bền và rất chắc. Bạn không cần ồn ào — kết quả tự nói thay.",
      "Bạn có lực ‘tự dựng lại’. Ngã đâu bạn học ở đó. Và lần sau bạn đi khôn hơn, sâu hơn.",
      "Bạn hợp đường dài: làm đều, làm sạch, làm chắc. Bạn thắng kiểu không cần thắng gấp.",
    ],
    shadow: [
      "Điểm kẹt của bạn không phải thiếu năng lực — mà là ôm quá nhiều ‘vai’. Vai nào cũng muốn làm tốt, cuối cùng bạn cạn.",
      "Bạn dễ tự ép mình phải ổn. Bạn ít cho phép mình nghỉ, nên nghỉ cũng thấy… có lỗi.",
      "Bạn hay nuốt mệt. Nhưng mệt không biến mất — nó chuyển thành cáu, mất ngủ, hoặc tụt năng lượng.",
    ],
    love: [
      "Bạn yêu tốt nhất khi được tôn trọng nhịp sống và ranh giới. Bạn không hợp kiểu thử lòng, im lặng trừng phạt.",
      "Bạn cần một người nói thẳng, rõ ràng, và tử tế. Bạn không muốn yêu trong trạng thái đoán mò.",
    ],
    work: [
      "Bạn hợp công việc có mục tiêu rõ + quy trình đủ gọn. Bạn tỏa sáng khi được làm sâu thay vì làm loạn.",
      "Bạn hợp vai ‘owner’: chịu trách nhiệm một phần rõ ràng. Đừng để bạn làm kiểu ai nhờ gì cũng làm.",
    ],
    money: [
      "Tiền đến tốt khi bạn bớt ‘đánh nhanh’ và chọn chiến lược bền: một kỹ năng lõi + một đầu ra rõ.",
      "Bạn dễ thất thoát tiền ở chỗ: mua để bù mệt. Mệt thì mình hay ‘tự thưởng’ quá tay.",
    ],
    selfCare: [
      "Bạn không thiếu động lực. Bạn thiếu nhịp nền: ngủ đủ, ăn đúng, đi bộ đều, giảm nhiễu.",
      "Chăm bạn theo kiểu ‘đều’ mới cứu bạn: 15–20 phút mỗi ngày còn hơn 2 giờ rồi biến mất.",
    ],
    mantra: ["Mình không cần chứng minh. Mình cần bền.", "Mình được phép nghỉ trước khi gãy.", "Mình làm ít lại để sâu hơn."],
    action7d_even: [
      "Ngày 1: viết ra 3 ưu tiên thật (không quá 3).\nNgày 2: bỏ 1 việc khiến bạn hao.\nNgày 3: ngủ sớm hơn 30 phút.\nNgày 4: làm sâu 45 phút cho ưu tiên #1.\nNgày 5: nói ‘không’ 1 lần.\nNgày 6: đi bộ 20 phút.\nNgày 7: tổng kết 10 dòng.",
    ],
    action7d_odd: [
      "Ngày 1: chọn 1 mục tiêu tuần.\nNgày 2: chia thành 3 bước.\nNgày 3: làm bước 1.\nNgày 4: giữ nhịp.\nNgày 5: hoàn thiện.\nNgày 6: đưa ra ngoài.\nNgày 7: tổng kết: cái gì hợp nhịp bạn?",
    ],
    journaling: [
      "Nếu hôm nay bạn được sống đúng nhịp 100%, bạn sẽ bỏ điều gì đầu tiên?",
      "Bạn đang cố mạnh vì ai? Nếu bạn mềm lại, điều gì bạn sợ nhất?",
    ],
  },

  destiny: {
    hook: [
      "Bạn không thiếu năng lực. Bạn chỉ đang đứng ở vai không hợp nên thấy nặng.",
      "Có người làm 10 việc vẫn mờ. Có người chốt đúng vai là bật.",
      "Bạn từng nghĩ mình lười. Thật ra là bạn đang làm sai vai nên không có lửa.",
    ],
    vibe: [
      "Sứ mệnh là ‘vai chính’ bạn chơi tốt nhất khi thôi xin phép. Đúng vai là nhẹ, sai vai là hao.",
      "Sứ mệnh giúp bạn lọc tiếng ồn: cái gì là của mình, cái gì chỉ là kỳ vọng người khác gắn lên bạn.",
    ],
    mirror: [
      "Bạn dễ nhận nhiều việc vì sợ bị đánh giá. Nhận xong lại mệt và tự trách.",
      "Bạn hay ‘chuẩn bị mãi’ vì sợ sai. Nhưng bạn chỉ cần làm 1 bản đủ tốt rồi sửa.",
    ],
    bright: [
      "Bạn bật rất nhanh khi chọn đúng vai và tập trung một đường. Bạn có lực ‘lên form’ mạnh.",
      "Bạn hợp làm chuẩn: tiêu chuẩn, hệ thống, quy trình. Làm đều là uy tín tăng.",
    ],
    shadow: [
      "Bạn dễ kẹt ở ‘định vị mơ hồ’: làm nhiều mà không thành hình ảnh rõ → khó tăng giá.",
      "Bạn dễ biến mọi thứ thành bài kiểm tra giá trị bản thân. Sai một chút cũng tự phạt mình.",
    ],
    love: ["Bạn cần người tôn trọng tham vọng của bạn: cổ vũ nhưng không kiểm soát.", "Bạn cần sự rõ ràng: yêu là hợp tác, không phải gồng một mình."],
    work: [
      "Bạn hợp vai ‘owner’ một mảng: leader/đầu mối/đứng tên kết quả.",
      "Bạn nên chọn 1 trục kỹ năng để lên hệ: làm sâu, làm chuẩn, làm ra sản phẩm/portfolio.",
    ],
    money: [
      "Tiền tăng khi bạn ‘đóng gói’ năng lực: gói dịch vụ/khóa học/sản phẩm. Đừng chỉ bán thời gian.",
      "Tránh học lan man: chốt 1 thứ rồi học sâu sẽ lời hơn.",
    ],
    selfCare: ["Bạn cần ranh giới: xong việc là thôi. Đừng mang công việc về tim.", "Bạn cần lịch phục hồi: 1 buổi/tuần không mục tiêu."],
    mantra: ["Mình chọn vai hợp, không chọn vai để vừa mắt ai.", "Làm ít lại, chuẩn hơn.", "Mình có quyền thử và sửa."],
    action7d_even: [
      "Ngày 1: viết 1 câu định vị (mình giúp ai, bằng gì).\nNgày 2: làm 1 sản phẩm nhỏ chứng minh.\nNgày 3: đăng/đưa ra ngoài.\nNgày 4: xin phản hồi.\nNgày 5: sửa 1 điểm.\nNgày 6: làm phiên bản 2.\nNgày 7: chốt checklist để lặp.",
    ],
    action7d_odd: [
      "Ngày 1: bỏ 1 việc không thuộc ‘vai chính’.\nNgày 2–3: dồn lực cho 1 đầu việc.\nNgày 4: hoàn thành.\nNgày 5: đóng gói.\nNgày 6–7: đưa ra ngoài + nhận phản hồi.",
    ],
    journaling: ["Bạn đang làm để được công nhận… hay làm vì bạn thật sự hợp?", "Nếu chỉ chọn 1 trục để nâng cấp 3 tháng tới, bạn chọn gì?"],
  },

  soul: {
    hook: [
      "Có kiểu thiếu: không thiếu việc, không thiếu trách nhiệm — nhưng thiếu bình yên.",
      "Bạn vẫn cười được. Nhưng có những tối bạn thấy mình… rỗng.",
      "Bạn hay chăm người khác tốt hơn chăm mình. Và bạn mệt theo cách rất thầm.",
    ],
    vibe: [
      "Linh hồn là nhu cầu tinh thần. Thiếu nó, bạn vẫn chạy được — nhưng không muốn chạy.",
      "Linh hồn không đòi bạn làm thêm. Nó đòi bạn quay về: về thân thể, về nhịp thở, về điều thật.",
    ],
    mirror: [
      "Bạn hay ‘cảm thay’ cho người khác. Mệt của người khác bạn cũng mệt.",
      "Bạn hay nói ‘không sao’ trong khi bên trong bạn đang cần một cái ôm.",
    ],
    bright: [
      "Bạn có năng lực chạm sâu: hiểu người, hiểu mình, hiểu tầng nghĩa — món quà hiếm.",
      "Bạn hồi phục nhanh khi được sống thật: ít vai diễn, nhiều chân thành.",
    ],
    shadow: [
      "Bạn dễ mệt vì cho đi quá nhiều mà không nhận lại. Bạn không đòi, nên người ta cũng quên.",
      "Bạn dễ bị kéo vào mối quan hệ ‘cứu rỗi’: thương quá nên chịu quá.",
    ],
    love: ["Bạn hợp tình yêu chậm, ấm, thật. Bạn cần an toàn cảm xúc.", "Bạn cần người lắng nghe mà không sửa bạn ngay lập tức."],
    work: ["Bạn hợp việc có ý nghĩa cá nhân: làm xong thấy ‘đúng’.", "Bạn hợp vai cần chiều sâu: tư vấn, viết, dạy, nghiên cứu, chăm sóc."],
    money: ["Bạn cần ranh giới để không ‘cho free’ quá nhiều.", "Bạn dễ hao tiền vì muốn làm dịu cảm xúc. Dịu thật nằm ở nhịp sống."],
    selfCare: ["Bạn cần chăm bằng thân thể: ngủ đủ, nước đủ, nắng đủ.", "Bạn cần dọn nhiễu: bớt so sánh, bớt người làm bạn hụt."],
    mantra: ["Mình được phép mềm.", "Mình chọn nơi an toàn cho tim.", "Mình tin cảm nhận của mình."],
    action7d_even: [
      "Ngày 1: chọn 1 góc an toàn trong nhà.\nNgày 2: mỗi tối 5 phút viết ‘Hôm nay mình cần…’.\nNgày 3: đi bộ 20 phút.\nNgày 4: nhắn 1 người an toàn.\nNgày 5: cắt 1 nguồn nhiễu.\nNgày 6: làm 1 việc dịu.\nNgày 7: ngủ sớm hơn 30 phút.",
    ],
    action7d_odd: [
      "Ngày 1: viết 3 điều làm bạn tổn thương gần đây.\nNgày 2: chọn 1 điều bạn sẽ nói ra.\nNgày 3: viết câu nói ra (ngắn, rõ).\nNgày 4: nói ra.\nNgày 5: làm 1 việc cho riêng bạn.\nNgày 6: uống đủ nước.\nNgày 7: tổng kết: mình dịu hơn ở đâu?",
    ],
    journaling: ["Điều gì khiến bạn thấy ‘ấm’ mà lâu rồi bạn không chạm tới?", "Bạn đang cần được hiểu, hay đang cần được nghỉ?"],
  },

  personalYear2026: {
    hook: ["2026 không cần bạn chạy nhanh. Nó cần bạn chọn đúng trọng tâm.", "2026 hợp ‘ít mà chất’ hơn là nhiều mà rối."],
    vibe: [
      "Năm cá nhân là chủ đề năm: bài học, nhịp độ và trọng tâm. Nó giúp bạn dồn lực đúng chỗ để đỡ hao.",
      "2026 hợp tối ưu: bỏ thừa, giữ tinh, tăng chất lượng. Không hợp chạy quá nhiều hướng.",
    ],
    mirror: [
      "Bạn dễ bị kéo bởi ‘phải làm cho kịp’. Nhưng càng kịp người khác, bạn càng trễ với chính mình.",
      "Bạn hay mở rộng quá sớm: nhận thêm, hứa thêm — rồi tự hỏi sao mình mệt.",
    ],
    bright: [
      "2026 thuận cho việc chốt lại một hướng và làm ra kết quả thật. Càng đơn giản, bạn càng mạnh.",
      "Năm này hợp ‘làm sâu’: chọn một kỹ năng/lĩnh vực để nâng cấp, rồi tăng giá trị.",
    ],
    shadow: [
      "2026 sẽ ‘đóng’ nếu bạn đổi hướng liên tục và chia mình quá mỏng.",
      "Bạn dễ hụt nếu mục tiêu nào cũng nửa vời: nhiều nhưng không có cái nào xong.",
    ],
    love: ["2026 hợp yêu trưởng thành: rõ ranh giới, rõ kỳ vọng, rõ cam kết.", "Ưu tiên người cho bạn bình yên, không phải hồi hộp."],
    work: ["Chốt 1 trục chính, xây hệ thống nhỏ rồi tăng dần.", "Tối ưu quy trình: làm ít bước hơn nhưng chuẩn hơn."],
    money: ["Tiền đến tốt khi bạn tối ưu thất thoát và tăng chất lượng đầu ra.", "Một khoản đầu tư tốt 2026: kỹ năng + sức khỏe để giữ nhịp."],
    selfCare: ["2026: cơ thể là nền. Ngủ đủ là đòn bẩy lớn nhất.", "Bạn cần lịch nghỉ có kế hoạch, đừng đợi kiệt mới nghỉ."],
    mantra: ["2026: bền là đẹp.", "2026: chọn một đường rồi đi.", "2026: ít mà chất."],
    action7d_even: [
      "Ngày 1: chọn 1 mục tiêu năm (1 câu).\nNgày 2: chia thành 3 bước.\nNgày 3: dọn lịch (bỏ 1 cam kết thừa).\nNgày 4: làm sâu 45 phút cho bước 1.\nNgày 5: tối ưu 1 thói quen nền.\nNgày 6: làm xong 1 việc nhỏ.\nNgày 7: tổng kết: cái gì mở – cái gì đóng?",
    ],
    action7d_odd: [
      "Ngày 1: liệt kê 5 việc đang kéo bạn.\nNgày 2: bỏ 1 việc.\nNgày 3–6: mỗi ngày 25 phút cho ưu tiên #1.\nNgày 7: nghỉ thật 1 buổi và viết 10 dòng về nhịp của mình.",
    ],
    journaling: ["Nếu chỉ giữ 1 ưu tiên trong 2026, bạn sẽ giữ điều gì?", "Bạn đang chia mình mỏng vì tham… hay vì sợ bỏ lỡ?"],
  },
};

function deepNarrative(key: IndexKey, n: number, name: string) {
  const nm = (name || "Bạn").trim() || "Bạn";
  const used = new Set<string>();
  const seed = hashSeed(`${key}|${n}|${nm}`);
  const pools = lensPoolsByKey[key];

  const hook = pickUnique(pools.hook, seed + 1, used);
  const vibe = pickUnique(pools.vibe, seed + 2, used);
  const mirror = pickUnique(pools.mirror, seed + 3, used);
  const bright = pickUnique(pools.bright, seed + 4, used);
  const shadow = pickUnique(pools.shadow, seed + 5, used);
  const love = pickUnique(pools.love, seed + 6, used);
  const work = pickUnique(pools.work, seed + 7, used);
  const money = pickUnique(pools.money, seed + 8, used);
  const selfCare = pickUnique(pools.selfCare, seed + 9, used);
  const mantra = pickUnique(pools.mantra, seed + 10, used);
  const journaling = pickUnique(pools.journaling, seed + 11, used);
  const actionPool = n % 2 === 0 ? pools.action7d_even : pools.action7d_odd;
  const action7d = pickUnique(actionPool, seed + 12, used);

  const header =
    key === "lifePath"
      ? "🌿 ĐƯỜNG ĐỜI"
      : key === "destiny"
      ? "🎯 SỨ MỆNH"
      : key === "soul"
      ? "🌙 LINH HỒN"
      : "🗓️ NĂM CÁ NHÂN 2026";

  const ks = keywords[n] ?? [];
  const kline = ks.length ? `🔑 Từ khóa: ${ks.slice(0, 6).join(" • ")}` : `🔑 Từ khóa: —`;

  return [
    `${header} • Chuyên sâu ${n}`,
    ``,
    `💥 ${nm} ơi, ${hook}`,
    ``,
    `🧭 Nhịp của bạn: ${vibe}`,
    ``,
    `🪞 Gương đời thật:`,
    `- ${mirror}`,
    ``,
    `${kline}`,
    ``,
    `✅ Đi đúng nhịp (bạn sẽ nở):`,
    `- ${bright}`,
    ``,
    `⚠️ Lệch nhịp (dễ kẹt):`,
    `- ${shadow}`,
    ``,
    `💛 Tình cảm:`,
    `- ${love}`,
    ``,
    `💼 Công việc:`,
    `- ${work}`,
    ``,
    `💰 Tiền & giá trị:`,
    `- ${money}`,
    ``,
    `🫧 Tự chăm:`,
    `- ${selfCare}`,
    ``,
    `🪞 Câu nhắc: “${mantra}”`,
    ``,
    `📌 7 ngày vào nhịp:`,
    action7d,
    ``,
    `✍️ Journaling:`,
    `- ${journaling}`,
  ].join("\n");
}

/* =========================
   TEASER
========================= */
function teaserText(key: IndexKey, n: number | null) {
  if (!n) return "Nhập thông tin để xem phần gợi mở.";
  const ks = (keywords[n] ?? []).slice(0, 6);
  const seed = hashSeed(`${key}|${n}`);

  const openByKey: Record<IndexKey, string[]> = {
    lifePath: [
      "Đường đời là nhịp nền: đúng nhịp thì nhẹ, lệch nhịp thì hao.",
      "Bạn không cần cố hơn. Bạn cần đúng nhịp hơn.",
      "Cơ thể bạn luôn biết bạn đang lệch nhịp trước khi lý trí kịp nhận ra.",
    ],
    destiny: [
      "Sứ mệnh là vai chính: đứng đúng vai thì ít làm mà ra kết quả.",
      "Bạn không thiếu năng lực. Bạn đang thiếu một vai rõ.",
      "Chốt đúng vai là bật. Mơ hồ là hao.",
    ],
    soul: [
      "Linh hồn là nhu cầu sâu: thiếu thì vẫn chạy được, nhưng không muốn chạy.",
      "Bạn có thể mạnh ngoài mặt, nhưng bên trong cần được dịu lại.",
      "Chữa lành không cần ồn ào. Nó cần đúng cách.",
    ],
    personalYear2026: [
      "2026 hợp “ít mà chất”: chọn trọng tâm rồi đi.",
      "Năm nay thưởng cho người giữ nền: sức khỏe, nhịp sống, kỷ luật nhẹ.",
      "Tối ưu trước khi mở rộng: đó là chìa khóa 2026.",
    ],
  };

  return `${openByKey[key][seed % openByKey[key].length]}
Con số ${n} thường gợi: ${ks.join(", ") || "—"}.

Chuyên sâu sẽ soi:
• Điểm mạnh & điểm kẹt
• Tình cảm – công việc – tiền
• 7 ngày vào nhịp + journaling`;
}

/* =========================
   MAIN
========================= */
const LS_UNLOCK_V1 = "anSoLab_unlock_v1";

type UnlockState = {
  combo: boolean;
  single: Record<IndexKey, boolean>;
};

function defaultUnlock(): UnlockState {
  return {
    combo: false,
    single: { lifePath: false, destiny: false, soul: false, personalYear2026: false },
  };
}

export default function Home() {
  const [fullName, setFullName] = useState("Trịnh Hồng Ân");
  const [dob, setDob] = useState("1997-05-26");

  const [result, setResult] = useState<IndexResult | null>(null);
  const [error, setError] = useState("");

  const [unlock, setUnlock] = useState<UnlockState>(defaultUnlock());

  const [toast, setToast] = useState<string | null>(null);

  const [openPay, setOpenPay] = useState(false);
  const [payMode, setPayMode] = useState<"single" | "combo">("combo");
  const [payTarget, setPayTarget] = useState<IndexKey>("lifePath");

  const [showFloatCTA, setShowFloatCTA] = useState(false);
  const teaserRef = useRef<HTMLDivElement | null>(null);
  const [teaserSeen, setTeaserSeen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  const normalizedName = useMemo(() => normalizeName(fullName), [fullName]);
  const transferNote = useMemo(() => `TSH ${normalizedName || "TEN"} ${dob}`, [normalizedName, dob]);

  // Load saved unlock (persist)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_UNLOCK_V1);
      if (!raw) return;
      const parsed = JSON.parse(raw) as UnlockState;
      if (!parsed || typeof parsed !== "object") return;
      if (!parsed.single) return;
      setUnlock(parsed);
    } catch {
      // ignore
    }
  }, []);

  // Save unlock (persist)
  useEffect(() => {
    try {
      localStorage.setItem(LS_UNLOCK_V1, JSON.stringify(unlock));
    } catch {
      // ignore
    }
  }, [unlock]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setShowFloatCTA(y > 650);
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
    if (unlock.combo) return;
    if (Object.values(unlock.single).some(Boolean)) return;
    if (showNudge) return;

    const t = setTimeout(() => setShowNudge(true), 9000);
    return () => clearTimeout(t);
  }, [result, teaserSeen, unlock, showNudge]);

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

  const isDeepLocked = (k: IndexKey) => !(unlock.combo || unlock.single[k]);

  const cardValue = (k: IndexKey) => {
    if (!result) return null;
    if (k === "lifePath") return result.lifePath;
    if (k === "destiny") return result.destiny;
    if (k === "soul") return result.soul;
    return result.personalYear2026;
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
      setUnlock({
        combo: true,
        single: { lifePath: true, destiny: true, soul: true, personalYear2026: true },
      });
    } else {
      setUnlock((p) => ({ ...p, single: { ...p.single, [payTarget]: true } }));
    }
    setOpenPay(false);
    setShowNudge(false);
    setToast("Đã mở khóa ✅");
  };
return (
  <main
    style={{
      minHeight: "100vh",
      padding: 18,
      overflowX: "hidden",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
      color: "white",
      background:
        "radial-gradient(1200px 520px at 20% 0%, rgba(124,92,255,0.45), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(52,214,255,0.40), transparent 60%), linear-gradient(180deg, #070A1A, #060A14)",
    }}
  >
      {/* subtle grid */}
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
            zIndex: 1000,
            padding: "10px 12px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            fontWeight: 900,
            fontSize: 12,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            maxWidth: "calc(100vw - 28px)",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      ) : null}

      {/* Floating CTA (mobile safe) */}
      {showFloatCTA ? (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 90,
            width: 340,
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
            <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.6, lineHeight: 1.1 }}>
              Numerology • Premium
            </div>
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
                  width: "100%",
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
                  width: "100%",
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
            const words = v ? (keywords[v] ?? []).slice(0, 3) : [];
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

                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
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
            Con số không quyết định bạn là ai — nó là <b>tấm gương</b> để bạn nhìn rõ nhịp sống của mình: bạn đang chạy
            quá nhanh, hay đang bỏ quên điều mình thật sự cần?
          </div>
        </div>

        {/* TEASER */}
        <div
          ref={teaserRef}
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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

            const excerpt = teaserText(key, v);

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
                  minHeight: 182,
                }}
              >
                <div style={{ fontWeight: 950, fontSize: 14 }}>{label}</div>

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
                      <div style={{ fontWeight: 950, color: "white" }}>Chạm để mở khóa</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
                        Đây là phần “chuyên sâu” — mở 1 chỉ số {money(PRICE_SINGLE)} hoặc combo {money(PRICE_COMBO)}.
                      </div>
                      <button
                        onClick={() => openSinglePay(key)}
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

            <div style={{ minWidth: 260, width: 360, maxWidth: "100%" }}>
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
              <CopyButton label="Copy STK" textToCopy={BANK_ACCOUNT} onCopied={() => setToast("Đã copy STK ✅")} />
              <CopyButton label="Copy nội dung CK" textToCopy={transferNote} onCopied={() => setToast("Đã copy nội dung ✅")} />
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
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
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
                        Mở 1 chỉ số {money(PRICE_SINGLE)} hoặc combo {money(PRICE_COMBO)} để xem đầy đủ.
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

      {/* NUDGE MODAL */}
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
              <b>{BANK_NAME}</b> • STK: <b>{BANK_ACCOUNT}</b>
            </div>
            <div style={{ marginTop: 6 }}>
              Nội dung: <b>{transferNote}</b>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <CopyButton label="Copy STK" textToCopy={BANK_ACCOUNT} onCopied={() => setToast("Đã copy STK ✅")} />
              <CopyButton label="Copy nội dung CK" textToCopy={transferNote} onCopied={() => setToast("Đã copy nội dung ✅")} />
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

      {/* PAYMENT MODAL */}
      <Modal
        open={openPay}
        title={
          payMode === "combo"
            ? `Mở combo chuyên sâu • ${money(PRICE_COMBO)}`
            : `Mở chuyên sâu 1 chỉ số • ${money(PRICE_SINGLE)}`
        }
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
              <CopyButton label="Copy STK" textToCopy={BANK_ACCOUNT} onCopied={() => setToast("Đã copy STK ✅")} />
              <CopyButton label="Copy nội dung CK" textToCopy={transferNote} onCopied={() => setToast("Đã copy nội dung ✅")} />
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
            *Mở khóa được lưu trên thiết bị này (localStorage). Nếu đổi máy/đổi trình duyệt sẽ phải mở lại.
          </div>
        </div>
      </Modal>
    </main>
  );
}