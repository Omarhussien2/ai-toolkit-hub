<div align="center">

<img src="logo.png" alt="AI Toolkit Hub" width="220" />

# AI Toolkit Hub — دليل أدوات الذكاء الاصطناعي

**منصة مفتوحة المصدر، عربية أولًا، لتجميع أدوات الذكاء الاصطناعي واكتشافها وإدارتها**
*An open-source, Arabic-first platform to discover, collect, and curate AI tools*

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=flat-square)](https://mytoolkit-hub.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres+%2B+Auth-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-ff69b4?style=flat-square)](https://github.com/Omarhussien2/ai-toolkit-hub/pulls)

**[تجربة مباشرة](https://mytoolkit-hub.vercel.app)** · **[English below ↓](#-english)**

</div>

---

## 💡 المشروع بإيجاز

لو بتعامل مع أدوات AI كتير كل يوم، هتعرف المشكلة: لينكات ضايعة في المفضلة، واتساب، ونوتس — ومفيش مكان واحد يجمعها بشكل منظم بمعايير موحدة.

**AI Toolkit Hub** بيحلّ ده: منصة ويب + امتداد متصفح تخليك تلتقط أي أداة في ثانية وانت بتتصفح، وتنضف بياناتها تلقائيًا، وتنظمها في دليل منقّم بمراجعة بشرية — بالعربي وبانجليزي، وبواجهة RTL أصلية مش مترجمة على السريع.

## ✨ المزايا

- 🔗 **التقاط فوري من المتصفح** — امتداد متصفح + Bookmarklet يلتقط الأداة وانت بتتصفحها، من غير ما تسيب الصفحة
- 🧹 **تنظيف البيانات تلقائيًا** — استخراج العنوان والوصف والصورة من صفحة الأداة (Metadata) مع تدقيق بشري قبل النشر
- 🗂️ **دليل منقّم** — تصنيفات، بحث، صفحة تعديل للأدمن، ومكتبة GitHub لتصفح مصادر مفتوحة
- 📊 **تصدير مرن** — Excel و CSV بنقرة، مع نسخ احتياطي مجدول إلى Google Sheets
- 📈 **لوحة مؤشرات المخاطر** — Dashboard لقياس التزام المشاريع بسجلات المخاطر (نموذج قابل للتوسيع)
- 🔐 **مصادقة كاملة** — Supabase Auth مع دخول Google OAuth، وأدوار أدمن
- 🌍 **عربي أولًا** — RTL أصلي من الأساس، مع دعم كامل للإنجليزية

## 🛠️ التقنيات

| الطبقة | التقنية |
|---|---|
| الواجهة | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS |
| الخلفية | Next.js API Routes · Zod للتحقق |
| قاعدة البيانات | Supabase (PostgreSQL + RLS + Auth) |
| الامتداد | WXT Framework |
| التكاملات | Google Sheets API · Google OAuth · Vercel Cron |
| النشر | Vercel |

## 🚀 التشغيل محليًا

**المتطلبات:** Node.js 20+ · حساب Supabase مجاني

```bash
# 1. استنساخ المشروع
git clone https://github.com/Omarhussien2/ai-toolkit-hub.git
cd ai-toolkit-hub

# 2. تثبيت الاعتماديات (Monorepo: تطبيق ويب + امتداد)
npm install

# 3. تجهيز البيانات الأولية (اختياري)
npm run prepare:data

# 4. إعداد المتغيرات البيئية
cp apps/web/.env.example apps/web/.env.local
#    ثم املأ القيم (رابط Supabase والمفتاح العام — التفاصيل داخل الملف)

# 5. قاعدة البيانات: نفّذ ملفات supabase/migrations بالترتيب من Supabase SQL Editor

# 6. تشغيل
npm run dev
```

ل.Build امتداد المتصفح: `npm run extension:build`

## 📁 بنية المشروع

```
apps/web        تطبيق الويب (Next.js)
apps/extension  امتداد التقاط الأدوات من المتصفح
supabase/       migrations قاعدة البيانات
scripts/        تحويل البيانات وتجهيزها
docs/           توثيق التكاملات والإنتاج (INTEGRATIONS.md)
```

## 🤝 المساهمة

المشروع مفتوح المصدر بالكامل تحت رخصة MIT — **استخدمه، عدّله، ابنِ عليه.**

أفكار أو لاقيت مشكلة؟ افتح Issue، وPRs مرحب بيها دايمًا. التواصل بالعربي أو الإجليزي — الاتنين تمام.

> ملاحظة أمان: لا ترفع أي مفاتيح أو Token حقيقي في commits — المتغيرات السرية مكانها `.env.local` وإعدادات منصة النشر فقط.

## 👤 المؤلف

**Omar Hussien** — Digital Marketer & AI Builder

[GitHub](https://github.com/Omarhussien2) · [Portfolio](https://github.com/Omarhussien2/portfolio)

## 📄 الرخصة

[MIT](LICENSE) — استخدم بحرية، مع ذكر المصدر.

---

<div align="center" id="-english">

## 🇬🇧 English

**AI Toolkit Hub** is an open-source, Arabic-first directory for discovering and curating AI tools. It pairs a Next.js web app with a browser extension: capture any tool while browsing, auto-clean its metadata with human review, and organize everything into a curated, bilingual (RTL-native) directory with exports, scheduled Google Sheets backups, and a risk-indicators dashboard.

**Stack:** Next.js 16 · React 19 · TypeScript · Supabase (Postgres, RLS, Auth) · Tailwind CSS · WXT extension · Vercel

**Quick start:** `git clone` → `npm install` → `npm run prepare:data` (optional) → run `supabase/migrations` in order in the Supabase SQL Editor → copy `apps/web/.env.example` to `.env.local` and fill values → `npm run dev`. Browser extension: `npm run extension:build`.

**Contributing:** Issues and PRs are welcome in Arabic or English. Licensed under [MIT](LICENSE) — use it, fork it, build on it.

</div>
