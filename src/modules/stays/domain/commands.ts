import { staySchema } from "./model";
export const createStayCommandSchema = staySchema;
export function stayOperationError(code: string): string {
  if (code.includes("E_INPUT")) return "Confira o apartamento e as datas de entrada e saída.";
  if (code.includes("E_FORBIDDEN")) return "Seu acesso não permite cadastrar estadias.";
  if (code.includes("E_VERSION") || code.includes("E_IDEMPOTENCY")) return "Este cadastro já foi enviado. Atualize a página antes de tentar novamente.";
  return "Não foi possível cadastrar a estadia. Tente novamente com os mesmos dados.";
}
