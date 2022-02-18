import React, { useContext } from "react";
import { Box, Button, Card, Heading } from "grommet";
import SignerContext from "../hooks/useSigner";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import ListingContext from "../hooks/useListing";

export const BuyerWaitingForOffer = () => {
  const { signer } = useContext(SignerContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { listing } = useContext(ListingContext);

  return (
    <Card elevation="large" width="medium">
      <Box margin="small">
        <Button
          primary
          size="small"
          label="Cancel Offer"
          alignSelf="center"
          onClick={async () => {
            await exchangeItGateway
              .connect(signer)
              .cancelOffer(listing.address);
          }}
        />
      </Box>
      <Heading level="4" margin={{ vertical: "small" }} alignSelf="center">
        Waiting for Seller to Accept Offer
      </Heading>
    </Card>
  );
};
