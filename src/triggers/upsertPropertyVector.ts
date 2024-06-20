import OpenAI from "openai";
import { GenericNodeShape } from "../types/NodeType";
import { Ok } from "../types/Result";
import { Driver, EagerResult, Integer, Node } from "neo4j-driver";



export const upsertPropertyVector = async (
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
    const vectorNode = await neo4jDriver.executeQuery<EagerResult<{
        vectorNode: Node<Integer, GenericNodeShape>
    }>>(/*cypher*/`
        MATCH (node:${nodeShape.nodeType} {nodeId: $nodeId})
        MERGE (node)<-[:VECTOR_TO]-(vectorNode:${nodeShape.nodeType}Vector {nodeId: $nodeId})
        ON CREATE 
            SET vectorNode.${propertyVectorKey} = $embedding
        ON MATCH 
            SET vectorNode.${propertyVectorKey} = $embedding
        RETURN vectorNode
    `, {
        nodeId: nodeShape.nodeId,
        embedding
    }).then(res => res.records[0].get('vectorNode').properties)
    return Ok(true)
}