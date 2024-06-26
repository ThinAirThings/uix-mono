import { execSync } from 'child_process'
import { v4 as uuid } from 'uuid'
import { expect, test } from 'vitest'
import { Err, tryCatch, UixErr, UixErrSubtype } from '../src/types/Result'
import { createNode, deleteNode, getAllOfNodeType, getChildNodeSet, getNodeByIndex, getUniqueChildNode, getVectorNodeByKey, updateNode } from './uix/generated/functionModule'
import { useUniqueChild } from './uix/generated/useUniqueChild'

test('Integration test', async () => {
    const { data: uixData, error: uixError } = await tryCatch({
        try: () => execSync('pnpm uix'),
        catch: (e: Error) => Err({
            type: 'TestErr',
            subtype: 'UixError',
            message: e.message,
            data: { e }
        })
    })
    // Create Node
    const { data: userNode, error: createUserNodeError } = await createNode([{ nodeType: 'Null', nodeId: '0' }], 'User', {
        email: `${uuid()}@localTest.com`,
        firstName: 'Local',
        lastName: 'Test',
        userType: 'Unspecified',
        completedOnboardingV2: false,
    })
    const data = useUniqueChild({
        parentNodeKey: { nodeType: 'User', nodeId: '1' },
        childNodeType: 'Profile'
    })
    if (createUserNodeError) {
        console.error(createUserNodeError.data)
        if (createUserNodeError.subtype === UixErrSubtype.CREATE_NODE_FAILED) {
            console.error(createUserNodeError.data)
        }
        expect(createUserNodeError).toBeFalsy()
        return
    }
    expect(userNode).toBeTruthy()
    const { data: createdEducationNode, error: createEducationNodeError } = await createNode(
        [userNode],
        'Education', {
        school: 'RPI',
        graduationYear: 2022,
        description: 'I studied math',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    const educationNodeSet = Array.from({ length: 5 }).map(async (_, i) => await createNode([userNode], 'Education', {
        school: 'RPI',
        graduationYear: 2022,
        description: 'I studied math',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    }))
    await Promise.all(educationNodeSet)
    expect(createdEducationNode).toBeTruthy()

    if (createEducationNodeError) {
        console.error(createEducationNodeError)
        expect(createEducationNodeError).toBeFalsy()
        return
    }
    expect(createdEducationNode).toBeTruthy()
    const { data: createdEducationVectorNode, error: createEducationVectorNodeError } = await getVectorNodeByKey({ nodeType: `${createdEducationNode.nodeType}Vector`, nodeId: createdEducationNode.nodeId })
    if (createEducationVectorNodeError) {
        console.error(createEducationVectorNodeError)
        expect(createEducationVectorNodeError).toBeFalsy()
        return
    }
    expect(createdEducationVectorNode).toBeTruthy()

    // Check updates
    const { data: updatedEducationNode, error: updateEducationNodeError } = await updateNode(createdEducationNode, {
        school: 'RPI',
        description: 'I studied Basket weaving',
        degree: 'Masters',
        fieldOfStudy: 'Electrical Engineering',
    })
    if (updateEducationNodeError) {
        console.error(updateEducationNodeError)
        expect(updateEducationNodeError).toBeFalsy()
        return
    }
    expect(updatedEducationNode).toBeTruthy()

    const { data: updatedEducationVectorNode, error: updateEducationVectorNodeError } = await getVectorNodeByKey({ nodeType: `${updatedEducationNode.nodeType}Vector`, nodeId: updatedEducationNode.nodeId })
    if (updateEducationVectorNodeError) {
        console.error(updateEducationVectorNodeError)
        expect(updateEducationVectorNodeError).toBeFalsy()
        return
    }
    expect(updatedEducationVectorNode).toBeTruthy()
    expect(createdEducationVectorNode.description![0]).not.toEqual(updatedEducationVectorNode.description![0])


    // Check getAllNodeType
    const { data: allEducationNodes, error: getAllEducationNodesError } = await getAllOfNodeType('Education', {
        limit: 4
    })
    if (getAllEducationNodesError) {
        console.error(getAllEducationNodesError)
        expect(getAllEducationNodesError).toBeFalsy()
        return
    }

    expect(allEducationNodes).toBeTruthy()
    expect(allEducationNodes.length).toBe(4)

    // Check getChildNodeSEt
    const { data: childEducationNodes, error: getChildEducationNodesError } = await getChildNodeSet(userNode, 'Education')
    if (getChildEducationNodesError) {
        console.error(getChildEducationNodesError)
        expect(getChildEducationNodesError).toBeFalsy()
        return
    }
    expect(childEducationNodes).toBeTruthy()
    expect(childEducationNodes.length).toBeGreaterThan(0)
    // childEducationNodes[0] // Type test
    // Check getUniqueChildNode
    const { data: workPreferenceNode, error: getUniqueProfileNodeError } = await getUniqueChildNode(userNode, 'Profile')
    if (getUniqueProfileNodeError) {
        console.error(getUniqueProfileNodeError)
        expect(getUniqueProfileNodeError).toBeFalsy()
        return
    }
    expect(workPreferenceNode).toBeTruthy()

    // Check getNodeByIndex
    const { data: userNodeByIndex, error: getUserNodeByIndexError } = await getNodeByIndex('User', 'email', userNode.email)
    if (getUserNodeByIndexError) {
        console.error(getUserNodeByIndexError)
        expect(getUserNodeByIndexError).toBeFalsy()
        return
    }
    expect(userNodeByIndex).toBeTruthy()
    // Check deleteNode
    const { data: deleted, error: deleteError } = await deleteNode(userNodeByIndex)
    if (deleteError) {
        console.error(deleteError)
        expect(deleteError).toBeFalsy()
        return
    }
    expect(deleted).toBeTruthy()
})