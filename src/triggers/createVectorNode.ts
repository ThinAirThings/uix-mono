import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import OpenAI from "openai";
import { AnyNodeShape, AnyNodeType, GenericNodeShape, GenericNodeType } from "../types/NodeType";
import { createNodeTypeSummary } from "./createNodeTypeSummary";
import { updateVectorNode } from "./updateVectorNode";

export const createVectorNode = async (
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    nodeShape: AnyNodeShape,
    nodeDefinition: AnyNodeType
) => {
    // Create Summary in background
    await createNodeTypeSummary(openaiClient, neo4jDriver, nodeShape, nodeDefinition)
    // Create Property Vectors
    await Promise.all(
        nodeDefinition.propertyVectors.map(async propertyVectorKey => await updateVectorNode(
            neo4jDriver,
            openaiClient,
            propertyVectorKey,
            nodeShape
        ))
    )
}