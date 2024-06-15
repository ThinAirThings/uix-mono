import { Driver, EagerResult } from "neo4j-driver"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap } from "../types/NodeType"
import { NodeKey } from "../types/types"
import { UixErr, Ok, UixErrCode } from "../types/Result"

export const deleteNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap
) => neo4jAction(async (
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
    if (!result.records[0]) return UixErr({
        code: UixErrCode.DELETE_NODE_FAILED,
        message: `Failed to delete node of type ${nodeKey.nodeType as string} with id ${nodeKey.nodeId}`
    })
    return Ok({
        parentNodeId: result.records[0].get('parentNodeId'),
        parentNodeType: result.records[0].get('parentNodeType')
    })
})

