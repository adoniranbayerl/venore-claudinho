import { integer, pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const enrollmentDashboardSchema = pgSchema("enrollment_dashboard");

// logoMediaId aponta pra media.files (contexts/media), sem FK cross-schema (mesmo racional de
// academy.courses.coverMediaId) — validado via getMediaAsset() na aplicação, nunca no banco.
// key é gerado a partir do nome (shared/slugify.ts) na criação, nunca digitado pelo admin — é
// vocabulário interno (usado na URL de apresentação e como identificador estável entre reordens),
// não um campo de formulário.
export const institutions = enrollmentDashboardSchema.table(
  "institutions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull(),
    name: text("name").notNull(),
    logoMediaId: text("logo_media_id"),
    programLabel: text("program_label").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("institutions_key_idx").on(table.key)],
);

// groupLabel é texto livre (ex: "Fundamental I") — sem tabela própria de grupo, porque o
// agrupamento nos slides é derivado só da igualdade de string entre programs de uma mesma
// instituição (ver groupPrograms em components/enrollment-columns-slide.tsx), não de uma
// entidade com identidade/ordem própria.
export const programs = enrollmentDashboardSchema.table(
  "programs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    institutionId: text("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    label: text("label").notNull(),
    groupLabel: text("group_label"),
    goal: integer("goal").notNull().default(0),
    renewed: integer("renewed").notNull().default(0),
    newEnrollments: integer("new_enrollments").notNull().default(0),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("programs_institution_key_idx").on(table.institutionId, table.key)],
);
