import { execSync } from 'child_process'
import { TestErr, tryCatch } from '../src/types/Result'
import { createNode, updateNode, getNodeByKey, getVectorNodeByKey, getAllOfNodeType, getChildNodeSet, getUniqueChildNode, getNodeByIndex, deleteNode } from './uix/generated/functionModule'
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
    const userNode = userNodeResult.data!
    const originalEducationNode = await createNode(
        userNode,
        'Education', {
        school: 'RPI',
        graduationYear: 2022,
        description: 'I studied math',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    const originalEducationVectorNode = await getVectorNodeByKey({ nodeType: `${originalEducationNode.data!.nodeType}Vector`, nodeId: originalEducationNode.data!.nodeId })
    expect(originalEducationVectorNode.data).toBeTruthy()
    expect(originalEducationNode.data).toBeTruthy()

    // Check updates
    const updatedEducationNode = await updateNode(originalEducationNode.data!, {
        school: 'RPI',
        description: 'I studied Basket weaving',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    const updatedEducationVectorNode = await getVectorNodeByKey({ nodeType: `${updatedEducationNode.data!.nodeType}Vector`, nodeId: updatedEducationNode.data!.nodeId })
    expect(updatedEducationNode.data).toBeTruthy()
    expect(updatedEducationVectorNode.data).toBeTruthy()
    expect(originalEducationVectorNode.data!.description![0]).not.toEqual(updatedEducationVectorNode.data!.description![0])

    // Check getAllNodeType
    const allEducationNodes = await getAllOfNodeType('Education')
    expect(allEducationNodes.data).toBeTruthy()
    expect(allEducationNodes.data!.length).toBeGreaterThan(0)

    // Check getChildNodeSEt
    const childNodes = await getChildNodeSet(userNode, 'Education')
    expect(childNodes.data).toBeTruthy()
    expect(childNodes.data!.length).toBeGreaterThan(0)
    // childNodes.data![0] // Type test
    // Check getUniqueChildNode
    const workPreferenceNode = await getUniqueChildNode(userNode, 'Profile')
    expect(workPreferenceNode.data).toBeTruthy()
    // Check getNodeByIndex
    const userNodeFromIndex = await getNodeByIndex('User', 'email', userNode.email)
    expect(userNodeFromIndex.data).toBeTruthy()
    // Check deleteNode
    const deleteResult = await deleteNode(userNodeFromIndex.data!)
    expect(deleteResult.data).toBeTruthy()

})