# ExchangeIt

ExhangeIt is a decentralized mobile marketplace for individuals to
create listings and submit offers for local goods around their location. Transactions are backed by smart contract escrowing and completed using a GPS backed Chainlink Oracle. Disputes and bad actors are regulated by a DAO governance.

The problem that ExhangeIt is addressing relates to the user experience of selling goods in an online marketplace and completing the transaction in person. This is accomplished through incentivization.

The main mechanisms for incentivizing people to meet and fully commit to their exchange obligations are based on two key functionalities:

1. Escrow for over collateralizing by enforcing a fixed deposit on both sides
2. Two-man rule for unlocking the escrow to retrieve deposit

We've deployed a fully functional version of our mobile app on the Mumbai Testnet.

Live DApp (Polygon Mumbai Testnet): 

[https://exchangeit.vercel.app](https://exchangeit.vercel.app)



# Overview

Traditional marketplaces for transacting on physical goods have been around for a long time, ie. Craigslist. Newer ones such as OfferUp provide an alternative on the mechanisms for marketing sellable goods, agreeing on a common price point, and the exchange of the final good with
payment.


## Pain Points

In the traditional online marketplace, one particular listing may have multiple offers, and in many situations buyers do not follow through on their offers. 

There are two scenarios in which a buyer or seller may lose out on an offer:

1. Buyer approaches seller with a great price and seller provides the
   meeting location and time to meet, but before they are able to meet another
   buyer offers more money. Buyer will lose out and might even go to the location
   waiting for the seller who already sold the item.
   
2. Seller receives multiple offer, picks highest offer and rejects all the other offers.
   Buyer who was accepted decides not to go through with purchase. Now the seller
   has to relist and engage with buyers who may have moved on or are not
   interested in working with seller.
   
Both parties incur opportunity costs when either party skips out because of the lack of enforcement
around how to commit and exchange goods.

# Solution

Lock and swap is a decentralized version of OfferUp where the sellers and buyers
must go through a series of steps facilitated by smart contracts

The overall steps are:

1. Seller creates a Listing with a 6-digit code which is hashed on frontend and sent to the contract
2. Buyer submits an offer and is required to send more than the minimum escrow to the listing along with a 6-digit code for their unlock which is also hashed on frontend and sent to the contract
3. Seller can accept only one offer and must also escrow more than the minimum escrow they set
4. At this point the contract is "Locked"
5. The seller and buyer must meet up to exchange goods and unlock the contract by providing their respective unlock codes. GPS data is also collected at this point and proximity of the people are measured for a secondary means of unlocking.
6. The contract will only be unlocked (eg. refunds allowed) when both codes are entered or their locations showed them close enough.
7.Reward tokens will be awarded to both parties
8.In the event that the transaction does not occur, if one party thinks they are not at fault and wants their escrow back they can open a dispute through a DAO governance. The community will then read the description, discuss, and use reward tokens to vote if the escrow should be returned.

## Unlock Mechanism

We utilize SHA256 to encode at different points in the process to ensure that bad actors can’t take advantage of the public nature of the block chain and transaction data.

When a Seller creates a contract, we send the SHA256 hash (calculated on DApp side) of the unlock code as a bytes32 to contract. When a Buyer submits an offer, we also send the SHA256 hash (calculated on DApp side) of the unlock code as a bytes32 to contract.

When Seller or Buyer is trying to unlock the contract, they must provide the 6-digit unlock code to the Listing. The Listing (contract) will then also use SHA256 to convert the code and match it to the saved hashes.

It's possible to guess the code since it's an alphanumeric character, but we can probably add a retry mechanism in future to prevent infinite guesses; however, since all these guesses incur a fee, blindly guessing is probably not worth it. Additionally, there will be GPS data to backup each transaction.


# Architecture

## IPFS

We use IPFS to store the image of the listing for users to view what the product is.

We didn't get a chance (refer to Future Improvements) to offload the listing metadata onto the IPFS Pin.

We also wanted to see how expensive it would be to use Polygon and just store data there.

## Polygon

Polygon allows this DApp to work in a real-world scenario while the gas fees remain extremely low.

Creating a listing ~  .08 MATIC
Offering ~ .001 Matic

Without Polygon, transacting any type of action on this DApp would be prohibitively expensive.

## Chainlink

We use a Chainlink EA for the GPS data collected from the seller and buyers phones and use that as truth data for their location to determine if the transaction took place or not.

## Tally DAO

We use Tally DAO for dispute resolution. Specifically, we use it to interact with the governance and allow share holders (those that received our reward erc20 tokens) to vote on disputs (proposals) generated by the community and its users. The results of that vote will be directly tied to the fund remaining in escrow after a failed transation with another party.

## Contracts

ExhangeIt consists of four contracts, ExhangeItGateway, Listing, the ERC20 token contract, and the governance.

### ExhangeItGateway

The gateway is the main entry point for the app.

It allows sellers to create new listings and paginate through their existing listings. Buyers may also submit/cancel offers
through the gateway.

For buyers they can submit/cancel offers through the gateway, which also provides a call
for buyers to viewer their current offers.

### Listing

The Listing contract holds all the information for a listing such as item info, seller info, 
minimum escrow and price. In the initial state the listing is in the **"Open"** state.

Buyers may submit offers and deposit the minimum escrow.

The main functionality of the Listing contract is to allow the seller to accept one offer.
Once the offer is accepted it moves onto the next state **"Locked"** and requires both parties
to enter their unlock codes.

**Note**: For prospective buyers who were not accepted they may withdraw their deposits at any time.

Once the contract is unlocked then the seller and buyer can withdraw their deposit, and the contract
is in the **"Completed"** state.

### ERC20 Token Contract

The ERC20 Token Contract allows ExhangeIt to mint governance compatible reward token to the users of the community as they complete transactions.

Specifically they use ERC20Permit and ERC20Votes to become compatible and is added to the DAO created on Tally.

### Governance

The governance is the mechanism in which people can file disputes to receive their escrow funds back. The governance is added to the DAO create on Tally.

Openzeppelin was used to generate the template for the governor contract.

For the current implementation there is not a TimeLockController and the values for Voting Delay, Voting Period, and Quorum were set at nominal values to be changed as more data is collected.


## DApp

The Frontend is built on Web3, Next.js, and Grommet in React. 

It's also deployed through IPFS and ENS

# Future Improvements

## IPFS

We can probably add metadata to our pins for the listing information instead of 
saving it on the chain. 

We will also need a gateway to throttle users from uploading a bunch of files and abusing our
completely public API Key/Secret.

## Search

Currently we just load all the available data (pagination is available), but we don't have a search mechanism.
We'd probably want to use Elasticsearch eventually but that requires a cloud service dependency.

## UX/UI

General UX/UI improvements can and probably will be made. We will integrate more event listening to make sure each step
of the process has the proper feedback for user actions.
