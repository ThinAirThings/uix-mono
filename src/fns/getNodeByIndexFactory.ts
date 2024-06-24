import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
import { neo4jAction } from "../clients/neo4j"
import { AnyNodeTypeMap, NodeShape } from "../types/NodeType"
import { Ok, UixErr, UixErrSubtype } from "../types/Result"
import { convertIntegersToNumbers } from "../utilities/convertIntegersToNumbers"




export const getNodeByIndexFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(
    // 'getNodeByIndex', 
    async <
        NodeType extends keyof NodeTypeMap,
        UniqueIndex extends NodeTypeMap[NodeType]['uniqueIndexes'][number],
    >(
        nodeType: NodeType,
        indexKey: UniqueIndex,
        indexValue: string
    ) => {
        console.log(`Getting node of type ${nodeType as string} with index ${indexKey} = ${indexValue}`);
        const node = await neo4jDriver.executeQuery<EagerResult<{
            node: Node<Integer, NodeShape<NodeTypeMap[NodeType]>>
        }>>(/*cypher*/`
        MATCH (node:${nodeType as string}) 
        WHERE node.${indexKey} = $indexValue
        RETURN node
        `, { indexValue }
        ).then(res => res.records[0]?.get('node').properties)
        if (!node) return UixErr({
            subtype: UixErrSubtype.GET_NODE_BY_INDEX_FAILED,
            message: `Failed to get node of type ${nodeType as string} with index ${indexKey} = ${indexValue}`,
            data: {
                nodeType,
                indexKey,
                indexValue
            }
        })
        return Ok(convertIntegersToNumbers(node))
    })