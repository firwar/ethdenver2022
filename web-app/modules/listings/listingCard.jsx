import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { Box, Card, CardBody, Heading, Image, Tip } from "grommet";
import { Icon } from "@iconify/react";
import maticIcon from "@iconify-icons/cryptocurrency/matic";
import usdIcon from "@iconify-icons/cryptocurrency/usd";

import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { ProviderContext } from "../hooks";

import { abis } from "../contracts";

export const ListingCard = ({ listingAddress }) => {
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const { provider } = useContext(ProviderContext);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [price, setPrice] = useState(0);
  const [escrow, setEscrow] = useState("");

  useEffect(() => {
    if (listingAddress === null || listingAddress === "") {
      return;
    }
    const newListing = new Contract(listingAddress, abis.Listing.abi, provider);
    const newSigner = provider.getSigner();
    setSigner(newSigner);
    setContract(newListing);
  }, [listingAddress]);

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
      setPrice(ethers.utils.formatEther(bigNumberPrice));
      setEscrow(ethers.utils.formatEther(bigNumberEscrow));
    }
    setData();
  }, [contract, signer]);

  return (
    <Link href={`/listing/${listingAddress}`}>
      <Card
        key={listingAddress}
        elevation="large"
        height="medium"
        width="medium"
        round="false"
        pad="xsmall"
        hoverIndicator={{ color: "light-4" }}
      >
        <Box height="small">
          <Image fit="cover" src={imageLink} />
        </Box>
        <Box
          pad={{ horizontal: "small" }}
          responsive
          justify="between"
          align="center"
          direction="row"
          height="xxsmall"
        >
          <Heading
            level="5"
            pad={{ horizontal: "medium" }}
            textAlign="start"
            truncate
          >
            {title}
          </Heading>
        </Box>
        <Box
          pad={{ horizontal: "small", vertical: "none" }}
          margin="none"
          responsive
          align="center"
          direction="row"
          height="xxsmall"
          gap="xsmall"
        >
          <Heading level="5" textAlign="start">
            Price:
          </Heading>
          <Icon icon={usdIcon} color="darkGreen" />
          <Heading level="5" textAlign="start">
            {price}
          </Heading>
        </Box>
        <Box
          pad={{ horizontal: "small", vertical: "none" }}
          responsive
          align="center"
          direction="row"
          height="xxsmall"
          gap="xsmall"
        >
          <Heading level="5" textAlign="start">
            Escrow:
          </Heading>
          <Icon icon={maticIcon} color="blueViolet" />
          <Heading level="5" textAlign="start">
            {escrow}
          </Heading>
        </Box>
        <Box pad={{ horizontal: "small" }} responsive={false}>
          <Heading level="6" margin={{ vertical: "none" }} color="dark-3">
            {location}
          </Heading>
        </Box>
      </Card>
    </Link>
  );
};
