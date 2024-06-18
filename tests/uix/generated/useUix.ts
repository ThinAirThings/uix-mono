
import { queryOptions, queryOptions, queryOptions, queryOptions, useQuery } from '@tanstack/react-query'
import {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey,
    ConfiguredNodeTypeMap
} from './functionModule'
import { UniqueChildNodeTypes, UniqueParentTypes, NodeKey, NodeShape, NodeSetParentTypes, NodeSetChildNodeTypes } from '@thinairthings/uix'

const fnMap = {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey
} as const

export const useUniqueChild = <
    ParentNodeType extends UniqueParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
>(
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType
) => useQuery({
    queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
    queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
        const result = await getUniqueChildNode({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
        if (result.error) throw new Error(result.error.message)
        return result.data
    }
})


const childNode = useUniqueChild({ nodeType: 'User', 'nodeId': '123' }, 'Profile')

enum QueryTypes {
    uniqueChild = 'uniqueChild',
    nodeSet = 'nodeSet'
}

export const useUix = <
    QueryType extends 'uniqueChild' | 'nodeSet',
    G1 extends QueryType extends 'uniqueChild'
    ? UniqueParentTypes<ConfiguredNodeTypeMap>
    : QueryType extends 'nodeSet'
    ? NodeSetParentTypes<ConfiguredNodeTypeMap>
    : never,
    G2 extends QueryType extends 'uniqueChild'
    ? UniqueChildNodeTypes<ConfiguredNodeTypeMap, G1>
    : QueryType extends 'nodeSet'
    ? NodeSetChildNodeTypes<ConfiguredNodeTypeMap, G1>
    : never
>(
    queryType: QueryType,
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, G1>,
    childNodeType: G2
) => {
    const options = queryType === 'uniqueChild'
        ? queryOptions({
            queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
            queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
                const result = await getUniqueChildNode({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
                if (result.error) throw new Error(result.error.message)
                return result.data
            }
        })
        : queryType === 'nodeSet'
            ? queryOptions({
                queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
                queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
                    const result = await getChildNodeSet({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
                    if (result.error) throw new Error(result.error.message)
                    return result.data
                }
            })
            : null as never
    return useQuery(options)
}
const val = useUix('uniqueChild', { nodeType: 'User', 'nodeId': '123' }, 'Profile')
