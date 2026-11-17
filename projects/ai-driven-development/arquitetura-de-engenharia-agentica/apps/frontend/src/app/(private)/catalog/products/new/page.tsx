import ProductFormPage from '@/modules/catalog/pages/product-form.page';

// As rotas privadas dependem da sessao (cookie lido no client): o AuthGuard nao
// renderiza a pagina no shell estatico. Sem este opt-out o Next (Cache Components)
// acusa "Could not validate that a segment has instant navigation" no dev overlay.
export const instant = false;

export default function NewProductRoutePage() {
  return <ProductFormPage />;
}
