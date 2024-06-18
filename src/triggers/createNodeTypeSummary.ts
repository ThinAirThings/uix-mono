import OpenAI from "openai"
import { GenericNodeShape, GenericNodeType } from "../types/NodeType"
import { Driver, EagerResult, Integer, Node } from "neo4j-driver"
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
        console.log(nodeDefinition.nodeTypeVectorDescription)
        console.log(JSON.stringify(nodeShape))
        const { type, description } = nodeDefinition.nodeTypeVectorDescription!
        const nodeTypeSummary = await openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content:
                        `You are an AI designed to write a paragraph about a ${type} as if you were writing a paragraph designated to define a '${type.toUpperCase()}Type'.\n`
                        + `A '${type.toUpperCase()}Type' is an abstract representation of a ${type} such that the information represents the properties of a ${type} in a way that encodes the ${type} to be semantically complete and follows the following description: ${description}.\n`
                        + `Your job is to generate the '${type.toUpperCase()}Type' paragraph to the best of your ability.\n`
                        + `The '${type.toUpperCase()}Type' paragraph should fully represent the '${type.toUpperCase()}Type' as it was defined.\n`
                        + `Your will receive information in a JSON.stringified format that you will use to generate the '${type.toUpperCase()}Type' paragraph.\n`
                        + `You should ignore information that is not relevant to the '${type.toUpperCase()}Type' paragraph as it was defined.\n`
                }, {
                    role: 'user',
                    content: `The JSON data to use is: ${JSON.stringify(nodeShape)}`
                }
            ]
        }).then(res => res.choices[0].message.content ?? '')
        console.log(nodeTypeSummary)
        const nodeTypeEmbedding = await openaiClient.embeddings.create({
            model: 'text-embedding-3-large',
            input: nodeTypeSummary
        }).then(res => res.data[0].embedding)
        // Update Node
        const nodeResult = await neo4jDriver.executeQuery<EagerResult<{
            vectorNode: Node<Integer, GenericNodeShape>
        }>>(/*cypher*/`
            MATCH (node:${nodeShape.nodeType} {nodeId: $nodeId})
            MERGE (vectorNode:${nodeShape.nodeType}Vector {nodeId: $nodeId})-[:VECTOR_TO]->(node)
            ON CREATE 
                SET vectorNode += $vectorNodeStructure
            ON MATCH 
                SET vectorNode += $vectorNodeStructure
            RETURN vectorNode
        `, {
            nodeId: nodeShape.nodeId,
            vectorNodeStructure: {
                nodeTypeSummary,
                nodeTypeEmbedding
            }
        }).then(res => res.records[0].get('vectorNode').properties)
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