import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Listing as ListingContainer } from "../../modules/listing";

const Listing = () => {
  const router = useRouter();
  const { address } = router.query;
  return <ListingContainer address={address} />;
};

export default Listing;
