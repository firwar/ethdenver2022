import React from "react";
import { Avatar, Box, Card, Heading, Paragraph, Text } from "grommet";
import { Icon } from "@iconify/react";
import usdIcon from "@iconify-icons/cryptocurrency/usd";
import maticIcon from "@iconify-icons/cryptocurrency/matic";

export const ListingInformation = ({
  contactInfo,
  description,
  sellerAddress,
}) => {
  const gravatarLink = `https://www.gravatar.com/avatar/${sellerAddress}?s=32&d=robohash&r=PG`;

  return (
    <Box gap="xsmall" margin={{ top: "none", bottom: "large" }}>
      <Heading level="5" textAlign="start" margin="none" color="dark-3">
        Seller
      </Heading>
      <Box
        height="xxsmall"
        direction="row"
        justify="center"
        align="center"
        alignContent="between"
        round={false}
      >
        <Box
          direction="row"
          justify="between"
          align="center"
          alignContent="between"
          gap="medium"
        >
          <Box width="xxsmall">
            <Avatar src={gravatarLink} size="small" />
          </Box>
          <Box width="small">
            <Heading level="4" truncate>
              {sellerAddress}
            </Heading>
          </Box>
          <Box width="small" align="end">
            <Heading level="4" truncate>
              {contactInfo}
            </Heading>
          </Box>
        </Box>
      </Box>
      <Box
        align="start"
        direction="column"
        gap="xxsmall"
        margin={{ top: "medium" }}
      >
        <Heading level="4" textAlign="start" margin="none">
          Description
        </Heading>
        <Paragraph size="small" margin={{ vertical: "xsmall" }}>
          {description}
        </Paragraph>
      </Box>
    </Box>
  );
};
