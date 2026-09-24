// Executa `fn` quando o navegador estiver ocioso (após hidratação e primeira pintura),
// para animações decorativas não competirem com o carregamento. Retorna o cancelamento.
export function whenIdle(fn: () => void, timeout = 2000): () => void {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(fn, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(fn, 1200)
  return () => clearTimeout(id)
}
