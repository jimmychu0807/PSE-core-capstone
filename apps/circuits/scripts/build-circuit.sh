#!/bin/bash -e
CIRCUIT=$1
TIMEOUT_SEC="6s"

# Yellow color escape code
YELLOW='\033[1;33m'
# Reset Color
NC='\033[0m'


echo -e "${YELLOW}Compiling ${CIRCUIT}${NC}"
yarn circomkit compile ${CIRCUIT}

echo -e "\n${YELLOW}Setting up ${CIRCUIT}${NC}"
timeout ${TIMEOUT_SEC} yarn circomkit setup ${CIRCUIT} || true
timeout ${TIMEOUT_SEC} yarn circomkit contract ${CIRCUIT} || true

echo -e "\n${YELLOW}Copying circuit assets from app/circuits to app/contracts ${NC}"
mkdir -p ../contracts/artifacts/circuits
cp artifacts/build/${CIRCUIT}/${CIRCUIT}.r1cs ../contracts/artifacts/circuits/${CIRCUIT}.r1cs
cp artifacts/build/${CIRCUIT}/plonk_pkey.zkey ../contracts/artifacts/circuits/${CIRCUIT}.zkey
cp artifacts/build/${CIRCUIT}/${CIRCUIT}_js/${CIRCUIT}.wasm ../contracts/artifacts/circuits/${CIRCUIT}.wasm

cp artifacts/build/${CIRCUIT}/plonk_verifier.sol ../contracts/contracts/${CIRCUIT}_verifier.sol
