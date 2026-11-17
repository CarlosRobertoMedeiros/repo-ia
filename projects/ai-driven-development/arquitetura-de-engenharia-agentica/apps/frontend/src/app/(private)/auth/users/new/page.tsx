import UserFormPage from '@/modules/auth/pages/user-form.page';

// As rotas privadas dependem da sessao (cookie lido no client): o AuthGuard nao
// renderiza a pagina no shell estatico. Sem este opt-out o Next (Cache Components)
// acusa "Could not validate that a segment has instant navigation" no dev overlay.
export const instant = false;

export default function NewUserRoutePage() {
  return <UserFormPage />;
}
