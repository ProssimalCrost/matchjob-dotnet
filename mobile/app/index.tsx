import { Redirect } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { Loading } from '@/src/shared/components/Loading';

export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) return <Loading message="Carregando..." />;
  if (!session) return <Redirect href="/login" />;
  return <Redirect href="/home" />;
}
