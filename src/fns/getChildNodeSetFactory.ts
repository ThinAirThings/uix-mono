import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import { neo4jAction } from "../clients/neo4j";
import { AnyNodeTypeMap, NodeSetParentTypes, NodeShape, NodeSetChildNodeTypes } from "../types/NodeType";
import { Ok } from "../types/Result";
import { NodeKey } from "../types/NodeKey";




export const getChildNodeSetFactory = <
    NodeTypeMap extends AnyNodeTypeMap,
>(
    neo4jDriver: Driver,
    nodeTypeMap: NodeTypeMap,
) => neo4jAction(async <
    ParentNodeType extends NodeSetParentTypes<NodeTypeMap>,
    ChildNodeType extends NodeSetChildNodeTypes<NodeTypeMap, ParentNodeType>,
>(
    parentNodeKey: NodeKey<NodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType
) => {
    console.log("Getting child nodes of type", childNodeType, "for node of type", parentNodeKey.nodeType, "with id", parentNodeKey.nodeId)
    const result = await neo4jDriver.executeQuery<EagerResult<{
        childNode: Node<Integer, NodeShape<NodeTypeMap[ChildNodeType]>>
    }>>(/*cypher*/`
        MATCH (parentNode:${parentNodeKey.nodeType as string} {nodeId: $parentNodeId})<-[:CHILD_TO]-(childNode:${childNodeType as string}) 
        RETURN childNode
    `, {
        parentNodeId: parentNodeKey.nodeId,
    });
    return Ok(result.records.map(record => record.get('childNode').properties))
})