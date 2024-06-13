'use server'

import { authenticatedServerAction } from "../authenticatedServerAction"
import { AnyNodeTypeMap, NodeShape, NodeState } from "../defines/NodeType"
import { NodeKey } from "../defines/typesv2"
import { neo4jAction } from "../neo4jAction"
import { neo4jDriver } from "../client"
import { EagerResult, Integer, Node } from "neo4j-driver"
import { BasicErr, Ok } from "../utilities/Result"
import { TypeOf } from "zod"



export const updateNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap
>(
    nodeTypeMap: NodeTypeMap
) => authenticatedServerAction(neo4jAction(async <
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
    if (!node) return BasicErr({
        code: 'NodeUpdateFailed',
        message: `Failed to update node of type ${nodeKey.nodeType} with id ${nodeKey.nodeId}`
    })
    return Ok(node.get('node').properties)
}))