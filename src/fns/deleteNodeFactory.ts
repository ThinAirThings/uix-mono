import { Driver, EagerResult } from "neo4j-driver"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap } from "../types/NodeType"
import { UixErr, Ok, UixErrSubtype } from "../types/Result"
import { NodeKey } from "../types/NodeKey"




/**
 * Factory for creating an action to delete a node in the database
 * @param neo4jDriver The neo4j driver to use
 * @param nodeTypeMap The node type map to use
 * @returns The delete node action
 */
export const deleteNodeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap
) => neo4jAction(async (
    nodeKey: NodeKey<NodeTypeMap, keyof NodeTypeMap>
) => {
    console.log("Deleting", nodeKey)
    const result = await neo4jDriver.executeQuery<EagerResult<{
        parentNodeId: string,
        parentNodeType: string
    }>>(/*cypher*/ `
        MATCH (node:${nodeKey.nodeType as string} {nodeId: $nodeId})<-[:CHILD_TO|UNIQUE_TO|VECTOR_TO*0..]-(children)
        DETACH DELETE node, children
    `, {
        ...nodeKey
    })
    if (!result.summary.counters.containsUpdates()) return UixErr({
        subtype: UixErrSubtype.DELETE_NODE_FAILED,
        message: `Failed to delete node of type ${nodeKey.nodeType as string} with id ${nodeKey.nodeId}`,
        data: {
            nodeKey
        }
    })
    return Ok(true)
})

