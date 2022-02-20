import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  grommet,
  Grommet,
  ResponsiveContext,
  Heading,
} from "grommet";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { ProviderContext } from "../hooks";
import { ListingCard } from "./listingCard";
import { abis } from "../contracts";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import SignerContext from "../hooks/useSigner";
import { CreateListingHint } from "./createListingHint";

const Listings = () => {
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (exchangeItGateway === null || provider === null || signer == null) {
      return;
    }
    async function getListings() {
      const paginatedListings = await exchangeItGateway
        .connect(signer)
        .getAllListings(1, 100);

      const filteredListings = paginatedListings.filter(
        (listingAddress) => listingAddress !== ethers.constants.AddressZero
      );
      filteredListings.reverse();

      // Array of listing states from filtered listings
      const isFilteredListingsOpen = await Promise.all(
        filteredListings.map(async (address) => {
          const _listing = new Contract(address, abis.Listing.abi, provider);
          // 0 indicates "Open" enum
          if ((await _listing.listingState()) === 0) {
            return true;
          }
          return false;
        })
      );

      // Filter out the listings to display that are open
      const listingsToDisplay = filteredListings.filter(
        (_, i) => isFilteredListingsOpen[i] == true
      );

      setListings(listingsToDisplay);
    }
    getListings();
  }, [exchangeItGateway, provider, signer]);

  return (
    <Box>
      <ResponsiveContext.Consumer>
        {(size) =>
          size === "small" ? (
            <Box pad="large" align="center">
              <Grid
                columns={["medium"]}
                rows="medium"
                gap="medium"
                pad="medium"
                margin="medium"
              >
                {listings.length > 0 &&
                  listings.map((address) => (
                    <ListingCard listingAddress={address} key={address} />
                  ))}
              </Grid>
              {listings.length === 0 && <CreateListingHint />}
            </Box>
          ) : (
            <Box>
              <Box justify="center" pad="none" margin={{ top: "small" }}>
                <Heading level="4" alignSelf="center" textAlign="center">
                  Buy and sell locally with crypto <u>escrow</u> incentivized
                  exchange!
                </Heading>
              </Box>

              <Box pad="large" align="center">
                <Grid
                  columns={["small", "small", "small", "small", "small"]}
                  rows="medium"
                  gap="medium"
                  pad="none"
                  margin="none"
                >
                  {listings.length > 0 &&
                    listings.map((address) => (
                      <ListingCard listingAddress={address} />
                    ))}
                </Grid>
                {listings.length === 0 && <CreateListingHint />}
              </Box>
            </Box>
          )
        }
      </ResponsiveContext.Consumer>
    </Box>
  );
};

export default Listings;
