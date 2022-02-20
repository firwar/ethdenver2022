import ExchangeItGatewayAbi from "../../contracts/ExchangeItGateway.sol/ExchangeItGateway.json";
import ListingAbi from "../../contracts/Listing.sol/Listing.json";
import ERC20 from "../../contracts/ERC20.sol/ERC20.json";

const abis = {
  ERC20: ERC20,
  ExchangeItGateway: ExchangeItGatewayAbi,
  Listing: ListingAbi,
};

export default abis;
