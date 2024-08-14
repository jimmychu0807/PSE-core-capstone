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

  modifier gameStateIn(uint32 gameId, GameState[2] memory gameStates) {
    Game storage game = games[gameId];
    bool found = false;
    for (uint8 i = 0; i < gameStates.length; i++) {
      if (game.state == gameStates[i]) {
        found = true;
        break;
      }
    }
    if (!found) {
      revert GuessingGame__UnexpectedGameState(game.state);
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

  // IMPROVE: the gameStateIn() modifier code is bad. It is restricted to take
  //   two params.
  function joinGame(uint32 gameId) external override validGameId(gameId) gameStateIn(gameId, [GameState.GameInitiated, GameState.GameInitiated]) {
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

  function startRound(
    uint32 gameId
  ) external override validGameId(gameId) byGameHost(gameId) gameStateIn(gameId, [GameState.GameInitiated, GameState.RoundEnd]) {
    _updateGameState(gameId, GameState.RoundBid);
    emit GameStarted(gameId);
  }

  function submitBid() {
    // each player submit a bid. The last player that submit a bid will change the game state
  }

  function revealBid() {
    // each player reveal a bid. The last player that reveal a bid will change the game state
  }

  function endRound() {
    // the average will be cmoputed, the winner will be determined. Update the game state.
  }
}
