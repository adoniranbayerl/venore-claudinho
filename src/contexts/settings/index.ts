export { getSettingHandler as getSetting } from "./features/get-setting/handler";
export { setSettingHandler as setSetting } from "./features/set-setting/handler";
export { registerDefaultSettingHandler as registerDefaultSetting } from "./features/register-default-setting/handler";
export { settingsAdminNavigationItems } from "./admin-navigation";
export { settingsBreadcrumbSegments } from "./breadcrumbs";

export type { SettingRecord } from "./contracts/types";
export type { GetSettingResult } from "./features/get-setting/types";
export type { SetSettingInput, SetSettingResult } from "./features/set-setting/types";
export type { RegisterDefaultSettingInput, RegisterDefaultSettingResult } from "./features/register-default-setting/types";
