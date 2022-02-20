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
  ResponsiveContext,
} from "grommet";
import { Add, FormClose, StatusGood } from "grommet-icons";
import { Contract } from "@ethersproject/contracts";
import AppBar from "../modules/navigation/appBar";
import WalletButton from "../modules/navigation/walletButton";
import ListingNavButtons from "../modules/navigation/listingNavButtons";
import BottomTabNavigation from "../modules/navigation/bottomTabNavigation";
import LogoHeader from "../modules/navigation/logoHeader";
import { ProviderContext } from "../modules/hooks";
import ExchangeItGatewayContext from "../modules/hooks/useExchangeItGateway";
import ListingContext from "../modules/hooks/useListing";
import ToastContext from "../modules/hooks/useToast";
import { abis } from "../modules/contracts";
import SignerContext from "../modules/hooks/useSigner";
import { deepFreeze } from "grommet/utils";
import ModalContext from "../modules/hooks/useModal";

const getDefaultPageLayout = (page) => page;
const ONE_MINUTE = 60 * 1000;
const CF_UPDATE_URL =
  "https://us-central1-cl-wwga-hackathon.cloudfunctions.net/updateLocation";

export const customTheme = deepFreeze({
  global: {
    colors: {
      brand: "#475C7A",
      focus: "#685D79",
      selected: "#475C7A",
      "accent-1": "#685D79",
      "accent-2": "#AB6C82",
      "accent-3": "#D8737F",
      "accent-4": "#FCBB6D",
      "dark-1": "#344E5C",
    },
  },
  button: {
    borderRadius: 2,
    padding: {
      horizontal: "12px",
    },
  },
});

function MyApp({ Component, pageProps }) {
  // Allow us to render children pages
  const getPageLayout = Component.getLayout || getDefaultPageLayout;

  // Context
  const [provider, setProvider] = useState(null);
  const [exchangeItGateway, setExchangeItGateway] = useState(null);
  const [listing, setListing] = useState(null);
  const [toast, setToast] = useState(null);
  const [signer, setSigner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Values for Providers
  const providerValue = { provider, setProvider };
  const gatewayValue = { exchangeItGateway, setExchangeItGateway };
  const listingValue = { listing, setListing };
  const signerValue = { signer, setSigner };
  const toastValue = { toast, setToast };
  const modalOpenValue = { modalOpen, setModalOpen };

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

  useEffect(() => {
    if (navigator === null || navigator === undefined) {
      return;
    }
    const tempAddress = "0xa2d6c4297Eec8a25226AE0dc77344B0BDEBF442a";
    // Create an interval to ping
    const periodic = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(
          `User ${tempAddress} Location ${position.coords.latitude} ${position.coords.longitude}`
        );
        const geoData = {
          userAddress: tempAddress,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        fetch(CF_UPDATE_URL, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "no-cors",
          headers: {
            Accept: "application/json",
          },
          body: JSON.stringify(geoData),
        })
          .then((res) => {
            console.log(res);
          })
          .catch((e) => {
            console.log(e);
          });
      });
    }, ONE_MINUTE);

    return function cleanup() {
      clearInterval(periodic);
    };
  }, []);

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
    <Grommet theme={customTheme} full>
      <Box fill>
        <ProviderContext.Provider value={providerValue}>
          <SignerContext.Provider value={signerValue}>
            <ExchangeItGatewayContext.Provider value={gatewayValue}>
              <ListingContext.Provider value={listingValue}>
                <ModalContext.Provider value={modalOpenValue}>
                  <ToastContext.Provider value={toastValue}>
                    <ResponsiveContext.Consumer>
                      {(size) =>
                        size === "small" ? (
                          <Grid
                            columns={["1"]}
                            rows={["xsmall", "flex", "xsmall"]}
                            areas={[["header"], ["main"], ["footer"]]}
                            gap="xxsmall"
                          >
                            <Box gridArea="header">
                              <AppBar>
                                <LogoHeader />
                                <WalletButton />
                              </AppBar>
                            </Box>
                            <Box gridArea="main">
                              {getPageLayout(<Component {...pageProps} />)}
                            </Box>
                            <BottomTabNavigation gridArea="footer" />
                          </Grid>
                        ) : (
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
                        )
                      }
                    </ResponsiveContext.Consumer>

                    {open && (
                      <Layer
                        position="bottom"
                        modal={false}
                        margin={{ vertical: "xlarge", horizontal: "small" }}
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
                          <Button
                            icon={<FormClose />}
                            onClick={onClose}
                            plain
                          />
                        </Box>
                      </Layer>
                    )}
                  </ToastContext.Provider>
                </ModalContext.Provider>
              </ListingContext.Provider>
            </ExchangeItGatewayContext.Provider>
          </SignerContext.Provider>
        </ProviderContext.Provider>
      </Box>
    </Grommet>
  );
}

export default MyApp;
