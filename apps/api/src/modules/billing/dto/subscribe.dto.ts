import { IsIn } from 'class-validator';

export class SubscribeDto {
  @IsIn(['starter', 'growth', 'pro']) // انظر modules/billing/plans.ts
  planKey!: 'starter' | 'growth' | 'pro';
}
