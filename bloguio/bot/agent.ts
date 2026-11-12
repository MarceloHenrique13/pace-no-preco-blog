import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "bloguio",
  description:
    "Gera rascunhos de corrida do Pace no Preço para busca orgânica no Google Brasil.",
  model: {
    id: "grok-4.7",
    params: [{ id: "reasoning_effort", value: "high" }],
  },
  // Sem shell, edit, grep ou web nativos. Gravação só pelas tools em bot/tools/.
  // "mcp" continua disponível: é o transporte dessas tools.
  tools: [],
});
