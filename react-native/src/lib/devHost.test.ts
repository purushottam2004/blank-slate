import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { rewriteLocalHostForPlatform } from './devHost.ts'

describe('rewriteLocalHostForPlatform', () => {
  it('rewrites loopback hosts on Android', () => {
    assert.equal(
      rewriteLocalHostForPlatform('http://127.0.0.1:8080', 'android'),
      'http://10.0.2.2:8080',
    )
    assert.equal(
      rewriteLocalHostForPlatform('http://localhost:54321/', 'android'),
      'http://10.0.2.2:54321',
    )
  })

  it('leaves loopback hosts on iOS and web', () => {
    assert.equal(
      rewriteLocalHostForPlatform('http://127.0.0.1:8080', 'ios'),
      'http://127.0.0.1:8080',
    )
    assert.equal(
      rewriteLocalHostForPlatform('http://127.0.0.1:54321', 'web'),
      'http://127.0.0.1:54321',
    )
  })

  it('leaves a LAN address on Android', () => {
    assert.equal(
      rewriteLocalHostForPlatform('http://192.168.1.20:8080', 'android'),
      'http://192.168.1.20:8080',
    )
  })
})
