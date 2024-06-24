import { defineConfig } from '@thinairthings/uix'
import { UserNodeDefinition } from './nodeDefinitions/UserNodeDefinition'
import { EducationNodeDefinition } from './nodeDefinitions/EducationNodeDefinition'
import { NullNodeDefinition } from './nodeDefinitions/NullNodeDefinition'
import { ProfileNodeDefinition } from './nodeDefinitions/ProfileNodeDefinition'
import { WorkExperienceNodeDefinition } from './nodeDefinitions/WorkExperienceNodeDefinition'
import { WorkPreferenceNodeDefinition } from './nodeDefinitions/WorkPreferenceNodeDefinition'
import { DummyNodeDefinition } from './nodeDefinitions/DummyNodeDefinition'
import { NEO4J_PASSWORD_LOCAL, NEO4J_URI_LOCAL, NEO4J_USERNAME_LOCAL, OPENAI_API_KEY } from './env'

export default defineConfig({
    type: 'Base',
    nodeTypeSet: [
        UserNodeDefinition,
        EducationNodeDefinition,
        NullNodeDefinition,
        ProfileNodeDefinition,
        WorkExperienceNodeDefinition,
        WorkPreferenceNodeDefinition,
        DummyNodeDefinition
    ],
    outdir: 'tests/uix/generated',
    neo4jConfig: {
        uri: NEO4J_URI_LOCAL,
        username: NEO4J_USERNAME_LOCAL,
        password: NEO4J_PASSWORD_LOCAL
    },
    openaiConfig: {
        apiKey: OPENAI_API_KEY
    }
})