"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { MediaPickerField } from "@/components/media-picker-field";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/, nunca do barrel (@/plugins/broadcast) — este arquivo é "use
// client" e o barrel reexporta handlers server-only que quebram o bundle do browser (achado real
// do `next build`, ver layer-renderer.tsx).
import {
  BROADCAST_LAYER_TYPES,
  type BroadcastLayerRecord,
  type BroadcastLayerType,
  type BroadcastPlaylistRecord,
  type BroadcastSceneRecord,
} from "@/plugins/broadcast/contracts/types";
import {
  createLayerAction,
  createSceneAction,
  deleteLayerAction,
  deleteSceneAction,
  updateLayerAction,
  updateSceneAction,
  type BroadcastActionState,
} from "../actions";

const initialState: BroadcastActionState = { error: null };

// Lista simplificada — "info"/"news"/"agenda" não têm nenhum campo próprio, resolvidos sozinhos a
// partir da região configurada em Configurações e da agenda interna (aba Agenda).
const LAYER_TYPE_LABELS: Record<BroadcastLayerType, string> = {
  video: "Playlist (vídeo, imagem, site e notícias)",
  text: "Texto",
  image: "Imagem",
  info: "Relógio e clima",
  news: "Notícias da região",
  agenda: "Agenda",
  alert: "Aviso rápido",
};

type Geometry = { x: number; y: number; width: number; height: number };

const POSITION_PRESETS: { label: string; geometry: Geometry }[] = [
  { label: "Tela cheia", geometry: { x: 0, y: 0, width: 100, height: 100 } },
  { label: "Metade superior", geometry: { x: 0, y: 0, width: 100, height: 50 } },
  { label: "Metade inferior", geometry: { x: 0, y: 50, width: 100, height: 50 } },
  { label: "Faixa no rodapé", geometry: { x: 0, y: 80, width: 100, height: 20 } },
  { label: "Canto superior direito", geometry: { x: 65, y: 0, width: 35, height: 35 } },
  { label: "Coluna esquerda (80%)", geometry: { x: 0, y: 0, width: 80, height: 100 } },
  { label: "Coluna direita (20%)", geometry: { x: 80, y: 0, width: 20, height: 100 } },
];

const GEOMETRY_FIELD_LABELS: Record<keyof Geometry, string> = { x: "Esquerda", y: "Topo", width: "Largura", height: "Altura" };

function readConfigString(config: Record<string, unknown>, key: string): string | undefined {
  const value = config[key];
  return typeof value === "string" ? value : undefined;
}

function readDrawerVariant(config: Record<string, unknown>): Partial<Geometry> | null {
  const value = config.drawerVariant;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const variant: Partial<Geometry> = {};
  for (const key of ["x", "y", "width", "height"] as const) {
    if (typeof record[key] === "number") variant[key] = record[key] as number;
  }
  return variant;
}

function CreateSceneForm() {
  const [state, formAction, pending] = useActionState(createSceneAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cena criada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-card p-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="scene-key">Identificador (sem espaços)</label>
        <Input id="scene-key" name="key" placeholder="abertura" required className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="scene-name">Nome</label>
        <Input id="scene-name" name="name" placeholder="Abertura" required className="w-56" />
      </div>
      <Button type="submit" disabled={pending}>Nova cena</Button>
    </form>
  );
}

function EditSceneForm({ scene, onSuccess }: { scene: BroadcastSceneRecord; onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(updateSceneAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cena atualizada.", onSuccess });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sceneId" value={scene.id} />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="edit-scene-name">Nome</label>
        <Input id="edit-scene-name" name="name" defaultValue={scene.name} required />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="edit-scene-order">Posição na lista (menor aparece primeiro)</label>
        <Input id="edit-scene-order" name="order" type="number" defaultValue={scene.order} className="w-24" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">Salvar</Button>
    </form>
  );
}

function EditSceneDialog({ scene }: { scene: BroadcastSceneRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Editar cena">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cena</DialogTitle>
          <DialogDescription>O identificador ({scene.key}) não pode ser alterado depois de criado.</DialogDescription>
        </DialogHeader>
        <EditSceneForm scene={scene} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DeleteSceneButton({ sceneId }: { sceneId: string }) {
  const [state, formAction, pending] = useActionState(deleteSceneAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cena removida." });

  return (
    <form action={formAction}>
      <input type="hidden" name="sceneId" value={sceneId} />
      <Button type="submit" variant="outline" size="icon" disabled={pending} aria-label="Remover cena">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function DeleteLayerButton({ layerId }: { layerId: string }) {
  const [state, formAction, pending] = useActionState(deleteLayerAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Camada removida." });

  return (
    <form action={formAction}>
      <input type="hidden" name="layerId" value={layerId} />
      <Button type="submit" variant="outline" size="icon" disabled={pending} aria-label="Remover camada">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

// Presets cobrem o caso comum sem nenhum número — o ajuste fino fica atrás de um <details>,
// escondido por padrão (pedido de simplificação: "não preciso de tantas opções").
function GeometryPicker({ geometry, onChange }: { geometry: Geometry; onChange: (geometry: Geometry) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Onde essa camada aparece na tela</label>
      <div className="flex flex-wrap gap-1.5">
        {POSITION_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.geometry)}
            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground ui-motion-base hover:border-ring hover:text-foreground"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">Ajustar manualmente</summary>
        <div className="mt-2 flex flex-wrap gap-3">
          {(Object.keys(GEOMETRY_FIELD_LABELS) as (keyof Geometry)[]).map((field) => (
            <label key={field} className="flex items-center gap-1 text-muted-foreground">
              {GEOMETRY_FIELD_LABELS[field]}
              <input
                type="number"
                value={geometry[field]}
                onChange={(event) => onChange({ ...geometry, [field]: Number(event.target.value) || 0 })}
                className="w-16 rounded-md border border-input bg-transparent px-1.5 py-1 text-xs"
              />
              %
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}

// Campos específicos por tipo de camada — compartilhado entre criar e editar. defaultConfig vem
// vazio na criação e de layer.config na edição, então os mesmos <input>/<Select> não-controlados
// nascem preenchidos com o valor atual ao editar. "info"/"news"/"agenda" não retornam campo
// nenhum — só um aviso de onde a configuração vem.
function LayerTypeFields({
  type,
  fieldId,
  defaultConfig,
  playlists,
}: {
  type: BroadcastLayerType;
  fieldId: (suffix: string) => string;
  defaultConfig: Record<string, unknown>;
  playlists: BroadcastPlaylistRecord[];
}) {
  switch (type) {
    case "video":
      return playlists.length === 0 ? (
        <p className="text-xs text-warning">Crie uma playlist na aba &quot;Playlists&quot; antes de adicionar uma camada de vídeo.</p>
      ) : (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Playlist a reproduzir</label>
            <Select name="playlistId" defaultValue={readConfigString(defaultConfig, "playlistId")} required>
              <SelectTrigger className="w-full"><SelectValue placeholder="Escolha uma playlist..." /></SelectTrigger>
              <SelectContent>
                {playlists.map((playlist) => (
                  <SelectItem key={playlist.id} value={playlist.id}>{playlist.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    case "text":
      return (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={fieldId("text")}>Texto</label>
            <Input id={fieldId("text")} name="text" placeholder="Bem-vindo!" defaultValue={readConfigString(defaultConfig, "text")} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={fieldId("color")}>Cor</label>
            <input
              id={fieldId("color")}
              name="color"
              type="color"
              defaultValue={readConfigString(defaultConfig, "color") ?? "#ffffff"}
              className="h-9 w-16 cursor-pointer rounded-md border border-border"
            />
          </div>
        </div>
      );
    case "image":
      return <MediaPickerField name="mediaAssetId" label="Imagem" />;
    case "info":
      return <p className="text-xs text-muted-foreground">Mostra a hora e o clima da região configurada em Configurações.</p>;
    case "news":
      return <p className="text-xs text-muted-foreground">Mostra as últimas notícias da região configurada em Configurações.</p>;
    case "agenda":
      return <p className="text-xs text-muted-foreground">Mostra os próximos eventos cadastrados na aba Agenda.</p>;
    case "alert":
      return (
        <p className="text-xs text-muted-foreground">
          Fica invisível até você publicar um aviso rápido (aba Saídas) — quando ativo, aparece sobre tudo na tela.
        </p>
      );
    default:
      return null;
  }
}

function DrawerVariantFields({
  enabled,
  onToggle,
  defaultVariant,
}: {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  defaultVariant: Partial<Geometry> | null;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="drawerEnabled"
          value="true"
          checked={enabled}
          onChange={(event) => onToggle(event.target.checked)}
        />
        Mudar de tamanho/posição quando a &quot;gaveta&quot; de informações abrir na saída
      </label>
      {enabled && (
        <div className="flex flex-wrap gap-3 pl-6">
          {(
            [
              ["drawerX", "x", "Esquerda"],
              ["drawerY", "y", "Topo"],
              ["drawerWidth", "width", "Largura"],
              ["drawerHeight", "height", "Altura"],
            ] as const
          ).map(([formField, geometryKey, label]) => (
            <label key={formField} className="flex items-center gap-1 text-xs text-muted-foreground">
              {label}
              <input
                type="number"
                name={formField}
                defaultValue={defaultVariant?.[geometryKey]}
                className="w-16 rounded-md border border-input bg-transparent px-1.5 py-1 text-xs"
              />
              %
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// zIndex e a gaveta são casos avançados — escondidos atrás de um <details> fechado por padrão,
// não porque sejam raros de precisar, mas pra não competir visualmente com os campos que toda
// camada usa (tipo, nome, posição).
function AdvancedLayerFields({
  fieldId,
  defaultZIndex,
  defaultVisible,
  drawerEnabled,
  onDrawerToggle,
  defaultDrawerVariant,
}: {
  fieldId: (suffix: string) => string;
  defaultZIndex: number;
  defaultVisible: boolean;
  drawerEnabled: boolean;
  onDrawerToggle: (enabled: boolean) => void;
  defaultDrawerVariant: Partial<Geometry> | null;
}) {
  return (
    <details className="rounded-md border border-border/60 p-2">
      <summary className="cursor-pointer text-xs font-medium text-muted-foreground">Opções avançadas</summary>
      <div className="mt-2 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground" htmlFor={fieldId("zIndex")}>
            Camada (maior número fica na frente)
            <input
              id={fieldId("zIndex")}
              name="zIndex"
              type="number"
              defaultValue={defaultZIndex}
              className="w-16 rounded-md border border-input bg-transparent px-1.5 py-1 text-xs"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="visible" value="true" defaultChecked={defaultVisible} />
            Visível
          </label>
        </div>
        <DrawerVariantFields enabled={drawerEnabled} onToggle={onDrawerToggle} defaultVariant={defaultDrawerVariant} />
      </div>
    </details>
  );
}

function CreateLayerForm({ sceneId, playlists }: { sceneId: string; playlists: BroadcastPlaylistRecord[] }) {
  const [state, formAction, pending] = useActionState(createLayerAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Camada criada." });

  const [type, setType] = useState<BroadcastLayerType>("video");
  const [geometry, setGeometry] = useState<Geometry>({ x: 0, y: 0, width: 100, height: 100 });
  const [drawerEnabled, setDrawerEnabled] = useState(false);
  const fieldId = (suffix: string) => `${sceneId}-${suffix}`;

  return (
    <form action={formAction} className="space-y-3 rounded-panel border border-border bg-muted/40 p-3">
      <input type="hidden" name="sceneId" value={sceneId} />
      <input type="hidden" name="x" value={geometry.x} />
      <input type="hidden" name="y" value={geometry.y} />
      <input type="hidden" name="width" value={geometry.width} />
      <input type="hidden" name="height" value={geometry.height} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">O que essa camada mostra</label>
          <Select name="type" value={type} onValueChange={(value) => setType(value as BroadcastLayerType)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BROADCAST_LAYER_TYPES.map((layerType) => (
                <SelectItem key={layerType} value={layerType}>{LAYER_TYPE_LABELS[layerType]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={fieldId("name")}>
            Nome (só pra identificar aqui no painel)
          </label>
          <Input id={fieldId("name")} name="name" placeholder="Vídeo principal" required />
        </div>
      </div>

      <LayerTypeFields type={type} fieldId={fieldId} defaultConfig={{}} playlists={playlists} />

      <GeometryPicker geometry={geometry} onChange={setGeometry} />

      <AdvancedLayerFields
        fieldId={fieldId}
        defaultZIndex={0}
        defaultVisible
        drawerEnabled={drawerEnabled}
        onDrawerToggle={setDrawerEnabled}
        defaultDrawerVariant={null}
      />

      <Button type="submit" disabled={pending}>Adicionar camada</Button>
    </form>
  );
}

function EditLayerForm({
  layer,
  playlists,
  onSuccess,
}: {
  layer: BroadcastLayerRecord;
  playlists: BroadcastPlaylistRecord[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateLayerAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Camada atualizada.", onSuccess });

  const [geometry, setGeometry] = useState<Geometry>({ x: layer.x, y: layer.y, width: layer.width, height: layer.height });
  const existingDrawerVariant = readDrawerVariant(layer.config);
  const [drawerEnabled, setDrawerEnabled] = useState(existingDrawerVariant !== null);
  const fieldId = (suffix: string) => `edit-${layer.id}-${suffix}`;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="layerId" value={layer.id} />
      <input type="hidden" name="type" value={layer.type} />
      <input type="hidden" name="x" value={geometry.x} />
      <input type="hidden" name="y" value={geometry.y} />
      <input type="hidden" name="width" value={geometry.width} />
      <input type="hidden" name="height" value={geometry.height} />

      <p className="text-xs text-muted-foreground">
        Tipo: <span className="font-medium text-foreground">{LAYER_TYPE_LABELS[layer.type]}</span> (não pode ser alterado — exclua e
        crie outra camada se precisar de um tipo diferente)
      </p>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={fieldId("name")}>
          Nome (só pra identificar aqui no painel)
        </label>
        <Input id={fieldId("name")} name="name" defaultValue={layer.name} required />
      </div>

      <LayerTypeFields type={layer.type} fieldId={fieldId} defaultConfig={layer.config} playlists={playlists} />

      <GeometryPicker geometry={geometry} onChange={setGeometry} />

      <AdvancedLayerFields
        fieldId={fieldId}
        defaultZIndex={layer.zIndex}
        defaultVisible={layer.visible}
        drawerEnabled={drawerEnabled}
        onDrawerToggle={setDrawerEnabled}
        defaultDrawerVariant={existingDrawerVariant}
      />

      <Button type="submit" disabled={pending} className="w-full">Salvar</Button>
    </form>
  );
}

function EditLayerDialog({ layer, playlists }: { layer: BroadcastLayerRecord; playlists: BroadcastPlaylistRecord[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Editar camada">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar camada</DialogTitle>
          <DialogDescription>Ajuste o conteúdo e a posição.</DialogDescription>
        </DialogHeader>
        <EditLayerForm layer={layer} playlists={playlists} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function LayerRow({ layer, playlists }: { layer: BroadcastLayerRecord; playlists: BroadcastPlaylistRecord[] }) {
  const preset = POSITION_PRESETS.find(
    (candidate) =>
      candidate.geometry.x === layer.x &&
      candidate.geometry.y === layer.y &&
      candidate.geometry.width === layer.width &&
      candidate.geometry.height === layer.height,
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-panel border border-border bg-card p-2 text-sm">
      <div>
        <span className="font-medium text-foreground">{layer.name}</span>{" "}
        <span className="text-muted-foreground">
          ({LAYER_TYPE_LABELS[layer.type]}, {preset?.label ?? "posição personalizada"}
          {!layer.visible && ", oculta"})
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <EditLayerDialog layer={layer} playlists={playlists} />
        <DeleteLayerButton layerId={layer.id} />
      </div>
    </div>
  );
}

export function ScenesSection({
  scenes,
  layersByScene,
  playlists,
}: {
  scenes: BroadcastSceneRecord[];
  layersByScene: Record<string, BroadcastLayerRecord[]>;
  playlists: BroadcastPlaylistRecord[];
}) {
  return (
    <div className="space-y-4">
      <CreateSceneForm />
      {scenes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cena cadastrada ainda.</p>}
      <div className="space-y-3">
        {scenes.map((scene) => (
          <details key={scene.id} className="rounded-panel border border-border bg-card p-3" open>
            <summary className="flex cursor-pointer items-center justify-between gap-3">
              <span className="font-medium text-foreground">{scene.name} <span className="text-muted-foreground">({scene.key})</span></span>
              <div className="flex items-center gap-1.5">
                <EditSceneDialog scene={scene} />
                <DeleteSceneButton sceneId={scene.id} />
              </div>
            </summary>
            <div className="mt-3 space-y-2">
              {(layersByScene[scene.id] ?? []).map((layer) => (
                <LayerRow key={layer.id} layer={layer} playlists={playlists} />
              ))}
              <CreateLayerForm sceneId={scene.id} playlists={playlists} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
