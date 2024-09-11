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
    mapping(uint8 => mapping(address => uint16)) revelations;
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
  error GuessingGame__CommitmentVerificationTerminated(uint32 gameId, uint8 round, address addr);
  error GuessingGame__InvalidOpeningProof(uint32 gameId, uint8 round, address addr);
  error GuessingGame__OpeningVerificationTerminated(uint32 gameId, uint8 round, address addr);
  error GuessingGame__NotOneOfPlayers();

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
  function submitCommitment(
    uint32 gameId,
    uint256[24] calldata _proof,
    uint256[2] calldata _pubSignals
  ) external;
  function openCommitment(uint32 gameId, bytes32 proof, uint16 bid) external;
  function endRound(uint32 gameId) external;
}
