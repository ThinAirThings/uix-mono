import { singleNodeTemplate } from "../singleNodeTemplate";


export const useNodeKeyTemplate = () => /*ts*/`
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NodeKeyQueryOptions } from "./queryOptions";
import { ConfiguredNodeTypeMap } from "./staticObjects";
import {
    NodeKey,
    NodeShape,
    NodeState
} from '@thinairthings/uix'
import { produce, Draft } from "immer";
import { updateNode, deleteNode } from "./functionModule";
import { useEffect, useRef } from "react";

export const useNodeKey = <
    NodeType extends keyof ConfiguredNodeTypeMap,
    Data = NodeShape<ConfiguredNodeTypeMap[NodeType]>,
>({
    nodeKey,
    select
}:{    
    nodeKey: NodeKey<ConfiguredNodeTypeMap, NodeType>,
    select?: (data: NodeShape<ConfiguredNodeTypeMap[NodeType]>) => Data
}) => {
    const queryOptions = NodeKeyQueryOptions({nodeKey, select})
    const queryClient = useQueryClient()
    const { data, error } = useQuery(queryOptions)
    ${singleNodeTemplate(true)}
}
`