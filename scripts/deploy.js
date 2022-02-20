async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    'Deploying contracts with the account:',
    deployer.address,
  );

  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Gateway = await ethers.getContractFactory('ExchangeItGateway');
  const gateway = await Gateway.deploy();

  console.log('LockAndSwapGateway address:', gateway.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
