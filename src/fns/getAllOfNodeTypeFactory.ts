import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap, NodeShape } from "../types/NodeType"
import { Ok } from "../types/Result"
import { convertIntegersToNumbers } from "../utilities/convertIntegersToNumbers"






export const getAllOfNodeTypeFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(
    // 'getAllOfNodeType', 
    async <
        NodeType extends keyof NodeTypeMap,
    >(
        nodeType: NodeType
    ) => {
        console.log("Getting all nodes of type", nodeType)
        const nodes = await neo4jDriver.executeQuery<EagerResult<{
            node: Node<Integer, NodeShape<NodeTypeMap[NodeType]>>
        }>>(/*cypher*/`
        MATCH (node:${nodeType as string}) 
        RETURN node   
    `).then(res => res.records.map(record => convertIntegersToNumbers(record.get('node').properties)))
        return Ok(nodes)
    })