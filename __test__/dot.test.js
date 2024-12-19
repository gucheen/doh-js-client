const DoT = require('../src/index').DoT

describe('Test DNS-over-TLS client', () => {
  let dot = new DoT('ali1', './__test__/key.pem', './__test__/certificate.pem')
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

  test('initialize dot', () => {
    expect(dot.provider).toBe('ali1')
    dot.setProvider('dnspod')
    expect(dot.provider).toBe('dnspod')
  })

  test('fetch dns over tls through ali1, ali2, dnspod and dnspod2', async (done) => {
    let totalTests = tests.length
    let isOk = true
    for (let i=0; i<totalTests; i++) {
      const dnsTest = tests[i]
      dot.setProvider('ali1')
      expect(dot.provider).toBe('ali1')
      try {
        await dot.resolve(dnsTest.domainName, dnsTest.domainType)
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
