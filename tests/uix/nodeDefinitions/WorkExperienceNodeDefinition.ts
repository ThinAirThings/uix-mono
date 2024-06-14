import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";



export const WorkExperienceNodeDefinition = defineNodeType('WorkExperience', z.object({
    companyName: z.string(),
    title: z.string(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    currentlyHere: z.boolean().optional()
}))