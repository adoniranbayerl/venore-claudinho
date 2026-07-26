import { cookies } from "next/headers";

const COLOR_MODE_COOKIE = "color-mode";

// colorMode é um toggle manual persistido em cookie (mesmo padrão de platform/nav-mode),
// lido no servidor pro RootLayout aplicar a classe "dark" antes do primeiro paint — sem
// localStorage, sem script inline, sem flash.
export async function getColorMode(): Promise<boolean> {
  const store = await cookies();
  return store.get(COLOR_MODE_COOKIE)?.value === "dark";
}

export { COLOR_MODE_COOKIE };
