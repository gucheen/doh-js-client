import * as tls from 'tls'
import * as fs from 'fs'
import * as Packet from 'native-dns-packet'
import * as Util from './util'

class DoT {
  readonly providers = {
    google: 'dns.google',
    cloudflare: '1.1.1.1',
    cleanbrowsing: '185.228.169.154',
    quad9: 'dns.quad9.net',
    ali1: '223.5.5.5',
    ali2: '223.6.6.6',
    dnspod: '1.12.12.12',
    dnspod2: '120.53.53.53',
  }

  provider: string
  uri: string
  key: Buffer
  cert: Buffer

  constructor(provider: string, keyPath: string, certPath: string) {
    if (typeof this.providers[provider] === 'undefined') {
      throw new Error('We only support these provider: ' + this.getProviders().join(', '))
    }
    const key = fs.readFileSync(keyPath)
    const cert = fs.readFileSync(certPath)
    this.provider = provider
    this.uri = this.providers[this.provider]
    this.key = key
    this.cert = cert
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

  // TODO: refactor socket and provider, multiple query and keepalive connection
  resolve(domainName: string, domainType: string) {
    let type = Util.getDomainType(domainType)
    let dnsPacket = new Packet()
    let dnsBuf = Util.newBuffer(128)
    let msgBuf = Util.newBuffer(130)
    dnsPacket.question.push({
      name: domainName,
      type: type,
      class: 1
    })
    Packet.write(dnsBuf, dnsPacket)
    msgBuf[1] = 128
    // copy dns buffer to message buffer
    dnsBuf.copy(msgBuf, 2, 0)
  
    const uri = this.uri
    const key = this.key
    const cert = this.cert
    return new Promise(function (resolve, reject) {
      const options = {
        key: key,
        cert: cert,
        // ca: [],
        checkServerIdentity: () => { 
          return null
        },
      }
      
      const socket = tls.connect(853, uri, options, () => {
        if (socket.authorized) {
          socket.write(msgBuf)
        } else {
          reject(new Error('socket authorized'))
        }
      })

      let dataBuffer
      socket.on('data', (data) => {
        dataBuffer = dataBuffer ? Buffer.concat([dataBuffer, data]) : data
      })
      socket.on('error', (err) => {
        reject(err)
      })
      socket.on('end', () => {
        const result = Packet.parse(dataBuffer.slice(2))
        resolve(result.answer)
      })
    })
  }
}

export default DoT
