import { Driver, EagerResult, Integer, Node } from "neo4j-driver";
import OpenAI from "openai";
import { AnyNodeShape, AnyNodeType, AnyNodeTypeMap, GenericNodeType, GenericNodeTypeMap } from "../types/NodeType";
import { upsertNodeTypeSummary } from "./upsertNodeTypeSummary";
import { upsertPropertyVector } from "./upsertPropertyVector";

export const upsertVectorNode = async (
    neo4jDriver: Driver,
    openaiClient: OpenAI,
    nodeShape: AnyNodeShape,
    nodeTypeDefinition: AnyNodeType
) => {
    // Create Summary in background
    (<GenericNodeType>nodeTypeDefinition).nodeTypeVectorDescription
        && await upsertNodeTypeSummary(neo4jDriver, openaiClient, nodeShape, nodeTypeDefinition)
    // Create Property Vectors
    await Promise.all(
        (<GenericNodeType>nodeTypeDefinition).propertyVectors.map(async propertyVectorKey => await upsertPropertyVector(
            neo4jDriver,
            openaiClient,
            propertyVectorKey,
            nodeShape
        ))
    )
}