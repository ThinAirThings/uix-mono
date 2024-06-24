

import { Driver, EagerResult, error, Integer, Node } from "neo4j-driver"
import { AnyNodeTypeMap, GenericNodeType, NodeShape, NodeState } from "../types/NodeType"
import { neo4jAction } from "../clients/neo4j"
import { UixErr, Ok, UixErrSubtype } from "../types/Result"
import OpenAI from "openai"
import { openAIAction } from "../clients/openai"
import { NodeKey } from "../types/NodeKey"
import { upsertVectorNode } from "../triggers/upsertVectorNode"
import { convertIntegersToNumbers } from "../utilities/convertIntegersToNumbers"


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
) => neo4jAction(
    // 'updateNode', 
    openAIAction(async <
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
        SET node += $state,
            node.updatedAt = timestamp()
        RETURN node
    `, {
            nodeId: nodeKey.nodeId,
            state: {
                ...strippedNodeState,
            }
        }).then(res => res.records[0]?.get('node').properties)
        if (!node) return UixErr({
            subtype: UixErrSubtype.UPDATE_NODE_FAILED,
            message: `Failed to update node of type ${nodeKey.nodeType} with id ${nodeKey.nodeId}`,
            data: {
                nodeKey,
                inputState
            }
        });
        // Run Triggers
        // NOTE: You should check what actually changes using immer here. You can probably have neo return the prevNode and currentNode
        await upsertVectorNode(neo4jDriver, openaiClient, node, nodeTypeMap[nodeKey.nodeType]!);
        // const triggers = nodeTypeMap[nodeKey.nodeType]!.triggerMap.get('onUpdate').forEach(trigger => trigger(nodeKey, node))
        return Ok(convertIntegersToNumbers(node))
    }))