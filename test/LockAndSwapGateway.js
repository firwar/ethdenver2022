const { expect } = require('chai');

const FAKE_IMAGE_LINK = 'FakeImageLink';
const FAKE_DESCRIPTION = 'Fake Description';
const FAKE_TITLE = 'Fake Title';
const FAKE_LOCATION = 'Fake Location';
const FAKE_CONTACT_INFO = 'email@gmail.com';

const EVM_ERROR = 'Error: VM Exception while processing transaction: reverted with reason string'
const NO_LISTINGS_ERROR = `${EVM_ERROR} 'You dont have any listings'`

describe('LockAndSwapGateway contract', () => {
  // Network specific
  let provider;

  // Contract specific
  let owner;
  let seller;
  let buyer;
  let friend2;
  let friend3;
  let friend4;
  let stranger1;
  let BetterTogetherGateway;
  let gateway;
  let allMyFriends = [];

  let sellerCode
  let buyerCode
  let wrongCode
  let hashSellerCode
  let hashBuyerCode
  let hashWrongCode


  beforeEach(async () => {
    // Using hardhat local blockchain instead
    provider = await ethers.provider;
    // provider = await ethers.getDefaultProvider();

    sellerCode = "000000"
    buyerCode = "111111"
    wrongCode = "222222"
    hashSellerCode = ethers.utils.solidityKeccak256(["string"], [sellerCode]);
    hashBuyerCode = ethers.utils.solidityKeccak256(["string"], [buyerCode]);
    hashWrongCode = ethers.utils.solidityKeccak256(["string"], [wrongCode]);


    [owner, seller, buyer, friend2, friend3, friend4, stranger1] = await ethers.getSigners();
    allMyFriends = [buyer, friend2, friend3, friend4];
    Gateway = await ethers.getContractFactory('LockAndSwapGateway');
    gateway = await Gateway.deploy();

    for (let i = 0; i < 10; i++) {
      const fakeHash = ethers.utils.formatBytes32String(i.toString());
      // eslint-disable-next-line no-await-in-loop
      await gateway.connect(seller).createListing(
        FAKE_IMAGE_LINK, FAKE_TITLE, FAKE_DESCRIPTION, FAKE_LOCATION, FAKE_CONTACT_INFO, i + 1, i + 2, fakeHash);
    }

    await gateway.deployed();
    gateway.on('*', (event) => {
      //   console.log(event)
    });
  });

  it('should check that users are able to fetch t heir listings appropriately', async () => {
    // Get 10 listings
    const sellerListings = await gateway.connect(seller).getMyListings(1, 10);
    expect(sellerListings.length).to.equal(10);
    sellerListings.forEach( listing => {
      expect(listing).to.not.equal(ethers.constants.AddressZero);
      console.log(listing);
    });

    try {
      await gateway.connect(buyer).getMyListings(1, 10);
    } catch (e) {
      expect(e.toString()).to.equal(NO_LISTINGS_ERROR)
    }
  });

  it('should allow buyers to see their offers', async () => {
    const listings = await gateway.connect(buyer).getAllListings(1, 5);

    // Submit an offer
    listings.forEach( async listing => {
      await gateway.connect(buyer).submitOffer(ethers.utils.getAddress(listing), hashBuyerCode, { value: 100 });
    })

    // Get all my offers
    const offers = await gateway.connect(buyer).getMyOffers();
    console.log(offers);

  })

  it('buyer cancel offers', async () => {
    const listings = await gateway.connect(buyer).getAllListings(1, 5);

    // Submit an offer
    listings.forEach( async listing => {
      await gateway.connect(buyer).submitOffer(ethers.utils.getAddress(listing), hashBuyerCode, { value: 100 });
    })

    // Get all my offers
    const offers = await gateway.connect(buyer).getMyOffers();
    console.log(offers);

    listings.forEach( async listing => {
      await gateway.connect(buyer).cancelOffer(ethers.utils.getAddress(listing));
    })
    
  })



});
