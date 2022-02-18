// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Listing.sol";

// This is the main building block for smart contracts.
contract ExchangeItGateway is Ownable{

    // Use SafeMath because its safe
    using SafeMath for uint256;
    // Use counter to track all ids
    using Counters for Counters.Counter;

    // Holds all our listings
    address[] public listings;

    // Counter for how many listings we've created
    Counters.Counter private _numOfListings;

    // Listing was created
    event ListingCreated(address seller, address listing);
    event SubmittedOffer(address buyer, address listing);
    event CanceledOffer(address buyer, address listing);

    // Seller and buyer listings and offers
    mapping (address => uint256[]) private sellerListings;
    mapping (address => uint256[]) private buyerListingOffers;

    // Listing's address to the index in listings
    mapping (address => uint256) private listingAddressToListingIndex;

    constructor() public {
        // Always create a dummy one for 0 index
        listings.push(address(0));
        _numOfListings.increment();
    }

     /*
     * General view methods
     */
    function getAllListings(uint256 page, uint256 resultsPerPage) external view returns (address[] memory) {
        // Enforce the limits
        require(page > 0, "Page must start at 1");
        uint256 startIndex = page * resultsPerPage - resultsPerPage + 1;

        // If we're at the resultsPerPage we return empty
        if (startIndex > listings.length - 1) {
            return new address[](0);
        }

        // Allocate new array for the results
        address[] memory results = new address[](resultsPerPage);

        uint256 currentIndex = 0;
        for (startIndex; startIndex < resultsPerPage * page + 1; startIndex++) {
            if (startIndex == listings.length) {
                break;
            }
            results[currentIndex] = listings[startIndex];
            currentIndex++;
        }
        return results;
    }

    // Gets a seller's listings
    function getMyListings(uint256 page, uint256 resultsPerPage) external view returns (address[] memory) {
        // Check to make sure that the seller has listings
        uint256[] memory currentSellerListings = sellerListings[msg.sender];
        require(currentSellerListings.length > 0, "You dont have any listings");

        // Enforce the limits
        require(page > 0, "Page must start at 1");
        uint256 startIndex = page * resultsPerPage - resultsPerPage;

        // If we're at the resultsPerPage we return empty
        if (startIndex > currentSellerListings.length - 1) {
            return new address[](0);
        }

        // Allocate new array for the results
        address[] memory results = new address[](resultsPerPage);

        uint256 currentIndex = 0;
        for (startIndex; startIndex < resultsPerPage * page; startIndex++) {
            if (startIndex == currentSellerListings.length) {
                break;
            }
            results[currentIndex] = listings[currentSellerListings[startIndex]];
            currentIndex++;
        }
        return results;
    }

    // Get a buyers offers
    function getMyOffers() external view returns (address[] memory) {
        uint256[] memory currentBuyerOffers = buyerListingOffers[msg.sender];
        if (currentBuyerOffers.length == 0)  {
            return new address[](0);
        }
        address[] memory results = new address[](currentBuyerOffers.length);
        for (uint256 i = 0; i < currentBuyerOffers.length; i++) {
            results[i] = listings[currentBuyerOffers[i]];
        }
        return results;
    }

    /*
     * Seller facing methods
     */
    function createListing(
        string memory listingImageLink,
        string memory listingTitle,
        string memory listingDescription,
        string memory listingLocation,
        string memory listingContact,
        uint256 listingMinEscrow,
        uint256 listingPrice,
        bytes32 hashSellerCode
    ) external payable {
        // Check to make sure that values are valid
        require(bytes(listingImageLink).length > 0, "Link must not be empty");
        require(bytes(listingTitle).length > 0, "Title must not be empty");
        require(bytes(listingLocation).length > 0, "Location must not be empty");
        require(bytes(listingDescription).length > 0, "Description must not be empty");
        require(bytes(listingContact).length > 0, "Listing contact must not be empty");
        require(listingPrice > 0, "Minimum listing price must be greater than 0");
        require(listingMinEscrow > 0, "Minimum listing escrow must be greater than 0");
        require(listingMinEscrow <=  listingPrice, "Listing Escrow can't be greater than Price");
        require(hashSellerCode.length > 0, "Seller's hash coe must not be empty");

        // Create a Listing
        Listing listing = new Listing(
            msg.sender,
            listingImageLink,
            listingTitle,
            listingDescription,
            listingLocation,
            listingContact,
            listingMinEscrow,
            listingPrice,
            hashSellerCode
        );

        // Add the listing to the total listings
        listings.push(address(listing));

        // Make sure we track the sellers listings
        sellerListings[msg.sender].push(_numOfListings.current());

        // Update our map to index
        listingAddressToListingIndex[address(listing)] = _numOfListings.current();

        // Increment total number of listings
        _numOfListings.increment();

        // Emit event
        emit ListingCreated(msg.sender, address(listing));
    }

    /*
     * Buyer facing methods
     */
    function submitOffer(address listingAddress, bytes32 hashBuyerCode) external payable {
        // Check if seller has already submitted offer
        Listing targetListing = Listing(listingAddress);

        // Submit the offer (also take money from buyer)
        targetListing.submitOffer{value: msg.value}(msg.sender, hashBuyerCode);

        // Find the index of the listing
        uint256 listingIndex = listingAddressToListingIndex[listingAddress];
        require(listingIndex > 0, "Listing doesn't exist");

        // Update the list of offers buyer has made
        buyerListingOffers[msg.sender].push(listingIndex);

        // Emit the event
        emit SubmittedOffer(msg.sender, listingAddress);
    }

    function cancelOffer(address listingAddress) external {
        Listing targetListing = Listing(listingAddress);

        // Get listing index if it exists
        uint256 listingIndex = listingAddressToListingIndex[listingAddress];
        require(listingIndex > 0, "Listing doesn't exist");

        // Cancel the offer
        targetListing.cancelOffer(msg.sender);

        // Look for the offer in the buyers list of offers
        uint256 found = 0;
        for (uint256 i = 0; i < buyerListingOffers[msg.sender].length; i++) {
            // Assign found to i
            found = i;

            // If the indexes are the same we've found the right place to delete
            if (listingIndex == buyerListingOffers[msg.sender][i]) {
                break;
            }
        }

        // This is only true if we've broken out early before the last element
        // Ie. if it doesn't exist we would actually be equal
        if (found == buyerListingOffers[msg.sender].length) {
            return;
        }

        delete buyerListingOffers[msg.sender][found];
        emit CanceledOffer(msg.sender, listingAddress);
    }

}
