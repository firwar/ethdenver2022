import React from "react";
import { Box, Card, Heading, Paragraph, Text } from "grommet";
import { Icon } from "@iconify/react";
import usdIcon from "@iconify-icons/cryptocurrency/usd";
import maticIcon from "@iconify-icons/cryptocurrency/matic";

export const ListingInformation = ({
  price,
  escrow,
  contactInfo,
  location,
  description,
}) => (
  <Box gap="xsmall" margin={{ top: "none" }}>
    <Box align="start" direction="column" gap="xxsmall">
      <Heading level="4" textAlign="start" margin="none">
        Description:
      </Heading>
      <Paragraph margin={{ vertical: "xsmall" }}>{description}</Paragraph>
    </Box>
    <Box align="center" direction="row" gap="xsmall">
      <Heading level="4" textAlign="start" margin="none">
        Price:{" "}
      </Heading>
      <Icon icon={usdIcon} color="darkGreen" />
      <Text level="3" textAlign="start" margin="none">
        {price}
      </Text>
    </Box>
    <Box align="center" direction="row" gap="xsmall">
      <Heading level="4" textAlign="start" margin="none">
        Escrow:{" "}
      </Heading>
      <Icon icon={maticIcon} color="blueViolet" />
      <Text level="3" textAlign="start" margin="none">
        {escrow}
      </Text>
    </Box>
    <Box align="center" direction="row" gap="xsmall">
      <Heading level="4" textAlign="start" margin="none">
        Contact:{" "}
      </Heading>
      <Text level="3" textAlign="start" margin="none">
        {contactInfo}
      </Text>
    </Box>
    <Box align="center" direction="row" gap="xsmall">
      <Heading level="4" textAlign="start" margin="none">
        Location:{" "}
      </Heading>
      <Text level="3" textAlign="start" margin="none">
        {location}
      </Text>
    </Box>
    <br />
  </Box>
);
