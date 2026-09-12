import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Hand-written guide text. One Markdown file per page slot, addressed by path:
//   notes/leveling.md            -> id "leveling"
//   notes/beasts/cu-sith.md      -> id "beasts/cu-sith"
//   notes/crucible/1/default.md  -> id "crucible/1/default" (one file per strat variant)
const notes = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/notes' }),
  schema: z.object({
    title: z.string().optional(),
    status: z.enum(['draft', 'verified']).default('draft'),
    author: z.string().optional(),
    updated: z.coerce.date().optional(),
    // Crucible strat variants only: the tab label.
    variant: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { notes };
