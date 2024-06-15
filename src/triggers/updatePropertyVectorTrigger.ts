import { openAIAction } from "../clients/openai";




export const updatePropertyVectorTrigger = openAIAction(async ({
    nodeType,
    propertyVectorKey,
    propertyValue
}: {
    nodeType: Capitalize<string>,
    propertyVectorKey: string
    propertyValue: string
}) => {
    return {
        nodeType,
        propertyVectorKey,
        propertyValue
    }
})