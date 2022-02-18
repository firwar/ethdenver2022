let sellerCode
let buyerCode
let wrongCode
let hashSellerCode
let hashBuyerCode
let hashWrongCode

async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log(
      'Creating Listing with the account::',
      deployer.address,
    );
  
    console.log('Account balance:', (await deployer.getBalance()).toString());
 
    const FAKE_IMAGE_LINK = 'Fake3ImageLink';
    const FAKE_DESCRIPTION = 'Fake3 Description';
    const FAKE_CONTACT_INFO = 'email3@gmail.com' 
    sellerCode = "000000"
    buyerCode = "111111"
    wrongCode = "222222"
    hashSellerCode = ethers.utils.solidityKeccak256(["string"], [sellerCode]);
    hashBuyerCode = ethers.utils.solidityKeccak256(["string"], [buyerCode]);
    hashWrongCode = ethers.utils.solidityKeccak256(["string"], [wrongCode])

    const Gateway = await ethers.getContractFactory("LockAndSwapGateway")

    // Edit deployed gateway address here
    const contract = await Gateway.attach("0x3E93afa5b86BCa0bc1bB1841c4ddf2D072153887")

    await contract.connect(deployer).createListing(FAKE_IMAGE_LINK, FAKE_DESCRIPTION, FAKE_CONTACT_INFO, 1, hashSellerCode, { value: 2});
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });  