import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";



export const EducationNodeDefinition = defineNodeType('Education', z.object({
    school: z.string(),
    degree: z.enum([`Bachelor's Degreee`, `Masters`]).optional(),
    fieldOfStudy: z.enum(['Biology', 'Electrical Engineering']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
}))
    .defineNodeTypeVectorDescription({
        type: 'person',
        description: 'A type representing a the type of person that would have this education.'
    })
    .definePropertyVector(['description'])
