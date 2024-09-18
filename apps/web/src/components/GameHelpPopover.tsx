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
            In this game, the goal of each player is to guess closest to the mean of submissions
            from all participating players. Each game is divided into multiple rounds. In each
            round, players first pick a commitment value from <b>{GameConfig.MIN_NUM}</b> to{" "}
            <b>{GameConfig.MAX_NUM}</b>. The value is processed through a zk-SNARK circuit on the
            client-side and the proof is submitted on-chain.
          </Text>
          <Text fontSize="sm" pb={4}>
            After all players submit commitment proofs, they then open and reveal their committment
            values. When all players have opened their commitments, the game host concludes the
            round and the mean will be computed on-chain. The one closest to the mean will win the
            round.
          </Text>
          <Text fontSize="sm" pb={4}>
            The player who win <b>{GameConfig.ROUNDS_TO_WIN}</b> rounds first win the game.
          </Text>
          <Text fontSize="sm" as="b">
            Some Technicalities
          </Text>

          <OrderedList spacing={3} mt={3}>
            <ListItem fontSize="sm">
              When a player first submit a value, a nullifier is randomly generated and gone through
              a zk-SNARK circuit. The circuit performs range check ({GameConfig.MIN_NUM} -{" "}
              {GameConfig.MAX_NUM}) and returns{" "}
              <MyCode>[Poseidon(value, nullifier), Poseidon(nullifier)]</MyCode>. These two hashes
              are stored on-chain and preserve players&apos; privacy.
            </ListItem>
            <ListItem fontSize="sm">
              Player chosen value and nullifier are saved in client local storage and thus are not
              prompted again when opening. By toggling &quot;Advanced Mode&quot;, you can manually
              change the value and nullifier upon opening and see what happen in the on-chain
              verification.
            </ListItem>
            <ListItem fontSize="sm">
              When a round is concluded, the winner submission, <b>NOT the actual mean</b>, is
              revealed. I think this will make the game a bit more interesting. But all the opening
              values are stored on-chain, so players can still compute the mean by inspecting the
              on-chain storage. Further work can be done to explore how to hide those openings but
              still being able to compute the mean and determine a round winner.
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
