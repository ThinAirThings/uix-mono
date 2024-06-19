import { ConfiguredNodeTypeMap, getChildNodeSet, getUniqueChildNode } from "../uix/generated/functionModule";
import React, { FC, ReactNode } from "react";
import { NodeShape } from "@thinairthings/uix";
import { useQuery } from "@tanstack/react-query";


export const useUixTuple = <
    NodeType extends keyof ConfiguredNodeTypeMap
>(tuple: [
    NodeType
]) => {

}




// export const EducationNode:FC<{
//     Component: FC<{
//         educationNode: NodeShape<ConfiguredNodeTypeMap['Education']>
//     }>
// }> = ({
//     Component
// }) => {

//     return (
//         <Component educationNode={{}} />
//     )
// }



export const EducationNodeSet = <
    R = NodeShape<ConfiguredNodeTypeMap['Education']>
    ,>({
        children,
        selector
    }: {
        selector?: (node: NonNullable<Awaited<ReturnType<typeof getChildNodeSet<'User', 'Education'>>>['data']>) => R
        children: ({ data }: { data: NonNullable<R> }) => ReactNode
    }) => {
    const { data, error } = useQuery({
        queryKey: ['Education', '123'],
        queryFn: async () => {
            const { data, error } = await getChildNodeSet({ nodeType: 'User', nodeId: '123' }, 'Education')
            if (error) throw new Error(error.message)
            return data
        },
        select: selector
    })
    if (!data) return null
    const Component = children
    return (
        <Component data={data} />
    )
}

const App = () => {
    return (
        <EducationNodeSet
            selector={(node) => node.filter((node) => node.degree === 'Bachelor\'s Degreee')}
        >
            {({ data }) => {
                return <>
                    {data.map((node) => {
                        return <div>{node.degree}</div>
                    })}
                </>
            }}
        </EducationNodeSet>
    )
}