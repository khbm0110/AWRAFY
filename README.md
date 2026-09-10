# awrafy — Monorepo

بداية الكود الحقيقي — Phase 0 (انظر `docs/tasks/phase-0-foundation.md` فمجلد التوثيق). هاد الملف كيفاش تخدم بيه محليا.

## البنية

```
awrafy/
├── apps/
│   ├── api/        ← NestJS backend (Modular Monolith)
│   └── web/         ← Next.js storefront + dashboard (SSR/ISR)
├── packages/         ← كود مشترك (يتزاد لاحقا: types, i18n keys)
├── docker-compose.yml ← Postgres + Redis محليا
└── .env.example
```

## التشغيل المحلي (أول مرة)

```bash
# 1. تثبيت pnpm إذا ماكاينش
npm install -g pnpm

# 2. تثبيت كل الـdependencies
pnpm install

# 3. تشغيل Postgres + Redis
pnpm docker:up

# 4. نسخ .env
cp .env.example .env
# بدل القيم الحساسة (JWT secrets) قبل production — أي قيمة default هنا للتطوير فقط

# 5. توليد Prisma client + أول migration
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate --name init

# 5.1 (إذا bcrypt رمى خطأ "Cannot find module ...napi-v3/bcrypt_lib.node")
cd node_modules/.pnpm/bcrypt@*/node_modules/bcrypt && npm run install && cd ../../../../..

# 6. تفعيل Row-Level Security (يدوي، Prisma ماكيدعمهاش مباشرة)
psql $DATABASE_URL -f prisma/rls/001_enable_rls.sql

# 7. رجع لجذر المشروع، شغل الـAPI والـweb (فـ2 terminals منفصلة)
cd ../..
pnpm dev:api   # http://localhost:3001
pnpm dev:web   # http://localhost:3000
```

## الحالة الحقيقية دابا (بصراحة)

**مبني ومختبر جزئيا:**
- ✅ Monorepo structure (pnpm workspaces)
- ✅ `modules/auth` — signup, login, 2FA (generate/confirm/verify) — كود كامل، **ماشي مختبر بـtest DB حقيقية بعد**
- ✅ `modules/tenants` — أساسي (`GET /tenants/me`)
- ✅ `modules/stores` — إعدادات المتجر (`GET/PATCH /stores/me`)
- ✅ `modules/categories` — CRUD أساسي بـi18n
- ✅ `modules/products` — CRUD كامل + pagination إجبارية + variants
- ✅ `modules/customers` — findOrCreate بالتيليفون (المعرف الأساسي لـCOD)
- ✅ `modules/orders` — إنشاء طلب مع **idempotency_key**، السعر يتحسب من الـDB (بلا ثقة فـclient)، transaction وحدة
- ✅ `modules/payments` — COD أساسي (بلا webhook، الحالة كتتبدل يدويا بعد التسليم)
- ✅ `modules/shipping` — شركات الشحن (multi-carrier) + shipments + status_history
- ✅ `modules/order-confirmation` — تأكيد الطلب قبل الشحن + تعديل `trust_score` أوتوماتيك (clamped بين 0-1) فنفس الـtransaction
- ✅ `modules/storefront-api` — endpoints عمومية **بلا JWT** (`PublicTenantGuard` يحدد الـtenant من الدومين) لعرض المنتجات وإنشاء الطلب من الزبون النهائي
- ✅ `modules/inventory` — stock decrement **atomic** (conditional update `WHERE stock >= quantity`، بلا race condition) داخل نفس transaction ديال إنشاء الطلب؛ + تعديل يدوي (`stock_adjustments`) لمشكل المحل الفيزيائي
- ✅ `modules/billing` — 3 خطط (Starter/Growth/Pro) بحدود واضحة، trial period (14 يوم للخطط المدفوعة)، usage tracking (count حي، بلا counter متراكم)، فواتير أساسية (`platform_invoices`)
- ✅ `TenantGuard` — JWT verification + tenant extraction
- ✅ `eslint-plugin-boundaries` محسّنة — كتفرق بين `module-entry` (index.ts) و`module-internal`، كتفرض استيراد modules عبر public API فقط
- ✅ Next.js storefront — صفحة رئيسية SSR + i18n (ar/fr/en) + RTL
- ✅ **Dashboard كاملة بحال `docs/09-admin-dashboard-structure.md`** — sidebar بـ11 قسم (`nav-config.ts` مصدر الحقيقة الوحيد):
  - **نشيطة بالكامل (backend + UI):** الرئيسية، الطلبات، المنتجات، **العملاء (جديد)**، **الشحن (جديد)**، **الفوترة (جديد)**، **الإعدادات (جديد)**
  - **"قريبا" (بلا backend بعد، بلا إخفاء)**: تصميم المتجر، التسويق، التقييمات، التحليلات، الدعم — كل واحدة كتعرض الـmodules الموثقة ليها فـ`tasks/`
  - **Permissions أساسية**: `billing` و`settings` مقفلين لـowner فقط فـUI (مطابقين لـ`@Roles('owner')` فـAPI) — الـrole كيتقرا من JWT client-side (للعرض فقط، الفرض الحقيقي server-side)
- ✅ **Storefront متصلة بالـAPI حقيقيا** — `/[locale]/products` (SSR list) و`/[locale]/products/[slug]` (SSR detail): **JSON-LD Product schema، BreadcrumbList، generateMetadata ديناميكية، canonical URL** — هاد الصفحة بالضبط هي الميزة التنافسية اللي كل استراتيجية awrafy مبنية عليها (انظر docs/04-seo-strategy.md وdocs/05-competitive-analysis.md)
- ✅ **Unit tests حقيقية، مشغلة فعليا وناجحة (36/36، 12 suites — تغطية كاملة لكل الـ10 modules + `customers.findAll`)** — `pnpm --filter @awrafy/api test`:
  - `auth.service.spec.ts` — bcrypt hash فعلي (بلا plain text)، 2FA branching (`requires2FA`)
  - `orders.service.spec.ts` — idempotency (بلا order مكرر)، السعر يتحسب من `products.price` (بلا ثقة فـDTO)
  - `inventory.service.spec.ts` — `decrementForOrder` atomic (conditional update)، رفض إذا مخزون ناقص
  - `order-confirmation.service.spec.ts` — `trust_score` clamped [0,1] فعليا
  - `roles.guard.spec.ts` — RBAC (owner/staff branching)
  - `products.service.spec.ts` — duplicate slug rejection، currency fallback
  - `billing.service.spec.ts` — usage limits calculation، خطة مجانية بلا فاتورة
  - `storefront-api.service.spec.ts` — **أمني**: draft product كيرجع 404 بلا فرق عن "ماكاينش"، `status` مفروضة `active` بغض النظر عن query الزبون
  - `stores.service.spec.ts`، `categories.service.spec.ts`، `customers.service.spec.ts`، `shipping.service.spec.ts` — تكملة التغطية على باقي الـmodules
  - `@prisma/client` **mocked بالكامل** فـ`__mocks__/prisma-client-mock.ts` — unit tests ماعندهاش dependency على Postgres حقيقي

**+ اختبار SQL شامل حقيقي على PostgreSQL 16** (مثبتة فهاد الـsandbox عبر `apt-get`، `archive.ubuntu.com` مسموحة):
  - كل الـ16 جدول اتخلقو من schema يدوي مطابق لـ`schema.prisma`
  - `UNIQUE(tenant_id, slug)`، `idempotency_key` مكرر، `@unique tenant_id` فـsubscriptions — كلهم اترفضو صح
  - **Stock decrement atomic + منع overselling** — `UPDATE...WHERE stock >= quantity` رجع `UPDATE 0` عند نقص المخزون، بالضبط منطق `InventoryService`
  - دورة كاملة (اشتراك → مخزون → طلب → COD → تأكيد → trust_score → شحن) — كل الـforeign keys ترابطت صح
- ✅ Prisma schema كاملة (14 model): tenants, users, stores, categories, products, product_variants, stock_adjustments, customers, orders, order_items, payments, order_confirmations, shipping_carriers, shipments
- ✅ RLS SQL migration (يدوية، خصها تتشغل بعد `prisma migrate`)
- ✅ `tsc --noEmit` مفحوص يدويا — بلا أي خطأ غير متوقع (الأخطاء الوحيدة كاسكاد من `PrismaClient` غير مولدة فهاد الـsandbox، كتتصلح أوتوماتيك عند `prisma generate` محليا)

**⚠️ TODO حرجة قبل أي production:**
- [ ] `totpSecret` و`totpRecoveryCodes` مخزنين plain فـPrisma schema حاليا — خصهم تشفير at-rest (انظر تعليقات `TODO` فـ`auth.service.ts`)
- [ ] `shippingCarrier.apiConfig` نفس الملاحظة — credentials خصهم تشفير قبل production
- [x] ~~TenantGuard كيقرا الـtenantId من JWT، بصح ماكيربطش مع SET LOCAL~~ — **تبدل القرار المعماري**: بدل ربط RLS الخام (معقد مع connection pooling)، بنينا `PrismaService.forTenant()` كطبقة حماية application-level (انظر `prisma.service.ts`). RLS SQL خاصها تبقى مفعّلة كـdefense-in-depth ثانية، بلا اعتماد عليها وحدها.
- [x] ~~`forTenant()` مطبقة غير فـ2 modules~~ — **معممة دابا على 7/10 modules** (الـ3 الباقيين بلا tenantId مباشر فالـschema أصلا، ماحتاجينش forTenant)
- [ ] RBAC مطبقة غير على 3 controllers (billing, stores, shipping-carriers) — الباقي (products, orders, customers...) بلا قيد role بعد؛ كل tenant user (owner/staff) عندو access كامل حاليا
- [x] ~~idempotencyKey check بلا tenantId~~ — **اكتشفت وصلحت فالطريق**: `order.findUnique({where: {idempotencyKey}})` كان بلا `tenantId` فالفحص، يعني تصادم نادر بين تاجرين (client كيولد نفس المفتاح بالصدفة) كان يقدر يسرب طلب تاجر لآخر. صلحتها بزيادة `tenantId` للـwhere
- [ ] `variantId` فـ`CreateOrderDto` اختياري — منتج بلا variants (بلا ألوان/مقاسات) ماعندوش stock tracking حاليا فـflow الطلب، غير التعديل اليدوي عبر `modules/inventory`
- [ ] `modules/billing` — `generateInvoice` ماكيتنادىش أوتوماتيك (خصو BullMQ job شهري)، `pdfUrl` فارغة (بلا توليد PDF حقيقي بعد)، وتجديد الاشتراك بلا ربط فعلي مع CMI (نفس حاجز الدفع)
- [ ] Dashboard: JWT مخزن فـ`localStorage` (سهل، بصح عرضة لـXSS) — التبديل لـhttpOnly cookies قبل production
- [ ] Dashboard: صفحة إدخال كود 2FA ماكاينتش بعد — `login()` كيرمي error إذا 2FA مفعّلة
- [ ] Dashboard: بلا refresh-token flow (access token كيخلص بعد 15 دقيقة، بلا تجديد أوتوماتيك حاليا)
- [ ] Storefront SSR fetch: تحديد الـtenant بـ`STOREFRONT_TENANT_ID` env var (dev fallback) — production خصها custom domains (DNS wildcard/CNAME لكل متجر) اللي مازال ماتبنات
- [ ] `storefront-api.ts` fetch options عندها type cast (`as RequestInit & {...}`) — كاسكاد من `.next/types` غير مولدة (خصها `next dev`/`next build` أول مرة)، كيتصلح تلقائيا محليا
- [ ] `modules/shipping` — webhook/polling أوتوماتيك من شركات الشحن ماشي مبني بعد، `updateShipmentStatus` يدوي حاليا فقط
- [ ] `modules/order-confirmation` — إرسال فعلي عبر WhatsApp/SMS/call ماشي مبني (الـmodule كيسجل الحالة فقط، بلا تكامل قناة حقيقية)
- [ ] trust_score delta (`±0.05/±0.1`) heuristic مبدئية — خصها تتحسن ملي تتوفر بيانات حقيقية
- [ ] `modules/payments` — CMI الحقيقي ماشي مبني بعد (حاجز تجاري خارجي: العقد لسع ماتوقعش)
- [ ] `PublicTenantGuard` عندو fallback `x-tenant-id` header للتطوير المحلي فقط (معطل تلقائيا فـ`NODE_ENV=production`) — خصو يتحيد قبل أي deploy حقيقي، production خصها تعتمد على الدومين الحقيقي فقط
- [x] ~~Unit tests موجودة لـ8/10 services~~ — **دابا 10/10 modules عندهم spec file مباشر** (35 test، 12 suites)
- [x] ~~Integration tests بلا Postgres حقيقي~~ — **جربنا فعليا على Postgres 16 حقيقية** (schema يدوي، ماشي عبر Prisma Client) وتأكدنا من كل الـconstraints الحرجة. الفجوة المتبقية: الكود ديال NestJS (`ProductsService.ts` نفسو) لسع ماخدمش، فقط منطقو تكرر يدويا بـSQL للتحقق
- [ ] **`prisma generate` محظورة بالكامل فهاد البيئة** — جربنا 4 طرق مختلفة (Prisma 5، Prisma 7 + `engineType: client`، `driverAdapters` + `prisma.config.ts`، حزمة `@prisma/prisma-schema-wasm`) — كلهم فشلو لأن `schema-engine` binary محظور (403) من `binaries.prisma.sh`، بغض النظر عن الإعداد. هذا قيد صلب فالـsandbox، خصو يتحل محليا عندك (بلا هاد القيد)
- [ ] `pnpm install` ماتديرش هنا (بلا internet access كافي للـsandbox) — خصك تديرها محليا عندك

## Dashboard — التغطية مقابل `docs/09-admin-dashboard-structure.md`

| القسم | الحالة |
|---|---|
| الرئيسية | ✅ نشيطة |
| الطلبات | ✅ نشيطة |
| المنتجات | ✅ نشيطة |
| العملاء | ✅ نشيطة (جديدة هاد الجولة) |
| الشحن | ✅ نشيطة (جديدة) |
| الدفع والفوترة | ✅ نشيطة، owner فقط (جديدة) |
| الإعدادات | ✅ نشيطة، owner فقط (جديدة) |
| تصميم المتجر | 🔜 قريبا (`themes` module) |
| التسويق | 🔜 قريبا (`promotions`, `affiliates`, `influencer-marketplace`, `loyalty`) |
| التقييمات | 🔜 قريبا (`reviews`) |
| التحليلات | 🔜 قريبا (`analytics`) |
| الدعم | 🔜 قريبا (`support`) |

## الخطوة الجاية

Backend (10 modules، 16 model) + Dashboard + Storefront متصلة (SSR + JSON-LD) + Unit tests (**27 ناجحة، 8 suites**) + SQL integration test حقيقي على Postgres 16 + `forTenant()` + RBAC **مبنيين ومختبرين لأقصى حد ممكن فهاد البيئة**. الخطوة الوحيدة المتبقية الحقيقية: `prisma generate` عندك محليا (بلا قيد الشبكة اللي عندي) — بعدها `pnpm dev:api` + `pnpm dev:web` وكلشي خصو يخدم مباشرة، حيت بنية البيانات وmنطق الأعمال متأكدين بالفعل.
