"use client";

import { Text } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";

type GamePageProps = {
  params: {
    gameId: number;
  };
};

export default function GamePage(props: GamePageProps) {
  const { gameId } = props.params;

  return (
    <>
      <Text>{gameId}</Text>
      <Link href="/">Back</Link>
    </>
  );
}
