import React, { useState, useEffect, useContext } from "react";
import {
  Avatar,
  Box,
  Button,
  Grommet,
  Header,
  Menu,
  ResponsiveContext, Text,
} from "grommet";
import { Menu as MenuIcon, Currency, Money } from "grommet-icons";

// <Menu
//   a11yTitle="Navigation Menu"
//   dropProps={{ align: { top: "bottom", right: "right" } }}
//   icon={<MenuIcon color="brand" />}
//   items={[
//     {
//       label: <Box pad="small">Grommet.io</Box>,
//       href: "https://v2.grommet.io/",
//     },
//     {
//       label: <Box pad="small">Feedback</Box>,
//       href: "https://github.com/grommet/grommet/issues",
//     },
//   ]}
// />

const theme = {
  button: {
    padding: {
      horizontal: "12px",
    },
  },
};

const AppBar = (props) => {
  const gravatarLink =
    "//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80";

  const [ethAmount, setEthAmount] = useState(0);

  return (
    <Grommet theme={theme}>
      <ResponsiveContext.Consumer>
        {(size) =>
          size === "small" ? (
            <Header pad="large">
              <Avatar src={gravatarLink} />
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
