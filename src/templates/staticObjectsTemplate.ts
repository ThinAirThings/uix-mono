

import { GenericUixConfig } from "../config/defineConfig";

export const staticObjectsTemplate = (config: GenericUixConfig) => {
    return /* ts */`
// Start of File
import uixConfig from '${config.pathToConfig.replace('uix.config.ts', 'uix.config')}'
import { NodeShape} from '@thinairthings/uix'
export type ConfiguredNodeTypeMap = typeof uixConfig.graph.nodeTypeMap
${config.graph.nodeTypeMap['Root']
            ? `export const rootNodeKey: NodeKey<ConfiguredNodeTypeMap, 'Root'> = {nodeType: 'Root', nodeId: '0'}`
            : ``
        }
export const nodeTypeMap = uixConfig.graph.nodeTypeMap
export type NodeKey<T extends keyof ConfiguredNodeTypeMap> = {
    nodeType: T
    nodeId: string
}
${Object.keys(config.graph.nodeTypeMap).map(nodeType =>
    /*ts*/`export type ${nodeType}Node = NodeShape<ConfiguredNodeTypeMap['${nodeType}']> \n`
        ).join('')}
`
}