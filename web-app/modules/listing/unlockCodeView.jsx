import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Paragraph,
  TextInput,
} from "grommet";
import ListingContext from "../hooks/useListing";
import ToastContext from "../hooks/useToast";
import SignerContext from "../hooks/useSigner";

export const UnlockCodeView = ({ role }) => {
  const { signer } = useContext(SignerContext);
  const { listing } = useContext(ListingContext);

  const [counterpartyRole, setCounterpartyRole] = useState(null);
  const [myUnlockCode, setMyUnlockCode] = useState(null);
  const [unlockCode, setUnlockCode] = useState(null);

  const { setToast } = useContext(ToastContext);

  useEffect(() => {
    // Depending on the role we will setup the unlock code view
    if (role === null || role === "viewer" || listing === null) {
      return;
    }

    // Buyer -> Seller or Seller -> Buyer
    setCounterpartyRole(role === "buyer" ? "seller" : "buyer");

    if (typeof window !== "undefined") {
      // This is probably ok because you most likely wouldn't share the same phone/browser w/ counterparty
      const key = `${role}_${listing.address}_unlock_code`;
      console.log(key);
      setMyUnlockCode(localStorage.getItem(key));
    }
  }, [role, listing]);

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setUnlockCode(value);
  };

  const unlockContract = async () => {
    if (listing === null || signer === null) {
      console.log("Listing or signer is null somehow");
      return;
    }
    try {
      if (role === "buyer") {
        await listing.connect(signer).unlockListingBuyer(unlockCode.toString());
      } else if (role === "seller") {
        await listing
          .connect(signer)
          .unlockListingSeller(unlockCode.toString());
      }
    } catch (e) {
      console.log(e);
      setToast({ status: "error", message: e.message });
    }
  };

  const geoUnlock = async () => {
    try {
      await listing.connect(signer).requestUserLocation();
    } catch (e) {
      setToast({ status: "error", message: e.message });
    }
  };

  return (
    <Box pad="medium" align="center" gap="medium">
      <Card elevation="large" width="medium">
        <CardBody height="small">
          <Box align="start" width="medium" pad="small">
            <Heading level="4" margin={{ vertical: "medium" }}>
              {`Your ${role} unlock code (give to ${counterpartyRole}):`}
            </Heading>
            {myUnlockCode === null ? (
              <Paragraph color="status-critical">
                Code not found! Try to remember it like your Ethereum wallet
                password
              </Paragraph>
            ) : (
              <Heading level="5" margin={{ vertical: "medium" }}>
                {myUnlockCode}
              </Heading>
            )}
          </Box>
        </CardBody>
      </Card>
      <Card elevation="large" width="medium">
        <CardBody height="large">
          <Box align="start" width="medium" pad="small">
            <Heading level="4" margin={{ vertical: "medium" }}>
              {`Enter ${counterpartyRole}'s unlock code:`}
            </Heading>
            <TextInput
              id="lock-code"
              placeholder="123456"
              value={unlockCode !== null ? unlockCode : ""}
              onChange={onChange}
            />
          </Box>
          <Box align="center" widht="medium" pad="small">
            <Button primary label="Unlock" onClick={unlockContract} />
          </Box>
          <Box align="center" widht="medium" pad="small">
            <Button primary label="Geo Unlock" onClick={geoUnlock} />
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};
