import { NextResponse } from "next/server";
import { importSiteBundle } from "@/contexts/import-export";
import { resolveBlockDefinition } from "@/platform/page-builder/block-registry";

function statusForErrorCode(code: string): number {
  if (code === "rbac.authorization.unauthenticated") return 401;
  if (code === "rbac.authorization.forbidden") return 403;
  return 400;
}

// Rota própria (não Server Action) pelo mesmo motivo de export/route.ts: o .zip de um pacote de
// import real (fotos, vídeos) passa fácil do limite de body de Server Action (10mb,
// next.config.ts). Limite real de upload aqui é o da própria plataforma de hospedagem — pacote
// muito grande é uma limitação conhecida, mesma razão pela qual upload de mídia grande já usa o
// fluxo de client-upload direto ao Blob em vez deste tipo de rota (blob-spec).
export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecione um arquivo .zip para importar." }, { status: 400 });
  }

  const zipData = Buffer.from(await file.arrayBuffer());
  const result = await importSiteBundle({ zipData, resolveDefinition: resolveBlockDefinition });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: statusForErrorCode(result.error.code) });
  }

  return NextResponse.json({ report: result.data });
}
