import * as XHR2 from 'xhr2'
import * as Packet from 'native-dns-packet'
import * as Util from './util'

interface Record { name: string, type: number, class: number, ttl: number, data?: string, address?: string }

class DoH {
  readonly providers = {
    google: 'https://dns.google/dns-query',
    cloudflare: 'https://cloudflare-dns.com/dns-query',
    cleanbrowsing: 'https://doh.cleanbrowsing.org/doh/family-filter',
    quad9: 'https://dns9.quad9.net/dns-query',
    ali1: 'https://223.5.5.5/dns-query',
    ali2: 'https://223.6.6.6/dns-query',
    dnspod: 'https://1.12.12.12/dns-query',
    dnspod2: 'https://120.53.53.53/dns-query',
  }

  provider: string
  uri: string

  constructor(provider: string) {
    if (typeof this.providers[provider] === 'undefined') {
      throw new Error('We only support these provider: ' + this.getProviders().join(', '))
    }
    this.provider = provider
    this.uri = this.providers[this.provider]
  }

  getProviders() {
    return Object.keys(this.providers)
  }

  setProvider(provider :string) {
    if (this.provider === provider) {
      return
    }
    if (typeof this.providers[provider] === 'undefined') {
      throw new Error('We only support these provider: ' + this.getProviders().join(', '))
    }
    this.provider = provider
    this.uri = this.providers[this.provider]
  }

  resolve(domainName: string, domainType: string): Promise<Record[]> {
    let type = Util.getDomainType(domainType)
    let dnsPacket = new Packet()
    let dnsBuf = Util.newBuffer(128)
    dnsPacket.question.push({
      name: domainName,
      type: type,
      class: 1
    })
    Packet.write(dnsBuf, dnsPacket)
  
    let provider = this.provider
    let query = `${this.uri}?dns=${dnsBuf.toString('base64').replace(/=+/, '')}`
    return new Promise(function (resolve, reject) {
      let xhr = new XHR2()
      xhr.open('GET', query, true)
      xhr.setRequestHeader('Accept', 'application/dns-message')
      xhr.setRequestHeader('Content-type', 'application/dns-message')
      xhr.responseType = 'arraybuffer'
      xhr.onload = function () {
        if (xhr.status === 200 && this.response) {
          try {
            let dnsResult = Buffer.from(this.response)
            let result = Packet.parse(dnsResult)
            resolve(result.answer)
          } catch (err) {
            reject(err)
          }
        } else {
          reject(new Error(`Cannot find the domain, provider: ${provider}, xhr status: ${xhr.status}.`))
        }
      }
      xhr.onerror = function (err) {
        reject(err)
      }
      xhr.send(null)
    })
  }
}

export default DoH
