import { AdminTopbar } from '@/components/AdminTopbar';
import { InvestmentForm } from '@/components/InvestmentForm';

export default function NewInvestmentPage() {
  return (
    <>
      <AdminTopbar title="Registrar inversión" />
      <InvestmentForm />
    </>
  );
}
