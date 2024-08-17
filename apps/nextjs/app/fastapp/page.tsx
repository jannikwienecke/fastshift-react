import { redirect } from 'next/navigation';

export default function FastAppPage() {
  redirect('/fastapp/tasks');

  return null;
}
