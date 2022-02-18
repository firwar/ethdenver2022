import { createContext } from "react";

const SignerContext = createContext({
  signer: null,
  setSigner: () => {},
});

export default SignerContext;
