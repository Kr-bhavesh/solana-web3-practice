import * as anchor from '@project-serum/anchor';
import { SystemProgram, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import bs58 from 'bs58';
import { configDotenv } from 'dotenv';
configDotenv({ path: "../.env" });
async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "processed");

    const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string))));
    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        { commitment: "processed" }
    );
    anchor.setProvider(provider);

    const programId = new anchor.web3.PublicKey("BRK8VyTHz5GMh5wRoeB7YXHnoqZSkta75bfZRtsbpzFB");

    const program = new Program(
        { "version": "0.1.0", "name": "counter_program", "instructions": [{ "name": "initialize", "accounts": [{ "name": "counter", "isMut": true, "isSigner": false }, { "name": "user", "isMut": true, "isSigner": true }, { "name": "systemProgram", "isMut": false, "isSigner": false }], "args": [] }, { "name": "increment", "accounts": [{ "name": "counter", "isMut": true, "isSigner": false }, { "name": "user", "isMut": true, "isSigner": true }], "args": [] }, { "name": "decrement", "accounts": [{ "name": "counter", "isMut": true, "isSigner": false }, { "name": "user", "isMut": true, "isSigner": true }], "args": [] },
         { "name": "getValue", "accounts": [{ "name": "counter", "isMut": false, "isSigner": false }, { "name": "user", "isMut": true, "isSigner": true }], "args": [], "returns": "u64" }], "accounts": [{ "name": "Counter", "type": { "kind": "struct", "fields": [{ "name": "value", "type": "u64" }] } }] },
        programId,
        provider
    );

    try {
        const counterAccount = await PublicKey.findProgramAddress(
            [wallet.publicKey.toBuffer()],
            programId
        );
        const tx = await program.methods.initialize().accounts({
            counter:counterAccount[0],
            user:wallet.publicKey,
            systemProgram:anchor.web3.SystemProgram.programId
        }).rpc()
        console.log("Counter initialized! Transaction signature:", tx);

        // Increment the counter
        let counterState;
        counterState = await program.account.counter.fetch(counterAccount[0]);
        console.log("🚀 ~ main ~ counterState:", counterState.value.toString());

        const incrementTx = await program.methods
            .increment()
            .accounts({
                counter: counterAccount[0],
                user: wallet.publicKey,
            })
            .rpc();

        console.log("Counter incremented! Transaction signature:", incrementTx);

         counterState = await program.account.counter.fetch(counterAccount[0]);
        console.log("Current counter value:", counterState.value.toString());
       
        const decrementTx = await program.methods
           .decrement()
           .accounts({
            counter:counterAccount[0],
            user:wallet.publicKey
           })
           .rpc();
           console.log("🚀 ~ main ~ decrementTx:", decrementTx);
           counterState = await program.account.counter.fetch(counterAccount[0]);
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