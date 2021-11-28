const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory('BabbyBees');
  const gameContract = await gameContractFactory.deploy(
    ["BunnyB", "BattyB", "CyberB"],
    [
      "https://imgur.com/isbBpMi", 
      "https://imgur.com/Gq9Lzv7", 
      "https://imgur.com/MHojVuj"
    ],
    [
      "Buzzy Hop", 
      "Buzzy Purr", 
      "Buzzy Develop an AI Capable of Destroying Life as We Know It"
    ],
    [222, 197, 266],
    [22, 12, 66],
    [22, 66, 33],
    "Big Bad Babby Bear",
    "https://i.imgur.com/Ihe21p8.gifv",
    6969,
    50
  );
  await gameContract.deployed();
  console.log("Contract deployed to: ", gameContract.address);

  let txn;

  txn = await gameContract.mintCharacterNFT(2);
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();

  txn = await gameContract.attackBoss();
  await txn.wait();

}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();