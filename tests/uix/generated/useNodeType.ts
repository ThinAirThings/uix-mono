
import {
    NodeShape,
} from '@thinairthings/uix'
import { ConfiguredNodeTypeMap } from './staticObjects'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { NodeTypeQueryOptions } from './queryOptions'

export const useNodeType = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>[],
>({
    nodeType,
    options,
    select
}: {
    nodeType: NodeType
    options?: {
        limit?: number
        page?: number
        orderBy?: 'updatedAt' | 'createdAt';
        orderDirection?: 'ASC' | 'DESC';
    }
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>[]) => Data
}) => {
    const queryOptions = NodeTypeQueryOptions({nodeType, options, select})
    const queryClient = useQueryClient()
    const { data, error } = useQuery(queryOptions)
    return { data, error }
}
