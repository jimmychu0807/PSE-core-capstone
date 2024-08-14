// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IGuessingGame {
  struct Game {
    // p1 and p2 addr, only they can send the missile
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
    RoundRunningBid,
    RoundRunningReveal,
    GameEnd
  }

  // Error declaration
  error GuessingGame__InvalidGameId();
  error GuessingGame__GameHasEnded();

  // Emitted Events
  event NewGame(uint32 indexed gameId, address indexed sender);

  // External Functions
  function newGame() external returns (uint32 gameId);
}
