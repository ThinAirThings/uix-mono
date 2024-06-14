import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
import { v4 as uuid } from 'uuid'
import { TypeOf } from "zod"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap, NodeShape } from "../types/NodeType"
import { NodeKey, ParentOfNodeSetTypes, SetNodeTypes } from "../types/types"
import { BasicErr, Ok } from "../types/Result"

export const createNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
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
        ON CREATE SET childNode += $childNode
        ON MATCH SET childNode += $childNode
        WITH childNode
        MATCH (parentNode:${parentNodeKey.nodeType as string} {nodeId: $parentNodeKey.nodeId})
        MERGE (childNode)-[:CHILD_TO]->(parentNode)
        RETURN childNode
    `, {
        parentNodeKey,
        childNode: newNodeStructure
    }).then(res => res.records[0])
    if (!node) return BasicErr({
        code: 'NodeCreateFailed',
        message: `Failed to create node of type ${childNodeType} with parent ${parentNodeKey.nodeType as string} ${parentNodeKey.nodeId}`
    })
    return Ok(node.get('childNode').properties)
})