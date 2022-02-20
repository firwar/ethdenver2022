import React, { useState, useEffect, useContext } from "react";
import {
  Avatar,
  Box,
  Button,
  Grommet,
  Header,
  Menu,
  ResponsiveContext,
  Stack,
  Text,
} from "grommet";
import { Menu as MenuIcon, Currency, Money } from "grommet-icons";
import { ProviderContext } from "../hooks";
import useWeb3Modal from "../hooks/useWeb3Modal";
import { Contract } from "@ethersproject/contracts";
import { abis } from "../contracts";
import { ethers } from "ethers";

const theme = {
  global: {
    colors: {
      brand: "#475C7A",
      focus: "#685D79",
      selected: "#475C7A",
      "accent-1": "#685D79",
      "accent-2": "#AB6C82",
      "accent-3": "#D8737F",
      "accent-4": "#FCBB6D",
      "dark-1": "#344E5C",
    },
  },
  button: {
    padding: {
      horizontal: "12px",
    },
  },
};

const LINK_MUMBAI_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

const AppBar = (props) => {
  const { provider } = useContext(ProviderContext);

  // Use the user address here later
  const gravatarLink =
    "https://www.gravatar.com/avatar/0xa2d6c4297Eec8a25226AE0dc77344B0BDEBF442a?s=32&d=identicon&r=PG";
  // Use the Web3 Provider for now
  const [loadWeb3Modal, logoutOfWeb3Modal, signedInAddress] = useWeb3Modal();
  const [status, setStatus] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    if (provider === null || provider === undefined) {
      return;
    }

    async function getBalanceOf() {
      const signer = provider.getSigner();
      const erc20 = new Contract(LINK_MUMBAI_ADDRESS, abis.ERC20.abi, provider);
      const selectedAddress = await signer.getAddress();
      const balance = await erc20.connect(signer).balanceOf(selectedAddress);
      console.log(ethers.utils.formatEther(balance));
      setTokenBalance(ethers.utils.formatEther(balance));
    }
    getBalanceOf();
  }, [provider]);

  return (
    <Grommet theme={theme}>
      <ResponsiveContext.Consumer>
        {(size) =>
          size === "small" ? (
            <Header pad="large">
              <Stack anchor="top-right">
                <Avatar
                  src={gravatarLink}
                  onClick={() => {
                    console.log(provider);
                    if (!provider) {
                      loadWeb3Modal();
                      setStatus(true);
                    } else {
                      logoutOfWeb3Modal();
                      setStatus(false);
                    }
                  }}
                />
                <Box
                  pad="xsmall"
                  round
                  background={status ? "status-ok" : "dark-6"}
                  responsive={false}
                />
              </Stack>
              <Text>ExchangeIt</Text>
              <Button
                icon={<Money />}
                gap="small"
                label={`EIT ${tokenBalance}`}
                onClick={() => {}}
                color="accent-4"
                primary
              />
            </Header>
          ) : (
            <Box
              tag="header"
              direction="row-responsive"
              align="center"
              justify="between"
              background="brand"
              pad={{ left: "medium", right: "small", vertical: "small" }}
              elevation="medium"
              style={{ zIndex: "1" }}
              {...props}
            />
          )
        }
      </ResponsiveContext.Consumer>
    </Grommet>
  );
};

export default AppBar;
