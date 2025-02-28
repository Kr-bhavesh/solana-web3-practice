import * as anchor from '@project-serum/anchor';
import { SystemProgram, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import bs58 from 'bs58';
import { configDotenv } from 'dotenv';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
configDotenv({ path: "../.env" });
async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "processed");
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string))));
    const account2 = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)))
    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        { commitment: "processed" }
    );
    anchor.setProvider(provider);

    const programId = new anchor.web3.PublicKey("7jGk2N8RG14q2fJrHsLxaSmew6u4bLV1MjBHcFLXehhC");

    const program = new Program(
        { "version": "0.1.0", "name": "token_example", "instructions": [{ "name": "mintTokens", "accounts":
             [{ "name": "signer", "isMut": true, "isSigner": true }, { "name": "mint", "isMut": true, "isSigner": false },
                 { "name": "tokenAccount", "isMut": true, "isSigner": false },
                  { "name": "tokenProgram", "isMut": false, "isSigner": false }], "args": [{ "name": "amount", "type": "u64" }] }] },
        programId,
        provider
    );

    try {
        const id = 1;
        const seedText = "curve"
        const idBuffer = Buffer.from(new Uint8Array([id]));  // Convert the `id` to a buffer (a single byte in this case)
        const account = findProgramAddressSync([Buffer.from(seedText, "utf-8"), wallet.publicKey.toBuffer()], programId)
        // const ata = await getOrCreateAssociatedTokenAccount(connection, acount1, new PublicKey("usnuLetQpWHSRSvdhiSwpCC44rYLKsnVHZqHod11WQR"), wallet.publicKey, undefined, undefined, undefined, TOKEN_2022_PROGRAM_ID)
        const mintTx = await program.methods.mintTokens(new anchor.BN(10000000000)).accounts({
            signer:wallet.publicKey,
            mint:new PublicKey("5Sk2jrbWvcoZpWFJBvUHHeQD7z6LwuE63JGPTMytcL4s"),
            tokenAccount:new PublicKey("7QTwjeE7sPPjNQaJK5msLxzToBU6xh5iF9N72v69AcpJ"),
            tokenProgram:TOKEN_PROGRAM_ID
        }).rpc();
        console.log("🚀 ~ mintTx ~ mintTx:", mintTx)


     


    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});