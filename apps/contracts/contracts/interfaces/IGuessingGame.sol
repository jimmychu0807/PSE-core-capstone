// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IGuessingGame {
  struct Game {
    // game players. The first player is the game host
    address[] players;
    mapping(address => uint8[]) winning;
    uint8 currentRound;
    GameState state;
    // player move list
    mapping(address => uint8[]) moves;
    address winner;
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
  error GuessingGame__GameHasEnded();
  error GuessingGame__UnexpectedGameState(GameState actual);
  error GuessingGame__PlayerAlreadyJoin(address p);
  error GuessingGame__SenderIsNotGameHost();

  // Emitted Events
  event NewGame(uint32 indexed gameId, address indexed sender);
  event PlayerJoinGame(uint32 indexed gameId, address indexed sender);
  event GameStarted(uint32 gameId);

  // External Functions
  function newGame() external returns (uint32 gameId);
  function joinGame(uint32 gameId) external;
  function startRound(uint32 gameId) external;
}
