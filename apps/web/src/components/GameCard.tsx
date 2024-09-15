type GameCardProps = {
  gameId: number;
};

export default function GameCard({ gameId }: GameCardProps) {
  return <div>{gameId}</div>;
  // const { abi, deployedAddress } = gameArtifact;
  // const contractCfg = useMemo(() => ({ abi, address: deployedAddress }), [abi, deployedAddress]);

  // const { address: userAddr } = useAccount();
  // const { isPending, writeContract } = useWriteContract();

  // const userJoinedGame: boolean = game.players.includes(userAddr);

  // const userJoinGameHandler = useCallback(() => {
  //   writeContract({
  //     ...contractCfg,
  //     functionName: "joinGame",
  //     args: [gameId],
  //   });
  // }, [writeContract, contractCfg, gameId]);

  // return (
  //   <Card w={500}>
  //     <LinkBox>
  //       <CardHeader>
  //         <LinkOverlay as={NextLink} href={`/game/${gameId}`}>
  //           <strong>Game ID: {gameId}</strong>
  //         </LinkOverlay>
  //       </CardHeader>

  //       <CardBody>
  //         <Text>Players: {game.players.length}</Text>
  //         <UnorderedList styleType="- ">
  //           {game.players.map((p) => (
  //             <ListItem key={`game-${gameId}-${p}`} fontSize={14}>
  //               {p}
  //             </ListItem>
  //           ))}
  //         </UnorderedList>
  //         <Text>
  //           State: <strong>{GameState[game.state]}</strong>
  //         </Text>
  //         <Text>Created: {formatter.dateTime(game.startTime)}</Text>
  //         <Text>Last Updated: {formatter.dateTime(game.lastUpdate)}</Text>
  //       </CardBody>
  //     </LinkBox>
  //     <CardFooter justifyContent="center">
  //       {game.state === GameState.GameInitiated && (
  //         <Button
  //           onClick={userJoinGameHandler}
  //           variant="outline"
  //           colorScheme="blue"
  //           isDisabled={userJoinedGame}
  //           isLoading={isPending}
  //         >
  //           {userJoinedGame ? "Already Joined" : "Join Game"}
  //         </Button>
  //       )}
  //       {game.state >= GameState.RoundCommit && game.state <= GameState.RoundEnd && (
  //         <Text>Game in Progress...</Text>
  //       )}
  //       {game.state >= GameState.GameEnd && <Text>Game Ended</Text>}
  //     </CardFooter>
  //   </Card>
  // );
}
