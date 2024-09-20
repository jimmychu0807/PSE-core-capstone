import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverCloseButton,
  PopoverHeader,
  PopoverTrigger,
  OrderedList,
  ListItem,
  Text,
  Code,
} from "@chakra-ui/react";
import { GameConfig } from "@/config";

export default function GameHelpPopover({ displayText }: { displayText: string }) {
  return (
    <Popover isLazy>
      <PopoverTrigger>
        <Button size="sm" variant="link">
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        maxHeight="400px"
        overflowY="scroll"
        width="500px"
        color="white"
        bg="blue.800"
        borderColor="blue.800"
      >
        <PopoverArrow bg="blue.800" />
        <PopoverHeader pt={4} fontWeight="semibold" border="0">
          Game Overview
        </PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody>
          <Text fontSize="sm" pb={4}>
            In this game, the goal of each player is to guess the closest to the mean of submissions
            from all participating players. Each game is divided into multiple rounds. Players first
            commit to a guess from <b>{GameConfig.MIN_NUM}</b> to <b>{GameConfig.MAX_NUM}</b>. The
            guess value is processed through a zk-SNARK circuit on the client side, and the
            commitment is submitted on-chain.
          </Text>
          <Text fontSize="sm" pb={4}>
            After all players have submitted commitments and proofs, they open and reveal their
            guesses. When all players have opened their guesses, the game host concludes the round.
            The mean of all guesses will be computed, and the player who submitted the guess closest
            to the mean will win the round.
          </Text>
          <Text fontSize="sm" pb={4}>
            The player who win <b>{GameConfig.ROUNDS_TO_WIN}</b> rounds first win the game.
          </Text>
          <Text fontSize="sm" as="b">
            Some Technicalities
          </Text>

          <OrderedList spacing={3} mt={3}>
            <ListItem fontSize="sm">
              When a player submit a guess, a nullifier is randomly generated, and both values are
              passed into a zk-SNARK circuit. The circuit performs range check on the guess (
              {GameConfig.MIN_NUM} - {GameConfig.MAX_NUM}) and returns{" "}
              <MyCode>[Poseidon(guess, nullifier), Poseidon(nullifier)]</MyCode>. These two hashes
              are stored on-chain, committing players to their guesses yet preserving their privacy.
            </ListItem>
            <ListItem fontSize="sm">
              Player guess and nullifier are saved in client local storage and thus are not prompted
              again during the opening phase. By toggling &quot;Advanced Mode&quot;, player can
              manually change the value and nullifier upon opening (and check that the value will
              indeed be rejected by the verifier on-chain 😏).
            </ListItem>
            <ListItem fontSize="sm">
              When a round is concluded, the winner's guess, <b>NOT the actual mean</b>, is
              revealed. I think this will make the game a bit more interesting. But all the opening
              values are stored on-chain in plain values, so players can still inspect the smart
              contract storage on-chain and compute the mean off-chain. Further work can be done to
              explore how to hide those openings but still being able to compute the mean and
              distances from players' guesses.
            </ListItem>
          </OrderedList>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

function MyCode({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Code colorScheme="yellow" size="sm" variant="outline">
      {children}
    </Code>
  );
}
