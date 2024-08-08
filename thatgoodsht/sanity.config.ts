import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'
import {myLogo} from './components/MyLogo'
import { BsCalendar2Heart, BsPerson, BsPencilSquare } from "react-icons/bs"




export default defineConfig({
  name: 'default',
  icon: myLogo,
  title: "That Good Shit",

  projectId: 'fnvy29id',
  dataset: 'tgs',

  plugins: [structureTool({structure}), visionTool()],
  

  schema: {
    types: schemaTypes,
  },
})
