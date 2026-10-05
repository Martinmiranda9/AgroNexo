import { redirect } from 'next/navigation';

// Todavía no hay landing: el logo y la raíz llevan al login hasta que exista.
export default function HomePage() {
  redirect('/login');
}
