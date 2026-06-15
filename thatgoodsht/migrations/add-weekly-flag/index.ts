import {at, defineMigration, set} from 'sanity/migrate'

/**
 * Backfill: flag every existing "Good Sh*t Weekly" roundup so it shows up in the
 * Good Sh*t Weekly structure list. Matches on the roundup slug pattern and only
 * touches posts that aren't already flagged.
 *
 * Run once from the studio package:
 *   npx sanity migration run add-weekly-flag
 *   npx sanity migration run add-weekly-flag --no-dry-run   # to actually write
 */
export default defineMigration({
  title: 'Flag existing Good Sh*t Weekly roundups',
  documentTypes: ['post'],
  filter: 'slug.current match "good-sh-t-weekly*" && !defined(weekly)',
  migrate: {
    document() {
      return at('weekly', set(true))
    },
  },
})
