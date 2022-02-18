// SPDX-License-Identifier: Apache-2.0
import React, {
  useCallback, useEffect, useState, useContext,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import ProviderContext from './useProvider';

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const DEFAULT_INFURA_ID = 'INVALID_INFURA_KEY';
const DEFAULT_NETWORK_NAME = 'mainnet';

function useWeb3Modal(config = {}) {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [signedInAddress, setSignedInAddress] = useState('');
  const { autoLoad = false, infuraId = DEFAULT_INFURA_ID, NETWORK = DEFAULT_NETWORK_NAME } = config;
  const { setProvider } = useContext(ProviderContext);

  useEffect(() => {
    if (web3Modal === null) {
      // Web3Modal also supports many other wallets.
      // You can see other options at https://github.com/Web3Modal/web3modal
      const web3 = new Web3Modal({
        network: NETWORK,
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId,
            },
          },
        },
      });
      setWeb3Modal(web3);
    }
  }, [config]);

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    setProvider(new Web3Provider(newProvider));
    setSignedInAddress(newProvider.selectedAddress);
    // Subscribing to accounts changed https://github.com/Web3Modal/web3modal
    newProvider.on('accountsChanged', (accounts) => {
      setSignedInAddress(accounts[0]);
    });
  }, [web3Modal]);

  const logoutOfWeb3Modal = useCallback(
    async () => {
      setSignedInAddress('');
      await web3Modal.clearCachedProvider();
      window.location.reload();
    },
    [web3Modal],
  );

  useEffect(() => {
    async function clearCachedProvider() {
      await web3Modal.clearCachedProvider();
      // window.location.reload();
    }
    if (web3Modal !== null && signedInAddress === '') {
      clearCachedProvider();
    }
  }, [signedInAddress]);

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (autoLoad && !autoLoaded && web3Modal !== null) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  },
  [autoLoad, autoLoaded, loadWeb3Modal, web3Modal]);

  return [loadWeb3Modal, logoutOfWeb3Modal, signedInAddress];
}

export default useWeb3Modal;
