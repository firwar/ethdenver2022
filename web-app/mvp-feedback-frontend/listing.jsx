import React, { useState, useEffect, useContext } from "react";
import {
  Anchor,
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Form,
  FormField,
  Grommet,
  Heading,
  Image,
  Layer,
  ResponsiveContext,
  Spinner,
  Stack,
  Text,
  TextInput,
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
// import { OfferList } from "./offerList";
import ToastContext from "../hooks/useToast";
import BiconomyContext from "../hooks/useBiconomy";
import { SellerStatusPanel } from "./sellerStatusPanel";
import { ListingPanel } from "./panel/listingPanel";

export const LISTING_STATES = {
  0: "Open",
  1: "Locked",
  2: "SellerUnlocked",
  3: "BuyerUnlocked",
  4: "Canceled",
  5: "Completed",
};
const TEN_SECONDS = 10 * 1000;

const LISTING_DETAIL_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/getListingDetail";
const LISTING_IMAGE_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/getListingImage";
const CLAIM_LISTING_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/claimListing";
const CLAIM_LISTING_TXN_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/claimListingTxn";
const UNLOCK_LISTING_TXN_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/unlockListingTxn";
const LISTING_VISIT_COUNT_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/updateListingVisitCount";

// TODO we probably want to listen to events and update the view if we've submitted offer etc
// eslint-disable-next-line react/prop-types
const Listing = ({ listingId }) => {
  const router = useRouter();
  const { provider } = useContext(ProviderContext);
  const { signer } = useContext(SignerContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { listing, setListing } = useContext(ListingContext);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const { biconomy } = useContext(BiconomyContext);
  const { setToast } = useContext(ToastContext);

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
  const [imageBase64, setImageBase64] = useState("");
  const [minimumEscrow, setMinimumEscrow] = useState(0);
  const [escrowedAmount, setEscrowedAmount] = useState(0);
  const [price, setPrice] = useState(0);
  const [listingState, setListingState] = useState(null);
  const [stateChecker, setStateChecker] = useState(null);
  const [unlockCode, setUnlockCode] = useState(null);
  const [listingAddress, setListingAddress] = useState("");
  const [txnLink, setTxnLink] = useState(null);
  const [claimTxnAddress, setClaimTxnAddress] = useState("");
  const [unlockTxnAddress, setUnlockTxnAddress] = useState("");
  // userName is the sellerName ie. whoever owns the listing
  const [sellerName, setSellerName] = useState(null);

  // Retrieve the listing information based on listingId
  useEffect(() => {
    if (listingId === null || listingId === undefined) {
      return;
    }
    const listingRequestQueryParam = new URLSearchParams({ listingId });
    console.log(listingId);

    const queryUpdateVisitCount = `${LISTING_VISIT_COUNT_URL}?${listingRequestQueryParam}`;
    fetch(queryUpdateVisitCount)
      .then(async (res) => {
        const response = await res.json();
        const { data } = response;
      })
      .catch((e) => {
        console.log(e);
      });
 
    // Make a request to get listing info
    const queryDetail = `${LISTING_DETAIL_URL}?${listingRequestQueryParam}`;
    fetch(queryDetail)
      .then(async (res) => {
        const response = await res.json();
        console.log(response);
        const {
          title,
          description,
          price,
          postDate,
          categoryId,
          locationName,
          userName,
        } = response;
        setDescription(description);
        setPrice(price);
        setLocation(locationName);
        setTitle(title);
        setSellerName(userName);
        if (response.listingAddress !== undefined) {
          setListingAddress(response.listingAddress);
        }
        if (response.sellerAddress !== undefined) {
          setSellerAddress(response.sellerAddress);
        }
        if (response.claimListingTxn !== undefined) {
          setClaimTxnAddress(response.claimListingTxn);
          console.log(`claim listing txn ${response.claimListingTxn}`);
        }
        if (response.unlockListingTxn !== undefined) {
          setUnlockTxnAddress(response.unlockListingTxn);
          console.log(`claim listing txn ${response.claimListingTxn}`);
        }
      })
      .catch((e) => {
        console.log(e);
      });
    const queryImage = `${LISTING_IMAGE_URL}?${listingRequestQueryParam}`;
    fetch(queryImage)
      .then(async (res) => {
        const response = await res.json();
        const { data } = response;
        setImageBase64(`data:image/png;base64, ${data}`);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [listingId]);

  // Use provider to make sure we have the right network
  useEffect(() => {
    if (provider === null || signer === null || biconomy == null) {
      return;
    }
    console.log(biconomy);

    async function fetchNetwork() {
      const network = await provider.getNetwork();
      const { chainId } = network;
      console.log(`ChainId ${chainId} ${chainId != 0x89}`);

      if (
        chainId != 0x89 &&
        biconomy._config.apiKey.prod !=
          "dnXuUmeKM.c48144f3-72a1-445c-b342-4604ba35ea86"
      ) {
        console.log(chainId);
        setStatus("wrongChain");
      } else {
        // TODO Remove this and inspect the contract properties
        console.log("setting roles");
        setRole("seller");
        if (status == null || status == "wrongChain") {
          console.log("setting open");
          console.log(status);
          setStatus("open");
        }
      }
    }
    fetchNetwork();
  }, [provider, signer, biconomy]);

  // If we have submitted a claim listing transaction, use the existing transaction
  // TODO: may need a timeout here based on the blocknumber
  useEffect(() => {
    if (
      biconomy === null ||
      provider === null ||
      signer === null ||
      claimTxnAddress === ""
    ) {
      return;
    }
    // TODO the fact that a listing exists means someone claimed it in the MVP
    // We do some checks against the state but it ignores that actual usage of state
    // When a contract is created (ie. when it's claimed) it will default to Open
    async function fetchListingWeb3() {
      // If we have a claim txn ongoing but no listing address yet
      if (listingAddress === "" && claimTxnAddress !== "") {
        // Check if we finished the claim txn on this refresh
        console.log("fetching claimTxn receipt");
        let receipt = await provider.getTransactionReceipt(claimTxnAddress);
        if (receipt != null) {
          console.log(
            `Read transaction receipt and set listing address ${receipt.logs[0].address}`
          );
          // Listing address taken from receipt transaction hash
          let _listingAddress = receipt.logs[0].address;
          // Seller address taken from decoded event
          let _senderAddress = ethers.utils.defaultAbiCoder.decode(
            ["address", "address"],
            receipt.logs[1].data
          )[0];

          const bodyData = {
            listingId,
            listingAddress: _listingAddress,
            sellerAddress: _senderAddress,
          };

          console.log(
            `Looked up txn and making a claim for ${listingId} with ${_listingAddress} and ${_senderAddress}`
          );
          // Make a request to get listing info
          fetch(CLAIM_LISTING_URL, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
          })
            .then((res) => {
              console.log(res);
            })
            .catch((e) => {
              console.log(e);
            });

          setListingAddress(_listingAddress);
          setSellerAddress(_senderAddress);

          setStatus("locked");
        } else {
          setStatus("locking");
        }
      }
    }

    fetchListingWeb3();
  }, [biconomy, provider, claimTxnAddress, signer]);

  // If we have submitted a unlock listing transaction, use the existing transaction
  // TODO: may need a timeout here based on the blocknumber
  useEffect(() => {
    if (
      biconomy === null ||
      provider === null ||
      signer === null ||
      unlockTxnAddress === ""
      //(sellerAddress === "" || listingAddress === "")
    ) {
      return;
    }

    // TODO the fact that a listing exists means someone claimed it in the MVP
    // We do some checks against the state but it ignores that actual usage of state
    // When a contract is created (ie. when it's claimed) it will default to Open
    async function fetchListingWeb3() {
      // If we have a claim txn ongoing but no listing address yet
      if (unlockTxnAddress !== "") {
        // Check if we finished the claim txn on this refresh
        console.log("fetching unlockTxn receipt");
        let receipt = await provider.getTransactionReceipt(claimTxnAddress);
        if (receipt != null) {
          setStatus("complete");
        } else {
          setStatus("withdrawing");
        }
      }
    }

    fetchListingWeb3();
  }, [biconomy, provider, unlockTxnAddress, signer]);

  // If we have an actual listingAddress read the state
  useEffect(() => {
    if (
      biconomy === null ||
      provider === null ||
      signer === null ||
      //((sellerAddress === "" || listingAddress === "") && claimTxnAddress === "" )
      sellerAddress === "" ||
      listingAddress === ""
    ) {
      return;
    }

    console.log("seller address update");
    // TODO the fact that a listing exists means someone claimed it in the MVP
    // We do some checks against the state but it ignores that actual usage of state
    // When a contract is created (ie. when it's claimed) it will default to Open
    async function fetchListingWeb3() {
      const currentListing = new Contract(
        listingAddress,
        abis.Listing.abi,
        provider
      );
      console.log(`Listing address in update ${listingAddress}`);
      const [_contractSellerAddress, _listingState] = await Promise.all([
        await currentListing.sellerAddress(),
        // await currentListing.connect(signer).buyerAddress(),
        await currentListing.listingState(),
      ]);
      console.log(
        `Seller ${_contractSellerAddress} Buyer fixme{_contractBuyerAddress} State ${_listingState}`
      );
      setSellerAddress(_contractSellerAddress);
      // setBuyerAddress(_contractBuyerAddress);
      // eslint-disable-next-line no-prototype-builtins
      if (LISTING_STATES.hasOwnProperty(_listingState)) {
        // eslint-disable-next-line no-underscore-dangle
        // TODO reenable this when we have a proper listing
        setListingState(LISTING_STATES[_listingState]);
        // TODO when people actually use the contract as intended
        // the state should be Locked if we want to set status to Locked
        if (LISTING_STATES[_listingState] === "Open") {
          if (unlockTxnAddress == "") {
            setStatus("locked");
          }
        }
        if (LISTING_STATES[_listingState] === "Completed") {
          setStatus("complete");
        }
      }
    }

    fetchListingWeb3();
  }, [biconomy, provider, sellerAddress, listingAddress, signer]);

  // Connect to the gateway
  useEffect(() => {
    if (exchangeItGateway === null) {
      return;
    }
    // Clear out to make sure we don't have duplicated calls
    exchangeItGateway.removeAllListeners("ListingCreated");
    exchangeItGateway.removeAllListeners("ListingWithdrawn");
    // Listen to listing created event
    exchangeItGateway.on(
      "ListingCreated",
      async (_senderAddress, _listingAddress) => {
        // cancel spinner even though we redirect
        setToast({ status: "ok", message: "Listing Claimed" });
        console.log(_senderAddress);
        console.log(_listingAddress);
        setTxnLink(null);

        setListingAddress(_listingAddress);
        // Make a post and update our listingId with the listingAddress and sellerAddress
        const bodyData = {
          listingId,
          listingAddress: _listingAddress,
          sellerAddress: _senderAddress,
        };
        console.log(
          `Making a claim for ${listingId} with ${_listingAddress} and ${_senderAddress}`
        );
        // Make a request to get listing info
        fetch(CLAIM_LISTING_URL, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        })
          .then((res) => {
            console.log(res);
          })
          .catch((e) => {
            console.log(e);
          });
        // update local storage if possible

        setStatus("locked");
      }
    );
    exchangeItGateway.on(
      "ListingWithdrawn",
      async (senderAddress, listingAddress) => {
        // cancel spinner even though we redirect
        setToast({ status: "ok", message: "Listing Reward Withdrawn!" });
        console.log(senderAddress);
        console.log(listingAddress);
        setStatus("complete");
        setTxnLink(null);
        // update local storage if possible
      }
    );
  }, [exchangeItGateway]);

  const onClaim = async () => {
    setStatus("locking");
    console.log("address");
    let sellerAddress = await signer.getAddress();
    let _unlockCodeBuyer = "142857";
    let _unlockCodeSeller = "111111";
    let { data } = await biconomy._contract.populateTransaction.claimListing(
      ethers.utils.solidityKeccak256(["string"], [_unlockCodeBuyer]),
      ethers.utils.solidityKeccak256(["string"], [_unlockCodeSeller]),
      sellerAddress
    );

    let provider = biconomy._biconomy.getEthersProvider();
    let gasLimit = await provider.estimateGas({
      to: biconomy._config.contract.address,
      from: await signer.getAddress(),
      data: data,
    });
    console.log("Gas limit : ", gasLimit);
    let txParams = {
      data: data,
      //value: ethers.utils.parseUnits("0.001", "ether"),
      to: biconomy._config.contract.address,
      //gasLimit: gasLimit,
      from: await signer.getAddress(),
      signatureType: "EIP712_SIGN",
    };
    let tx;
    try {
      tx = await provider.send("eth_sendTransaction", [txParams]);
      let _txnLink = "https://polygonscan.com/tx/" + tx;

      console.log(_txnLink);
      setTxnLink(_txnLink);

      const bodyData = {
        listingId,
        claimListingTxn: tx,
      };
      console.log(`Making a claim for ${listingId} with ${tx}`);

      fetch(CLAIM_LISTING_TXN_URL, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (err) {
      console.log("handle errors like signature denied here");
      console.log(err);
    }

    console.log("Transaction hash : ", tx);
  };

  const onWithdraw = async () => {
    try {
      console.log(listingAddress);
      console.log("address");
      let _address = await signer.getAddress();
      setStatus("withdrawing");
      let { data } =
        await biconomy._contract.populateTransaction.unlockListingAndWithdraw(
          ethers.utils.getAddress(listingAddress),
          unlockCode.toString(),
          _address
        );

      let provider = biconomy._biconomy.getEthersProvider();
      /*
    let gasLimit = await provider.estimateGas({
        to: biconomy._config.contract.address,
        from: await signer.getAddress(),
        data: data
    });
    */
      let txParams = {
        data: data,
        to: biconomy._config.contract.address,
        from: await signer.getAddress(),
        signatureType: "EIP712_SIGN",
      };
      let tx;
      try {
        tx = await provider.send("eth_sendTransaction", [txParams]);
        let _txnLink = "https://polygonscan.com/tx/" + tx;
        console.log(_txnLink);
        setTxnLink(_txnLink);

        const bodyData = {
          listingId,
          unlockListingTxn: tx,
        };
        console.log(`Submitting unlock txn ${listingId} with ${tx}`);

        fetch(UNLOCK_LISTING_TXN_URL, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        })
          .then((res) => {
            console.log(res);
          })
          .catch((e) => {
            console.log(e);
          });
      } catch (err) {
        console.log("handle errors like signature denied here");
        console.log(err);
        setStatus("locked");
      }

      console.log("Transaction hash : ", tx);
    } catch (err) {
      console.log(err);
      setStatus("locked");
    }
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setUnlockCode(value);
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

  return (
    <ResponsiveContext.Consumer>
      {(size) =>
        size === "small" ? (
          <Box>
            {!loading && (
              <Box pad="medium" align="center" gap="medium">
                <Card elevation="large" width="medium" height="35em">
                  <Stack anchor="bottom-left">
                    <CardBody height="medium" width="medium">
                      <Image fit="cover" src={imageBase64} />
                    </CardBody>
                    <CardHeader
                      pad={{ horizontal: "small", vertical: "small" }}
                      // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4#all-hex-value-from-100-to-0-alpha
                      background="#000000A0"
                      //background="#210033"
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
                        {/*
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

                          */}
                        <Icon icon={usdIcon} color="white" />
                        <Heading level="3" margin="none" textAlign="end">
                          {price}
                        </Heading>
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
                        sellerName={sellerName}
                        sellerName={sellerName}
                      />

                    <Box width="9em" alignSelf="end">
                          <Image fit="contain" src="/images/polygon-badge.svg" />
                    </Box>
                    </Box>

                  </CardFooter>
                </Card>
                <Box height="10em">
                <SellerStatusPanel
                  status={status}
                  provider={provider}
                  role={role}
                  txnLink={txnLink}
                  onClaim={onClaim}
                  onWithdraw={onWithdraw}
                  unlockCode={unlockCode}
                  onChange={onChange}
                />

                </Box>
                {renderWaitingForUnlockStateView()}
              </Box>
            )}
            {loading && (
              <Box
                fill
                pad="large"
                align="center"
                justify="center"
                gap="medium"
              >
                <Spinner size="large" />
              </Box>
            )}
          </Box>
        ) : (
          <ListingPanel
            imageBase64={imageBase64}
            sellerAddress={sellerAddress}
            sellerName={sellerName}
            description={description}
            contactInfo={contactInfo}
            price={price}
            title={title}
            location={location}
            sellerStatusPanel={
              <SellerStatusPanel
                status={status}
                provider={provider}
                role={role}
                txnLink={txnLink}
                onClaim={onClaim}
                onWithdraw={onWithdraw}
                unlockCode={unlockCode}
                onChange={onChange}
              />
            }
          />
        )
      }
    </ResponsiveContext.Consumer>
  );
};

export default Listing;
