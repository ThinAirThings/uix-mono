import { defineNodeType } from "@thinairthings/uix";
import { z } from "zod";

export const industries = [
    'Driver and Delivery',
    'Kitchen Porter',
    'Chef and Cook',
    'Waiters',
    'Host and Hostess',
    'Barista',
    'Bar Staff',
    'Entertainment',
    'Customer Service',
    'Security',
    'Child Care',
    'Office and Admin',
    'Sales and Marketing',
    'Accounting and Finance',
    'Legal',
    'Management',
    'Retail',
    'Warehouse',
    'Events and Promotion',
    'Information Technology',
    'Online Jobs',
    'Writing and Editing',
    'Education',
    'Construction and Trades',
    'Engineering',
    'Manufacturing',
    'Healthcare',
    'Science',
    'Animal Care',
    'Salon and Beauty',
    'Art, Media, Design',
    'Fashion',
    'Sports and Wellness',
    'Other'
] as const

export const WorkPreferenceNodeDefinition = defineNodeType('WorkPreference', z.object({
    industryPreferenceSet: z.enum(industries).catch('Entertainment').array(),
    workPreferenceSet: z.enum(['Remote', 'Onsite', 'Hybrid']).catch('Onsite').array(),
    positionTypePreferenceSet: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship']).catch('Full-Time').array(),
}))

