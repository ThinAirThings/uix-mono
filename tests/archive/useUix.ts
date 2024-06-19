
import { QueryClient, queryOptions, useQuery } from '@tanstack/react-query'
import {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey,
    ConfiguredNodeTypeMap
} from '../uix/generated/functionModule'
import { UniqueChildNodeTypes, UniqueParentTypes, NodeKey, NodeShape, NodeSetParentTypes, NodeSetChildNodeTypes, AnyResult, ParentOfNodeSetTypes } from '@thinairthings/uix'

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

class Node<
    ParentNodeType extends NodeSetParentTypes<ConfiguredNodeTypeMap> | UniqueParentTypes<ConfiguredNodeTypeMap>,
> {
    constructor(
        public parentNode: NodeShape<ConfiguredNodeTypeMap[ParentNodeType]>
    ) { }
    async getChildNodeSet<
        NodeType extends NodeSetChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>
    >(
        nodeType: NodeType
    ) {
        const { error, data } = await getChildNodeSet(this.parentNode, nodeType)
        if (error) return
        return new Node(data)
    }
    async getUniqueChildNode<
        NodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>
    >(
        nodeType: NodeType
    ) {
        const childNode = await getUniqueChildNode(this.data, nodeType)
        return new Node()
    }
}

const childNode = useUniqueChild({ nodeType: 'User', 'nodeId': '123' }, 'Profile')


export const useUix = <
    R,
    Args extends any[]
>(
    uixFn: (uixFns: {
        getUniqueChildNode: typeof getUniqueChildNode,
        getChildNodeSet: typeof getChildNodeSet,
        getAllOfNodeType: typeof getAllOfNodeType,
        getVectorNodeByKey: typeof getVectorNodeByKey,
        getNodeByKey: typeof getNodeByKey
    }) => Promise<R>,
    args: Args
) => {
    return useQuery({
        queryKey: [...args] as const,
        queryFn: async () => {
            // const {data, error} = await uixFn({
            //     getUniqueChildNode,
            //     getChildNodeSet,
            //     getAllOfNodeType,
            //     getVectorNodeByKey,
            //     getNodeByKey
            // }) as AnyResult
            // if (error) throw new Error(error.message)
            // return data 
            return uixFn({
                getUniqueChildNode,
                getChildNodeSet,
                getAllOfNodeType,
                getVectorNodeByKey,
                getNodeByKey
            })
        }
    })
}

const queryClient = new QueryClient()

const getUniqueChildQueryAction = (nodeType: string, nodeId: string, childNodeType: string) => { }

const val = useUix(async ({ getUniqueChildNode }) => {
    return await getUniqueChildNode({ nodeType: 'User', nodeId: '123' }, 'Profile')
}, [{ nodeType: 'User', nodeId: '123' }, 'Profile'])

// val.data?.data.
// export const useUix = <
//     QueryType extends 'uniqueChild' | 'nodeSet',
//     Params extends QueryType extends 'uniqueChild'
//         ? [UniqueParentTypes<ConfiguredNodeTypeMap>, UniqueChildNodeTypes<ConfiguredNodeTypeMap, Params[0]>]
//         : QueryType extends 'nodeSet'
//             ? [NodeSetParentTypes<ConfiguredNodeTypeMap>, NodeSetChildNodeTypes<ConfiguredNodeTypeMap, Params[0]>]
//             : never
//     // G1 extends QueryType extends 'uniqueChild'
//     // ? UniqueParentTypes<ConfiguredNodeTypeMap>
//     // : QueryType extends 'nodeSet'
//     // ? NodeSetParentTypes<ConfiguredNodeTypeMap>
//     // : never,
//     // G2 extends QueryType extends 'uniqueChild'
//     // ? UniqueChildNodeTypes<ConfiguredNodeTypeMap, G1>
//     // : QueryType extends 'nodeSet'
//     // ? NodeSetChildNodeTypes<ConfiguredNodeTypeMap, G1>
//     // : never
// >(
//     queryType: QueryType,
//     ...params: Params
//     // parentNodeKey: NodeKey<ConfiguredNodeTypeMap, G1>,
//     // childNodeType: G2
// ) => {
//     const options = queryType === 'uniqueChild'
//         ? useUniqueChild(parentNodeKey, childNodeType)
//         : queryType === 'nodeSet'
//             ? queryOptions({
//                 queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
//                 queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
//                     const result = await getChildNodeSet({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
//                     if (result.error) throw new Error(result.error.message)
//                     return result.data
//                 }
//             })
//             : null as never
//     return useQuery(options)
// }
// const val = useUix('uniqueChild', { nodeType: 'User', 'nodeId': '123' }, 'Profile')

// val.data



