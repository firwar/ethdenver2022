import { Box, Button, Heading, TextInput } from "grommet";
import React from "react";

const SubmitOffer = ({ price, offerValue, setOfferValue, submitOffer }) => {
  return (
    <Box>
      <Heading margin="small" level="3">
        Your Escrow
      </Heading>
      <Box
        direction="row"
        justify="between"
        align="center"
        alignContent="between"
        pad="small"
      >
        <Box
          pad={{ horizontal: "small", vertical: "none" }}
          responsive
          align="center"
          direction="column"
          height="xxsmall"
          gap="xsmall"
          style={{ paddingLeft: "0px" }}
        >
          <Box style={{ marginRight: "24px" }}>
            <TextInput
              placeholder={price}
              value={offerValue}
              onChange={(event) => setOfferValue(event.target.value)}
            />
          </Box>
        </Box>
        <Button
          gap="small"
          onClick={() => {
            submitOffer();
          }}
          label="Offer"
          size="large"
          type="submit"
          color="accent-4"
          style={{
            borderRadius: 2,
          }}
          primary
        />
      </Box>
    </Box>
  );
};

export default SubmitOffer;
