import { AnyNodeTypeMap } from "./NodeType.js"
import { AnyRelationshipTypeSet } from "./RelationshipType.js"


export type ParentOfNodeSetTypes<
    NodeTypeMap extends AnyNodeTypeMap,
> = {
    [NodeType in keyof NodeTypeMap]: (
        NodeTypeMap[NodeType]['relationshipTypeSet'][number] & { relationshipClass: 'Set' }
    ) extends AnyRelationshipTypeSet ? never : NodeType
}[keyof NodeTypeMap]
// 
export type SetNodeTypes<
    NodeTypeMap extends AnyNodeTypeMap,
    ParentNodeType extends ParentOfNodeSetTypes<NodeTypeMap>
> = ((
    NodeTypeMap[ParentNodeType]
)['relationshipTypeSet'][number] & { relationshipClass: 'Set' })['toNodeType']['type']

