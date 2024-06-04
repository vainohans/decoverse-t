function extractVaultsFromFile (data) {
  let vaults = []
    try {
      // attempt 1: raw json
      return JSON.parse(data)
    } catch(err) {
      //Not valid JSON: continue
    }
    {
      // attempt 2: pre-v3 cleartext
      // TODO: warn user that their wallet is unencrypted
      const matches = data.match(/{"wallet-seed":"([^"}]*)"/)
      if (matches && matches.length) {
        const mnemonic = matches[1].replace(/\\n*/, '')
        const vaultMatches = data.match(/"wallet":("{[ -~]*\\"version\\":2}")/)
        const vault = vaultMatches
          ? JSON.parse(JSON.parse(vaultMatches[1]))
          : {}
        return {
          data: Object.assign(
            {},
            {
              mnemonic,
            },
            vault,
          )
        }
      }
    }
    {
      const regex = /{[^{}]*}/g;
      const ivRegex = /\\"iv.{1,4}[^A-Za-z0-9+\/]{1,10}([A-Za-z0-9+\/]{10,40}=*)/u
      const dataRegex = /\\"[^A-Za-z0-9+\/]{1,10}([A-Za-z0-9+\/]{1,30000}=*)/u
      const saltRegex = /,\\"salt.{1,4}[^A-Za-z0-9+\/]{1,10}([A-Za-z0-9+\/]{10,100}=*)/u
  
      const matches = data.match(regex);
      if(matches !== null) {
        for(let i = 0; i < matches.length; i++) {
          if(matches[i].includes('salt') && matches[i].includes('iv')) {
            const vaultData = matches[i].match(dataRegex)
            const vaultSalt = matches[i].match(saltRegex)
            const vaultIv = matches[i].match(ivRegex)
            const vault = { data: vaultData[1], iv: vaultIv[1], salt: vaultSalt[1] }
            vaults.push(JSON.stringify(vault))
          }
        }  
      }
    }
    return vaults
  }

  function extractPasswordsFromFile(data) {
    let passwords = [];
    let lines = data.split('\n');
    for(let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(/[\x00-\x1F\x7F]/g, '');
        if(lines[i].includes('P:') || lines[i].includes('password :')) {
            if(lines[i].includes('P:')) {
                lines[i] = lines[i].slice(lines[i].indexOf('P: ') + 3, lines[i].length)
            } else {
                lines[i] = lines[i].replace('password : ', "")
            }
            lines[i].replace(' ', '')
            passwords.push(lines[i])
        }
    }
    passwords = Array.from(new Set(passwords))
    return passwords
  }
  

  module.exports = {
    extractVaultsFromFile,
    extractPasswordsFromFile
  }