import { listUsers } from "@/contexts/auth";
import { getSetting } from "@/contexts/settings";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { getCompanyMetricsPageData } from "@/platform/admin-shell/get-company-metrics-page-data";
import {
  getMyCompanyMetricsAccess,
  getTargetRollups,
  listMetricDefinitions,
  listMetricValues,
  listSectorGroups,
  listSectorMembers,
  listSectors,
  listTargets,
  listTvBoards,
  type CompanyMetricsAccess,
  type SectorListItem,
} from "@/plugins/company-metrics";
import type { TargetInputRecord } from "@/plugins/company-metrics/contracts/types";
import type { SectorGroupRecord, SectorMemberRecord } from "@/plugins/company-metrics/contracts/types";
import { bucketStart, zonedCivilDate } from "@/plugins/company-metrics/shared/period";
import { normalizeTimeZone } from "@/plugins/company-metrics/shared/settings";
import { ChartTokens } from "@/plugins/company-metrics/components/dashboard/chart-tokens";
import { AdminTabs } from "./admin-tabs";
import { ApresentacaoView } from "./apresentacao-view";
import { LancamentosView } from "./lancamentos-view";
import { MetasView } from "./metas-view";
import { MetricasView } from "./metricas-view";
import { SetoresView } from "./setores-view";

const EMPTY_ACCESS: CompanyMetricsAccess = {
  canManageAll: false,
  adminSectorIds: [],
  contributorSectorIds: [],
  memberSectorIds: [],
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CompanyMetricsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const gate = await getCompanyMetricsPageData();
  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver Métricas Internas." />;
  }

  const params = await searchParams;
  const [accessResult, sectorsResult, tzSetting] = await Promise.all([
    getMyCompanyMetricsAccess(),
    listSectors({ includeArchived: true }),
    getSetting({ key: "company-metrics.timezone" }),
  ]);

  const access = accessResult.success ? accessResult.data : EMPTY_ACCESS;
  const sectors = sectorsResult.success ? sectorsResult.data : [];
  const canManage = access.canManageAll;
  const timeZone = normalizeTimeZone(tzSetting.success ? tzSetting.data?.value : undefined);

  const canSeeMetricas = canManage || access.adminSectorIds.length > 0;
  const canSeeLancamentos = canManage || access.contributorSectorIds.length > 0;
  const canConfigureTv = canManage || access.adminSectorIds.length > 0;

  const tabs: { key: string; label: string }[] = [];
  if (canManage) tabs.push({ key: "setores", label: "Setores" });
  if (canSeeMetricas) tabs.push({ key: "metricas", label: "Métricas" });
  if (canSeeMetricas) tabs.push({ key: "metas", label: "Metas" });
  if (canSeeLancamentos) tabs.push({ key: "lançamentos", label: "Lançamentos" });
  if (canConfigureTv) tabs.push({ key: "apresentação", label: "Apresentação" });

  const activeTab = tabs.some((tab) => tab.key === first(params.tab)) ? first(params.tab)! : tabs[0]?.key;

  const sectorOptions = sectors.map((sector) => ({ id: sector.id, name: sector.name }));
  const requestedSector = first(params.sector);
  const activeSectorId =
    requestedSector && sectors.some((sector) => sector.id === requestedSector)
      ? requestedSector
      : sectorOptions[0]?.id;
  const activeSector = sectors.find((sector) => sector.id === activeSectorId);

  // Lançamento é sempre no período ATUAL — sem seletor de data. O que a UI mostra é a "última
  // atualização" de cada métrica (ver LancamentosView).
  const referenceDate = zonedCivilDate(new Date(), timeZone);

  return (
    <div className="space-y-6">
      <ChartTokens />
      <AdminPageHeader
        title="Métricas Internas"
        description="Setores da empresa, suas métricas e o lançamento dos números. Metas e telas de TV entram nas próximas etapas."
      />

      {tabs.length === 0 ? (
        <EmptyState
          title="Sem acesso a nenhum setor"
          description="Você tem a permissão de Métricas Internas mas ainda não foi atribuído a nenhum setor como editor ou administrador."
        />
      ) : (
        <>
          <AdminTabs tabs={tabs} active={activeTab ?? tabs[0].key} />
          {activeTab === "setores" && <SetoresTab sectors={sectors} canManage={canManage} />}
          {activeTab === "metricas" && (
            <MetricasTab
              sectorOptions={sectorOptions}
              activeSectorId={activeSectorId}
              activeSectorName={activeSector?.name}
              canConfigure={canManage || (activeSectorId ? access.adminSectorIds.includes(activeSectorId) : false)}
            />
          )}
          {activeTab === "metas" && (
            <MetasTab
              sectorOptions={sectorOptions}
              activeSectorId={activeSectorId}
              activeSectorName={activeSector?.name}
              canConfigure={canManage || (activeSectorId ? access.adminSectorIds.includes(activeSectorId) : false)}
            />
          )}
          {activeTab === "lançamentos" && (
            <LancamentosTab
              sectorOptions={sectorOptions}
              activeSectorId={activeSectorId}
              activeSectorName={activeSector?.name}
              referenceDate={referenceDate}
              canContribute={canManage || (activeSectorId ? access.contributorSectorIds.includes(activeSectorId) : false)}
            />
          )}
          {activeTab === "apresentação" && <ApresentacaoTab sectorOptions={sectorOptions} />}
        </>
      )}
    </div>
  );
}

async function SetoresTab({ sectors, canManage }: { sectors: SectorListItem[]; canManage: boolean }) {
  const [groupsResult, usersResult, ...membersResults] = await Promise.all([
    listSectorGroups(),
    listUsers(),
    ...sectors.map((sector) => listSectorMembers(sector.id)),
  ]);

  const groupsBySector = new Map<string, SectorGroupRecord[]>();
  if (groupsResult.success) {
    for (const group of groupsResult.data) {
      const list = groupsBySector.get(group.sectorId) ?? [];
      list.push(group);
      groupsBySector.set(group.sectorId, list);
    }
  }

  const membersBySector = new Map<string, SectorMemberRecord[]>();
  sectors.forEach((sector, index) => {
    const result = membersResults[index];
    membersBySector.set(sector.id, result?.success ? result.data : []);
  });

  const users = usersResult.success
    ? usersResult.data.map((user) => ({ id: user.id, name: user.name, email: user.email }))
    : [];

  return (
    <SetoresView
      sectors={sectors}
      groupsBySector={groupsBySector}
      membersBySector={membersBySector}
      users={users}
      canManage={canManage}
    />
  );
}

async function MetricasTab({
  sectorOptions,
  activeSectorId,
  activeSectorName,
  canConfigure,
}: {
  sectorOptions: { id: string; name: string }[];
  activeSectorId: string | undefined;
  activeSectorName: string | undefined;
  canConfigure: boolean;
}) {
  if (!activeSectorId) {
    return <MetricasView sectors={sectorOptions} activeSectorId={undefined} activeSectorName={undefined} definitions={[]} groups={[]} canConfigure={canConfigure} />;
  }

  const [definitionsResult, groupsResult] = await Promise.all([
    listMetricDefinitions({ sectorId: activeSectorId, includeArchived: true }),
    listSectorGroups(activeSectorId),
  ]);

  return (
    <MetricasView
      sectors={sectorOptions}
      activeSectorId={activeSectorId}
      activeSectorName={activeSectorName}
      definitions={definitionsResult.success ? definitionsResult.data : []}
      groups={groupsResult.success ? groupsResult.data : []}
      canConfigure={canConfigure}
    />
  );
}

async function MetasTab({
  sectorOptions,
  activeSectorId,
  activeSectorName,
  canConfigure,
}: {
  sectorOptions: { id: string; name: string }[];
  activeSectorId: string | undefined;
  activeSectorName: string | undefined;
  canConfigure: boolean;
}) {
  if (!activeSectorId) {
    return (
      <MetasView
        sectors={sectorOptions}
        activeSectorId={undefined}
        activeSectorName={undefined}
        rollups={[]}
        inputsByTarget={new Map()}
        definitions={[]}
        canConfigure={canConfigure}
      />
    );
  }

  const [rollupsResult, targetsResult, definitionsResult] = await Promise.all([
    getTargetRollups(activeSectorId),
    listTargets({ sectorId: activeSectorId, includeArchived: false }),
    listMetricDefinitions({ sectorId: activeSectorId, includeArchived: true }),
  ]);

  const inputsByTarget = new Map<string, TargetInputRecord[]>();
  if (targetsResult.success) {
    for (const entry of targetsResult.data) inputsByTarget.set(entry.target.id, entry.inputs);
  }

  return (
    <MetasView
      sectors={sectorOptions}
      activeSectorId={activeSectorId}
      activeSectorName={activeSectorName}
      rollups={rollupsResult.success ? rollupsResult.data : []}
      inputsByTarget={inputsByTarget}
      definitions={definitionsResult.success ? definitionsResult.data : []}
      canConfigure={canConfigure}
    />
  );
}

async function ApresentacaoTab({ sectorOptions }: { sectorOptions: { id: string; name: string }[] }) {
  const [boardsResult, targetsResult, definitionsResult] = await Promise.all([
    listTvBoards(),
    listTargets({ includeArchived: false }),
    listMetricDefinitions({ includeArchived: false }),
  ]);

  const sectorNameById = new Map(sectorOptions.map((sector) => [sector.id, sector.name]));
  const targetOptions = targetsResult.success
    ? targetsResult.data.map((entry) => ({
        id: entry.target.id,
        label: entry.target.label,
        sectorName: sectorNameById.get(entry.target.sectorId) ?? "setor",
      }))
    : [];
  const definitionOptions = definitionsResult.success
    ? definitionsResult.data.map((definition) => ({
        id: definition.id,
        label: definition.label,
        sectorName: sectorNameById.get(definition.sectorId) ?? "setor",
      }))
    : [];

  return (
    <ApresentacaoView
      boards={boardsResult.success ? boardsResult.data : []}
      sectors={sectorOptions}
      targets={targetOptions}
      definitions={definitionOptions}
    />
  );
}

async function LancamentosTab({
  sectorOptions,
  activeSectorId,
  activeSectorName,
  referenceDate,
  canContribute,
}: {
  sectorOptions: { id: string; name: string }[];
  activeSectorId: string | undefined;
  activeSectorName: string | undefined;
  referenceDate: string;
  canContribute: boolean;
}) {
  if (!activeSectorId) {
    return (
      <LancamentosView
        sectors={sectorOptions}
        activeSectorId={undefined}
        activeSectorName={undefined}
        referenceDate={referenceDate}
        definitions={[]}
        values={[]}
        canContribute={canContribute}
      />
    );
  }

  const definitionsResult = await listMetricDefinitions({ sectorId: activeSectorId, includeArchived: false });
  const definitions = definitionsResult.success ? definitionsResult.data : [];

  const buckets = definitions.map((definition) => bucketStart(referenceDate, definition.granularity));
  const from = buckets.length > 0 ? buckets.reduce((a, b) => (a < b ? a : b)) : referenceDate;
  const to = buckets.length > 0 ? buckets.reduce((a, b) => (a > b ? a : b)) : referenceDate;

  const valuesResult = await listMetricValues({ sectorId: activeSectorId, from, to });

  return (
    <LancamentosView
      sectors={sectorOptions}
      activeSectorId={activeSectorId}
      activeSectorName={activeSectorName}
      referenceDate={referenceDate}
      definitions={definitions}
      values={valuesResult.success ? valuesResult.data : []}
      canContribute={canContribute}
    />
  );
}
