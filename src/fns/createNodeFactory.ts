import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
import { v4 as uuid } from 'uuid'
import { TypeOf } from "zod"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap, GenericNodeTypeMap, NodeShape } from "../types/NodeType"
import { ParentOfNodeSetTypes, SetNodeTypes } from "../types/types"
import { UixErr, Ok, UixErrCode, AnyErrType } from "../types/Result"
import { Action } from "../types/Action"
import { createVectorNode } from "../triggers/createVectorNode"
import OpenAI from "openai"
import { GenericNodeKey, NodeKey } from "../types/NodeKey"


export type GenericCreateNodeAction = Action<
    [GenericNodeKey, Capitalize<string>, Record<string, any>, string?],
    Record<string, any>,
    AnyErrType
>

/**
 * Factory for creating an action to create a node in the database
 * @param neo4jDriver The neo4j driver to use
 * @param nodeTypeMap The node type map to use
 * @returns The create node action
 */
export const createNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(async <
    ParentOfNodeSetType extends ParentOfNodeSetTypes<NodeTypeMap>,
    SetNodeType extends SetNodeTypes<NodeTypeMap, ParentOfNodeSetType>,
    InitialState extends TypeOf<NodeTypeMap[SetNodeType]['stateSchema']>
>(
    parentNodeKey: NodeKey<NodeTypeMap, ParentOfNodeSetType>,
    childNodeType: SetNodeType,
    initialState: InitialState,
    nodeId?: string
) => {
    // Check Schema
    const newNodeStructure = nodeTypeMap[childNodeType]!['shapeSchema'].parse({
        ...initialState,
        nodeId: nodeId ?? uuid(),
        nodeType: childNodeType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })
    console.log("Creating", parentNodeKey, childNodeType, newNodeStructure)
    const node = await neo4jDriver.executeQuery<EagerResult<{
        childNode: Node<Integer, NodeShape<NodeTypeMap[SetNodeType]>>
    }>>(/* cypher */ `
        MERGE (childNode:Node:${childNodeType} {nodeId: $childNode.nodeId})
        ON CREATE 
            SET childNode += $childNode
        ON MATCH 
            SET childNode += $childNode
        WITH childNode
        MATCH (parentNode:${parentNodeKey.nodeType as string} {nodeId: $parentNodeKey.nodeId})
        MERGE (childNode)-[:CHILD_TO]->(parentNode)
        RETURN childNode
    `, {
        parentNodeKey,
        childNode: newNodeStructure
    }).then(res => res.records[0]!.get('childNode').properties)
    if (!node) return UixErr({
        code: UixErrCode.CREATE_NODE_FAILED,
        message: `Failed to create node of type ${childNodeType} with parent ${parentNodeKey.nodeType as string} ${parentNodeKey.nodeId}`,
    });
    // Triggers

    (<GenericNodeTypeMap>nodeTypeMap)[childNodeType]!.nodeTypeVectorDescription && await createVectorNode(neo4jDriver, openaiClient, node, nodeTypeMap[childNodeType]!)

    return Ok(node)
})