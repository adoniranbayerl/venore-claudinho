import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SidebarLeftSlot } from "./SidebarLeftSlot";
import type { SidebarLeftSlotProps } from "@/contexts/themes";

// SidebarLeftSlot continua um server component (docs/ui/shell-spec.md §3): o único estado que
// importa pro markup SSR é `collapsed`, já resolvido do cookie ANTES deste componente rodar (não
// há hidratação/segundo render que troque a largura — é por isso que não existe o bug de flash
// registrado no spec). SidebarNavLink usa usePathname() internamente; fora do App Router esse
// hook retorna null (Next não lança), então aria-current fica ausente aqui — comportamento
// aceitável pra este teste, que cobre layout/largura/permissão, não roteamento.
const baseProps: SidebarLeftSlotProps = {
  enabled: true,
  navMode: "main",
  navItems: [
    { key: "home", label: "Home", href: "/", icon: "home" },
    { key: "academy", label: "Academy", href: "/academy" },
  ],
  navGroups: [],
  canToggleAdminNav: false,
  onToggleNavMode: async () => {},
  collapsed: false,
  onToggleCollapsed: async () => {},
};

const adminGroups: SidebarLeftSlotProps["navGroups"] = [
  {
    key: "rbac",
    label: "RBAC",
    items: [{ key: "rbac.roles", label: "Papéis e permissões", href: "/admin/rbac", icon: "users" }],
  },
];

describe("SidebarLeftSlot — estados de colapso", () => {
  it("não renderiza nada quando enabled é false", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} enabled={false} />);
    expect(html).toBe("");
  });

  it("expandida: carrega a largura expandida via token e aria-expanded=true no controle de colapso", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} collapsed={false} />);

    expect(html).toContain("lg:w-(--sidebar-width-expanded)");
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("Colapsar barra lateral");
  });

  it("colapsada: carrega a largura colapsada via token e aria-expanded=false no controle de colapso", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} collapsed={true} />);

    expect(html).toContain("lg:w-(--sidebar-width-collapsed)");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("Expandir barra lateral");
  });

  it("o controle de colapso tem alvo de toque mínimo de 44px (size-11) e só aparece em lg:", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} />);

    expect(html).toContain("size-11");
    expect(html).toContain("hidden translate-x-1/2 lg:block");
  });

  it("<aside> preenche a altura inteira em qualquer breakpoint (sem override lg:h-auto) e <nav> estica/rola por conta própria", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} />);

    expect(html).toContain("h-full");
    expect(html).not.toContain("lg:h-auto");
    expect(html).toContain("min-h-0 flex-1");
    expect(html).toContain("overflow-y-auto");
  });

  it("renderiza os itens de main-nav (lista plana, sem título de seção) quando navMode é 'main'", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} />);

    expect(html).toContain("Home");
    expect(html).toContain("Academy");
  });

  it("renderiza os grupos de admin-nav com título de seção quando navMode é 'admin'", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} navMode="admin" navGroups={adminGroups} navItems={[]} />);

    expect(html).toContain("RBAC");
    expect(html).toContain("Papéis e permissões");
  });

  it("o item de nav não tem borda de destaque fixa (isActive) — só via hover/active", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} />);

    expect(html).toContain("border-transparent");
    expect(html).not.toMatch(/border-l-2[^"]*border-primary/);
  });
});

describe("SidebarLeftSlot — visibilidade do alternador Site/Admin", () => {
  it("NÃO renderiza o alternador quando canToggleAdminNav é false (sem a permissão)", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} canToggleAdminNav={false} />);

    expect(html).not.toContain("Área administrativa");
    expect(html).not.toContain("Sair do admin");
  });

  it("renderiza o alternador (modo site) quando canToggleAdminNav é true e navMode é 'main'", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} canToggleAdminNav={true} navMode="main" />);

    expect(html).toContain("Área administrativa");
  });

  it("renderiza o alternador (modo admin) quando canToggleAdminNav é true e navMode é 'admin'", () => {
    const html = renderToStaticMarkup(
      <SidebarLeftSlot {...baseProps} canToggleAdminNav={true} navMode="admin" navGroups={adminGroups} navItems={[]} />,
    );

    expect(html).toContain("Sair do admin");
  });

  it("continua sem renderizar o alternador mesmo colapsada, se canToggleAdminNav é false", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} canToggleAdminNav={false} collapsed={true} />);

    expect(html).not.toContain("Área administrativa");
  });

  it("o alternador vem antes do <nav> no markup (não depois)", () => {
    const html = renderToStaticMarkup(<SidebarLeftSlot {...baseProps} canToggleAdminNav={true} navMode="main" />);

    const switchIndex = html.indexOf("Área administrativa");
    const navIndex = html.indexOf("data-nav-mode");
    expect(switchIndex).toBeGreaterThan(-1);
    expect(navIndex).toBeGreaterThan(-1);
    expect(switchIndex).toBeLessThan(navIndex);
  });

  it("o pill de dois segmentos some em lg: quando colapsada, mas continua no markup (off-canvas mobile ignora collapsed)", () => {
    const html = renderToStaticMarkup(
      <SidebarLeftSlot {...baseProps} canToggleAdminNav={true} navMode="main" collapsed={true} />,
    );

    expect(html).toContain("lg:hidden");
    expect(html).toContain("Área administrativa");
  });
});
