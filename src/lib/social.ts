import { kvReady, kvGet, kvSet, kvDel, kvSadd, kvSrem, kvSmembers } from "@/lib/kv";
import { getAccount, listAccounts, patchAccount, type Account, type Solve } from "@/lib/users";

/*
 * Couche "sociale" (Vercel KV) : profils publics, classement, solves (unlocks),
 * amis et équipes. Tout est no-op si aucun store KV n'est connecté.
 */

const lc = (e: string) => e.trim().toLowerCase();

/* ─────────── Profil public ─────────── */
export interface PublicProfile {
  email: string;
  name: string;
  avatar?: string;
  handle?: string;
  country?: string;
  bio?: string;
  score: number;
  teamId?: string;
  solves: Solve[];
  role: string;
}

export function toPublic(a: Account): PublicProfile {
  return {
    email: a.email,
    name: a.displayName || a.name,
    avatar: a.avatar,
    handle: a.handle,
    country: a.country,
    bio: a.bio,
    score: a.score ?? 0,
    teamId: a.teamId,
    solves: a.solves ?? [],
    role: a.role,
  };
}

export async function leaderboard(): Promise<PublicProfile[]> {
  const all = await listAccounts();
  return all
    .filter((a) => a.status !== "banned")
    .map(toPublic)
    .sort((x, y) => y.score - x.score || y.solves.length - x.solves.length);
}

/* ─────────── Solves (unlocks) ─────────── */
export async function addSolve(
  email: string,
  input: { name: string; points: number; cat?: string },
): Promise<Account | null> {
  const a = await getAccount(email);
  if (!a) return null;
  const s: Solve = {
    name: String(input.name).slice(0, 80),
    points: Math.max(0, Math.min(100000, Math.round(Number(input.points)) || 0)),
    cat: input.cat ? String(input.cat).slice(0, 24) : undefined,
    at: Date.now(),
  };
  if (!s.name.trim()) return a;
  const solves = [s, ...(a.solves ?? [])].slice(0, 200);
  const score = solves.reduce((sum, x) => sum + x.points, 0);
  return patchAccount(email, { solves, score });
}

export async function removeSolve(email: string, at: number): Promise<Account | null> {
  const a = await getAccount(email);
  if (!a) return null;
  const solves = (a.solves ?? []).filter((x) => x.at !== at);
  const score = solves.reduce((sum, x) => sum + x.points, 0);
  return patchAccount(email, { solves, score });
}

/* ─────────── Amis ─────────── */
const fKey = (e: string) => `friends:${lc(e)}`;
const inKey = (e: string) => `freq:in:${lc(e)}`;
const outKey = (e: string) => `freq:out:${lc(e)}`;

export async function requestFriend(from: string, to: string): Promise<{ ok: boolean; error?: string }> {
  from = lc(from);
  to = lc(to);
  if (!to) return { ok: false, error: "Email requis." };
  if (from === to) return { ok: false, error: "Impossible de t'ajouter toi-même." };
  const target = await getAccount(to);
  if (!target) return { ok: false, error: "Aucun compte avec cet email." };
  const friends = (await kvSmembers(fKey(from))) ?? [];
  if (friends.includes(to)) return { ok: false, error: "Vous êtes déjà amis." };
  const incoming = (await kvSmembers(inKey(from))) ?? [];
  if (incoming.includes(to)) {
    await acceptFriend(from, to);
    return { ok: true };
  }
  await kvSadd(outKey(from), to);
  await kvSadd(inKey(to), from);
  return { ok: true };
}

export async function acceptFriend(me: string, other: string): Promise<void> {
  me = lc(me);
  other = lc(other);
  await kvSrem(inKey(me), other);
  await kvSrem(outKey(other), me);
  await kvSadd(fKey(me), other);
  await kvSadd(fKey(other), me);
}

export async function declineFriend(me: string, other: string): Promise<void> {
  me = lc(me);
  other = lc(other);
  await kvSrem(inKey(me), other);
  await kvSrem(outKey(other), me);
}

export async function removeFriend(me: string, other: string): Promise<void> {
  me = lc(me);
  other = lc(other);
  await kvSrem(fKey(me), other);
  await kvSrem(fKey(other), me);
}

async function mapProfiles(emails: string[] | null): Promise<PublicProfile[]> {
  const out: PublicProfile[] = [];
  for (const e of emails ?? []) {
    const a = await getAccount(e);
    if (a) out.push(toPublic(a));
  }
  return out;
}

export async function friendsOf(
  email: string,
): Promise<{ friends: PublicProfile[]; incoming: PublicProfile[]; outgoing: PublicProfile[] }> {
  const [f, i, o] = await Promise.all([
    kvSmembers(fKey(email)),
    kvSmembers(inKey(email)),
    kvSmembers(outKey(email)),
  ]);
  return { friends: await mapProfiles(f), incoming: await mapProfiles(i), outgoing: await mapProfiles(o) };
}

/* ─────────── Équipes ─────────── */
export interface TeamRec {
  id: string;
  name: string;
  tag: string;
  owner: string;
  members: string[];
  createdAt: number;
}

const TEAM_SET = "teams";
const teamKey = (id: string) => `team:${id}`;
const slugTag = (t: string) => t.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

export async function getTeam(id: string): Promise<TeamRec | null> {
  if (!kvReady || !id) return null;
  const raw = await kvGet(teamKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TeamRec;
  } catch {
    return null;
  }
}

export async function listTeams(): Promise<TeamRec[]> {
  if (!kvReady) return [];
  const ids = (await kvSmembers(TEAM_SET)) ?? [];
  const out: TeamRec[] = [];
  for (const id of ids) {
    const t = await getTeam(id);
    if (t) out.push(t);
  }
  return out.sort((a, b) => b.members.length - a.members.length);
}

export async function createTeam(
  owner: string,
  name: string,
  tag: string,
): Promise<{ ok: boolean; team?: TeamRec; error?: string }> {
  if (!kvReady) return { ok: false, error: "Base de données non connectée." };
  owner = lc(owner);
  const acc = await getAccount(owner);
  if (acc?.teamId) return { ok: false, error: "Tu es déjà dans une équipe." };
  const cleanName = String(name).trim().slice(0, 40);
  const cleanTag = slugTag(String(tag));
  if (cleanName.length < 2 || cleanTag.length < 2) return { ok: false, error: "Nom (≥2) et tag (≥2) requis." };
  const id = cleanTag.toLowerCase() + "-" + Math.random().toString(36).slice(2, 7);
  const team: TeamRec = { id, name: cleanName, tag: cleanTag, owner, members: [owner], createdAt: Date.now() };
  await kvSet(teamKey(id), JSON.stringify(team));
  await kvSadd(TEAM_SET, id);
  await patchAccount(owner, { teamId: id });
  return { ok: true, team };
}

export async function joinTeam(email: string, id: string): Promise<{ ok: boolean; error?: string }> {
  email = lc(email);
  const acc = await getAccount(email);
  if (acc?.teamId) return { ok: false, error: "Tu es déjà dans une équipe." };
  const team = await getTeam(id);
  if (!team) return { ok: false, error: "Équipe introuvable." };
  if (team.members.length >= 12) return { ok: false, error: "Équipe complète (12 max)." };
  if (!team.members.includes(email)) team.members.push(email);
  await kvSet(teamKey(id), JSON.stringify(team));
  await patchAccount(email, { teamId: id });
  return { ok: true };
}

export async function leaveTeam(email: string): Promise<void> {
  email = lc(email);
  const acc = await getAccount(email);
  if (!acc?.teamId) return;
  const team = await getTeam(acc.teamId);
  await patchAccount(email, { teamId: undefined });
  if (!team) return;
  team.members = team.members.filter((m) => m !== email);
  if (team.members.length === 0) {
    await kvDel(teamKey(team.id));
    await kvSrem(TEAM_SET, team.id);
  } else {
    if (team.owner === email) team.owner = team.members[0];
    await kvSet(teamKey(team.id), JSON.stringify(team));
  }
}

export async function teamWithMembers(
  id: string,
): Promise<{ team: TeamRec; members: PublicProfile[] } | null> {
  const team = await getTeam(id);
  if (!team) return null;
  const members = await mapProfiles(team.members);
  members.sort((a, b) => b.score - a.score);
  return { team, members };
}

/* ─────────── Travaux de groupe (tâches d'équipe) ─────────── */
export type TaskStatus = "todo" | "doing" | "done";
export interface TeamTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignee?: string;
  by: string;
  at: number;
}
const tasksKey = (id: string) => `team:${id}:tasks`;

export async function getTasks(teamId: string): Promise<TeamTask[]> {
  if (!kvReady || !teamId) return [];
  const raw = await kvGet(tasksKey(teamId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TeamTask[];
  } catch {
    return [];
  }
}

async function setTasks(teamId: string, tasks: TeamTask[]): Promise<void> {
  await kvSet(tasksKey(teamId), JSON.stringify(tasks.slice(0, 100)));
}

export async function addTask(teamId: string, title: string, by: string): Promise<TeamTask[]> {
  const clean = String(title).trim().slice(0, 120);
  if (!clean) return getTasks(teamId);
  const tasks = await getTasks(teamId);
  tasks.unshift({ id: Math.random().toString(36).slice(2, 9), title: clean, status: "todo", by: lc(by), at: Date.now() });
  await setTasks(teamId, tasks);
  return tasks;
}

export async function updateTask(
  teamId: string,
  id: string,
  patch: { status?: TaskStatus; assignee?: string },
): Promise<TeamTask[]> {
  const tasks = await getTasks(teamId);
  const t = tasks.find((x) => x.id === id);
  if (t) {
    if (patch.status && ["todo", "doing", "done"].includes(patch.status)) t.status = patch.status;
    if (patch.assignee !== undefined) t.assignee = patch.assignee ? lc(patch.assignee) : undefined;
  }
  await setTasks(teamId, tasks);
  return tasks;
}

export async function removeTask(teamId: string, id: string): Promise<TeamTask[]> {
  const tasks = (await getTasks(teamId)).filter((x) => x.id !== id);
  await setTasks(teamId, tasks);
  return tasks;
}
