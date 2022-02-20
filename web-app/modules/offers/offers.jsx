import React, { useContext, useState, useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { Box, Grid, grommet, Grommet, ResponsiveContext } from "grommet";
import { ProviderContext } from "../hooks";
import { abis } from "../contracts";
import { ListingCard } from "../listings/listingCard";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import SignerContext from "../hooks/useSigner";

const Offers = () => {
  const { signer } = useContext(SignerContext);
  const { provider } = useContext(ProviderContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);

  const [pendingOfferListings, setPendingOfferListings] = useState([]);
  const [acceptedOfferListings, setAcceptedOfferListings] = useState([]);
  const [currentUserAddress, setCurrentUserAddress] = useState();
  const [canceledCompletedOfferListings, setCanceledCompletedOfferListings] =
    useState([]);

  useEffect(() => {
    if (exchangeItGateway === null || provider === null || signer == null) {
      return;
    }
    async function getOffers() {
      const offerListings = await exchangeItGateway
        .connect(signer)
        .getMyOffers();
      const filteredListings = offerListings.filter(
        (listingAddress) => listingAddress !== ethers.constants.AddressZero
      );

      // Array of listing states from filtered listings
      const filteredListingsStatus = await Promise.all(
        filteredListings.map(async (address) => {
          const listing = new Contract(address, abis.Listing.abi, provider);
          // 0 indicates "Open" enum
          return listing.listingState();
        })
      );

      const pendingListings = filteredListings.filter(
        (_, i) => filteredListingsStatus[i] === 0
      );
      const acceptedListings = filteredListings.filter(
        (_, i) =>
          filteredListingsStatus[i] === 1 ||
          filteredListingsStatus[i] === 2 ||
          filteredListingsStatus[i] === 3
      );
      const canceledCompletedListings = filteredListings.filter(
        (_, i) =>
          filteredListingsStatus[i] === 4 || filteredListingsStatus[i] === 5
      );

      setPendingOfferListings(pendingListings);
      setAcceptedOfferListings(acceptedListings);
      setCanceledCompletedOfferListings(canceledCompletedListings);

      const selectedUser = await signer.getAddress();
      setCurrentUserAddress(selectedUser);
    }
    getOffers();
  }, [exchangeItGateway, provider, signer]);

  return (
    <Box>
      <ResponsiveContext.Consumer>
        {(size) =>
          size === "small" ? (
            <Box>
              <Box pad="large" align="center">
                Accepted Offers
                <Grid
                  columns={["medium"]}
                  rows="medium"
                  gap="large"
                  pad="none"
                  margin="none"
                >
                  {acceptedOfferListings.map((address) => (
                    <ListingCard
                      listingAddress={address}
                      currentUserAddress={currentUserAddress}
                      viewOnly
                    />
                  ))}
                </Grid>
              </Box>
              <Box pad="large" align="center">
                Pending Offers
                <Grid
                  columns={["medium"]}
                  rows="medium"
                  gap="xsmall"
                  pad="none"
                  margin="none"
                >
                  {pendingOfferListings.map((address) => (
                    <ListingCard
                      listingAddress={address}
                      currentUserAddress={currentUserAddress}
                      viewOnly
                    />
                  ))}
                </Grid>
              </Box>
              <Box pad="large" align="center">
                Canceled or Completed Offers
                <Grid
                  columns={["medium"]}
                  rows="medium"
                  gap="large"
                  pad="none"
                  margin="none"
                >
                  {canceledCompletedOfferListings.map((address) => (
                    <ListingCard
                      listingAddress={address}
                      currentUserAddress={currentUserAddress}
                    />
                  ))}
                </Grid>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box pad="large" align="center">
                Accepted Offers
                <Grid
                  columns={["small", "small", "small", "small", "small"]}
                  rows="medium"
                  gap="large"
                  pad="none"
                  margin="none"
                >
                  {acceptedOfferListings.map((address) => (
                    <ListingCard
                      listingAddress={address}
                      currentUserAddress={currentUserAddress}
                      viewOnly
                    />
                  ))}
                </Grid>
              </Box>
              <Box pad="large" align="center">
                Pending Offers
                <Grid
                  columns={["small", "small", "small", "small", "small"]}
                  rows="medium"
                  gap="large"
                  pad="none"
                  margin="none"
                >
                  {pendingOfferListings.map((address) => (
                    <ListingCard
                      listingAddress={address}
                      currentUserAddress={currentUserAddress}
                    />
                  ))}
                </Grid>
              </Box>
              <Box pad="large" align="center">
                Canceled or Completed Offers
                <Grid
                  columns={["small", "small", "small", "small", "small"]}
                  rows="medium"
                  gap="large"
                  pad="none"
                  margin="none"
                >
                  {canceledCompletedOfferListings.map((address) => (
                    <ListingCard
                      listingAddress={address}
                      currentUserAddress={currentUserAddress}
                      viewOnly
                    />
                  ))}
                </Grid>
              </Box>
            </Box>
          )
        }
      </ResponsiveContext.Consumer>
    </Box>
  );
};

export default Offers;
