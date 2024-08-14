// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IGuessingGame} from "./interfaces/IGuessingGame.sol";
import {MIN_NUM, MAX_NUM} from "./base/Constants.sol";

contract GuessingGame is IGuessingGame, Ownable {
  Game[] public games;
  uint32 public nextGameId = 0;

  // Constructor
  constructor() Ownable(msg.sender) {
    // Initialization happens here
  }

  // Modifiers declaration
  modifier validGameId(uint32 gameId) {
    if (gameId >= nextGameId) {
      revert GuessingGame__InvalidGameId();
    }
    _;
  }

  modifier nonEndState(uint32 gameId) {
    Game storage game = games[gameId];
    if (game.state == GameState.GameEnd) {
      revert GuessingGame__GameHasEnded();
    }
    _;
  }

  modifier gameStateEq(uint32 gameId, GameState gameState) {
    Game storage game = games[gameId];
    if (game.state != gameState) {
      revert GuessingGame__UnexpectedGameState(gameState, game.state);
    }
    _;
  }

  modifier byGameHost(uint32 gameId) {
    Game storage game = games[gameId];
    address host = game.players[0];
    if (host != msg.sender) {
      revert GuessingGame__SenderIsNotGameHost();
    }
    _;
  }

  // Helper functions
  function _updateGameState(uint32 gameId, GameState state) internal validGameId(gameId) nonEndState(gameId) {
    Game storage game = games[gameId];
    game.state = state;

    // Dealing with time recording
    game.lastUpdate = block.timestamp;
    if (state == GameState.GameInitiated) {
      game.startTime = game.lastUpdate;
    } else if (state == GameState.GameEnd) {
      game.endTime = game.lastUpdate;
    }
  }

  function newGame() external override returns (uint32 gameId) {
    Game storage game = games.push();
    game.players.push(msg.sender);
    gameId = nextGameId++;
    _updateGameState(gameId, GameState.GameInitiated);

    emit NewGame(gameId, msg.sender);
  }

  function joinGame(uint32 gameId) external override validGameId(gameId) gameStateEq(gameId, GameState.GameInitiated) {
    Game storage game = games[gameId];
    // check the player has not been added to the game
    for (uint8 i = 0; i < game.players.length; i++) {
      if (game.players[i] == msg.sender) {
        revert GuessingGame__PlayerAlreadyJoin(msg.sender);
      }
    }

    game.players.push(msg.sender);
    emit PlayerJoinGame(gameId, msg.sender);
  }

  function startGame(
    uint32 gameId
  ) external override validGameId(gameId) byGameHost(gameId) gameStateEq(gameId, GameState.GameInitiated) {
    _updateGameState(gameId, GameState.RoundRunningBid);
    emit GameStarted(gameId);
  }
}
