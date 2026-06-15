import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'fnvy29id',
    dataset: 'tgs'
  },
  // Target for `sanity deploy` -> https://tgs.sanity.studio (skips the prompt).
  studioHost: 'tgs'
})
