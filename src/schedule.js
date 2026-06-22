// الجدول الفعلي للمعرض الطبي — ثابت في الكود (لا يحتاج قاعدة بيانات).
// التواريخ YYYY-MM-DD ووقت البداية للعدّاد.

export const TYPES = {
  training: { ar: "تدريب", dot: "#8B5CF6", soft: "rgba(139,92,246,.16)" },
  inperson: { ar: "اجتماع حضوري", dot: "#E8997A", soft: "rgba(232,153,122,.18)" },
  online:   { ar: "Catch Up أونلاين", dot: "#19C6B0", soft: "rgba(25,198,176,.16)" },
  bigevent: { ar: "فعالية كبيرة", dot: "#F4C04A", soft: "rgba(244,192,74,.18)" },
};

export const SCHEDULE = [
  { id: "2026-07-04", date: "2026-07-04", start: "10:00", end: "19:00", type: "training", label: "تدريب الإداريين" },
  { id: "2026-07-10", date: "2026-07-10", start: "10:00", end: "19:00", type: "training", label: "تدريب فريق 1" },
  { id: "2026-07-11", date: "2026-07-11", start: "13:00", end: "17:00", type: "inperson", label: "اجتماع إداري حضوري" },
  { id: "2026-07-25", date: "2026-07-25", start: "21:30", end: "22:30", type: "online",   label: "اجتماع أونلاين" },
  { id: "2026-08-07", date: "2026-08-07", start: "10:00", end: "19:00", type: "training", label: "تدريب فريق 2" },
  { id: "2026-08-08", date: "2026-08-08", start: "13:00", end: "17:00", type: "inperson", label: "اجتماع إداري حضوري" },
  { id: "2026-08-21", date: "2026-08-21", start: "10:00", end: "23:00", type: "bigevent", label: "الفعالية الكبيرة للفريق (مقترح)" },
  { id: "2026-08-22", date: "2026-08-22", start: "21:30", end: "22:30", type: "online",   label: "اجتماع أونلاين" },
  { id: "2026-09-05", date: "2026-09-05", start: "13:00", end: "17:00", type: "inperson", label: "اجتماع إداري حضوري" },
  { id: "2026-09-19", date: "2026-09-19", start: "21:30", end: "22:30", type: "online",   label: "اجتماع أونلاين" },
  { id: "2026-09-26", date: "2026-09-26", start: "12:00", end: "19:00", type: "bigevent", label: "اجتماع كامل للفريق" },
  { id: "2026-10-03", date: "2026-10-03", start: "21:30", end: "22:30", type: "online",   label: "اجتماع أونلاين" },
];

// الإداريون + المتطوعون من الهيكلية (لقوائم الحضور والمهام)
export const ROLES = [
  "المنسق التنفيذي",
  "النائب / المالية والضبط",
  "مشرف الجلسات العلمية",
  "مسؤول MEAL",
  "مشرف المحتوى الإبداعي والرقمي",
  "مسؤول اللوجستيات",
  "المساعد التنفيذي",
  "مشرف قاعة المعرض",
  "مسؤول الموارد البشرية",
  "مشرف التسجيل",
  "الدعم الفني",
  "دعم السوشال ميديا",
  "مسؤول الإعلام المرئي",
  "المصوّرون",
  "دعم قاعة المعرض",
  "الاستقبال الداخلي",
  "الاستقبال الخارجي",
];

export const STATUS = {
  todo:  { ar: "لم يبدأ", color: "#9A8FB0" },
  doing: { ar: "قيد العمل", color: "#F4C04A" },
  done:  { ar: "منجز", color: "#19C6B0" },
};

export const RSVP = {
  going: { ar: "حاضر", color: "#19C6B0" },
  maybe: { ar: "ربما", color: "#F4C04A" },
  no:    { ar: "معتذر", color: "#E8997A" },
};

const AR_MONTHS = ["كانون2","شباط","آذار","نيسان","أيار","حزيران","تموز","آب","أيلول","تشرين1","تشرين2","كانون1"];
const AR_DAYS = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

export function parseDT(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}
export function fmtDate(dateStr) {
  const dt = parseDT(dateStr);
  return `${AR_DAYS[dt.getDay()]} ${dt.getDate()} ${AR_MONTHS[dt.getMonth()]}`;
}
export function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}
