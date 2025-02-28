import * as anchor from '@project-serum/anchor';
import { SystemProgram, Connection, Keypair } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import bs58 from 'bs58';
import { configDotenv } from 'dotenv';
configDotenv({path:"../.env"});
async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "processed");

  const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string))));
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "processed" }
  );
  anchor.setProvider(provider);

  const programId = new anchor.web3.PublicKey("6X3VEotvfkmvm55k87RiPjBez9Jy9Pp7tGVdkHuZjXTL");

  const program = new Program(
    {
      version: "0.1.0",
      name: "counter_program",
      instructions: [
        {
          name: "initialize",
          accounts: [
            { name: "counter", isMut: true, isSigner: true },
            { name: "user", isMut: true, isSigner: true },
            { name: "systemProgram", isMut: false, isSigner: false }
          ],
          args: []
        },
        {
          name: "increment",
          accounts: [
            { name: "counter", isMut: true, isSigner: false },
            { name: "user", isMut: true, isSigner: true }
          ],
          args: []
        },
        {
          name: "decrement",
          accounts: [
            { name: "counter", isMut: true, isSigner: false },
            { name: "user", isMut: true, isSigner: true }
          ],
          args: []
        },
        {
          name: "getValue",
          accounts: [{ name: "counter", isMut: false, isSigner: false }],
          args: [],
          returns: "u64"
        }
      ],
      accounts: [
        {
          name: "Counter",
          type: {
            kind: "struct",
            fields: [{ name: "value", type: "u64" }]
          }
        }
      ]
    },
    programId,
    provider
  );

  try {
    const counterAccount = anchor.web3.Keypair.generate();
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterAccount.publicKey,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([counterAccount])
      .rpc();

    console.log("Counter initialized! Transaction signature:", tx);

    // Increment the counter
    const incrementTx = await program.methods
      .increment()
      .accounts({
        counter: counterAccount.publicKey,
        user: wallet.publicKey,
      })
      .rpc();

    console.log("Counter incremented! Transaction signature:", incrementTx);

    const counterState = await program.account.counter.fetch(counterAccount.publicKey);
    console.log("Current counter value:", counterState.value.toString());

   

  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});