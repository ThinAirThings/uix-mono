import { execSync } from 'child_process'
import { BasicErr, tryCatch } from '../src/types/Result'


describe('Main Test', () => {
    test('Integration test', async () => {
        const { data, error } = await tryCatch({
            try: () => execSync('pnpm uix'),
            catch: (e: Error) => BasicErr({
                code: 'CommandFailed',
                message: e.message
            })

        })
        if (error) fail(error.message)
        expect(data.toString()).toContain('Success')

    })
})