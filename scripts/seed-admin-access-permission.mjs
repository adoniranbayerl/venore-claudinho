import { Client } from "pg";

const ADMIN_ROLE_KEY = "admin";
const PERMISSION_KEY = "platform.admin.access";

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  const { rows } = await client.query('SELECT id FROM rbac.roles WHERE key = $1 LIMIT 1', [ADMIN_ROLE_KEY]);
  const adminRole = rows[0];
  if (!adminRole) {
    throw new Error(`Papel de sistema "${ADMIN_ROLE_KEY}" não encontrado — rode as migrations antes do seed.`);
  }

  await client.query(
    'INSERT INTO rbac.role_permissions (role_id, permission_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [adminRole.id, PERMISSION_KEY],
  );

  console.log(`Permission "${PERMISSION_KEY}" garantida para o papel "${ADMIN_ROLE_KEY}".`);
}

main()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await client.end();
    process.exit(1);
  });
