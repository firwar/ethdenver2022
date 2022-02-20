import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Grommet,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
} from "grommet";
import { Money } from "grommet-icons";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { useRouter } from "next/router";
import { ProviderContext } from "../hooks";
import { abis } from "../contracts";
import { ListingInformation } from "./listingInformation";
import { SellerWaitingForOffer } from "./sellerWaitingForOffer";
import { BuyerWaitingForOffer } from "./buyerWaitingForOffer";
import { BuyerSubmitOffer } from "./buyerSubmitOffer";
import { UnlockCodeView } from "./unlockCodeView";
import ListingContext from "../hooks/useListing";
import { CardWithText } from "./cardWithText";
import SignerContext from "../hooks/useSigner";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import { Icon } from "@iconify/react";
import usdIcon from "@iconify-icons/cryptocurrency/usd";
import maticIcon from "@iconify-icons/cryptocurrency/matic";

export const LISTING_STATES = {
  0: "Open",
  1: "Locked",
  2: "SellerUnlocked",
  3: "BuyerUnlocked",
  4: "Canceled",
  5: "Completed",
};

const TEN_SECONDS = 10 * 1000;

// TODO we probably want to listen to events and update the view if we've submitted offer etc
// eslint-disable-next-line react/prop-types
const Listing = ({ address }) => {
  const router = useRouter();
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { listing, setListing } = useContext(ListingContext);
  const [role, setRole] = useState(null);

  // Helpers for UX/UI
  const [loading, setLoading] = useState(false);

  // Contract information
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [minimumEscrow, setMinimumEscrow] = useState(0);
  const [escrowedAmount, setEscrowedAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [listingState, setListingState] = useState(null);
  const [stateChecker, setStateChecker] = useState(null);

  useEffect(() => {
    if (address === null || provider === null || signer === null) {
      return;
    }
    const contractAddress = ethers.utils.getAddress(address);
    const newListing = new Contract(
      contractAddress,
      abis.Listing.abi,
      provider
    );
    setListing(newListing);
  }, [address, provider, signer]);

  useEffect(() => {
    if (listing === null || signer === null) {
      return;
    }
    async function setData() {
      setLoading(true);
      const [
        _contractSellerAddress,
        _contractBuyerAddress,
        _signerAddress,
        _description,
        _contact,
        _minEscrow,
        _imageLink,
        _listingState,
        _ipfsHash,
        _title,
        _location,
        _price,
      ] = await Promise.all([
        await listing.connect(signer).sellerAddress(),
        await listing.connect(signer).buyerAddress(),
        await signer.getAddress(),
        await listing.connect(signer).listingDescription(),
        await listing.connect(signer).listingContact(),
        await listing.connect(signer).listingMinEscrow(),
        await listing.connect(signer).listingImageLink(),
        await listing.connect(signer).listingState(),
        await listing.connect(signer).listingImageLink(),
        await listing.connect(signer).listingTitle(),
        await listing.connect(signer).listingLocation(),
        await listing.connect(signer).listingPrice(),
      ]);
      setLoading(false);
      const _escrowedAmount = await listing
        .connect(signer)
        .listingOffers(_signerAddress);
      setDescription(_description);
      setSellerAddress(_contractSellerAddress);
      setBuyerAddress(_contractBuyerAddress);
      setSignerAddress(_signerAddress);
      setContactInfo(_contact);
      setMinimumEscrow(
        ethers.utils.formatUnits(ethers.BigNumber.from(_minEscrow))
      );
      setImageLink(_imageLink);
      setEscrowedAmount(_escrowedAmount);
      setTitle(_title);
      setLocation(_location);
      setPrice(ethers.utils.formatEther(_price));
      if (_ipfsHash.length < 46) {
        setImageLink("//v2.grommet.io/assets/IMG_4245.jpg");
      } else {
        setImageLink(`https://gateway.pinata.cloud/ipfs/${_ipfsHash}`);
      }
      // eslint-disable-next-line no-prototype-builtins
      if (LISTING_STATES.hasOwnProperty(_listingState)) {
        // eslint-disable-next-line no-underscore-dangle
        setListingState(LISTING_STATES[_listingState]);
      }

      const myOffers = await exchangeItGateway.connect(signer).getMyOffers();
      // signer has made an offer to this listing
      if (myOffers.indexOf(address) !== -1) {
        setRole("buyer");
      } else if (_contractSellerAddress === _signerAddress) {
        // The contract seller address matches signer address
        // They must be the seller
        setRole("seller");
      } else {
        // No offer and not a seller means they can be prospective buyers
        setRole("viewer");
      }
    }
    setData();
    if (stateChecker === null) {
      setStateChecker(
        setInterval(async () => {
          // Long poll for state change
          const stateCode = await listing.connect(signer).listingState();
          const state = LISTING_STATES[stateCode];
          if (state !== listingState) {
            setListingState(state);
          }
        }, TEN_SECONDS)
      );
    }
    return function cleanup() {
      if (stateChecker !== null) {
        clearInterval(stateChecker);
      }
    };
  }, [listing, signer, listingState]);

  const renderOpenStateControls = () => {
    if (listingState !== "Open") {
      return null;
    }
    if (role === "buyer") {
      return <BuyerWaitingForOffer />;
    }
    if (role === "seller") {
      return (
        <Box>
          <SellerWaitingForOffer />
        </Box>
      );
    }
    if (role === "viewer") {
      return <BuyerSubmitOffer />;
    }
    return null;
  };

  const renderWaitingForUnlockStateView = () => {
    if (listingState === "SellerUnlocked") {
      if (role === "buyer") {
        return <UnlockCodeView role={role} />;
      }
      if (role === "seller") {
        return <CardWithText text="Waiting for buyer to unlock" />;
      }
    }
    if (listingState === "BuyerUnlocked") {
      if (role === "buyer") {
        return <CardWithText text="Waiting for seller to unlock" />;
      }
      if (role === "seller") {
        return <UnlockCodeView role={role} />;
      }
    }
    return null;
  };

  // TODO load image from ipfs
  return (
    <Box>
      {!loading && (
        <Box pad="medium" align="center" gap="medium">
          <Card elevation="large" width="medium">
            <Stack anchor="bottom-left">
              <CardBody height="medium">
                <Image fit="cover" src={imageLink} />
              </CardBody>
              <CardHeader
                pad={{ horizontal: "small", vertical: "small" }}
                // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4#all-hex-value-from-100-to-0-alpha
                background="#000000A0"
                width="medium"
              >
                <Box
                  direction="row"
                  justify="between"
                  align="center"
                  alignContent="between"
                  gap="medium"
                  size="medium"
                >
                  <Box
                    direction="row"
                    justify="between"
                    align="center"
                    alignContent="between"
                    gap="medium"
                    size="medium"
                  >
                    <Icon icon={usdIcon} color="white" />
                    <Heading level="3" margin="none">
                      {price}
                    </Heading>
                  </Box>
                  <Box width="small"></Box>
                  <Box
                    direction="row"
                    justify="between"
                    align="center"
                    alignContent="between"
                    gap="medium"
                    size="medium"
                  >
                    <Icon icon={maticIcon} color="white" />
                    <Heading level="3" margin="none">
                      {price}
                    </Heading>
                  </Box>
                </Box>
              </CardHeader>
            </Stack>

            <CardFooter>
              <Box pad={{ horizontal: "medium" }} responsive={false}>
                <Box
                  direction="row"
                  justify="between"
                  align="center"
                  alignContent="between"
                  gap="small"
                  margin={{ vertical: "medium" }}
                >
                  <Heading level="3" textAlign="start">
                    {title}
                  </Heading>
                  <Heading
                    level="5"
                    textAlign="end"
                    margin="none"
                    color="dark-3"
                  >
                    {location}
                  </Heading>
                </Box>
                <ListingInformation
                  contactInfo={contactInfo}
                  location={location}
                  description={description}
                  sellerAddress={sellerAddress}
                />
              </Box>
            </CardFooter>
          </Card>
          {renderOpenStateControls()}
          {listingState === "Locked" && <UnlockCodeView role={role} />}
          {role === "seller" &&
            signerAddress == sellerAddress &&
            (listingState === "Canceled" || listingState === "Completed") && (
              <Button
                primary
                size="small"
                label="Withdraw Escrow"
                alignSelf="center"
                onClick={async () => {
                  await listing.connect(signer).sellerWithdraw();
                }}
              />
            )}
          {((role === "buyer" &&
            signerAddress == buyerAddress &&
            escrowedAmount > 0 &&
            (listingState === "Canceled" || listingState === "Completed")) ||
            (role === "buyer" &&
              signerAddress != buyerAddress &&
              listingState != "Open")) && (
            <Button
              primary
              size="small"
              label="Withdraw Escrow"
              alignSelf="center"
              onClick={async () => {
                await listing.connect(signer).buyerWithdraw();
              }}
            />
          )}

          {renderWaitingForUnlockStateView()}
        </Box>
      )}
      {loading && (
        <Box fill pad="large" align="center" justify="center" gap="medium">
          <Spinner size="large" />
        </Box>
      )}
    </Box>
  );
};

export default Listing;
