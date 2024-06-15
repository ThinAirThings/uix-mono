

import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
import { AnyNodeTypeMap, NodeShape, NodeState } from "../types/NodeType"
import { neo4jAction } from "../clients/neo4j"
import { NodeKey } from "../types/types"
import { UixErr, Ok, UixErrCode } from "../types/Result"


export const updateNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap
) => neo4jAction(async <
    NodeType extends NodeTypeMap[keyof NodeTypeMap]['type']
>(
    nodeKey: NodeKey<NodeTypeMap, NodeType>,
    inputState: Partial<NodeState<NodeTypeMap[NodeType]>>
) => {
    console.log("Updating", nodeKey, inputState)
    // Strip out any properties that are not in the schema
    const strippedNodeState = nodeTypeMap[nodeKey.nodeType]!.stateSchema.partial().parse(inputState)

    const node = await neo4jDriver.executeQuery<EagerResult<{
        node: Node<Integer, NodeShape<NodeTypeMap[NodeType]>>
    }>>(/*cypher*/`
        MATCH (node:${nodeKey.nodeType} {nodeId: $nodeId})
        SET node += $state
        RETURN node
    `, {
        nodeId: nodeKey.nodeId,
        state: {
            ...strippedNodeState,
            updatedAt: new Date().toISOString(),
        }
    }).then(res => res.records[0])
    if (!node) return UixErr({
        code: UixErrCode.UPDATE_NODE_FAILED,
        message: `Failed to update node of type ${nodeKey.nodeType} with id ${nodeKey.nodeId}`
    })
    return Ok(node.get('node').properties)
})