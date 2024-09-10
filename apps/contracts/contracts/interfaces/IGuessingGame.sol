// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IGuessingGame {
  struct Bid {
    uint256 submission;
    uint256 nullifier;
  }

  struct Game {
    // game players. The first player is the game host
    address[] players;
    address[] roundWinners;
    uint8 currentRound;
    GameState state;
    // player bid list
    mapping(uint8 => mapping(address => Bid)) bids;
    mapping(uint8 => mapping(address => uint8)) revelations;
    address finalWinner;
    uint256 startTime;
    uint256 lastUpdate;
    uint256 endTime;
  }

  struct GameView {
    address[] players;
    address[] roundWinners;
    uint8 currentRound;
    GameState state;
    address finalWinner;
    uint256 startTime;
    uint256 lastUpdate;
    uint256 endTime;
  }

  // game state
  enum GameState {
    GameInitiated,
    RoundBid,
    RoundReveal,
    RoundEnd,
    GameEnd
  }

  // Error declaration
  error GuessingGame__InvalidGameId();
  error GuessingGame__NotEnoughPlayers(uint32 gameId);
  error GuessingGame__GameHasEnded();
  error GuessingGame__UnexpectedGameState(GameState actual);
  error GuessingGame__PlayerAlreadyJoin(address p);
  error GuessingGame__SenderIsNotGameHost();
  error GuessingGame__SenderNotOneOfPlayers();
  error GuessingGame__BidProofRejected(address, uint32, uint8);
  error GuessingGame__BidOutOfRange(address, uint8);

  // Emitted Events
  event NewGame(uint32 indexed gameId, address indexed sender);
  event PlayerJoinGame(uint32 indexed gameId, address indexed sender);
  event GameStarted(uint32 gameId);
  event GameStateUpdated(uint32 gameId, GameState state);
  event BidSubmitted(uint32 gameId, uint8 round, address sender);
  event BidRevealed(uint32 gameId, uint8 round, address sender);
  event RoundWinner(uint32 gameId, uint8 round, address winner);
  event GameWinner(uint32 gameId, address winner);

  // External Functions
  function newGame() external returns (uint32 gameId);
  function joinGame(uint32 gameId) external;
  function startGame(uint32 gameId) external;
  function submitCommitment(uint32 gameId, bytes32, bytes32) external;
  function revealCommitment(uint32 gameId, bytes32 proof, uint8 bid, uint256 nullifier) external;
  function endRound(uint32 gameId) external;
}
