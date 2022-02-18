
const { expect, assert } = require("chai");


describe("Listing contract", function() {

    let pact
    let owner
    let seller
    let buyer

    let sellerCode
    let buyerCode
    let wrongCode

    let hashSellerCode
    let hashBuyerCode
    let hashWrongCode

    const EVM_ERROR = 'Error: VM Exception while processing transaction: reverted with reason string'
    const NOT_SELLER_ACCEPT_OFFER = `${EVM_ERROR} 'You are not the seller, cannot accept offer'`

    beforeEach(async function () {
        // Using hardhat local blockchain instead
        provider = await ethers.provider;
        // provider = await ethers.getDefaultProvider();

        [owner, seller, buyer1, buyer2] = await ethers.getSigners()
        const Listing = await ethers.getContractFactory("Listing");

        let minEscrow = 1;
        let price = 2;

        sellerCode = "000000"
        buyerCode = "111111"
        wrongCode = "222222"
        hashSellerCode = ethers.utils.solidityKeccak256(["string"], [sellerCode]);
        hashBuyerCode = ethers.utils.solidityKeccak256(["string"], [buyerCode]);
        hashWrongCode = ethers.utils.solidityKeccak256(["string"], [wrongCode]);

        listing = await Listing.deploy(seller.address, "link","title", "desc", "location", "contact", minEscrow, price, hashSellerCode);

        await listing.deployed()
        /*
        listing.on('*', (event) => {
          console.log(event)
        })
        */
      })

      it("Buyer and seller withdraw from offer", async function() {

        offerValue = 2;
        buyer1 = owner;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});

        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();

        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        await listing.cancelOffer(buyer1.address);

    });
      it("Buyer and seller withdraw from offer", async function() {

        offerValue = 2;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});

        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();

        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)

        await listing.connect(seller).acceptOffer(buyer1.address, {value: offerValue});
        // Listing state should be Locked
        expect(await listing.listingState()).to.equal(1)

        // Attempt to unlock with correct seller code
        await listing.connect(buyer1).unlockListingBuyer(sellerCode);
        // Listing state should be BuyerUnlocked
        expect(await listing.listingState()).to.equal(3)

        // Attempt to unlock with correct buyer code
        await listing.connect(seller).unlockListingSeller(buyerCode);
        // Listing state should now be Completed
        expect(await listing.listingState()).to.equal(5)

        await listing.connect(seller).sellerWithdraw();
        await listing.connect(buyer1).buyerWithdraw();

    });

    it("Submit offer and cancel offer from same buyer with one buyer", async function() {
        // Submit an offer and check offer was submitted
        offerValue = 2;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});
        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();
        // Check number offers increased to 1
        expect(numOffers).to.equal(1);
        expect(listingOffers[0][0]).to.equal(buyer1.address);
        expect(listingOffers[1][0]).to.equal(offerValue);

        // Cancel offer, expect no offers
        await listing.cancelOffer(buyer1.address);
        numOffers = await listing.numOffers();
        expect(numOffers).to.equal(0);

    });

    it("Seller can sucessfully cancel listing", async function() {
        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        await listing.connect(seller).cancelListing()
        expect(await listing.listingState()).to.equal(4)
    });

    it("Non-seller cannot cancel listing", async function() {
        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        try  {
          await listing.connect(buyer2).cancelListing()
          assert.fail("Should have failed to accept offer")
        } catch (e) {
          expect(1).to.equal(1);
        }
        expect(await listing.listingState()).to.equal(0)
    });

    it("Seller accepts offer from buyer, state changes", async function() {
        offerValue = 2;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});
        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();

        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        await listing.connect(seller).acceptOffer(buyer1.address, {value: offerValue});
        // Listing state should be Locked
        expect(await listing.listingState()).to.equal(1)
    });

    it("Non-seller attempts to accept offer from a buyer, not allowed", async function() {
        offerValue = 2;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});
        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();

        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        try  {
          await listing.connect(buyer2).acceptOffer(buyer1.address, {value: offerValue});
          assert.fail("Should have failed to accept offer")
        } catch (e) {
          expect(e.toString()).to.equal(NOT_SELLER_ACCEPT_OFFER)
        }
        // Listing stated should still be Open
        expect(await listing.listingState()).to.equal(0)
    });

    it("Seller unlocks listing after accepting offer, includes 1 failed unlock attempt", async function() {
        offerValue = 2;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});
        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();

        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        await listing.connect(seller).acceptOffer(buyer1.address, {value: offerValue});
        // Listing state should be Locked
        expect(await listing.listingState()).to.equal(1)

        // Attempt to unlock with wrong code
        try  {
        await listing.connect(seller).unlockListingSeller(wrongCode);
          assert.fail("Should have failed to unlock listing with wrong code")
        } catch (e) {
          expect(1).to.equal(1);
        }
        expect(await listing.listingState()).to.equal(1)

        // Attempt to unlock with correct buyer code
        await listing.connect(seller).unlockListingSeller(buyerCode);
        // Listing state should be SellerUnlocked
        expect(await listing.listingState()).to.equal(2)

        // Attempt to unlock with correct seller code
        await listing.connect(buyer1).unlockListingBuyer(sellerCode);
        // Listing state should now be Completed
        expect(await listing.listingState()).to.equal(5)
    });

    it("Buyer unlocks listing after accepting offer, includes 1 failed unlock attempt", async function() {
        offerValue = 2;
        await listing.submitOffer(buyer1.address, hashBuyerCode, {value: offerValue});
        listingOffers = await listing.getListingOffers();
        numOffers = await listing.numOffers();

        // Listing stated should be Open
        expect(await listing.listingState()).to.equal(0)
        await listing.connect(seller).acceptOffer(buyer1.address, {value: offerValue});
        // Listing state should be Locked
        expect(await listing.listingState()).to.equal(1)

        // Attempt to unlock with wrong code
        try  {
        await listing.connect(buyer1).unlockListingBuyer(wrongCode);
          assert.fail("Should have failed to unlock listing with wrong code")
        } catch (e) {
          expect(1).to.equal(1);
        }
        expect(await listing.listingState()).to.equal(1)

        // Attempt to unlock with correct seller code
        await listing.connect(buyer1).unlockListingBuyer(sellerCode);
        // Listing state should be BuyerUnlocked
        expect(await listing.listingState()).to.equal(3)

        // Attempt to unlock with correct buyer code
        await listing.connect(seller).unlockListingSeller(buyerCode);
        // Listing state should now be Completed
        expect(await listing.listingState()).to.equal(5)
    });

});
