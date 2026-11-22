import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatDay, localDate, shiftDate } from './localDate.ts'

describe('localDate', () => {
  it('uses the device calendar, not UTC', () => {
    const evening = new Date(2026, 10, 22, 1, 0, 0)
    assert.equal(localDate(evening), '2026-11-22')
  })

  it('shifts within the local calendar', () => {
    assert.equal(shiftDate('2026-11-22', 1), '2026-11-23')
    assert.equal(shiftDate('2026-11-01', -1), '2026-10-31')
  })

  it('labels today', () => {
    const now = new Date(2026, 10, 22, 9, 0, 0)
    assert.equal(formatDay('2026-11-22', now), 'Today')
    assert.match(formatDay('2026-11-21', now), /Nov/)
  })
})
