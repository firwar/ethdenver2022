import React, { useState, useEffect, useContext } from "react";
import {
  Avatar,
  Box,
  Button,
  Grommet,
  Header,
  Menu,
  ResponsiveContext,
} from "grommet";
import {
  Menu as MenuIcon,
  Performance,
  Currency,
  Money,
  Home,
  ChatOption,
  Favorite,
  Contract,
} from "grommet-icons";
import { useRouter } from "next/router";

const BottomTabNavigation = (props) => {
  const [ethAmount, setEthAmount] = useState(0);
  const router = useRouter();

  return (
    <Box
      tag="header"
      direction="row"
      align="center"
      justify="between"
      pad={{ left: "medium", right: "small", vertical: "small" }}
      elevation="medium"
      round="xlarge"
      background="dark-1"
      style={{
        zIndex: "1",
        position: "absolute",
        width: "75%",
        bottom: 32,
        left: 0,
        right: 0,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Button
        icon={<Home color="light-1" />}
        gap="small"
        onClick={() => {
          router.push(`/listings`);
        }}
        primary
        style={{ backgroundColor: "transparent" }}
      />
      <Button
        icon={<ChatOption color="light-1" />}
        gap="small"
        onClick={() => {
          router.push(`/offers`);
        }}
        primary
        style={{ backgroundColor: "transparent" }}
      />
      <Button
        icon={<Contract color="light-1" />}
        gap="small"
        onClick={() => {
          router.push(`/listings/create`);
        }}
        primary
        style={{ backgroundColor: "transparent" }}
      />
      <Button
        icon={<Favorite color="light-1" />}
        gap="small"
        onClick={() => {}}
        primary
        style={{ backgroundColor: "transparent" }}
      />
      <Button
        icon={<Performance color="light-1" />}
        gap="small"
        onClick={() => {}}
        primary
        style={{ backgroundColor: "transparent" }}
      />
    </Box>
  );
};

export default BottomTabNavigation;
