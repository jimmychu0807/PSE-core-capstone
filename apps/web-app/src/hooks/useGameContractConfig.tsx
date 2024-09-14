import { gameArtifact } from "@/config";
import { useMemo } from "react";

export default function useGameContractConfig() {
  const { abi, deployedAddress } = gameArtifact;
  const contractConfig = useMemo(() => ({ abi, address: deployedAddress }), [abi, deployedAddress]);
  return contractConfig;
}
