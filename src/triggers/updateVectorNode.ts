import OpenAI from "openai";
import { GenericNodeShape } from "../types/NodeType";
import { Ok } from "../types/Result";
import { Driver, EagerResult, Integer, Node } from "neo4j-driver";



export const updateVectorNode = async (
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    propertyVectorKey: string,
    nodeShape: GenericNodeShape
) => {
    // Create Embedding
    const propertyKey = Object.keys(nodeShape).find(key => key === propertyVectorKey)
    if (!propertyKey) return Ok(null)
    
    const embedding = await openaiClient.embeddings.create({
        model: 'text-embedding-3-large',
        input: nodeShape[propertyKey as string]
    }).then(res => res.data[0].embedding)
    // Update Node
    console.log("Updating", propertyVectorKey, propertyKey)
    const updatedNode = await neo4jDriver.executeQuery<EagerResult<{
        node: Node<Integer, GenericNodeShape>
    }>>(/*cypher*/`
        MERGE (node:${nodeShape.nodeType}Vector {nodeId: $nodeId})
        ON CREATE 
            SET node.${propertyVectorKey} = $embedding
        ON MATCH 
            SET node.${propertyVectorKey} = $embedding
        RETURN node
    `, {
        nodeId: nodeShape.nodeId,
        embedding
    }).then(res => res.records[0].get('node').properties)
    console.log("UpdatedNode", updatedNode)
    return Ok(true)
}