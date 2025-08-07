import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users from root "/" to "/view-invoice"
  redirect('/invoice');
}
