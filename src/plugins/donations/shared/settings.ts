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
  academyLessonIntro: {
    key: "donations.academyLessonIntro",
    defaultValue:
      "Este material é gratuito para professores e autodidatas. Se esta aula te ajudou, considere apoiar quem produz o conteúdo.",
    label: "Academy — texto da etapa de doação na aula",
  },
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
  academyLessonIntro: string;
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
  academyLessonIntro: DONATIONS_SETTINGS.academyLessonIntro.defaultValue,
};

// Limites do próprio formato EMV (campos "26 01", "59" e "60" do BR Code, ver shared/pix-br-
// code.ts) — validados aqui porque é o único lugar que grava as settings; build-donation-pix-
// code/service.ts confia que já vieram dentro do limite.
export const MAX_PIX_KEY_LENGTH = 77;
export const MAX_RECIPIENT_NAME_LENGTH = 25;
export const MAX_RECIPIENT_CITY_LENGTH = 15;
