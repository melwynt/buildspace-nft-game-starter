import './App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
// import abi from './utils/MyEpicNFT.json';
// import ReactLoading from 'react-loading';
// import Modal from 'react-modal';

import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';

// Constants
const TWITTER_HANDLE = 'melwyntee';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// String, hex code of the chainId of the Rinkebey test network
const rinkebyChainId = '0x4';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentChainId, setCurrentChainId] = useState(null);

  // characterNFT
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // const [totalNFTMinted, setTotalNFTMinted] = useState(0);
  // const [minting, setMinting] = useState(false);
  // const [modalBox, setModalBox] = useState({
  //   open: false,
  //   message: '',
  // });

  // const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    // checkIfWalletIsConnected is ran only once
    console.log('check if wallet is connected...');

    const { ethereum } = window;

    const networkVersion = ethereum ? ethereum.networkVersion : null;
    // console.log(
    //   `#checkIfWalletIsConnected - Network Version: ${networkVersion}`
    // );

    // const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    try {
      if (!ethereum) {
        console.log('Make sure you have metamask!');
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account: ', account);
        setCurrentAccount(account);

        let chainId = await ethereum.request({ method: 'eth_chainId' });
        setCurrentChainId(chainId);

        // console.log('Connected to chain ' + chainId);

        // if (chainId !== rinkebyChainId) {
        //   alert('You are not connected to the Rinkeby Test Network!');
        // }

        if (chainId === rinkebyChainId) {
          // setupEventListener();
          console.log('chainId === rinkebyChainId');
        }
      } else {
        console.log('No authorized account found.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    const networkVersion = ethereum ? ethereum.networkVersion : null;
    // console.log(`#connectWallet - Network Version: ${networkVersion}`);

    // const isMetaMask = ethereum ? ethereum.isMetaMask : null;

    try {
      if (!ethereum) {
        console.log('Get metamask!');
        return;
      }

      // check in doc if this is an async function
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const account = accounts[0];

      setCurrentAccount(account);

      console.log('connected', account);

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      setCurrentChainId(chainId);

      // console.log('Connected to chain ' + chainId);

      // setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();

    const { ethereum } = window;

    try {
      if (ethereum) {
        ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0)
            console.log(`Account connected: ${accounts[0]}`);
          else {
            console.log('Account disconnected');
            setCurrentAccount('');
            setCurrentChainId('');
          }
        });

        ethereum.on('chainChanged', async (_) => {
          console.log('Chain changed');
          let chainId = await window.ethereum.request({
            method: 'eth_chainId',
          });
          console.log(chainId, typeof chainId);
          setCurrentChainId(chainId);
        });
      } else {
        console.log("Ethereum object doesn't exist.");
      }
    } catch (error) {
      console.log(error);
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const { ethereum } = window;

    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address: ', currentAccount);
      try {
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const gameContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicGame.abi,
            signer
          );

          const txn = await gameContract.checkIfUserHasNFT();

          if (txn.name) {
            console.log('txn: ', txn);

            console.log('User has a character.');
            setCharacterNFT(transformCharacterData(txn));
          } else {
            console.log('No character NFT found.');
          }
          // setIsLoading(false);
        } else {
          console.log('Ethereum object does not exist.');
        }
      } catch (error) {
        console.log(error);
        // setIsLoading(false);
      }
    };

    if (currentAccount) {
      console.log('Current Account: ', currentAccount);
      fetchNFTMetadata();
    }
    setIsLoading(false);
  }, [currentAccount]);

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect Wallet to get started
    </button>
  );

  // add a render if user is connected on the wrong network

  // render component
  const renderContent = () => {
    /*
     * If the app is currently loading, just render out LoadingIndicator
     */

    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://i.giphy.com/media/KvhFSEiWWD9yDcG1qL/giphy.webp"
            alt="Day of the Tentacle Gif"
          />
          {renderNotConnectedContainer()}
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  // Show Arena

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Tentacle Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
