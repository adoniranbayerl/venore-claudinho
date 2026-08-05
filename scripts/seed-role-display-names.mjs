import { Client } from "pg";

const DISPLAY_NAMES = {
  superadmin: "Overlord",
  admin: "Administrador",
  member: "Membro",
};

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  for (const [key, name] of Object.entries(DISPLAY_NAMES)) {
    const { rowCount } = await client.query(
      'UPDATE rbac.roles SET name = $1, updated_at = now() WHERE key = $2',
      [name, key],
    );
    if (rowCount === 0) {
      console.warn(`Papel de sistema "${key}" não encontrado — pulei.`);
      continue;
    }
    console.log(`Papel "${key}" agora exibe como "${name}".`);
  }
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
