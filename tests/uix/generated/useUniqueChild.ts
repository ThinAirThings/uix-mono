
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    UniqueChildNodeTypes,
    UniqueParentTypes,
    NodeKey,
    NodeShape,
    NodeState
} from '@thinairthings/uix'
import {
    ConfiguredNodeTypeMap
} from './staticObjects'
import {
    UniqueChildQueryOptions
} from './queryOptions'
import { produce, Draft } from 'immer'
import { updateNode, deleteNode } from "./functionModule";
import { useEffect, useRef } from 'react'

export const useUniqueChild = <
    ParentNodeType extends UniqueParentTypes<ConfiguredNodeTypeMap>,
    NodeType extends UniqueChildNodeTypes<ConfiguredNodeTypeMap, ParentNodeType>,
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>,
>({
    parentNodeKey,
    childNodeType,
    select
}: {    
    parentNodeKey: NodeKey<ConfiguredNodeTypeMap, ParentNodeType>,
    childNodeType: NodeType,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>) => Data
}) => {
    const queryOptions = UniqueChildQueryOptions({parentNodeKey, childNodeType, select})
    const queryClient = useQueryClient()
    const { data, error } = useQuery(queryOptions)
    
    const setData = (
        newData: 
        | Partial<NodeState<ConfiguredNodeTypeMap[NodeType]>> 
        | ((draft: Draft<NodeState<ConfiguredNodeTypeMap[NodeType]>>) => void)
    ) => {
        if (typeof newData === 'function') {
            queryClient.setQueryData(queryOptions.queryKey, oldData => produce(oldData, newData))
        } else {
            queryClient.setQueryData(queryOptions.queryKey, oldData => {
                if (!oldData) return
                return produce(oldData, draft => {
                    Object.assign(draft, newData)
                })
            })
        }
    }
    const updateMutation = useMutation({
        mutationFn: async (inputData: Partial<NodeState<ConfiguredNodeTypeMap[NodeType]>>) => {
            const currentNodeData = queryClient.getQueryData(queryOptions.queryKey)
            if (!currentNodeData) return
            console.log("Running Mutation: ", 'updateNode({ nodeType: ' + currentNodeData.nodeType + 'nodeId: ' + currentNodeData.nodeId + inputData)
            return await updateNode({ nodeType: currentNodeData.nodeType, nodeId: currentNodeData.nodeId }, inputData)
        },
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: queryOptions.queryKey })
            const previousData = queryClient.getQueryData(queryOptions.queryKey)
            queryClient.setQueryData(queryOptions.queryKey, (oldData) => {
                if (!oldData) return
                return produce(oldData, draftData => {
                    Object.assign(draftData, data)
                })
            })
            return { previousData }
        },
        onError: (err, newData, context) => {
            queryClient.setQueryData(queryOptions.queryKey, context?.previousData)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryOptions.queryKey
            })
        }
    })
    
    const useMutateOnDismount = () => {
        const initialDataRef = useRef(queryClient.getQueryData(queryOptions.queryKey))
        useEffect(() => {
            queryClient.setQueryDefaults(queryOptions.queryKey, { enabled: false })
            return () => {
                const didChange = !initialDataRef.current || initialDataRef.current !== produce(initialDataRef.current, draftData => {
                    Object.assign(draftData, queryClient.getQueryData(queryOptions.queryKey))
                })
                didChange && updateMutation.mutate(queryClient.getQueryData(queryOptions.queryKey)!, {
                    onSettled: () => queryClient.setQueryDefaults(queryOptions.queryKey, { enabled: true })
                })
            }
        }, [])
    }
    return {
        data,
        error,
        updateMutation,
        
        setData,
        useMutateOnDismount
    }

}
