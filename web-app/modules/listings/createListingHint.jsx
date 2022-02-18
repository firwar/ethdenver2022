import React from "react";
import { useRouter } from "next/router";
import { Box, Button, Text } from "grommet";

export const CreateListingHint = () => {
  const router = useRouter();
  const onClick = () => {
    router.push("/listings/create");
  };
  return (
    <Box align="center" widht="medium" pad="small" gap="small">
      <Text> Be the first to create a listing!</Text>
      <Button primary label="Create Listing" onClick={onClick} />
    </Box>
  );
};
