import React, { useState, useEffect, useContext } from "react";
import { Box, Button, Card, CardBody, Heading } from "grommet";
import { ethers } from "ethers";
import SignerContext from "../hooks/useSigner";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import ListingContext from "../hooks/useListing";
import ToastContext from "../hooks/useToast";

export const SellerWaitingForOffer = () => {
  const { signer } = useContext(SignerContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { listing } = useContext(ListingContext);
  const { setToast } = useContext(ToastContext);
  const [offers, setOffers] = useState([]);
  const [offersValue, setOffersValue] = useState([]);

  useEffect(() => {
    if (listing === null) {
      return;
    }
    async function getOffers() {
      const response = await listing.getListingOffers();
      if (response === undefined || response.length === 0) {
        return;
      }
      setOffers(response[0].map((_listing) => _listing));
      setOffersValue(
        response[1].map((_escrow) => ethers.utils.formatEther(_escrow))
      );
    }
    getOffers();
    exchangeItGateway.removeAllListeners("SubmittedOffer");
    exchangeItGateway.on("SubmittedOffer", (buyerAddress, listingAddress) => {
      if (listingAddress === listing.address) {
        setToast({
          status: "ok",
          message: `Received offer from ${buyerAddress}`,
        });
        getOffers();
      }
    });
  }, [exchangeItGateway, listing]);

  return (
    <Card elevation="large" width="medium">
      <CardBody height="small">
        <Box pad="small" align="center" margin="none" border="bottom">
          <Box margin="small">
            <Button
              primary
              size="small"
              label="Cancel Listing"
              alignSelf="end"
              onClick={async () => {
                await listing.connect(signer).cancelListing();
              }}
            />
          </Box>
        </Box>

        <Box pad="small" align="center" margin="none">
          <Heading level="3" margin={{ vertical: "none" }}>
            {" "}
            Offers{" "}
          </Heading>
        </Box>

        {offers.map((offer, index) => (
          <Box key={index} pad="small" align="center" margin="none">
            <Heading
              level="6"
              textAlign="center"
              margin={{ vertical: "xxsmall" }}
            >
              Buyer Address: <br />
              {offer} <br />
            </Heading>
            <Heading
              level="6"
              textAlign="center"
              margin={{ vertical: "xxsmall" }}
            >
              Offer Escrow: <br />
              {offersValue[index]} <br />
              <Button
                primary
                onClick={async () => {
                  await listing.connect(signer).acceptOffer(offer, {
                    value: ethers.utils.parseEther(offersValue[index]),
                  });
                }}
                size="small"
                label="Accept Offer"
                alignSelf="center"
              />
            </Heading>
          </Box>
        ))}
      </CardBody>
    </Card>
  );
};
