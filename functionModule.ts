import uixConfig from "./tests/uix/uix.config.js";
import { createNodeFactory, updateNodeFactory, deleteNodeFactory, getNodeByKeyFactory } from "@thinairthings/uix";
import neo4j from "neo4j-driver";
import OpenAI from "openai";

const driver = // Initialize Neo4j Driver
    neo4j.driver({
        uixConfig.neo4jConfig.uri,
        neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
    };
const openaiClient;
export const createNode = createNodeFactory(driver, uixConfig.graph.nodeTypeMap);
export const updateNode = updateNodeFactory(driver, uixConfig.graph.nodeTypeMap);
export const deleteNode = deleteNodeFactory(driver, uixConfig.graph.nodeTypeMap);
export const getNodeByKey = getNodeByKeyFactory(driver, uixConfig.graph.nodeTypeMap);
// Hello
