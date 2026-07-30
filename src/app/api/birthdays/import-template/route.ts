import { NextResponse } from "next/server";
import { authorizeActor } from "@/contexts/rbac";
import { generateBirthdaysCsvTemplate } from "@/plugins/birthdays";

export async function GET() {
  const authz = await authorizeActor("birthdays.manage");
  if (!authz.authorized) {
    return NextResponse.json({ error: authz.error.message }, { status: 403 });
  }

  return new NextResponse(generateBirthdaysCsvTemplate(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modelo-aniversariantes.csv"',
    },
  });
}
