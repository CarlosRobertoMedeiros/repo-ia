import __MODULE_CLASS_NAME__Page from "@/modules/__MODULE_NAME__/pages/__MODULE_NAME__.page";

// As rotas privadas dependem da sessao (cookie lido no client): o AuthGuard nao
// renderiza a pagina no shell estatico. Sem este opt-out o Next (Cache Components)
// acusa "Could not validate that a segment has instant navigation" no dev overlay.
export const instant = false;

export default function __MODULE_CLASS_NAME__RoutePage() {
  return <__MODULE_CLASS_NAME__Page />;
}
