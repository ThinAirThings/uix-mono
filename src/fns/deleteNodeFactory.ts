'use server'

import { EagerResult } from "neo4j-driver"
import { neo4jDriver } from "../client"
import { authenticatedServerAction } from "../authenticatedServerAction"
import { neo4jAction } from "../neo4jAction"
import { AnyNodeTypeMap } from "../defines/NodeType"
import { NodeKey } from "../defines/typesv2"
import { BasicErr, Ok } from "../utilities/Result"

export const deleteNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    nodeTypeMap: NodeTypeMap
) => authenticatedServerAction(neo4jAction(async (
    nodeKey: NodeKey<NodeTypeMap, keyof NodeTypeMap>
) => {
    const result = await neo4jDriver.executeQuery<EagerResult<{
        parentNodeId: string,
        parentNodeType: string
    }>>(/*cypher*/ `
        MATCH (node:${nodeKey.nodeType as string} {nodeId: $nodeId})-[:CHILD_TO]->(parent)
        WITH parent, node
        DETACH DELETE node
        RETURN parent.nodeId AS parentNodeId, parent.nodeType AS parentNodeType
    `, {
        ...nodeKey
    })
    if (!result.records[0]) return BasicErr({
        code: 'NodeDeleteFailed',
        message: `Failed to delete node of type ${nodeKey.nodeType as string} with id ${nodeKey.nodeId}`
    })
    return Ok({
        parentNodeId: result.records[0].get('parentNodeId'),
        parentNodeType: result.records[0].get('parentNodeType')
    })
}))

