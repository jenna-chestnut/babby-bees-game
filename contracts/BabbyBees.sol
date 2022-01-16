// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./libraries/Base64.sol";

import "hardhat/console.sol";

contract BabbyBees is ERC721 {
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        string specialMove;
        uint256 hp;
        uint256 maxHp;
        uint256 armor;
        uint256 attackDamage;
    }

    struct BossBear {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    BossBear public bossBear;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    CharacterAttributes[] defaultCharacters;

    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event AttackComplete(uint256 newBossHp, uint256 newPlayerHp, bool crit);

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        string[] memory characterSpecialMoves,
        uint256[] memory characterHp,
        uint256[] memory characterArmor,
        uint256[] memory characterAttackDmg,
        string memory bossName,
        string memory bossImageURI,
        uint256 bossHp,
        uint256 bossAttackDamage
    ) ERC721("BabbyBees", "BBBS") {
        bossBear = BossBear({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        console.log(
            "Done initializing boss %s w/ HP %s, img %s",
            bossBear.name,
            bossBear.hp,
            bossBear.imageURI
        );

        for (uint256 i = 0; i < characterNames.length; i++) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    specialMove: characterSpecialMoves[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    armor: characterArmor[i],
                    attackDamage: characterAttackDmg[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }

        _tokenIds.increment();
    }

    function mintCharacterNFT(uint256 _characterIndex) external {
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);

        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            specialMove: defaultCharacters[_characterIndex].specialMove,
            hp: defaultCharacters[_characterIndex].hp,
            armor: defaultCharacters[_characterIndex].armor,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log(
            "Minted NFT w/ tokenId %s and characterIndex %s",
            newItemId,
            _characterIndex
        );

        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();

        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        charAttributes.name,
                        " -- NFT #: ",
                        Strings.toString(_tokenId),
                        '", "description": "This is an NFT that lets people play in the game Babby Bees!", "image": "',
                        charAttributes.imageURI,
                        '", "attributes": [ { "trait_type": "Health Points", "value": ',
                        strHp,
                        ', "max_value":',
                        strMaxHp,
                        '}, { "trait_type": "Attack Damage", "value": ',
                        strAttackDamage,
                        "} ]}"
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function attackBoss() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD",
            bossBear.name,
            bossBear.hp,
            bossBear.attackDamage
        );

        require(
            player.hp > 0,
            "Error: character must have HP to attack Big Bad Babby Bear!!"
        );

        require(
            bossBear.hp > 0,
            "Error: Big Bad Babby Bear has been murdered. You can't beat a dead... bear."
        );

        bool isCrit = false;
        uint nonce = 1;
        uint256 randomNumber = uint(keccak256(abi.encodePacked(nonce, msg.sender, blockhash(block.number - 1))));

        uint dmg = player.attackDamage;

        if (randomNumber % 11 >= 7) {
            dmg += 22;
            isCrit = true;
        }

        if (bossBear.hp < dmg) {
            bossBear.hp = 0;
        } else {
            bossBear.hp -= dmg;
        }

        uint bossDmg = bossBear.attackDamage;

        if (player.armor > 0) {
            if (player.armor < bossDmg) {
                bossDmg -= player.armor;
                player.armor = 0;
            } else {
                player.armor -= bossDmg;
                bossDmg = 0;
            }
        }

        if (player.hp < bossDmg) {
            player.hp = 0;
        } else {
            if (bossDmg != 0) {
                player.hp -= bossDmg;
            }
        }

        console.log("Player attacked boss. New boss hp: %s", bossBear.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);

        emit AttackComplete(bossBear.hp, player.hp, isCrit);
    }

    function checkIfUserHasNFT()
        public
        view
        returns (CharacterAttributes memory)
    {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        if (nftTokenIdOfPlayer > 0) {
            return nftHolderAttributes[nftTokenIdOfPlayer];
        } else {
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultCharacters()
        public
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    function getBossBear() public view returns (BossBear memory) {
        return bossBear;
    }

    function revive(address playerAddress) public {
        uint256 nftTokenIdOfPlayer = nftHolders[playerAddress];
        require(
            nftTokenIdOfPlayer > 0,
            "Error: This wallet address does not have a character."
        );

        CharacterAttributes memory charAttributes = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];

        require(charAttributes.hp == 0, "Error: Player hp not at 0.");
        require(msg.sender != playerAddress, "Error: You cannot revive yourself!");

        charAttributes.hp = defaultCharacters[charAttributes.characterIndex].hp;

        nftHolderAttributes[nftTokenIdOfPlayer] = charAttributes;
    }
}
