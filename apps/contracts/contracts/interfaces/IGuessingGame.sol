// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IGuessingGame {
  struct Commitment {
    uint256 submission;
    uint256 nullifier;
  }

  struct Game {
    GameState state;
    // game players. The first player is the game host
    address[] players;
    uint8 currentRound;
    mapping(address => uint8) playerRoundsWon;
    // player bid list
    mapping(uint8 => mapping(address => Commitment)) commitments;
    mapping(uint8 => mapping(address => uint16)) openings;
    address winner;
    uint256 startTime;
    uint256 lastUpdate;
    uint256 endTime;
  }

  struct GameView {
    address[] players;
    uint8 currentRound;
    GameState state;
    address winner;
    uint256 startTime;
    uint256 lastUpdate;
    uint256 endTime;
  }

  // game state
  enum GameState {
    GameInitiated,
    RoundCommit,
    RoundOpen,
    RoundEnd,
    GameEnd
  }

  // Error declaration
  error GuessingGame__InvalidGameId();
  error GuessingGame__NotEnoughPlayers(uint32 gameId);
  error GuessingGame__GameHasEnded();
  error GuessingGame__UnexpectedGameState(GameState expected, GameState actual);
  error GuessingGame__PlayerAlreadyJoin(address p);
  error GuessingGame__NotGameHost(uint32 gameId, address addr);
  error GuessingGame__InvalidCommitmentProof(uint32 gameId, uint8 round, address addr);
  error GuessingGame__UnmatchedCommitment(uint32 gameId, uint8 round, address addr);
  error GuessingGame__InvalidOpeningProof(uint32 gameId, uint8 round, address addr);
  error GuessingGame__NotOneOfPlayers();

  // Emitted Events
  event NewGame(uint32 indexed gameId, address indexed sender);
  event PlayerJoinGame(uint32 indexed gameId, address indexed sender);
  event GameStarted(uint32 gameId);
  event GameStateUpdated(uint32 gameId, GameState state);
  event CommitmentSubmitted(uint32 gameId, uint8 round, address sender);
  event CommitmentOpened(uint32 gameId, uint8 round, address sender);
  event RoundWinner(uint32 gameId, uint8 round, address winner, uint16 bid);
  event RoundDraw(uint32 gameId, uint8 round);
  event GameWinner(uint32 gameId, address winner);

  // External Functions
  function newGame() external returns (uint32 gameId);
  function joinGame(uint32 gameId) external;
  function startGame(uint32 gameId) external;
  function submitCommitment(
    uint32 gameId,
    uint256[24] calldata _proof,
    uint256[2] calldata _pubSignals
  ) external;
  function openCommitment(
    uint32 gameId,
    uint256[24] calldata _proof,
    uint256[4] calldata _pubSignals
  ) external;
  function concludeRound(uint32 gameId) external;
}
