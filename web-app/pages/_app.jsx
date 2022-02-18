import "../styles/globals.css";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Grommet,
  grommet,
  Layer,
  Text,
  Heading,
} from "grommet";
import { Add, FormClose, StatusGood } from "grommet-icons";
import { Contract } from "@ethersproject/contracts";
import AppBar from "../modules/navigation/appBar";
import WalletButton from "../modules/navigation/walletButton";
import ListingNavButtons from "../modules/navigation/listingNavButtons";
import LogoHeader from "../modules/navigation/logoHeader";
import { ProviderContext } from "../modules/hooks";
import ExchangeItGatewayContext from "../modules/hooks/useExchangeItGateway";
import ListingContext from "../modules/hooks/useListing";
import ToastContext from "../modules/hooks/useToast";
import { abis } from "../modules/contracts";
import SignerContext from "../modules/hooks/useSigner";

const getDefaultPageLayout = (page) => page;

function MyApp({ Component, pageProps }) {
  // Allow us to render children pages
  const getPageLayout = Component.getLayout || getDefaultPageLayout;

  // Context
  const [provider, setProvider] = useState(null);
  const [exchangeItGateway, setExchangeItGateway] = useState(null);
  const [listing, setListing] = useState(null);
  const [toast, setToast] = useState(null);
  const [signer, setSigner] = useState(null);

  // Values for Providers
  const providerValue = { provider, setProvider };
  const gatewayValue = { exchangeItGateway, setExchangeItGateway };
  const listingValue = { listing, setListing };
  const signerValue = { signer, setSigner };
  const toastValue = { toast, setToast };

  const [open, setOpen] = useState(false);
  const [toastTimeout, setToastTimeout] = useState();

  // Set the gateway when we load app
  useEffect(() => {
    if (provider === null) {
      return;
    }
    setExchangeItGateway(
      new Contract(
        //"0x98Bfe4e725285E2696Aa4a125b171f82bb5af0B1", // kovan
        "0xbaE92eCf99cd1fEA6Dfe0C630e2e0b31Dd50AB8D", //Mumbai
        //"0x064CFA230CB6cDdDe57D30f38DfCfBf7A2786272", // Mumbai
        //"0x83E3BE4B89EbaB7C65c5695ED31Fd07e42Aac6dB", // Kovan
        abis.ExchangeItGateway.abi,
        provider
      )
    );
    setSigner(provider.getSigner());
  }, [provider]);

  useEffect(() => {
    if (toast === null) {
      return;
    }
    setOpen(true);
    setToastTimeout(
      setTimeout(() => {
        setOpen(false);
        setToast(null);
      }, 3000)
    );
  }, [toast]);

  const onClose = () => {
    setOpen(false);
    clearTimeout(toastTimeout);
  };
  /*
  const styles={
    position:'fixed'
  };
*/
  return (
    <Grommet theme={grommet} full>
      <Box fill>
        <ProviderContext.Provider value={providerValue}>
          <SignerContext.Provider value={signerValue}>
            <ExchangeItGatewayContext.Provider value={gatewayValue}>
              <ListingContext.Provider value={listingValue}>
                <ToastContext.Provider value={toastValue}>
                  <Grid
                    columns={["1"]}
                    rows={["xsmall", "xxsmall", "large"]}
                    areas={[["header"], ["navigation"], ["main"]]}
                    gap="xxsmall"
                  >
                    <Box>
                      <AppBar>
                        <LogoHeader />
                        <WalletButton />
                      </AppBar>
                    </Box>
                    <Box
                      border={{ side: "bottom", color: "border" }}
                      margin="none"
                      pad="none"
                      align="start"
                      justify="start"
                    >
                      <ListingNavButtons />
                    </Box>
                    <Box flex>
                      {getPageLayout(<Component {...pageProps} />)}
                    </Box>
                  </Grid>
                  {open && (
                    <Layer
                      position="bottom"
                      modal={false}
                      margin={{ vertical: "medium", horizontal: "small" }}
                      onEsc={onClose}
                      responsive={false}
                      plain
                    >
                      <Box
                        align="center"
                        direction="row"
                        gap="small"
                        justify="between"
                        round="medium"
                        elevation="medium"
                        pad={{ vertical: "xsmall", horizontal: "small" }}
                        background={`status-${toast.status}`}
                      >
                        <Box align="center" direction="row" gap="xsmall">
                          <StatusGood />
                          <Text>{toast.message}</Text>
                        </Box>
                        <Button icon={<FormClose />} onClick={onClose} plain />
                      </Box>
                    </Layer>
                  )}
                </ToastContext.Provider>
              </ListingContext.Provider>
            </ExchangeItGatewayContext.Provider>
          </SignerContext.Provider>
        </ProviderContext.Provider>
      </Box>
    </Grommet>
  );
}

export default MyApp;
