import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function MarketingPage() {
  return (
    <ComingSoonPage
      title="التسويق"
      description="كوبونات وعروض، حملات إيميل، إدارة المسوّقين (Affiliate)، سوق الكولاب مع الموترين، وبرنامج الولاء."
      modules={['promotions', 'marketing-campaigns', 'affiliates', 'influencer-marketplace', 'loyalty']}
    />
  );
}
