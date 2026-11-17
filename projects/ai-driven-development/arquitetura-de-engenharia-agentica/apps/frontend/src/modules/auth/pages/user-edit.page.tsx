'use client';

import { useParams } from 'next/navigation';
import UserFormPage from './user-form.page';

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();

  return <UserFormPage userId={id} />;
}
