import { AdminTopbar } from '@/components/AdminTopbar';
import { ExpenseForm } from '@/components/ExpenseForm';

export default function NewExpensePage() {
  return (
    <>
      <AdminTopbar title="Registrar gasto" />
      <ExpenseForm />
    </>
  );
}
