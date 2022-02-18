import React from "react";
import { Lock, Add, Update } from "grommet-icons";
import { Box, Heading } from "grommet";
import Link from "next/link";
import { SearchBar } from "./searchBar";

const LogoHeader = () => {
  const setQuery = (query) => {
    console.log(query);
  };
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
          Lock&Swap
        </Heading>
        <SearchBar setQuery={setQuery} />
      </Box>
    </Link>
  );
};

export default LogoHeader;
