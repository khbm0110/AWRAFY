/**
 * Mock كامل لـ@prisma/client خاص بـunit tests فقط.
 * السبب: unit tests خصها تختبر business logic بمعزل عن DB حقيقية —
 * حتى لو @prisma/client كانت مولدة فعليا، unit tests صحيحة ما خصهاش
 * تعتمد على Postgres شغال. Integration tests (لاحقا) هوما اللي غادي
 * يحتاجو DB حقيقية (test database منفصلة، انظر docs/08-code-quality-performance.md).
 */
export class PrismaClient {
  $connect() {
    return Promise.resolve();
  }
  $disconnect() {
    return Promise.resolve();
  }
  $transaction(fn: unknown) {
    if (typeof fn === 'function') return fn(this);
    return Promise.resolve(fn);
  }
}

export namespace Prisma {
  export type TransactionClient = PrismaClient;
}
