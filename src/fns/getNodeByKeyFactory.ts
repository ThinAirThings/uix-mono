import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import { neo4jAction } from "../clients/neo4j";
import { NodeKey } from "../types/types";
import { AnyNodeTypeMap, NodeShape } from "../types/NodeType";
import { BasicErr, Ok } from "../types/Result";




export const getNodeByKeyFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(async <
    NodeType extends keyof NodeTypeMap,
>(
    nodeKey: NodeKey<NodeTypeMap, NodeType>
) => {
    const getNodeResult = await neo4jDriver.executeQuery<EagerResult<{
        node: Node<Integer, NodeShape<NodeTypeMap[NodeType]>>
    }>>(/*cypher*/`
        MATCH (node:${nodeKey.nodeType as string} {nodeId: $nodeId}) 
        RETURN node   
    `, { nodeId: nodeKey.nodeId })
    if (!getNodeResult.records[0]) return BasicErr({
        code: 'NodeNotFound',
        message: `Failed to find node of type ${nodeKey.nodeType as string} with id ${nodeKey.nodeId}`
    })
    return Ok(getNodeResult.records[0].get('node').properties)
})