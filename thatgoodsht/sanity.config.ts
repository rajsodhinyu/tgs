import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'





export default defineConfig({
  name: 'default',
  title: 'ThatGoodSht',

  projectId: 'fnvy29id',
  dataset: 'tgs',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
