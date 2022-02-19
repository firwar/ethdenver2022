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

      //define a falg for each contract call
      var flag1 = new Boolean(false);
      var flag2 = new Boolean(false);
      var flag3 = new Boolean(false);
      var flag4 = new Boolean(false);
      var flag5 = new Boolean(false);
      var flag6 = new Boolean(false);
      var flag7 = new Boolean(false);

      //define a max number of times to retry the request and associated counter
      const MAX_TRIES = 10;
      var iterations = 0;

      //Try for 7 api hits
      do {
        //if iterations is larger than max tries break from do loop, else increment and continue
        if(iterations++ > MAX_TRIES) 
        {
          break;
        }

        //if the await function call hits the 40 requests per second limit it will throw an
        //error and enter the catch statement and not set the associated flag to true.
        //On the next iteration the contract will be called again.
        try{
          if(flag1 == false)
          {
            setEscrow(
              ethers.utils.formatEther(
                await contract.connect(signer).listingMinEscrow()
              )
            );
            flag1 = true;
          }
          if(flag2 == false)
          {
            setDescription(await contract.connect(signer).listingDescription());
            flag2 = true;
          }
          if(flag3 == false)
          {
            setTitle(await contract.connect(signer).listingTitle());
            flag3 = true;
          }
          if(flag4 == false)
          {
            setLocation(await contract.connect(signer).listingLocation());
            flag4 = true;
          }
          if(flag5 == false)
          {
            const ipfsHash = await contract.connect(signer).listingImageLink();

            if (ipfsHash.length < 46) {
              setImageLink("//v2.grommet.io/assets/IMG_4245.jpg");
            } else {
              setImageLink(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            }
            flag5= true;
          }
          if(flag6 == false)
          {
            const bigNumberPrice = await contract.connect(signer).listingPrice();
            setPrice(ethers.utils.formatEther(bigNumberPrice));
            flag6 = true;
          } 
          if(flag7 == false)
          {
            const bigNumberEscrow = await contract.connect(signer).listingMinEscrow();
            setEscrow(ethers.utils.formatEther(bigNumberEscrow));
            flag7 = true;
          }
        }catch(error)
        {
          console.log(error);
          //Adding a delay before retrying to slow down requests per second
          //Increasing backoff window
          await new Promise(r => setTimeout(r, 50 + iterations * 50));
        }

      }while(flag1 == false || 
              flag2 == false || 
              flag3 == false || 
              flag4 == false || 
              flag5 == false || 
              flag6 == false || 
              flag7 == false );
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
