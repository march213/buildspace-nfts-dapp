import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import myEpicNft from './utils/MyEpicNFT.json'
import './App.css'

const CONTRACT_ADDRESS = '0xDD7DcB2b3dE652A7D42CcDDd7AceC80aF90902f0'
const getRaribleLink = (contractAddress, tokenId) => `https://rinkeby.rarible.com/token/${contractAddress}:${tokenId}`
const TOTAL_MINT_COUNT = 50

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log('Make sure you have metamask!')
      return
    } else {
      console.log('We have the ethereum object', ethereum)
    }

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)
      setCurrentAccount(account)
    } else {
      console.log('No authorized account found')
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(
            `Hey there!
            We've minted your NFT and sent it to your wallet.
            It may be blank right now.
            Here's the link: ${getRaribleLink(CONTRACT_ADDRESS, tokenId.toNumber())}`,
          )
        })

        console.log('Going to pop wallet now to pay gas...')
        let nftTxn = await connectedContract.makeAnEpicNFT()

        console.log('Mining...please wait.')
        await nftTxn.wait()

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const renderNotConnectedContainer = () => {
    return currentAccount === '' ? (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
    ) : (
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
        Mint NFT
      </button>
    )
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">Each unique. Each beautiful. Discover your NFT today.</p>
          {renderNotConnectedContainer()}
        </div>
      </div>
    </div>
  )
}

export default App
