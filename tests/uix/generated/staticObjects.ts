
// Start of File
import uixConfig from '/home/aircraft/create/Hirebird/hirebird.v.2/hb.monorepo/packages/uix/tests/uix/uix.config'
import { NodeShape} from '@thinairthings/uix'
export type ConfiguredNodeTypeMap = typeof uixConfig.graph.nodeTypeMap

export const nodeTypeMap = uixConfig.graph.nodeTypeMap
export type NodeKey<T extends keyof ConfiguredNodeTypeMap> = {
    nodeType: T
    nodeId: string
}
export type UserNode = NodeShape<ConfiguredNodeTypeMap['User']> 
export type EducationNode = NodeShape<ConfiguredNodeTypeMap['Education']> 
export type NullNode = NodeShape<ConfiguredNodeTypeMap['Null']> 
export type ProfileNode = NodeShape<ConfiguredNodeTypeMap['Profile']> 
export type WorkExperienceNode = NodeShape<ConfiguredNodeTypeMap['WorkExperience']> 
export type WorkPreferenceNode = NodeShape<ConfiguredNodeTypeMap['WorkPreference']> 
export type DummyNode = NodeShape<ConfiguredNodeTypeMap['Dummy']> 

