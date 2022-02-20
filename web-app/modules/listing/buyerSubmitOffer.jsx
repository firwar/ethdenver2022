import React, { useContext } from "react";
import { Box, Button, Card, CardBody, Form, FormField } from "grommet";
import { ethers } from "ethers";
import ToastContext from "../hooks/useToast";
import ExchangeItGatewayContext from "../hooks/useExchangeItGateway";
import SignerContext from "../hooks/useSigner";
import ListingContext from "../hooks/useListing";

export const BuyerSubmitOffer = () => {
  const { signer } = useContext(SignerContext);
  const { exchangeItGateway } = useContext(ExchangeItGatewayContext);
  const { listing } = useContext(ListingContext);
  const { setToast } = useContext(ToastContext);

  // TODO wrap this in useCallback
  const submitOffer = async ({ value }) => {
    if (signer === null || exchangeItGateway === null || listing === null) {
      console.log("Cant submit with null address and gateway");
      return;
    }

    // Store the key on local storage for the person buying
    if (typeof window !== "undefined") {
      // This is probably ok because you most likely wouldn't share the same phone/browser w/ counterparty
      const key = `buyer_${listing.address}_unlock_code`;
      localStorage.setItem(key, value.lockCode);
    }

    try {
      await exchangeItGateway
        .connect(signer)
        .submitOffer(
          listing.address,
          ethers.utils.solidityKeccak256(["string"], [value.lockCode]),
          { value: ethers.utils.parseUnits(value.escrow.toString(), "ether") }
        );
      // TODO: Change this to waiting for event
      setToast({ status: "ok", message: "Submitted offer!" });
    } catch (e) {
      console.log(e);
      setToast({ status: "error", message: e.message });
    }
  };

  return (
    <Card elevation="large" width="medium">
      <CardBody height="small">
        <Box fill overflow="auto" align="center" justify="center" pad="small">
          <Box flex={false} width="medium">
            <Form onSubmit={submitOffer}>
              <FormField
                label="Contact:"
                name="contact"
                type="email"
                required
              />
              <FormField
                label="Offer Escrow (Matic):"
                name="escrow"
                required
                validate={[
                  (name) => {
                    if (name <= 0) return "must be >0";
                    return undefined;
                  },
                ]}
              />
              <FormField
                label="6 Digit Lock Code:"
                name="lockCode"
                required
                validate={[{ regexp: /^[0-9]{6}$/i }]}
              />
              <Box direction="row" justify="end" margin={{ top: "medium" }}>
                <Button
                  type="submit"
                  label="Submit Offer"
                  color="accent-4"
                  style={{
                    borderRadius: 2,
                  }}
                  primary
                />
              </Box>
            </Form>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};
