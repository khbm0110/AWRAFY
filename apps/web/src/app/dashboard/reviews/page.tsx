import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function ReviewsPage() {
  return (
    <ComingSoonPage
      title="التقييمات"
      description="مراجعة والموافقة على تقييمات الزبناء قبل نشرها فصفحة المنتج."
      modules={['reviews']}
    />
  );
}
