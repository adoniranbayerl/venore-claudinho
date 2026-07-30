export { getActiveThemeHandler as getActiveTheme } from "./features/active-theme/get-active-theme/handler";
export { activateThemeHandler as activateTheme } from "./features/active-theme/activate-theme/handler";
export { themesAdminNavigationItems } from "./admin-navigation";

export type { GetActiveThemeResult } from "./features/active-theme/get-active-theme/types";
export type { ActivateThemeInput, ActivateThemeResult } from "./features/active-theme/activate-theme/types";

export type {
  ThemeManifest,
  ActiveThemeState,
  HeaderSlotProps,
  HeaderBrand,
  HeaderBrandMode,
  HeaderBrandPosition,
  HeaderUserInfo,
  FooterSlotProps,
  FooterBrand,
  ContentSlotProps,
  SidebarLeftSlotProps,
  NavItem,
  MainNavItem,
  NavGroup,
  NavMode,
  SitemapItem,
} from "./contracts/types";
export { CURRENT_THEME_CONTRACT_VERSION, SUPPORTED_THEME_CONTRACT_RANGE } from "./contracts/contract-version";
