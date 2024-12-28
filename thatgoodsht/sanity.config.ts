import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {myLogo} from './components/MyLogo'
import {media} from 'sanity-plugin-media'





export default defineConfig({
  name: 'Backend',
  icon: myLogo,
  title: "ThatGoodSh*t!",

  projectId: 'fnvy29id',
  dataset: 'tgs',

  plugins: [structureTool({structure}),media()],

  schema: {
    types: schemaTypes,
  },

  document: {
    comments: {
      enabled: false,
    },
  },
})
