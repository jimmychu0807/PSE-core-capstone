// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IOpeningVerifier {
  function verifyProof(
    uint256[24] calldata _proof,
    uint256[4] calldata _pubSignals
  ) external view returns (bool);
}
