// Chaves e defaults de contexts/settings pra configuração da doação — única fonte de verdade,
// usada tanto por manifest.ts (registro do default via registerDefaultSetting, ver
// register-plugins.ts) quanto pela tela admin e pela página/bloco público. Diferente de
// BIRTHDAY_APPEARANCE_SETTINGS (src/plugins/birthdays/shared/appearance.ts), os valores aqui não
// são todos string — suggestedAmounts é number[] — então não dá pra derivar um Record<string,
// string> genérico por Object.fromEntries; get-donation-settings/service.ts lê cada chave com o
// tipo próprio.
export const DONATIONS_SETTINGS = {
  pixKey: { key: "donations.pixKey", defaultValue: "", label: "Chave PIX" },
  recipientName: { key: "donations.recipientName", defaultValue: "", label: "Nome do recebedor" },
  recipientCity: { key: "donations.recipientCity", defaultValue: "", label: "Cidade do recebedor" },
  suggestedAmounts: { key: "donations.suggestedAmounts", defaultValue: [20, 50, 100], label: "Valores sugeridos (R$)" },
  title: { key: "donations.title", defaultValue: "Faça uma doação", label: "Título da página" },
  message: {
    key: "donations.message",
    defaultValue: "Sua doação ajuda a manter nosso trabalho. Escolha um valor ou digite o quanto quiser doar.",
    label: "Mensagem",
  },
  // Textos dos widgets embutidos no Academy (catálogo, página de curso, barra lateral da aula,
  // etapa de doação dentro da aula) — pedido explícito de uma sessão posterior: essas quatro
  // superfícies não são composição de CMS (docs/venore-docks.md/AGENTS.md, "esta página é JSX
  // fixo"), então o texto ficava hardcoded direto no JSX sem forma de editar. Aqui viram settings
  // como title/message acima, na mesma tela /admin/donations.
  academyCatalogTitle: {
    key: "donations.academyCatalogTitle",
    defaultValue: "Este catálogo é gratuito",
    label: "Academy — título no catálogo de cursos",
  },
  academyCourseTitle: {
    key: "donations.academyCourseTitle",
    defaultValue: "Gostando do curso?",
    label: "Academy — título na página do curso",
  },
  academySidebarTitle: {
    key: "donations.academySidebarTitle",
    defaultValue: "Este material é gratuito",
    label: "Academy — título na barra lateral da aula",
  },
  academyCtaLabel: {
    key: "donations.academyCtaLabel",
    defaultValue: "Apoiar com uma doação",
    label: "Academy — texto do botão",
  },
  // Linha inteira abaixo do título na chamada rápida — dois textos porque a frase muda de
  // estrutura conforme existe ou não valor sugerido (sem valor sugerido, não faz sentido "a
  // partir de"). "{amount}" é o único token substituído (valor formatado, ex: "R$ 5,00") — o
  // resto do texto é livre, nada além disso é calculado/hardcoded em donation-teaser.tsx.
  academyTeaserSubtitleWithAmount: {
    key: "donations.academyTeaserSubtitleWithAmount",
    defaultValue: "Contribua com a partir de {amount}",
    label: "Academy — texto abaixo do título (com valor sugerido)",
  },
  academyTeaserSubtitleNoAmount: {
    key: "donations.academyTeaserSubtitleNoAmount",
    defaultValue: "Contribua com o valor que você quiser",
    label: "Academy — texto abaixo do título (sem valor sugerido)",
  },
  academyLessonIntro: {
    key: "donations.academyLessonIntro",
    defaultValue:
      "Este material é gratuito para professores e autodidatas. Se esta aula te ajudou, considere apoiar quem produz o conteúdo.",
    label: "Academy — texto da etapa de doação na aula",
  },
  // Microcopy do próprio DonationWidget/DonationTeaser (botões, placeholder, mensagens de estado)
  // — pedido explícito: "nenhum texto deve ser hardcoded nos widgets". Diferente dos campos
  // "academy*" acima (um valor por superfície, porque o texto de contexto muda), estes são globais
  // porque a MESMA instância do componente é reaproveitada em toda parte que ele aparece
  // (/donations, block de CMS, todo canto do Academy) — não faria sentido o botão "Copiar código"
  // dizer algo diferente em cada lugar.
  customAmountLabel: { key: "donations.customAmountLabel", defaultValue: "Escolha o valor", label: "Botão \"valor personalizado\"" },
  customAmountPlaceholder: {
    key: "donations.customAmountPlaceholder",
    defaultValue: "Digite o valor (R$)",
    label: "Placeholder do campo de valor",
  },
  customAmountSubmitLabel: { key: "donations.customAmountSubmitLabel", defaultValue: "Gerar", label: "Botão \"gerar código\"" },
  customAmountError: {
    key: "donations.customAmountError",
    defaultValue: "Digite um valor válido, maior que zero.",
    label: "Erro de valor inválido",
  },
  qrUpdatedLabel: {
    key: "donations.qrUpdatedLabel",
    defaultValue: "Código atualizado — escaneie novamente",
    label: "Aviso de QR atualizado",
  },
  freeAmountLabelCompact: {
    key: "donations.freeAmountLabelCompact",
    defaultValue: "Valor livre",
    label: "Rótulo \"valor livre\" (compacto)",
  },
  freeAmountLabelFull: {
    key: "donations.freeAmountLabelFull",
    defaultValue: "Valor livre — informe o quanto quiser doar no app do seu banco.",
    label: "Rótulo \"valor livre\" (completo)",
  },
  copiedLabel: { key: "donations.copiedLabel", defaultValue: "Copiado!", label: "Botão \"copiado\"" },
  copyLabelCompact: { key: "donations.copyLabelCompact", defaultValue: "Copiar código", label: "Botão \"copiar\" (compacto)" },
  copyLabelFull: {
    key: "donations.copyLabelFull",
    defaultValue: "Copiar código Pix Copia e Cola",
    label: "Botão \"copiar\" (completo)",
  },
  closeLabel: { key: "donations.closeLabel", defaultValue: "Fechar", label: "Botão \"fechar\" (chamada rápida)" },
  loadingLabel: { key: "donations.loadingLabel", defaultValue: "Carregando...", label: "Botão \"carregando\" (chamada rápida)" },
} as const;

export type DonationSettingsValues = {
  pixKey: string;
  recipientName: string;
  recipientCity: string;
  suggestedAmounts: number[];
  title: string;
  message: string;
  academyCatalogTitle: string;
  academyCourseTitle: string;
  academySidebarTitle: string;
  academyCtaLabel: string;
  academyTeaserSubtitleWithAmount: string;
  academyTeaserSubtitleNoAmount: string;
  academyLessonIntro: string;
  customAmountLabel: string;
  customAmountPlaceholder: string;
  customAmountSubmitLabel: string;
  customAmountError: string;
  qrUpdatedLabel: string;
  freeAmountLabelCompact: string;
  freeAmountLabelFull: string;
  copiedLabel: string;
  copyLabelCompact: string;
  copyLabelFull: string;
  closeLabel: string;
  loadingLabel: string;
};

export const DEFAULT_DONATION_SETTINGS: DonationSettingsValues = {
  pixKey: DONATIONS_SETTINGS.pixKey.defaultValue,
  recipientName: DONATIONS_SETTINGS.recipientName.defaultValue,
  recipientCity: DONATIONS_SETTINGS.recipientCity.defaultValue,
  suggestedAmounts: [...DONATIONS_SETTINGS.suggestedAmounts.defaultValue],
  title: DONATIONS_SETTINGS.title.defaultValue,
  message: DONATIONS_SETTINGS.message.defaultValue,
  academyCatalogTitle: DONATIONS_SETTINGS.academyCatalogTitle.defaultValue,
  academyCourseTitle: DONATIONS_SETTINGS.academyCourseTitle.defaultValue,
  academySidebarTitle: DONATIONS_SETTINGS.academySidebarTitle.defaultValue,
  academyCtaLabel: DONATIONS_SETTINGS.academyCtaLabel.defaultValue,
  academyTeaserSubtitleWithAmount: DONATIONS_SETTINGS.academyTeaserSubtitleWithAmount.defaultValue,
  academyTeaserSubtitleNoAmount: DONATIONS_SETTINGS.academyTeaserSubtitleNoAmount.defaultValue,
  academyLessonIntro: DONATIONS_SETTINGS.academyLessonIntro.defaultValue,
  customAmountLabel: DONATIONS_SETTINGS.customAmountLabel.defaultValue,
  customAmountPlaceholder: DONATIONS_SETTINGS.customAmountPlaceholder.defaultValue,
  customAmountSubmitLabel: DONATIONS_SETTINGS.customAmountSubmitLabel.defaultValue,
  customAmountError: DONATIONS_SETTINGS.customAmountError.defaultValue,
  qrUpdatedLabel: DONATIONS_SETTINGS.qrUpdatedLabel.defaultValue,
  freeAmountLabelCompact: DONATIONS_SETTINGS.freeAmountLabelCompact.defaultValue,
  freeAmountLabelFull: DONATIONS_SETTINGS.freeAmountLabelFull.defaultValue,
  copiedLabel: DONATIONS_SETTINGS.copiedLabel.defaultValue,
  copyLabelCompact: DONATIONS_SETTINGS.copyLabelCompact.defaultValue,
  copyLabelFull: DONATIONS_SETTINGS.copyLabelFull.defaultValue,
  closeLabel: DONATIONS_SETTINGS.closeLabel.defaultValue,
  loadingLabel: DONATIONS_SETTINGS.loadingLabel.defaultValue,
};

// Limites do próprio formato EMV (campos "26 01", "59" e "60" do BR Code, ver shared/pix-br-
// code.ts) — validados aqui porque é o único lugar que grava as settings; build-donation-pix-
// code/service.ts confia que já vieram dentro do limite.
export const MAX_PIX_KEY_LENGTH = 77;
export const MAX_RECIPIENT_NAME_LENGTH = 25;
export const MAX_RECIPIENT_CITY_LENGTH = 15;
