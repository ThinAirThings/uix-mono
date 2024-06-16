import { GenericUixConfig } from "../../../config/defineConfig";



export const functionModuleTemplate = (config: GenericUixConfig) => {
    return /* ts */`
// Start of File
import uixConfig from '${config.pathToConfig.replace('uix.config.ts', 'uix.config')}'
import {createNodeFactory, updateNodeFactory, deleteNodeFactory, getNodeByKeyFactory} from '@thinairthings/uix'
import neo4j from 'neo4j-driver'
import OpenAI from 'openai'
const driver = neo4j.driver(
    uixConfig.neo4jConfig.uri, 
    neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
)
const openaiClient = new OpenAI({
    apiKey: uixConfig.openaiConfig.apiKey
})
export const createNode = createNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const updateNode = updateNodeFactory(driver, openaiClient, uixConfig.graph.nodeTypeMap)
export const deleteNode = deleteNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const getNodeByKey = getNodeByKeyFactory(driver, uixConfig.graph.nodeTypeMap)
`}