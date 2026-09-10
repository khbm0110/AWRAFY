-- Row-Level Security — يتشغل يدويا بعد أول `prisma migrate dev`
-- (Prisma ماكيدعمش RLS مباشرة، انظر docs/03-database-schema.md § قواعد إجبارية #1)
--
-- تشغيل: psql $DATABASE_URL -f prisma/rls/001_enable_rls.sql

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- الـAPI كيحط app.current_tenant_id فبداية كل transaction (انظر TenantGuard)
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_stores ON stores
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- ⚠️ TODO Phase 0: ربط TenantGuard بـ`SET LOCAL app.current_tenant_id` فبداية كل query
-- (عبر Prisma middleware أو interceptor) — هاد الملف كيفعل الحماية على مستوى DB
-- بصح خصو يتغذى من الـapplication layer. بلا هاد الربط، RLS معطلة فعليا رغم أنها مفعلة.
