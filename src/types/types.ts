import { AnyNodeTypeMap } from "./NodeType"
import { AnyRelationshipTypeSet } from "./RelationshipType"


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

