const { expect } = require("chai");
const { charactersArray, boss } = require("./fixtures");

// * need a test for : health changes, retrieval, and THEN
//* write a test for the revival functionality

describe("Babby Bees contract", function () {

  it("Users are able to mint a single NFT", async function () {
    const gameContractFactory = await ethers.getContractFactory("BabbyBees");

    const babbyBeesGameContract = await gameContractFactory.deploy(
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

    await babbyBeesGameContract.deployed();

    let txn;

    txn = await babbyBeesGameContract.mintCharacterNFT(0);
    await txn.wait();

    const userCharacter = await babbyBeesGameContract.checkIfUserHasNFT();

    expect(userCharacter.name).to.equal(charactersArray[0].name);
    expect(userCharacter.imageURI).to.equal(charactersArray[0].imageURI);
    expect(userCharacter.hp).to.equal(charactersArray[0].hp);
    expect(userCharacter.attackDamage).to.equal(charactersArray[0].attackDamage);
  });

  it("Character NFT attack function", async function () {

    const gameContractFactory = await ethers.getContractFactory("BabbyBees");

    const babbyBeesGameContract = await gameContractFactory.deploy(
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

    await babbyBeesGameContract.deployed();

    let txn;

    txn = await babbyBeesGameContract.mintCharacterNFT(0);
    await txn.wait();

    await babbyBeesGameContract.attackBoss();
    const newPlayer = await babbyBeesGameContract.checkIfUserHasNFT();
    const newBoss = await babbyBeesGameContract.getBossBear();

    expect(newBoss.hp).to.equal(boss.hp - charactersArray[0].attackDamage);
    expect(newPlayer.hp).to.equal(charactersArray[0].hp - boss.attackDamage);

  });

  // HERE!!!! *****
  it("User can revive another user using wallet address", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const gameContractFactory = await ethers.getContractFactory("BabbyBees");

    const babbyBeesGameContract = await gameContractFactory.deploy(
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
    [222, 0, 266],
    [22, 12, 66],
    [22, 66, 33],
    "Big Bad Babby Bear",
    "https://i.imgur.com/Ihe21p8.gifv",
    6969,
    50
    );

    await babbyBeesGameContract.deployed();

    let txn;

    txn = await babbyBeesGameContract.mintCharacterNFT(0);
    await txn.wait();

    // write logic here and write new function in our smart contract!!

  });

});