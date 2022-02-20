import React, { useContext, useState, useEffect } from "react";
import { Box, Grid, grommet, Grommet, ResponsiveContext } from "grommet";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { ProviderContext } from "../hooks";
import { abis } from "../contracts";
import { ListingCard } from "./listingCard";
import { ListingCard2 } from "./listingCard2";
import SignerContext from "../hooks/useSigner";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";

const MyListings = () => {
  const { signer } = useContext(SignerContext);
  const { provider } = useContext(ProviderContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const [pendingOfferListings, setPendingOfferListings] = useState([]);
  const [acceptedOfferListings, setAcceptedOfferListings] = useState([]);
  const [canceledCompletedOfferListings, setCanceledCompletedOfferListings] =
    useState([]);

  useEffect(() => {
    if (exchangeItGateway === null) {
      return;
    }
    async function getListings() {
      const paginatedListings = await exchangeItGateway
        .connect(signer)
        .getMyListings(1, 10);
      const filteredListings = paginatedListings.filter(
        (a) => a !== ethers.constants.AddressZero
      );

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
    }
    getListings();
  }, [exchangeItGateway]);

  return (

    <Grommet theme={grommet}>
      <ResponsiveContext.Consumer>
        {(size) =>
          size === "small" ? (

        <Box>
          <Box pad="large" align="center">
        Open Listings
        <Grid
          columns={["small", "small"]}
          rows="small"
          gap="xsmall"
          pad="none"
          margin="none"
        >
          {pendingOfferListings.map((address) => (
            <ListingCard2 listingAddress={address} />
          ))}
        </Grid>
      </Box>
      <Box pad="large" align="center">
        Locked Listings

        <Grid
          columns={["small", "small" ]}
          rows="small"
          gap="xsmall"
          pad="none"
          margin="none"
        >
          {acceptedOfferListings.map((address) => (
            <ListingCard2 listingAddress={address} />
          ))}
        </Grid>
      </Box>
      <Box pad="large" align="center">
        Canceled or Completed Listings
        <Grid
          columns={["small", "small"]}
          rows="small"
          gap="xsmall"
          pad="none"
          margin="none"
        >
          {canceledCompletedOfferListings.map((address) => (
            <ListingCard2 listingAddress={address} />
          ))}
        </Grid>
      </Box>
      </Box>):(
        <Box>
          <Box pad="large" align="center">
        Open Listings
        <Grid
          columns={["small", "small", "small", "small", "small"]}
          rows="medium"
          gap="large"
          pad="none"
          margin="none"
        >
          {pendingOfferListings.map((address) => (
            <ListingCard listingAddress={address} />
          ))}
        </Grid>
      </Box>
      <Box pad="large" align="center">
        Locked Listings

        <Grid
          columns={["small", "small", "small", "small", "small"]}
          rows="medium"
          gap="large"
          pad="none"
          margin="none"
        >
          {acceptedOfferListings.map((address) => (
            <ListingCard listingAddress={address} />
          ))}
        </Grid>
      </Box>
      <Box pad="large" align="center">
        Canceled or Completed Listings
        <Grid
          columns={["small", "small", "small", "small", "small"]}
          rows="medium"
          gap="large"
          pad="none"
          margin="none"
        >
          {canceledCompletedOfferListings.map((address) => (
            <ListingCard listingAddress={address} />
          ))}
        </Grid>
      </Box>
      </Box>)}
      </ResponsiveContext.Consumer>
    </Grommet>
  );
};

export default MyListings;
