// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface ICommitmentVerifier {
  function verifyProof(
    uint256[24] calldata _proof,
    uint256[2] calldata _pubSignals
  ) external view returns (bool);
}
