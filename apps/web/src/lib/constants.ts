export const ADMIN_EMAIL = "omarsamawah@gmail.com";

export const DEFAULT_CATEGORIES = [
  "الكل",
  "ميديا",
  "صوت",
  "إنتاجية",
  "وكلاء",
  "منصات",
  "تسويق",
  "برمجة",
  "تصميم",
  "كتابة",
  "تحليل بيانات",
  "بحث",
  "محادثة",
  "تعلم",
  "GitHub",
  "أخرى",
];

export const CAPTURE_BOOKMARKLET = `javascript:(()=>{const u=encodeURIComponent(location.href);const t=encodeURIComponent(document.title);open((localStorage.getItem('mytoolkit_url')||'${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}')+'/capture/new?url='+u+'&title='+t,'_blank','noopener')})()`;
