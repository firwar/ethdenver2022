import { createContext } from 'react';

const ListingContext = createContext({
  Listing: null,
  setListing: () => {},
});

export default ListingContext;
