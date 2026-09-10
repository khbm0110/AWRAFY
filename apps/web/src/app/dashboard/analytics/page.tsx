import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="التحليلات"
      description="مبيعات، ربح صافي (بعد التكاليف)، مصدر الزيارات، وتقرير SEO دوري."
      modules={['analytics']}
    />
  );
}
