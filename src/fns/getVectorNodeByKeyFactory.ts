import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import { AnyNodeType, AnyNodeTypeMap, NodeShape, VectorNodeShape } from "../types/NodeType";
import { neo4jAction } from "../clients/neo4j";
import { Ok, UixErr, UixErrCode } from "../types/Result";
import { NodeKey } from "../types/types";







export const getVectorNodeByKeyFactory = <
    NodeTypeMap extends AnyNodeTypeMap
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(async <
    NodeType extends {
        [K in keyof NodeTypeMap]: `${NodeTypeMap[K]['type']}Vector`
    }[keyof NodeTypeMap],
>(
    nodeKey: NodeKey<NodeTypeMap, NodeType>
) => {
    const node = await neo4jDriver.executeQuery<EagerResult<{
        node: Node<Integer, VectorNodeShape<NodeTypeMap[NodeType extends `${infer T}Vector` ? T : never]>>
    }>>(/*cypher*/`
        MATCH (node:${nodeKey.nodeType as string} {nodeId: $nodeId}) 
        RETURN node   
    `, { nodeId: nodeKey.nodeId }).then(res => res.records[0]?.get('node')?.properties)
    if (!node) return UixErr({
        code: UixErrCode.GET_NODE_BY_KEY_FAILED,
        message: `Failed to find node of type ${nodeKey.nodeType as string} with id ${nodeKey.nodeId}`
    })

    return Ok(node)
})