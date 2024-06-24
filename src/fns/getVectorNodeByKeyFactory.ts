import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import { AnyNodeTypeMap, VectorNodeShape } from "../types/NodeType";
import { neo4jAction } from "../clients/neo4j";
import { Ok, UixErr, UixErrSubtype } from "../types/Result";
import { NodeKey, TypeFromVectorType, VectorKeys } from "../types/NodeKey";
import { convertIntegersToNumbers } from "../utilities/convertIntegersToNumbers";





export const getVectorNodeByKeyFactory = <
    NodeTypeMap extends AnyNodeTypeMap
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(
    // 'getVectorNodeByKey', 
    async <
        NodeType extends VectorKeys<NodeTypeMap>,
    >(
        nodeKey: NodeKey<NodeTypeMap, NodeType>
    ) => {
        const node = await neo4jDriver.executeQuery<EagerResult<{
            node: Node<Integer, VectorNodeShape<NodeTypeMap[TypeFromVectorType<NodeTypeMap, NodeType>]>>
        }>>(/*cypher*/`
        MATCH (node:${nodeKey.nodeType as string} {nodeId: $nodeId}) 
        RETURN node   
    `, { nodeId: nodeKey.nodeId }).then(res => res.records[0]?.get('node')?.properties)
        if (!node) return UixErr({
            subtype: UixErrSubtype.GET_NODE_BY_KEY_FAILED,
            message: `Failed to find vector node of type ${nodeKey.nodeType as string} with id ${nodeKey.nodeId}`,
            data: { nodeKey }
        })

        return Ok(convertIntegersToNumbers(node))
    })