import React, { useState, useEffect, useContext } from "react";
import {
  Avatar,
  Box,
  Button,
  Grommet,
  Header,
  Menu,
  ResponsiveContext,
  Text,
} from "grommet";
import { Menu as MenuIcon, Currency, Money } from "grommet-icons";
import { ProviderContext } from "../hooks";
import useWeb3Modal from "../hooks/useWeb3Modal";

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

const AppBar = (props) => {
  const { provider } = useContext(ProviderContext);

  const gravatarLink =
    "//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80";
  const [ethAmount, setEthAmount] = useState(0);
  // Use the Web3 Provider for now
  const [loadWeb3Modal, logoutOfWeb3Modal, signedInAddress] = useWeb3Modal();

  return (
    <Grommet theme={theme}>
      <ResponsiveContext.Consumer>
        {(size) =>
          size === "small" ? (
            <Header pad="large">
              <Avatar
                src={gravatarLink}
                onClick={() => {
                  console.log(provider);
                  console.log("hi");
                  if (!provider) {
                    loadWeb3Modal();
                  } else {
                    logoutOfWeb3Modal();
                  }
                }}
              />
              <Text>ExchangeIt</Text>
              <Button
                icon={<Money />}
                gap="small"
                label={`ETH ${ethAmount}`}
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
