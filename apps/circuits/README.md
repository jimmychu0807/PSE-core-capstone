# Number Guessing Game Circuits

- To compile a circuit and generate a smart contract verifier

  ```sh
  # To see all available circuits
  yarn circomkit list

  # To compile a circuit
  # This will also copy the smart contract verifier to `apps/contracts` directory
  yarn compile <circuit>
  ```

- To clear a circuit artifact

  ```sh
  yarn clear <circuit>
  ```

- To generate proof with a certain circuit and input and verify it

  ```sh
  # generate the witness
  yarn circomkit witness <circuit> <input>

  # generate the proof
  timeout 5s yarn circomkit prove <circuit> <input>

  # verify the proof
  timeout 5s yarn circomkit verify <circuit> <input>
  ```
