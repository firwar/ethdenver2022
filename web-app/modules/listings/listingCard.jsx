import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Image,
  Layer,
  Markdown,
  Paragraph,
  Text,
  TextInput,
  Tip,
} from "grommet";
import { Icon } from "@iconify/react";
import maticIcon from "@iconify-icons/cryptocurrency/matic";
import usdIcon from "@iconify-icons/cryptocurrency/usd";

import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { ProviderContext } from "../hooks";

import { abis } from "../contracts";
import { FormClose } from "grommet-icons";
import ModalContext from "../hooks/useModal";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import ToastContext from "../hooks/useToast";
import SubmitOffer from "../listing/submitOffer";
import {getRandomNumber, getRandomString} from "../utils";
import { useRouter } from "next/router";

const fakeOffers = {
  "0x02d6c4297Eec8a25226AE0dc77344B0BDEBF442a": 100,
  "0x12d6c4297Eeaaaa226AE0dc77bbbbbbbbbbbb42a": 100,
  "0xa2d6c4297Eec8a25226AE0dc77344B0BDEBF442a": 200,
};

export const ListingCard = ({
  listingAddress,
  currentUserAddress,
  viewOnly,
}) => {
  const router = useRouter();
  const [signer, setSigner] = useState(null);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const [contract, setContract] = useState(null);
  const { provider } = useContext(ProviderContext);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [price, setPrice] = useState(0);
  const [escrow, setEscrow] = useState("");
  const [offers, setOffers] = useState({});
  const { setToast } = useContext(ToastContext);
  const [submittedOffer, setSubmittedOffer] = useState(false);

  // Modal stuff
  const { setModalOpen } = useContext(ModalContext);
  const [open, setOpen] = useState(false);
  const [offerValue, setOfferValue] = useState(0);

  // Get the listing
  useEffect(() => {
    if (listingAddress === null || listingAddress === "" || provider === null) {
      return;
    }
    const newListing = new Contract(listingAddress, abis.Listing.abi, provider);
    const newSigner = provider.getSigner();
    setSigner(newSigner);
    setContract(newListing);
  }, [listingAddress, provider]);

  // Get the listing information
  useEffect(() => {
    if (contract === null || signer === null) {
      return;
    }
    // TODO: Get information from contract
    async function setData() {
      setEscrow(
        ethers.utils.formatEther(
          await contract.connect(signer).listingMinEscrow()
        )
      );
      setDescription(await contract.connect(signer).listingDescription());
      setTitle(await contract.connect(signer).listingTitle());
      setLocation(await contract.connect(signer).listingLocation());
      const ipfsHash = await contract.connect(signer).listingImageLink();
      if (ipfsHash.length < 46) {
        setImageLink("//v2.grommet.io/assets/IMG_4245.jpg");
      } else {
        setImageLink(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      }
      const bigNumberPrice = await contract.connect(signer).listingPrice();
      const bigNumberEscrow = await contract.connect(signer).listingMinEscrow();
      setOfferValue(ethers.utils.formatEther(bigNumberPrice));
      setPrice(ethers.utils.formatEther(bigNumberPrice));
      setEscrow(ethers.utils.formatEther(bigNumberEscrow));
    }
    setData();
  }, [contract, signer]);

  const onOpen = async () => {
    router.push(`/listing/${listingAddress}`);
    // const listingOffersTuples = await contract
    //   .connect(signer)
    //   .getListingOffers();
    // const listingOfferAddress = listingOffersTuples[0];
    // const listingMap = {};
    // listingOfferAddress.forEach((userAddress, index) => {
    //   console.log(`${userAddress} - ${currentUserAddress}`);
    //   if (
    //     userAddress.toLowerCase() === (currentUserAddress || "").toLowerCase()
    //   ) {
    //     listingMap["You"] = ethers.utils.formatEther(
    //       listingOffersTuples[1][index]
    //     );
    //     setSubmittedOffer(true);
    //   } else {
    //     listingMap[userAddress] = ethers.utils.formatEther(
    //       listingOffersTuples[1][index]
    //     );
    //   }
    // });
    // console.log(listingMap);
    // setOffers(listingMap);
    // // setOffers(fakeOffers);
    // setModalOpen(true);
    // setOpen(true);
  };
  const onClose = () => {
    setModalOpen(false);
    setOpen(undefined);
  };

  const getOfferCards = () => {
    console.log(offers);
    return Object.keys(offers).map((offerAddress) => {
      const gravatarLink = `https://www.gravatar.com/avatar/${offerAddress}?s=32&d=robohash&r=PG`;

      return (
        <Box
          key={offerAddress}
          height="xxsmall"
          direction="row"
          justify="center"
          align="center"
          alignContent="between"
          round={false}
        >
          <Box
            direction="row"
            justify="center"
            align="center"
            alignContent="between"
            gap="small"
          >
            <Box width="xxsmall">
              <Avatar src={gravatarLink} size="small" />
            </Box>
            <Box width="medium">
              <Heading level="4" truncate>
                {offerAddress}
              </Heading>
            </Box>
            <Box width="small" align="end">
              <Heading level="4" truncate>
                {offers[offerAddress]}
              </Heading>
            </Box>
          </Box>
        </Box>
      );
    });
  };

  const submitOffer = async () => {
    if (
      signer === null ||
      exchangeItGateway === null ||
      listingAddress === null ||
      listingAddress === ""
    ) {
      console.log("Cant submit with null address and gateway");
      return;
    }

    const unlockCode = getRandomNumber(6).toLowerCase();
    console.log(`Unlock Code ${unlockCode}`);
    // Store the key on local storage for the person buying
    if (typeof window !== "undefined") {
      // This is probably ok because you most likely wouldn't share the same phone/browser w/ counterparty
      const key = `buyer_${listingAddress}_unlock_code`;
      localStorage.setItem(key, unlockCode);
    }

    try {
      await exchangeItGateway
        .connect(signer)
        .submitOffer(
          listingAddress,
          ethers.utils.solidityKeccak256(["string"], [unlockCode]),
          { value: ethers.utils.parseUnits(offerValue.toString(), "ether") }
        );
      // TODO: Change this to waiting for event
      setToast({ status: "ok", message: "Submitted offer!" });
    } catch (e) {
      console.log(e);
      setToast({ status: "error", message: e.message });
    }
  };

  return (
    <Box>
      <Box
        key={listingAddress}
        width="medium"
        round="false"
        pad="xsmall"
        style={{
          background: "transparent",
        }}
      >
        <Box height="medium">
          <Image fit="cover" src={imageLink} />
        </Box>
        <Card
          direction="row"
          justify="between"
          align="center"
          alignContent="between"
          background="light-1"
          round="xsmall"
          pad="medium"
          style={{
            zIndex: "1",
            height: "10vh",
            width: "80%",
            position: "relative",
            left: 0,
            right: 0,
            bottom: 32,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Box
            pad={{ horizontal: "small", vertical: "none" }}
            align="start"
            direction="column"
            height="xxsmall"
            width="xsmall"
            gap="xsmall"
          >
            <Box width="medium">
              <Heading margin="none" level="3" truncate>
                {title}
              </Heading>
            </Box>
            <Box direction="row" justify="center" align="center" gap="small">
              <Icon icon={usdIcon} color="green" />
              <Text margin="none" size="medium">
                {price}
              </Text>
            </Box>
          </Box>
          <Button
            gap="small"
            onClick={() => {
              onOpen();
            }}
            label={viewOnly ? "View" : "Place Escrow"}
            size="small"
            type="submit"
            color="accent-4"
            style={{
              borderRadius: 2,
            }}
            primary
          />
        </Card>
      </Box>
      {open && (
        <Layer
          full={true}
          position="center"
          onClickOutside={onClose}
          align="center"
          justify="center"
          onEsc={onClose}
          style={{
            background: "rgba(55,55,55,.6)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <Box
            pad="medium"
            margin="large"
            background="light-1"
            direction="column"
          >
            <Box height="medium">
              <Image fit="cover" src={imageLink} />
            </Box>
            <Box>
              <Heading margin="small" level="3">
                Description
              </Heading>
              <Paragraph size="small" style={{ margin: "6px" }}>
                {description}
              </Paragraph>
            </Box>
            <Heading margin="small" level="3">
              Top Escrow
            </Heading>
            <Box>
              {Object.keys(offers).length === 0 ? (
                <Card
                  height="xxsmall"
                  direction="row"
                  justify="center"
                  align="center"
                  alignContent="between"
                  margin={{ bottom: "medium" }}
                >
                  No Offers
                </Card>
              ) : (
                getOfferCards()
              )}
            </Box>
            {submittedOffer || viewOnly ? (
              <Box>
                <Button
                  alignSelf="center"
                  label="View Exchange Instructions"
                  onClick={() => {
                    setModalOpen(false);
                    router.push(`/listing/${listingAddress}`);
                  }}
                  style={{
                    borderRadius: 2,
                  }}
                  primary
                />
              </Box>
            ) : (
              <SubmitOffer
                price={price}
                offerValue={offerValue}
                setOfferValue={setOfferValue}
                submitOffer={submitOffer}
              />
            )}
          </Box>
          <Box>
            <Button
              alignSelf="center"
              icon={<FormClose color="white" />}
              onClick={onClose}
            />
          </Box>
        </Layer>
      )}
    </Box>
  );
};
