import React from "react";
import { Box, Heading } from "grommet";
import Link from "next/link";

const LogoHeader = () => {
  return (
    <Link href="/listings">
      <Box
        gap="small"
        margin="none"
        align="center"
        direction="row"
        focusIndicator={false}
      >
        <Heading level={3} size="medium" margin="none">
          ExchangeIt
        </Heading>
      </Box>
    </Link>
  );
};

export default LogoHeader;
