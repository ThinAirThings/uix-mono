import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
import { v4 as uuid } from 'uuid'
import { TypeOf, z } from "zod"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap, GenericNodeType, GenericNodeTypeMap, Neo4jNodeShape, NodeShape } from "../types/NodeType"
import { ParentOfNodeSetTypes, SetNodeTypes } from "../types/types"
import { UixErr, Ok, UixErrSubtype, AnyErrType } from "../types/Result"
import { Action } from "../types/Action"
import OpenAI from "openai"
import { GenericNodeKey, NodeKey } from "../types/NodeKey"
import { upsertVectorNode } from "../triggers/upsertVectorNode"
import { convertIntegersToNumbers } from "../utilities/convertIntegersToNumbers"


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
    parentNodeKeys: NodeKey<NodeTypeMap, ParentOfNodeSetType>[],
    childNodeType: SetNodeType,
    initialState: InitialState,
    nodeId?: string
) => {
    // Check Schema
    const newNodeStructure = (<GenericNodeType>nodeTypeMap[childNodeType]!)['stateSchema'].extend({
        nodeId: z.string(),
        nodeType: z.string()
    }).parse({
        ...initialState,
        nodeId: nodeId ?? uuid(),
        nodeType: childNodeType
    })
    console.log("Creating", parentNodeKeys, childNodeType, newNodeStructure)
    const node = await neo4jDriver.executeQuery<EagerResult<{
        childNode: Node<Integer, NodeShape<NodeTypeMap[SetNodeType]>>
    }>>(/* cypher */ `
        MERGE (childNode:Node:${childNodeType} {nodeId: $childNode.nodeId})
        ON CREATE 
            SET childNode += $childNode,
                childNode.createdAt = timestamp(),
                childNode.updatedAt = timestamp()

        ON MATCH 
            SET childNode += $childNode,
                childNode.updatedAt = timestamp()
        WITH childNode
        UNWIND $parentNodeKeys AS parentNodeKey
        MATCH (parentNode:Node {nodeId: parentNodeKey.nodeId})
        MERGE (childNode)-[:CHILD_TO]->(parentNode)
        RETURN childNode
    `, {
        parentNodeKeys,
        childNode: newNodeStructure
    }).then(res => res.records[0]?.get('childNode').properties)
    if (!node) return UixErr({
        subtype: UixErrSubtype.CREATE_NODE_FAILED,
        message: `Failed to create node of type ${childNodeType} with parent keys ${parentNodeKeys}`,
        data: { parentNodeKeys, childNodeType, initialState }
    });
    // Triggers
    await upsertVectorNode(neo4jDriver, openaiClient, node, nodeTypeMap[childNodeType]!);
    return Ok(convertIntegersToNumbers(node))
})