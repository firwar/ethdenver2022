// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.6.12;

import '@openzeppelin/contracts/access/AccessControl.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/payment/escrow/Escrow.sol";

// This is the main building block for smart contracts.
contract Listing is Ownable, AccessControl {

    enum ListingState { Open, Locked, SellerUnlocked, BuyerUnlocked, Canceled, Completed }

    ListingState public listingState;

    // Listing information
    string public listingImageLink;
    string public listingTitle;
    string public listingDescription;
    string public listingLocation;
    string public listingContact;
    uint256 public listingMinEscrow;
    uint256 public listingPrice;

    // Listing transaction participants
    address public sellerAddress;
    address public buyerAddress;

    // Listing hash values
    bytes32 public hashSellerCode;
    bytes32 public hashBuyerCode;

    uint256 public numOffers;
    mapping (uint => address) public offerIndexes;
    // Maps address of buyer to amount they are willing to escrow
    mapping (address => uint256) public listingOffers;
    uint256 public numListingOffers;

    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    bytes32 public constant BUYER_ROLE = keccak256("BUYER_ROLE");

    event BuyerOfferAccepted(address buyer);
    event BuyerOfferCancelled(address buyer);
    event ListingCancelled();
    event SellerUnlocked();
    event BuyerUnlocked();
    event ListingCompeted();

    Escrow escrow;

    constructor(
        address _sellerAddress,
        string memory _listingImageLink,
        string memory _listingTitle,
        string memory _listingDescription,
        string memory _listingLocation,
        string memory _listingContact,
        uint256 _listingMinEscrow,
        uint256 _listingPrice,
        bytes32 _hashSellerCode
    ) public {

        // Sets the gateway as the admin role for access control
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Sets the seller as the seller role
        _setupRole(SELLER_ROLE, _sellerAddress);

        // Sets constructor variables
        sellerAddress = _sellerAddress;
        listingImageLink = _listingImageLink;
        listingTitle = _listingTitle;
        listingDescription = _listingDescription;
        listingLocation = _listingLocation;
        listingContact = _listingContact;
        listingMinEscrow = _listingMinEscrow;
        listingPrice = _listingPrice;
        hashSellerCode = _hashSellerCode;

        numOffers = 0;
        listingState = ListingState.Open;
        escrow = new Escrow();
    }

     /**********************
     * General view methods
     **********************/

     /*
     * Gets the current listing offers and returns an array of address and array of offer amounts
     */
    function getListingOffers() external view returns (address[] memory, uint256[] memory){

        address[] memory _offerAddresses = new address[](numOffers);
        uint256[] memory _offerAmounts = new uint256[](numOffers);

        for (uint256 i = 0; i < numOffers; i++) {
            _offerAddresses[i] = offerIndexes[i];
            _offerAmounts[i] = listingOffers[offerIndexes[i]];
        }

        return (_offerAddresses, _offerAmounts);
    }

    /**********************
     * Seller facing methods
     **********************/

     /*
     * Accepts offer from a buyer on a listing, must be seller to call this method
     * Seller deposits escrow offered by buyer
     */
    function acceptOffer(address _buyerAddress) external payable {
        require(hasRole(SELLER_ROLE, msg.sender), "You are not the seller, cannot accept offer");
        require(escrow.depositsOf(_buyerAddress) >= listingMinEscrow , "Error buyer does not have the minimum amount deposited");
        require(msg.value == listingOffers[_buyerAddress], "You must deposit the amount commited to by the buyer");
        buyerAddress = _buyerAddress;
        listingState = ListingState.Locked;

        // TODO: can you send a transaction with a prefilled out amount?
        escrow.deposit{value: msg.value}(msg.sender);
    }

    function cancelListing() external {
        require(hasRole(SELLER_ROLE, msg.sender), "You are not the seller, cannot accept offer");
        listingState = ListingState.Canceled;
        // TODO: Upon seller initiation, listing is canceled, marks Listing as Canceled or Completed
    }

    function unlockListingSeller(string memory buyerUnlockCode) external {

        bytes32 hashBuyerUnlockCode = keccak256(abi.encodePacked(buyerUnlockCode));
        require(hashBuyerUnlockCode == hashBuyerCode, "Incorrect buyer unlock code");

        // If buyer has not yet unlocked the listing
        if (listingState == ListingState.Locked) {
            listingState = ListingState.SellerUnlocked;
        // If buyer has unlocked the listing, transaction complete and enable refunds
        } else if (listingState == ListingState.BuyerUnlocked) {
            listingState = ListingState.Completed;
        }
    }

    function sellerWithdraw() public {
        require(hasRole(SELLER_ROLE, msg.sender), "You are not the seller, cannot withdraw");
        if (listingState == ListingState.Canceled || listingState == ListingState.Completed) {
            escrow.withdraw(msg.sender);
        } else {
            revert("Seller withdrawal not allowed");
        }
    }

    /*
     * Buyer facing methods
     */
    function submitOffer(address _buyerAddress, bytes32 _hashBuyerCode) external payable onlyOwner {

        require(msg.value >= listingMinEscrow, "You must meet the minimum escrow amount");
        hashBuyerCode = _hashBuyerCode;
        listingOffers[_buyerAddress] = msg.value;
        offerIndexes[numOffers] = _buyerAddress;

        // TODO: can you send a transaction with a prefilled out amount?
        escrow.deposit{value: msg.value}(_buyerAddress);
        numOffers++;
    }

    function cancelOffer(address payable _buyerAddress) external onlyOwner {
        if (_buyerAddress == sellerAddress) {
            revert("Seller cancel offer not allowed");
        }
        if (_buyerAddress == buyerAddress) {
            if (listingState == ListingState.Canceled || listingState == ListingState.Completed) {
                delete(listingOffers[_buyerAddress]);
                numOffers--;
                listingOffers[_buyerAddress] = 0;
                escrow.withdraw(_buyerAddress);
            } else {
                revert("Buyer withdrawal not allowed");
            }
        } else {
            delete(listingOffers[_buyerAddress]);
            numOffers--;
            listingOffers[_buyerAddress] = 0;
            escrow.withdraw(_buyerAddress);
        }
        // TODO: removes buyer address from listing offers
    }

    function unlockListingBuyer(string memory sellerUnlockCode) external {
        bytes32 hashSellerUnlockCode = keccak256(abi.encodePacked(sellerUnlockCode));
        require(hashSellerUnlockCode == hashSellerCode, "Incorrect seller unlock code");

        // If buyer has not yet unlocked the listing
        if (listingState == ListingState.Locked) {
            listingState = ListingState.BuyerUnlocked;
        // If buyer has unlocked the listing, transaction complete and enable refunds
        } else if (listingState == ListingState.SellerUnlocked) {
            listingState = ListingState.Completed;
        }
    }

    function buyerWithdraw() public {
        require(msg.sender != sellerAddress, "seller cannot call buyer method to withdraw");

        if (msg.sender == buyerAddress) {
            if (listingState == ListingState.Canceled || listingState == ListingState.Completed) {
                listingOffers[msg.sender] = 0;
                escrow.withdraw(msg.sender);
            } else {
                revert("Buyer withdrawal not allowed");
            }
        } else {
            listingOffers[msg.sender] = 0;
            escrow.withdraw(msg.sender);
        }
    }

}
