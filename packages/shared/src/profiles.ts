import { z } from 'zod'
import { type RichDoc, richDocSchema } from './richText.js'

/**
 * Who a profile is about. Party members are the player characters picked at login;
 * NPCs are added by hand. A ref is also what an @mention stores, so it has to name
 * the subject rather than the profile row, which a party member may not have yet.
 */
export const PROFILE_KINDS = ['pc', 'npc'] as const
export type ProfileKind = (typeof PROFILE_KINDS)[number]

export type ProfileRef = `${ProfileKind}:${string}`

export const profileRefSchema = z
  .string()
  .regex(/^(pc|npc):[A-Za-z0-9-]{1,64}$/) as unknown as z.ZodType<ProfileRef>

export function parseProfileRef(ref: string): { kind: ProfileKind; id: string } | null {
  const match = /^(pc|npc):([A-Za-z0-9-]{1,64})$/.exec(ref)
  return match ? { kind: match[1] as ProfileKind, id: match[2] } : null
}

/** One character as seen from the active character's ledger. */
export const characterProfileSchema = z.object({
  ref: z.string(),
  kind: z.enum(PROFILE_KINDS),
  name: z.string(),
  description: z.string(),
  notes: z.custom<RichDoc>(),
  /** Party members only: the user who plays them. */
  playedBy: z.string().nullable(),
  /** The active character's own entry. */
  isSelf: z.boolean(),
  /** Changes whenever the portrait does; null when there is none. Build the URL with `profileImagePath`. */
  imageVersion: z.number().nullable(),
})
export type CharacterProfile = z.infer<typeof characterProfileSchema>

export const createNpcSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
})
export type CreateNpc = z.infer<typeof createNpcSchema>

/** A party member's name belongs to its player, so `name` is refused for a `pc:` ref. */
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500),
    notes: richDocSchema,
  })
  .partial()
export type UpdateProfile = z.infer<typeof updateProfileSchema>

/** Raster only: an SVG portrait could carry script. */
export const PROFILE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const
export type ProfileImageType = (typeof PROFILE_IMAGE_TYPES)[number]

/** Upper bound on the stored bytes. The client resizes to `PROFILE_IMAGE_EDGE` first, so this is a backstop. */
export const PROFILE_IMAGE_MAX_BYTES = 1_000_000
export const PROFILE_IMAGE_EDGE = 512

/** Relative to the API base, e.g. `/api`. */
export function profileImagePath(characterId: string, profile: CharacterProfile): string | null {
  if (profile.imageVersion === null) return null
  return `/characters/${encodeURIComponent(characterId)}/profiles/${encodeURIComponent(profile.ref)}/image?v=${profile.imageVersion}`
}

/** A note that @mentions a character. */
export const BACKLINK_SOURCES = ['sessionNote', 'brewingNote', 'profile', 'development'] as const
export const backlinkSchema = z.object({
  source: z.enum(BACKLINK_SOURCES),
  /** The note's id, the mentioning profile's ref, or the ledger's own character id for development. */
  id: z.string(),
  /** The note's date/label, the mentioning character's name, or "Character development". */
  title: z.string(),
  createdAt: z.string(),
})
export type Backlink = z.infer<typeof backlinkSchema>

/** What a mention node carries: tiptap's Mention stores `id` and `label` as attrs. */
export const MENTION_NODE = 'mention'
