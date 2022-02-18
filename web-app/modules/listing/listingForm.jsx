import React, { useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Box, Button, Form, FormField, Grommet, Spinner } from "grommet";
import { useRouter } from "next/router";
import PinataFile from "../pinata/pinataFile";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import SignerContext from "../hooks/useSigner";
import ToastContext from "../hooks/useToast";

const ListingForm = () => {
  const router = useRouter();
  const [ipfsHash, setIpfsHash] = useState(null);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { signer } = useContext(SignerContext);
  const { setToast } = useContext(ToastContext);
  const [myUnlockCode, setMyUnlockCode] = useState();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (exchangeItGateway === null) {
      return;
    }
    // Clear out to make sure we don't have duplicated calls
    exchangeItGateway.removeAllListeners("ListingCreated");
    // Listen to listing created event
    exchangeItGateway.on(
      "ListingCreated",
      async (senderAddress, listingAddress) => {
        const signerAddress = await signer.getAddress();
        if (senderAddress === signerAddress) {
          // cancel spinner even though we redirect
          setCreating(false);
          // set the toast
          setToast({ status: "ok", message: "Created listing!" });
          // update local storage if possible
          if (typeof window !== "undefined") {
            // This is probably ok because you most likely wouldn't share the same phone/browser w/ counterparty
            const key = `seller_${listingAddress}_unlock_code`;
            console.log(key);
            console.log(myUnlockCode);
            setMyUnlockCode(localStorage.setItem(key, myUnlockCode));
          }
          // router user to newly created listing
          router.push(`/listing/${listingAddress}`);
        }
      }
    );
  }, [exchangeItGateway, myUnlockCode]);

  const onSubmit = async ({ value }) => {
    // Start spinner
    setCreating(true);
    // Create the actual listing
    await exchangeItGateway
      .connect(signer)
      .createListing(
        ipfsHash || "QmdrhgztmsZwV664Tfd4Z2jb2hKC4TkpzwKRs8jfhRAFTp",
        value.title,
        value.description,
        value.location,
        value.contact,
        ethers.utils.parseUnits(value.minEscrow.toString(), "ether"),
        ethers.utils.parseUnits(value.price, "ether"),
        ethers.utils.solidityKeccak256(["string"], [value.lockCode])
      );
    // TODO add some failure mechanism here if we timeout and show a toast
  };

  const onChange = (value) => {
    // Store the key on local storage for the person creating listing
    setMyUnlockCode(value.lockCode);
  };

  return (
    <Grommet>
      <Box fill overflow="auto" align="center" justify="center" pad="large">
        <Box flex={false} width="medium" gap="small">
          <PinataFile setIpfsHash={setIpfsHash} />
        </Box>
        <Box flex={false} width="medium" gap="small">
          <Form onSubmit={onSubmit} onChange={onChange}>
            <FormField
              label="Title"
              name="title"
              required
              validate={[
                { regexp: /^[a-z]/i },
                (name) => {
                  if (name && name.length === 1) return "must be >1 character";
                  return undefined;
                },
                (name) => {
                  if (name && name.length <= 2)
                    return { message: "that's short", status: "info" };
                  return undefined;
                },
              ]}
            />
            <FormField
              label="Description"
              name="description"
              required
              validate={[
                (name) => {
                  if (name && name.length === 1) return "must be >1 character";
                  return undefined;
                },
                (name) => {
                  if (name && name.length <= 2)
                    return { message: "that's short", status: "info" };
                  return undefined;
                },
              ]}
            />
            <FormField
              label="Location"
              name="location"
              required
              validate={[
                { regexp: /^[a-z]/i },
                (name) => {
                  if (name && name.length === 1) return "must be >1 character";
                  return undefined;
                },
                (name) => {
                  if (name && name.length <= 2)
                    return { message: "that's short", status: "info" };
                  return undefined;
                },
              ]}
            />
            <FormField label="Contact" name="contact" required />
            <FormField
              label="Price (USD)"
              name="price"
              required
              validate={[
                { regexp: /^[0-9]*$/i },
                (name) => {
                  if (name <= 0) return "must be > 0 USD";
                  return undefined;
                },
              ]}
            />
            <FormField
              label="Minimum Escrow (Matic)"
              name="minEscrow"
              required
              validate={[
                (name) => {
                  if (name < 0.1) return "must be > 0.1 Matic";
                  return undefined;
                },
              ]}
            />
            <FormField
              label="6 Digit Lock Code"
              name="lockCode"
              required
              validate={[{ regexp: /^[0-9]{6}$/i }]}
            />
            <Box
              direction="column"
              justify="center"
              align="center"
              margin={{ top: "medium" }}
              gap="medium"
            >
              <Button type="submit" label="Submit" primary />
              {creating && (
                <Spinner message="Start Built-in Spinner Announcement" />
              )}
            </Box>
          </Form>
        </Box>
      </Box>
    </Grommet>
  );
};

export default ListingForm;
