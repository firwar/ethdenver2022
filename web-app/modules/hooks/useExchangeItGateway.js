import { createContext } from 'react';

const ExchangeItGatewayContext = createContext({
  exchangeItGateway: null,
  setExchangeItGateway: () => {},
});

export default ExchangeItGatewayContext;
