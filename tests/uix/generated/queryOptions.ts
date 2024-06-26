
import { queryOptions } from '@tanstack/react-query'
import {
    getUniqueChildNode,
    getChildNodeSet,
    getAllOfNodeType,
    getVectorNodeByKey,
    getNodeByKey,
    getNodeByIndex
} from './functionModule'

import {
    ConfiguredNodeTypeMap
} from './staticObjects'

import { 
    UniqueChildNodeTypes, 
    UniqueParentTypes, 
    NodeKey, 
    NodeSetParentTypes, 
    NodeSetChildNodeTypes, 
    VectorKeys,
    NodeShape,
    VectorNodeShape,
    TypeFromVectorType,
    QueryError
} from '@thinairthings/uix'

// Unique Child Query
export const UniqueChildQueryOptions = <
    ParentNodeType extends UniqueParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
    Data = NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>,
>({
    parentNodeKey,
    childNodeType,
    select
}:{
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>) => Data
}) => queryOptions({
    queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
    queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
        const result = await getUniqueChildNode({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
        if (result.error) throw new QueryError(result.error)
        return result.data
    },
    select
})

export const NodeSetQueryOptions = <
    ParentNodeType extends NodeSetParentTypes<ConfiguredNodeTypeMap>,
    ChildNodeType extends NodeSetChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
    Data = NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>[],
>({
    parentNodeKey,
    childNodeType,
    select
}:{
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: ChildNodeType,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[ChildNodeType]>[]) => Data
}) => queryOptions({
    queryKey: [parentNodeKey.nodeType, parentNodeKey.nodeId, childNodeType] as const,
    queryFn: async ({ queryKey: [parentNodeType, parentNodeId, childNodeType] }) => {
        const result = await getChildNodeSet({ nodeType: parentNodeType, nodeId: parentNodeId }, childNodeType)
        if (result.error) throw new QueryError(result.error)
        return result.data
    },
    select
})

export const NodeTypeQueryOptions = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>[],
>({
    nodeType,
    options,
    select
}:{
    nodeType: NodeType,
    options?: {
        limit?: number
        page?: number
        orderBy?: 'updatedAt' | 'createdAt';
        orderDirection?: 'ASC' | 'DESC';
    }
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>[]) => Data
}) => queryOptions({
    queryKey: [nodeType] as const,
    queryFn: async ({ queryKey: [nodeType] }) => {
        const result = await getAllOfNodeType(nodeType, options)
        if (result.error) throw new QueryError(result.error)
        return result.data
    },
    select
})

export const NodeKeyQueryOptions = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>,
>({
    nodeKey,
    select
}:{
    nodeKey: NodeKey<ConfiguredNodeTypeMap, NodeType>,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>) => Data
}) => queryOptions({
    queryKey: [nodeKey.nodeType, nodeKey.nodeId] as const,
    queryFn: async ({ queryKey: [nodeType, nodeId] }) => {
        const result = await getNodeByKey({ nodeType, nodeId })
        if (result.error) throw new QueryError(result.error)
        return result.data
    },
    select
})

export const VectorNodeKeyQueryOptions = <
    NodeType extends VectorKeys<ConfiguredNodeTypeMap>,
    Data = VectorNodeShape<ConfiguredNodeTypeMap[TypeFromVectorType<ConfiguredNodeTypeMap, NodeType>]>,
>({
    nodeKey,
    select
}:{
    nodeKey: NodeKey<ConfiguredNodeTypeMap, NodeType>,
    select?: (data: VectorNodeShape<ConfiguredNodeTypeMap[TypeFromVectorType<ConfiguredNodeTypeMap, NodeType>]>) => Data
}) => queryOptions({
    queryKey: [nodeKey.nodeType, nodeKey.nodeId] as const,
    queryFn: async ({ queryKey: [nodeType, nodeId] }) => {
        const result = await getVectorNodeByKey({ nodeType, nodeId })
        if (result.error) throw new QueryError(result.error)
        return result.data
    },
    select
})

export const NodeIndexQueryOptions = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    UniqueIndex extends ConfiguredNodeTypeMap[NodeType]['uniqueIndexes'][number],
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>,
>({
    nodeType,
    indexKey,
    indexValue,
    select
}:{
    nodeType: NodeType,
    indexKey: UniqueIndex,
    indexValue: string,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>) => Data
}) => queryOptions({
    queryKey: [nodeType, indexKey, indexValue] as const,
    queryFn: async ({ queryKey: [nodeType, indexKey, indexValue] }) => {
        const result = await getNodeByIndex(nodeType, indexKey, indexValue)
        if (result.error) throw new QueryError(result.error)
        return result.data
    },
    select
})
