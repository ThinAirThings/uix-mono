import { execSync } from 'child_process'
import { TestErr, tryCatch } from '../src/types/Result'
import { createNode } from './uix/generated/functionModule'
import { v4 as uuid } from 'uuid'
import { expect, test } from 'vitest'

test('Integration test', async () => {
    const { data, error } = await tryCatch({
        try: () => execSync('pnpm uix'),
        catch: (e: Error) => TestErr(e)
    })
    // Create Node
    const userNodeResult = await createNode({ nodeType: 'Null', nodeId: '0' }, 'User', {
        email: `${uuid()}@localTest.com`,
        firstName: 'Local',
        lastName: 'Test',
        userType: 'Unspecified',
        completedOnboardingV2: false,
    })

    expect(userNodeResult.data).toBeTruthy()

    const educationNode = await createNode(userNodeResult.data!, 'Education', {
        school: 'RPI',
        graduationYear: 2022,
        description: 'I studied math',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    // Check updates
    // if (userNode.error) fail(userNode.error.message)
})