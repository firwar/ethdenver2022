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

  // Use the user address here later
  const gravatarLink =
    "https://www.gravatar.com/avatar/0xa2d6c4297Eec8a25226AE0dc77344B0BDEBF442a?s=32&d=identicon&r=PG";
  const [ethAmount, setEthAmount] = useState(0);
  // Use the Web3 Provider for now
  const [loadWeb3Modal, logoutOfWeb3Modal, signedInAddress] = useWeb3Modal();
  const [status, setStatus] = useState(false);

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
                label={`EIT ${ethAmount}`}
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
