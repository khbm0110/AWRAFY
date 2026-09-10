import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function DesignPage() {
  return (
    <ComingSoonPage
      title="تصميم المتجر"
      description="اختيار قالب، ترتيب/تعديل sections الصفحة الرئيسية، وتخصيص الألوان والخطوط."
      modules={['themes']}
    />
  );
}
