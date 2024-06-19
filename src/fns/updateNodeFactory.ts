

import { Driver, EagerResult, error, Integer, Node } from "neo4j-driver"
import { AnyNodeShape, AnyNodeTypeMap, GenericNodeShape, GenericNodeType, NodeShape, NodeState } from "../types/NodeType"
import { neo4jAction } from "../clients/neo4j"
import { UixErr, Ok, UixErrCode } from "../types/Result"
import OpenAI from "openai"
import { updateVectorNode } from "../triggers/updateVectorNode"
import { openAIAction } from "../clients/openai"
import { NodeKey } from "../types/NodeKey"


/**
 * Factory for creating an action to update a node in the database
 * @param neo4jDriver The neo4j driver to use
 * @param nodeTypeMap The node type map to use
 * @returns The update node action
 */
export const updateNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap
>(
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    nodeTypeMap: NodeTypeMap
) => neo4jAction(openAIAction(async <
    NodeType extends NodeTypeMap[keyof NodeTypeMap]['type']
>(
    nodeKey: NodeKey<NodeTypeMap, NodeType>,
    inputState: Partial<NodeState<NodeTypeMap[NodeType]>>
) => {
    console.log("Updating", nodeKey, inputState)
    const nodeDefinition = nodeTypeMap[nodeKey.nodeType] as GenericNodeType
    // Strip out any properties that are not in the schema
    const strippedNodeState = nodeDefinition.stateSchema.partial().parse(inputState)

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
    }).then(res => res.records[0]?.get('node').properties)
    if (!node) return UixErr({
        code: UixErrCode.UPDATE_NODE_FAILED,
        message: `Failed to update node of type ${nodeKey.nodeType} with id ${nodeKey.nodeId}`,
        data: {
            nodeKey,
            inputState
        }
    })
    // Run Triggers
    // NOTE: You should check what actually changes using immer here. You can probably have neo return the prevNode and currentNode
    await Promise.all(
        nodeDefinition.propertyVectors.map(async propertyVectorKey => await updateVectorNode(
            neo4jDriver,
            openaiClient,
            propertyVectorKey,
            node as AnyNodeShape
        ))
    )
    // const triggers = nodeTypeMap[nodeKey.nodeType]!.triggerMap.get('onUpdate').forEach(trigger => trigger(nodeKey, node))
    return Ok(node)
}))