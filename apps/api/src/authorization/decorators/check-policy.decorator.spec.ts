import { SetMetadata } from '@nestjs/common'
import { Action, Subject } from '@repo/authorization'
import { CHECK_POLICY, CheckPolicy } from './check-policy.decorator'

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}))

describe('CheckPolicy', () => {
  it('creates metadata with action and subject', () => {
    const decorator = Symbol('decorator')
    const setMetadataMock = SetMetadata as jest.Mock
    setMetadataMock.mockReturnValue(decorator)

    const result = CheckPolicy(Action.Manage, Subject.Tournament)

    expect(SetMetadata).toHaveBeenCalledWith(CHECK_POLICY, {
      action: Action.Manage,
      subject: Subject.Tournament,
    })
    expect(result).toBe(decorator)
  })
})
