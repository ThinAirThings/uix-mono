import { Driver } from "neo4j-driver";
import OpenAI from "openai";
import { GenericNodeShape, GenericNodeType } from "../types/NodeType";
import { createNodeTypeSummary } from "./createNodeTypeSummary";

export const createVectorNode = async (
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    nodeShape: GenericNodeShape,
    nodeDefinition: GenericNodeType
) => {
    // Create Summary in background
    createNodeTypeSummary(openaiClient, neo4jDriver, nodeShape, nodeDefinition)
    // Create Embeddings
    const embeddings = await openaiClient.embeddings.create({
        model: 'text-embedding-3-large',
        inputs: [
            nodeShape[nodeDefinition.],
        ]
    }).then(res => res.data.map(d => d.embedding))
}