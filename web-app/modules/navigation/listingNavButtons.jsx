import React, { useState, useEffect, useContext } from "react";
import { Box, Heading, Button } from "grommet";
import Link from "next/link";
import { useRouter } from "next/router";
import * as path from "path";

const ListingNavButtons = () => {
  const router = useRouter();
  const [button1, setButton1] = useState(false);
  const [button2, setButton2] = useState(false);
  const [button3, setButton3] = useState(false);
  const [button4, setButton4] = useState(false);

  function resetAllButtons() {
    setButton1(false);
    setButton2(false);
    setButton3(false);
    setButton4(false);
  }

  useEffect(() => {
    const { pathname } = router;
    resetAllButtons();
    if (pathname === "/listings") {
      setButton1(true);
    } else if (pathname === "/listings/create") {
      setButton2(true);
    } else if (pathname === "/listings/mylistings") {
      setButton3(true);
    } else if (pathname === "/offers") {
      setButton4(true);
    }
  }, [router]);

  return (
    <Box
      gap="none"
      margin="small"
      pad={{ left: "medium", right: "xlarge" }}
      direction="row-responsive"
      align="end"
    >
      <Heading level="5" margin={{ vertical: "xxsmall", horizontal: "xsmall" }}>
        <Link href="/listings">
          <Button
            primary
            active={button1}
            size="small"
            label="All Listings"
            alignSelf="end"
            onClick={() => {
              resetAllButtons();
              setButton1(true);
            }}
          />
        </Link>
      </Heading>
      <Heading level="5" margin={{ vertical: "xxsmall", horizontal: "xsmall" }}>
        <Link href="/listings/create">
          <Button
            primary
            active={button2}
            size="small"
            label="Create Listing"
            alignSelf="end"
            onClick={() => {
              resetAllButtons();
              setButton2(true);
            }}
          />
        </Link>
      </Heading>
      <Heading level="5" margin={{ vertical: "xxsmall", horizontal: "xsmall" }}>
        <Link href="/listings/mylistings">
          <Button
            primary
            active={button3}
            size="small"
            label="My Listings"
            alignSelf="end"
            onClick={() => {
              resetAllButtons();
              setButton3(true);
            }}
          />
        </Link>
      </Heading>
      <Heading level="5" margin={{ vertical: "xxsmall", horizontal: "xsmall" }}>
        <Link href="/offers">
          <Button
            primary
            active={button4}
            size="small"
            label="My Offers"
            alignSelf="end"
            onClick={() => {
              resetAllButtons();
              setButton4(true);
            }}
          />
        </Link>
      </Heading>
    </Box>
  );
};

export default ListingNavButtons;
