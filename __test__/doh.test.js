const DoH = require('../src/index').DoH

describe('Test DNS-over-HTTPS client', () => {
  let doh = new DoH('ali1')
  let tests = [
    {
      domainName: 'www.baidu.com',
      domainType: 'A'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'AAAA'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'CNAME'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'DS'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'DNSKEY'
    }, {
      domainName: 'mail.qq.com',
      domainType: 'MX'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'NS'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'NSEC'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'NSEC3'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'RRSIG'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'SOA'
    }, {
      domainName: 'www.baidu.com',
      domainType: 'TXT'
    }
    // Seems cleanbrowsing doesn't support caa query
    // {
    //   domainName: 'example.com',
    //   domainType: 'CAA'
    // }
  ]

  test('initialize doh', () => {
    expect(doh.provider).toBe('ali1')
    doh.setProvider('dnspod')
    expect(doh.provider).toBe('dnspod')
  })

  test('fetch dns over https through ali1, ali2, dnspod and dnspod2', async (done) => {
    let totalTests = tests.length
    let isOk = true
    for (let i=0; i<totalTests; i++) {
      const dnsTest = tests[i]
      doh.setProvider('ali1')
      expect(doh.provider).toBe('ali1')
      try {
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('ali2')
        expect(doh.provider).toBe('ali2')
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('dnspod')
        expect(doh.provider).toBe('dnspod')
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('dnspod2')
        expect(doh.provider).toBe('dnspod2')
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
      } catch (err) {
        isOk = false
        done.fail(err)
        break
      }
    }
    if (isOk === true) {
      done()
    }
  }, 120000)
})
