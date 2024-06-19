import { GenericUixConfig } from "../../../config/defineConfig";



export const functionModuleTemplate = (config: GenericUixConfig) => {
    return /* ts */`
'use server'
// Start of File
import uixConfig from '${config.pathToConfig.replace('uix.config.ts', 'uix.config')}'
import {
    createNodeFactory, 
    updateNodeFactory, 
    deleteNodeFactory, 
    getNodeByKeyFactory, 
    getVectorNodeByKeyFactory,
    getAllOfNodeTypeFactory,
    getChildNodeSetFactory,
    getUniqueChildNodeFactory,
    getNodeByIndexFactory
} from '@thinairthings/uix'
import neo4j from 'neo4j-driver'
import OpenAI from 'openai'

const driver = neo4j.driver(
    uixConfig.neo4jConfig.uri, 
    neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
)
const openaiClient = new OpenAI({
    apiKey: uixConfig.openaiConfig.apiKey
})
export const createNode = createNodeFactory(driver, openaiClient, uixConfig.graph.nodeTypeMap)
export const updateNode = updateNodeFactory(driver, openaiClient, uixConfig.graph.nodeTypeMap)
export const deleteNode = deleteNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const getNodeByKey = getNodeByKeyFactory(driver, uixConfig.graph.nodeTypeMap)
export const getVectorNodeByKey = getVectorNodeByKeyFactory(driver, uixConfig.graph.nodeTypeMap)
export const getAllOfNodeType = getAllOfNodeTypeFactory(driver, uixConfig.graph.nodeTypeMap)
export const getChildNodeSet = getChildNodeSetFactory(driver, uixConfig.graph.nodeTypeMap)
export const getUniqueChildNode = getUniqueChildNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const getNodeByIndex = getNodeByIndexFactory(driver, uixConfig.graph.nodeTypeMap)

export type ConfiguredNodeTypeMap = typeof uixConfig.graph.nodeTypeMap

`}