import { openAIAction } from "../clients/openai";
import { Ok } from "../types/Result";




export const updatePropertyVectorTrigger = openAIAction(async ({
    nodeType,
    propertyVectorKey,
    propertyValue
}: {
    nodeType: Capitalize<string>,
    propertyVectorKey: string
    propertyValue: string
}) => {
    return Ok({
        nodeType,
        propertyVectorKey,
        propertyValue
    })
})