import OpenAI from "openai"
import { GenericNodeShape, GenericNodeType } from "../types/NodeType"
import { Driver } from "neo4j-driver"
import { Ok } from "../types/Result"
import { openAIAction } from "../clients/openai"
import { neo4jAction } from "../clients/neo4j"



export const createNodeTypeSummary = async (
    openaiClient: OpenAI,
    neo4jDriver: Driver,
    nodeShape: GenericNodeShape,
    nodeDefinition: GenericNodeType
) => {
    // Try/catch this because you're not going to handle it with application logic.
    // You'll just log it.
    const result = await neo4jAction(openAIAction(async () => {
        // Create Node Type Summary
        const nodeTypeSummary = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        + `You are an AI designed to convert a JSON structure of data into a paragraph of information summarizing the data.`
                        + `You should consider the paragraph you write to be representative of a 'type' of data.`
                        + `The user will describe to you what 'type' paragraph you are supposed to convert the data to and you will generate the paragraph.`
                }, {
                    role: 'user',
                    content:
                        + `Create a 'type' paragraph based on the following information: ${nodeDefinition.nodeTypeVectorDescription}`
                        + `The JSON data to use is: ${JSON.stringify(nodeShape)}`
                }
            ]
        }).then(res => res.choices[0].message.content ?? '')
        const nodeTypeEmbedding = await openaiClient.embeddings.create({
            model: 'text-embedding-3-large',
            input: nodeTypeSummary
        }).then(res => res.data[0].embedding)
        // Update Node
        await neo4jDriver.executeQuery(/*cypher*/`
            MERGE (vectorNode:${nodeShape.type}Vector {nodeId: $nodeId})
            SET node.nodeTypeSummary = $nodeTypeSummary
            SET node.nodeTypeEmbedding = $nodeTypeEmbedding
            RETURN node
        `, {
            nodeId: nodeShape.nodeId,
            nodeTypeSummary,
            nodeTypeEmbedding
        }).then(res => res.records[0].get('node').properties)
        return Ok(true as true)
    }))()
    const { data, error } = result
    if (data) return
    if (error.type === 'Neo4jErr') {
        // Note! You could do some logging here
        console.error("Neo4j Error", error)
    }
    if (error.type === 'OpenAIError') {
        console.error("OpenAI Error", error)
    }
}