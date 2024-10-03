// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameNFTGame is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // NFT-related variables
    mapping(uint256 => string) private _tokenURIs;

    // Game-related variables
    struct Player {
        address playerAddress;
        uint256 score;
    }

    mapping(address => Player) public players;

    event GamePlayed(address indexed player, uint256 score);
    event NFTMinted(address indexed owner, uint256 tokenId, string tokenMetadataURI);

    constructor() ERC721("GameNFT", "GNFT") {}

    // Function to mint NFTs with the renamed tokenMetadataURI
    function mint(string memory tokenMetadataURI) external {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(msg.sender, tokenId);
        _tokenURIs[tokenId] = tokenMetadataURI;

        emit NFTMinted(msg.sender, tokenId, tokenMetadataURI);
    }

    // Correctly overriding tokenURI to return the stored URI for a given tokenId
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // Function to play the game and update the player's score
    function playGame(uint256 score) external {
        require(score > players[msg.sender].score, "New score must be higher.");
        players[msg.sender].score = score;
        emit GamePlayed(msg.sender, score);
    }

    // View function to get a player's score
    function getPlayerScore(address player) external view returns (uint256) {
        return players[player].score;
    }
}
