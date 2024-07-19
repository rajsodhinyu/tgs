import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'ThatGoodSht',

  projectId: 'fnvy29id',
  dataset: 'tgs',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
