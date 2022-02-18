import { createContext } from "react";

const ProviderContext = createContext({
  provider: null,
  setProvider: () => {},
});

export default ProviderContext;
