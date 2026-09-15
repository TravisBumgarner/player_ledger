import {
  type Backlink,
  type CharacterProfile,
  type CreateNpc,
  MENTION_NODE,
  type ProfileImageType,
  type ProfileRef,
  parseProfileRef,
  type RichDoc,
  type RichNode,
  trimRichDoc,
  type UpdateProfile,
} from '@awesomeness-mgmt/shared'
import { and, asc, eq, like, sql } from 'drizzle-orm'
import { db } from '../index.js'
import {
  type CharacterProfileRow,
  characterDevelopment,
  characterProfiles,
  characters,
  sessionNotes,
  users,
} from '../schema.js'

const EMPTY_DOC: RichDoc = { type: 'doc' }

/** Every column but the image bytes, which only the image route reads. */
const profileColumns = {
  id: characterProfiles.id,
  characterId: characterProfiles.characterId,
  kind: characterProfiles.kind,
  subjectCharacterId: characterProfiles.subjectCharacterId,
  name: characterProfiles.name,
  description: characterProfiles.description,
  notes: characterProfiles.notes,
  imageUpdatedAt: characterProfiles.imageUpdatedAt,
  createdAt: characterProfiles.createdAt,
}

type ProfileRow = Omit<CharacterProfileRow, 'image' | 'imageType'>

function toNpcProfile(row: ProfileRow): CharacterProfile {
  return {
    ref: `npc:${row.id}`,
    kind: 'npc',
    name: row.name,
    description: row.description,
    notes: row.notes,
    playedBy: null,
    isSelf: false,
    imageVersion: row.imageUpdatedAt?.getTime() ?? null,
  }
}

function selectPartyMembers(ledgerId: string) {
  return db
    .select({
      id: characters.id,
      name: characters.name,
      playedBy: users.name,
      description: characterProfiles.description,
      notes: characterProfiles.notes,
      imageUpdatedAt: characterProfiles.imageUpdatedAt,
    })
    .from(characters)
    .innerJoin(users, eq(users.id, characters.userId))
    .leftJoin(
      characterProfiles,
      and(
        eq(characterProfiles.characterId, ledgerId),
        eq(characterProfiles.subjectCharacterId, characters.id),
      ),
    )
    .$dynamic()
}

type PartyMemberRow = Awaited<ReturnType<typeof selectPartyMembers>>[number]

function toPartyProfile(ledgerId: string, row: PartyMemberRow): CharacterProfile {
  return {
    ref: `pc:${row.id}`,
    kind: 'pc',
    name: row.name,
    description: row.description ?? '',
    notes: row.notes ?? EMPTY_DOC,
    playedBy: row.playedBy,
    isSelf: row.id === ledgerId,
    imageVersion: row.imageUpdatedAt?.getTime() ?? null,
  }
}

async function findPartyProfile(
  ledgerId: string,
  subjectId: string,
): Promise<CharacterProfile | undefined> {
  const [row] = await selectPartyMembers(ledgerId).where(eq(characters.id, subjectId))
  return row ? toPartyProfile(ledgerId, row) : undefined
}

const ownedNpc = (ledgerId: string, profileId: string) =>
  and(
    eq(characterProfiles.characterId, ledgerId),
    eq(characterProfiles.id, profileId),
    eq(characterProfiles.kind, 'npc'),
  )

export async function listProfiles(ledgerId: string): Promise<CharacterProfile[]> {
  const party = await selectPartyMembers(ledgerId).orderBy(
    sql`case when ${characters.id} = ${ledgerId} then 0 else 1 end`,
    asc(sql`lower(${characters.name})`),
  )
  const npcs = await db
    .select(profileColumns)
    .from(characterProfiles)
    .where(and(eq(characterProfiles.characterId, ledgerId), eq(characterProfiles.kind, 'npc')))
    .orderBy(asc(sql`lower(${characterProfiles.name})`))

  return [...party.map((row) => toPartyProfile(ledgerId, row)), ...npcs.map(toNpcProfile)]
}

export async function createNpc(ledgerId: string, input: CreateNpc): Promise<CharacterProfile> {
  const [row] = await db
    .insert(characterProfiles)
    .values({
      characterId: ledgerId,
      kind: 'npc',
      name: input.name,
      description: input.description,
    })
    .returning(profileColumns)
  return toNpcProfile(row)
}

/** Undefined when the party member does not exist. The caller refuses `name` first. */
export async function upsertPartyProfile(
  ledgerId: string,
  subjectId: string,
  input: Omit<UpdateProfile, 'name'>,
): Promise<CharacterProfile | undefined> {
  const [subject] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(eq(characters.id, subjectId))
  if (!subject) return undefined

  const patch = {
    description: input.description,
    notes: input.notes ? trimRichDoc(input.notes) : undefined,
  }
  await db
    .insert(characterProfiles)
    .values({ characterId: ledgerId, kind: 'pc', subjectCharacterId: subjectId, ...patch })
    .onConflictDoUpdate({
      target: [characterProfiles.characterId, characterProfiles.subjectCharacterId],
      // An empty patch still needs something to set; `kind` is already 'pc'.
      set: { kind: 'pc', ...patch },
    })

  return findPartyProfile(ledgerId, subjectId)
}

export async function updateNpc(
  ledgerId: string,
  profileId: string,
  input: UpdateProfile,
): Promise<CharacterProfile | undefined> {
  const [row] = await db
    .update(characterProfiles)
    .set({
      kind: 'npc',
      name: input.name,
      description: input.description,
      notes: input.notes ? trimRichDoc(input.notes) : undefined,
    })
    .where(ownedNpc(ledgerId, profileId))
    .returning(profileColumns)
  return row ? toNpcProfile(row) : undefined
}

export async function deleteNpc(ledgerId: string, profileId: string): Promise<boolean> {
  const rows = await db
    .delete(characterProfiles)
    .where(ownedNpc(ledgerId, profileId))
    .returning({ id: characterProfiles.id })
  return rows.length > 0
}

function mentions(node: RichDoc | RichNode, ref: ProfileRef): boolean {
  if (node.type === MENTION_NODE && 'attrs' in node && node.attrs?.id === ref) return true
  return (node.content ?? []).some((child) => mentions(child, ref))
}

export async function listBacklinks(ledgerId: string, ref: ProfileRef): Promise<Backlink[]> {
  // The LIKE narrows in SQL; the walk confirms it was a mention and not text that happened to match.
  const pattern = `%${JSON.stringify(ref)}%`

  const notes = await db
    .select()
    .from(sessionNotes)
    .where(and(eq(sessionNotes.characterId, ledgerId), like(sessionNotes.body, pattern)))

  const profiles = await db
    .select({
      id: characterProfiles.id,
      kind: characterProfiles.kind,
      subjectCharacterId: characterProfiles.subjectCharacterId,
      npcName: characterProfiles.name,
      subjectName: characters.name,
      notes: characterProfiles.notes,
      createdAt: characterProfiles.createdAt,
    })
    .from(characterProfiles)
    .leftJoin(characters, eq(characters.id, characterProfiles.subjectCharacterId))
    .where(and(eq(characterProfiles.characterId, ledgerId), like(characterProfiles.notes, pattern)))

  const noteLinks = notes
    .filter((note) => mentions(note.body, ref))
    .map((note) => ({
      source: note.kind === 'brewing' ? ('brewingNote' as const) : ('sessionNote' as const),
      id: note.id,
      title: note.date,
      at: note.createdAt,
    }))

  const profileLinks = profiles
    .map((row) => ({
      ...row,
      ref: row.kind === 'pc' ? `pc:${row.subjectCharacterId}` : `npc:${row.id}`,
    }))
    .filter((row) => row.ref !== ref && mentions(row.notes, ref))
    .map((row) => ({
      source: 'profile' as const,
      id: row.ref,
      title: row.kind === 'pc' ? (row.subjectName ?? '') : row.npcName,
      at: row.createdAt,
    }))

  const [development] = await db
    .select()
    .from(characterDevelopment)
    .where(
      and(eq(characterDevelopment.characterId, ledgerId), like(characterDevelopment.body, pattern)),
    )
  const developmentLinks =
    development && mentions(development.body, ref)
      ? [
          {
            source: 'development' as const,
            id: ledgerId,
            title: 'Character development',
            at: development.updatedAt,
          },
        ]
      : []

  return [...noteLinks, ...profileLinks, ...developmentLinks]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .map(({ at, ...link }) => ({ ...link, createdAt: at.toISOString() }))
}

/** The ref's profile in this ledger, created for a party member if it has none. Undefined if the subject does not exist. */
async function ensureProfileId(ledgerId: string, ref: ProfileRef): Promise<string | undefined> {
  const parsed = parseProfileRef(ref)
  if (!parsed) return undefined
  if (parsed.kind === 'npc') {
    const [row] = await db
      .select({ id: characterProfiles.id })
      .from(characterProfiles)
      .where(ownedNpc(ledgerId, parsed.id))
    return row?.id
  }
  if (!(await upsertPartyProfile(ledgerId, parsed.id, {}))) return undefined
  const [row] = await db
    .select({ id: characterProfiles.id })
    .from(characterProfiles)
    .where(
      and(
        eq(characterProfiles.characterId, ledgerId),
        eq(characterProfiles.subjectCharacterId, parsed.id),
      ),
    )
  return row?.id
}

async function findProfile(
  ledgerId: string,
  ref: ProfileRef,
): Promise<CharacterProfile | undefined> {
  return (await listProfiles(ledgerId)).find((profile) => profile.ref === ref)
}

/** Null image clears it. Undefined when the ref names nothing in this ledger. */
export async function setProfileImage(
  ledgerId: string,
  ref: ProfileRef,
  image: { bytes: Buffer; type: ProfileImageType } | null,
): Promise<CharacterProfile | undefined> {
  const profileId = await ensureProfileId(ledgerId, ref)
  if (!profileId) return undefined
  await db
    .update(characterProfiles)
    .set(
      image
        ? { image: image.bytes, imageType: image.type, imageUpdatedAt: new Date() }
        : { image: null, imageType: null, imageUpdatedAt: null },
    )
    .where(eq(characterProfiles.id, profileId))
  return findProfile(ledgerId, ref)
}

export async function getProfileImage(
  ledgerId: string,
  ref: ProfileRef,
): Promise<{ bytes: Buffer; type: ProfileImageType } | undefined> {
  const parsed = parseProfileRef(ref)
  if (!parsed) return undefined
  const [row] = await db
    .select({ bytes: characterProfiles.image, type: characterProfiles.imageType })
    .from(characterProfiles)
    .where(
      parsed.kind === 'npc'
        ? ownedNpc(ledgerId, parsed.id)
        : and(
            eq(characterProfiles.characterId, ledgerId),
            eq(characterProfiles.subjectCharacterId, parsed.id),
          ),
    )
  return row?.bytes && row.type ? { bytes: row.bytes, type: row.type } : undefined
}
