import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import { AnyNodeTypeMap, NodeShape, NodeState, UniqueChildNodeTypes, UniqueParentTypes } from "../types/NodeType";
import { neo4jAction } from "../clients/neo4j";
import { Ok, UixErr, UixErrSubtype } from "../types/Result";
import { v4 as uuid } from 'uuid'
import { NodeKey } from "../types/NodeKey";
import { convertIntegersToNumbers } from "../utilities/convertIntegersToNumbers";


export const getUniqueChildNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(async <
    ParentNodeType extends UniqueParentTypes<NodeTypeMap>,
    ChildNodeType extends UniqueChildNodeTypes<NodeTypeMap, ParentNodeType>,
>(
    parentNodeKey: NodeKey<NodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType
) => {
    console.log("Getting child nodes of type", childNodeType, "for node of type", parentNodeKey.nodeType, "with id", parentNodeKey.nodeId)
    const node = await neo4jDriver.executeQuery<EagerResult<{
        childNode: Node<Integer, NodeShape<NodeTypeMap[ChildNodeType]>>
    }>>(/*cypher*/`
        MERGE (parentNode:${parentNodeKey.nodeType as string} {nodeId: $parentNodeId})
        MERGE (parentNode)<-[:UNIQUE_TO]-(childNode:${childNodeType as string})
        ON CREATE 
            SET childNode = $defaultChildParams
        RETURN childNode
    `, {
        parentNodeId: parentNodeKey.nodeId,
        defaultChildParams: {
            nodeId: uuid(),
            nodeType: childNodeType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...nodeTypeMap[childNodeType]!.stateSchema.parse({})
        }
    }).then(res => res.records[0]?.get('childNode').properties)
    if (!node) return UixErr({
        subtype: UixErrSubtype.GET_UNIQUE_CHILD_NODE_FAILED,
        message: `Failed to get unique child node of type ${childNodeType as string} for parent node of type ${parentNodeKey.nodeType as string} with id ${parentNodeKey.nodeId}`,
        data: { parentNodeKey, childNodeType }
    })
    return Ok(convertIntegersToNumbers(node))
})