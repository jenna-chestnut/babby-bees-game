const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { charactersArray, boss } = require("./fixtures");

use(chaiAsPromised);

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

  it("Character NFT attack function & crit chance", async function () {

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

    expect(parseInt(newBoss.hp)).to.be.lessThan(boss.hp - charactersArray[0].attackDamage + 1); // if not crit (char. dmg)
    expect(parseInt(newBoss.hp)).to.be.greaterThan(boss.hp - charactersArray[0].attackDamage  - 23); // if crit (char dmg + 22)
    expect(newPlayer.hp).to.equal(charactersArray[0].hp - boss.attackDamage);

  });

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
    [222, 45, 266],
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

    txn = await babbyBeesGameContract.connect(addr1).mintCharacterNFT(1);
    await txn.wait();

    txn = await babbyBeesGameContract.connect(addr1).attackBoss();
    await txn.wait();

    const rev = await babbyBeesGameContract.revive(addr1.address);

    const userCharacter = await babbyBeesGameContract.connect(addr1).checkIfUserHasNFT();

    expect(userCharacter.hp).to.equal(45);

  });

  it("User canNOT revive themselves", async function () {
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
    [222, 45, 266],
    [22, 12, 66],
    [22, 66, 33],
    "Big Bad Babby Bear",
    "https://i.imgur.com/Ihe21p8.gifv",
    6969,
    50
    );

    await babbyBeesGameContract.deployed();

    let txn;

    txn = await babbyBeesGameContract.mintCharacterNFT(1);
    await txn.wait();

    txn = await babbyBeesGameContract.attackBoss();
    await txn.wait();

    const rev = babbyBeesGameContract.revive(owner.address);

    await expect(rev).eventually.to.rejectedWith(Error, "VM Exception while processing transaction: reverted with reason string 'Error: You cannot revive yourself!'")

  });

});