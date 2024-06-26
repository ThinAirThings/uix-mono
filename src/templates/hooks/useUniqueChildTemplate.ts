import { singleNodeTemplate } from "../singleNodeTemplate";



export const useUniqueChildTemplate = () => /*ts*/`
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
    ${singleNodeTemplate(false)}
}
`