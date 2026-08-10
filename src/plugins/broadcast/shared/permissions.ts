// Handlers de agenda (agenda + agenda_events) aceitam QUALQUER uma destas — authorizeActor(string[])
// já é "qualquer uma" (ver contexts/rbac/authorize-actor.ts). broadcast.manage continua valendo
// pra quem já tinha acesso total; broadcast.agenda.manage é o escopo estreito pro papel "editor de
// agenda" (manifest.ts). Handlers fora de agenda (playlists, saídas, configurações, vínculo
// agenda↔saída) continuam exigindo só "broadcast.manage" — este array é deliberadamente usado
// apenas pelos handlers de agenda/agenda_events.
export const BROADCAST_AGENDA_PERMISSIONS = ["broadcast.manage", "broadcast.agenda.manage"];
