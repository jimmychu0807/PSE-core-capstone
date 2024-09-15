import { GameContractAbi, deployedAddress } from "@/config";
import { useMemo } from "react";

export default function useGameContractConfig() {
  const contractConfig = useMemo(
    () => ({
      abi: GameContractAbi,
      address: deployedAddress,
    }),
    []
  );
  return contractConfig;
}
