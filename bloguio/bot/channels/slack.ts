import { slackChannel } from "@grok/agent-sdk/channels/slack";

// Opcional e desligado sem os dois tokens BLOGUIO_SLACK_BOT_TOKEN e
// BLOGUIO_SLACK_APP_TOKEN. Sem eles o canal sobe idle. Não criar o app
// Slack neste repositório: o Marcelo roda `agent-sdk slack create` se quiser.
export default slackChannel({
  envPrefix: "BLOGUIO",
  toolApprovals: true,
  suggestedPromptsTitle: "Pace no Preço",
  suggestedPrompts: [
    {
      title: "Rascunho de ranking",
      message:
        "Gere um rascunho de ranking de tênis de corrida para o Google Brasil. draft true. Sem inventar link de afiliado.",
    },
  ],
});
