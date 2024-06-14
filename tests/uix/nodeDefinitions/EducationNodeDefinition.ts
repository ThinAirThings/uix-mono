import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";



export const EducationNodeDefinition = defineNodeType('Education', z.object({
    school: z.string(),
    degree: z.enum(['degree1', 'degree2']).optional(),
    fieldOfStudy: z.enum(['basket weaving', 'picnic having']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
}))
