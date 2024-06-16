import OpenAI from "openai";
import { GenericNodeShape } from "../types/NodeType";
import { Ok } from "../types/Result";
import { Driver } from "neo4j-driver";

export const updateVectorNode = async (
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    propertyVectorKey: string,
    nodeShape: GenericNodeShape
) => {
    // Create Embedding
    const embedding = await openaiClient.embeddings.create({
        model: 'text-embedding-3-large',
        input: nodeShape[propertyVectorKey]
    }).then(res => res.data[0].embedding)
    // Update Node
    await neo4jDriver.executeQuery(/*cypher*/`
        MATCH (node:${nodeShape.type} {nodeId: $nodeId})
        SET node.${propertyVectorKey} = $embedding
        RETURN node
    `, {
        nodeId: nodeShape.nodeId,
        embedding
    }).then(res => res.records[0].get('node').properties)
    return Ok(embedding)
}