import Link from "next/link";

type GamePageProps = {
  gameId: number;
};

export default function GamePage({ gameId }: GamePageProps) {
  return (<h3>{gameId}</h3>);
}
