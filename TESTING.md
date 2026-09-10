# حالة الاختبار — awrafy Backend

آخر تحديث: هاد الجلسة. هاد الملف كيوثق بدقة **شنو تأكد فعليا، وشنو لسع لا**، بلا مبالغة.

## ✅ مستوى 1: Unit Tests (27/27 ناجحة، 8 suites)

مشغلة فعليا عبر `pnpm --filter @awrafy/api test` (jest + @swc/jest، `@prisma/client` mocked بالكامل — انظر `src/__mocks__/prisma-client-mock.ts`).

| الملف | كيغطي |
|---|---|
| `auth.service.spec.ts` | bcrypt hash حقيقي، 2FA branching |
| `orders.service.spec.ts` | idempotency، حساب السعر من DB |
| `inventory.service.spec.ts` | atomic stock decrement، رفض overselling |
| `order-confirmation.service.spec.ts` | trust_score clamping [0,1] |
| `roles.guard.spec.ts` | RBAC owner/staff |
| `products.service.spec.ts` | duplicate slug، currency fallback |
| `billing.service.spec.ts` | usage limits، فاتورة خطة مجانية |
| `storefront-api.service.spec.ts` | **أمني**: بلا تسريب draft products |

**الحدود:** هاد الاختبارات كتغطي business logic بمعزل — الـmocks كتحاكي سلوك Prisma، بلا اختبار حقيقي مع DB.

## ✅ مستوى 2: SQL Integration Test (على PostgreSQL 16 حقيقية)

PostgreSQL 16 مثبتة ومشغلة فعليا فهاد الـsandbox (`apt-get install postgresql`). الـschema اتبنى يدويا بـSQL خام (مطابق لـ`prisma/schema.prisma`)، والاختبارات دارت **حقيقيا** على قاعدة بيانات شغالة، ماشي محاكاة.

**تأكد فعليا:**
- الـ16 جدول كاملين اتخلقو بلا خطأ syntax
- `UNIQUE(tenant_id, slug)` — نفس slug عند 2 تجار يخدم، عند نفس التاجر يفشل
- `idempotency_key` مكرر يفشل
- `subscriptions.tenant_id UNIQUE` — اشتراك ثاني لنفس التاجر يفشل
- **Atomic stock decrement**: `UPDATE product_variants SET stock = stock - N WHERE stock >= N` — جربناها بمخزون 1 ونقص 5، رجعت `UPDATE 0` (بلا تغيير) — بالضبط السلوك المطلوب من `InventoryService.decrementForOrder`
- دورة كاملة مترابطة: tenant → subscription → carrier → product+variant → order+items → payment → confirmation+trust_score → shipment، كل الـforeign keys صحيحة

**الحدود المهمة:** هاد الاختبار كتحقق من **بنية البيانات** (الـSQL constraints نفسهم) — الكود اللي كتبناه (`InventoryService.ts`, `OrdersService.ts`...) **تكرر منطقو يدويا بـSQL** للاختبار، بصح **ماخدمش هو نفسو**. يعني: تأكدنا أن التصميم صحيح، ماشي أن التطبيق (application code) كيخدم فعليا.

## ❌ مستوى 3: تشغيل التطبيق الحقيقي (NestJS + Prisma Client) — ماوصلناش

`prisma generate` محظورة بالكامل فهاد البيئة. جربنا:

1. `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` — 403 حتى بعد التجاوز (الـbinary نفسو محظور)
2. الرفع لـPrisma 7 (بلا Rust query engine افتراضيا) — نفس المشكل، لأن `schema-engine` (أداة الـCLI، ماشي الـclient) مازالت محتاجة
3. `engineType: "client"` + `driverAdapters` + `prisma.config.ts` — نفس المشكل
4. تثبيت `@prisma/prisma-schema-wasm` يدويا — ماكيتقرأش أوتوماتيك من الـCLI

**السبب الجذري:** `binaries.prisma.sh` (اللي منو كيتحمل `schema-engine`) ماشي فلائحة الدومينات المسموحة فهاد الـsandbox. هذا قيد شبكة صلب، بلا حل بديل داخل هاد البيئة.

**الحل:** عندك محليا — `binaries.prisma.sh` غالبا ماشي محظورة عندك، `prisma generate` خصها تخدم عادي.

## الخلاصة

| المستوى | الحالة | الثقة |
|---|---|---|
| Business logic (mocked) | ✅ 27/27 | عالية |
| Database schema/constraints | ✅ مؤكد على DB حقيقية | عالية |
| Application runtime (NestJS + Prisma) | ❌ ماتأكدش | **معدومة — أول حاجة تديرها محليا** |

بعد `prisma generate` محليا، الخطوة المنطقية: تشغيل `pnpm dev:api` + إرسال request حقيقي (curl أو Postman) لـ`POST /auth/signup`، ثم مقارنة النتيجة مع الافتراضات اللي بنينا عليها الاختبارات هنا.
