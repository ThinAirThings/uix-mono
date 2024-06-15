
// Start of File
import uixConfig from '/home/aircraft/create/Hirebird/hirebird.v.2/hb.monorepo/packages/uix/tests/uix/uix.config'
import {createNodeFactory, updateNodeFactory, deleteNodeFactory, getNodeByKeyFactory} from '@thinairthings/uix'
import neo4j from 'neo4j-driver'
const driver = neo4j.driver(
    uixConfig.neo4jConfig.uri, 
    neo4j.auth.basic(uixConfig.neo4jConfig.username, uixConfig.neo4jConfig.password)
)
export const createNode = createNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const updateNode = updateNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const deleteNode = deleteNodeFactory(driver, uixConfig.graph.nodeTypeMap)
export const getNodeByKey = getNodeByKeyFactory(driver, uixConfig.graph.nodeTypeMap)
// Hello
