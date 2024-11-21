import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {myLogo} from './components/MyLogo'
import {media} from 'sanity-plugin-media'





export default defineConfig({
  name: 'default',
  icon: myLogo,
  title: "ThatGoodShit",

  projectId: 'fnvy29id',
  dataset: 'tgs',

  plugins: [structureTool({structure}),media(),visionTool()],
  

  schema: {
    types: schemaTypes,
  },
})
