export { getActiveThemeHandler as getActiveTheme } from "./features/active-theme/get-active-theme/handler";
export { activateThemeHandler as activateTheme } from "./features/active-theme/activate-theme/handler";

export type { GetActiveThemeResult } from "./features/active-theme/get-active-theme/types";
export type { ActivateThemeInput, ActivateThemeResult } from "./features/active-theme/activate-theme/types";

export type {
  ThemeManifest,
  ActiveThemeState,
  HeaderSlotProps,
  FooterSlotProps,
  ContentSlotProps,
  SidebarRightSlotProps,
  NavItem,
  SitemapItem,
  SidebarBlock,
  ScrollState,
} from "./contracts/types";
export { CURRENT_THEME_CONTRACT_VERSION, SUPPORTED_THEME_CONTRACT_RANGE } from "./contracts/contract-version";
