import { TypeOf, z } from "zod";
import { ProfileNodeDefinition } from "./ProfileNodeDefinition";
import { EducationNodeDefinition } from "./EducationNodeDefinition";
import { WorkExperienceNodeDefinition } from "./WorkExperienceNodeDefinition";
import { WorkPreferenceNodeDefinition } from "./WorkPreferenceNodeDefinition";
import { defineNodeType } from "@thinairthings/uix";

export const UserNodeDefinition = defineNodeType('User', z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    userType: z.enum(['Employer', 'Candidate', 'Unspecified']).catch('Unspecified'),
    completedOnboardingV2: z.boolean().catch(false),
    phoneNumber: z.string().min(10, { message: 'Phone number is required' }).optional(),
    profileImageUrl: z.string().optional(),
}))
    .defineUniqueIndexes(['email'])
    .defineSetRelationship(EducationNodeDefinition)
    .defineSetRelationship(WorkExperienceNodeDefinition)
    .defineUniqueRelationship(ProfileNodeDefinition)
    .defineUniqueRelationship(WorkPreferenceNodeDefinition)

export type UserRoleType = TypeOf<typeof UserNodeDefinition['stateSchema']>

