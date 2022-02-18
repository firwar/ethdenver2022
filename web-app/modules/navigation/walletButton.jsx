import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'grommet';
import { ProviderContext } from '../hooks';
import useWeb3Modal from '../hooks/useWeb3Modal';

const WalletButton = () => {
  const { provider } = useContext(ProviderContext);
  // Use the Web3 Provider for now
  const [loadWeb3Modal, logoutOfWeb3Modal, signedInAddress] = useWeb3Modal();

  useEffect(() => {
    console.log('provider changed');
    console.log(provider);
    if (provider !== null) {
      console.log(provider.provider.selectedAddress);
    }
  }, [provider]);

  return (
    <Button
      label={!provider ? 'Connect Wallet' : `${signedInAddress} Disconnect Wallet`}
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
      secondary
    />
  );
};

export default WalletButton;
