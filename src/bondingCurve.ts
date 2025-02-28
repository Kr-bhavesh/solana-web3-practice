import * as anchor from '@project-serum/anchor';
import { SystemProgram, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import bs58 from 'bs58';
import { configDotenv } from 'dotenv';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
configDotenv({ path: "../.env" });
async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "processed");
    const bondingCurveAccount = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.RECEIVER_PRIVATE_KEY as string))))
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string))));
    const account2 = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)))
    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        { commitment: "processed" }
    );
    anchor.setProvider(provider);

    const programId = new anchor.web3.PublicKey("8GnwxAQGULJJfn1wuBEQXjEEQB4dTMebgsq9rmLkejzT");

    const program = new Program(
        {"version":"0.1.0","name":"bonding_curve","instructions":[{"name":"initialize","accounts":[{"name":"signer","isMut":true,"isSigner":true},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"vault","isMut":true,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"totalSupply","type":"f64"}]},{"name":"buyToken","accounts":[{"name":"signer","isMut":true,"isSigner":true},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"vault","isMut":true,"isSigner":false},{"name":"mint","isMut":true,"isSigner":false},{"name":"tokenAccount","isMut":true,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"quantity","type":"u64"}]},{"name":"sellToken","accounts":[{"name":"signer","isMut":true,"isSigner":true},{"name":"bondingCurve","isMut":true,"isSigner":false},{"name":"vault","isMut":true,"isSigner":false},{"name":"mint","isMut":true,"isSigner":false},{"name":"tokenAccount","isMut":true,"isSigner":false},{"name":"tokenProgram","isMut":false,"isSigner":false},{"name":"systemProgram","isMut":false,"isSigner":false}],"args":[{"name":"quantity","type":"u64"}]}],"accounts":[{"name":"BondingCurve","type":{"kind":"struct","fields":[{"name":"owner","type":"publicKey"},{"name":"totalSupply","type":"f64"},{"name":"initialPrice","type":"f64"},{"name":"slope","type":"f64"},{"name":"reserveSupply","type":"f64"},{"name":"currentPrice","type":"f64"}]}}],"errors":[{"code":6000,"name":"InsufficientFunds","msg":"Buy amount exceeds the available funds"}]},
        programId,
        provider
    );

    try {
        const id = 1;
        const seedText = "curve"
        const vaultSeed = "vault"
        const [account] = findProgramAddressSync([Buffer.from(seedText, "utf-8"), wallet.publicKey.toBuffer()], programId)
        const [vaultAccount] = findProgramAddressSync([Buffer.from(vaultSeed,"utf-8"),account.toBuffer()],programId)
        console.log("🚀 ~ main ~ vaultAccount:", vaultAccount)
      
        const initialize = await program.methods.initialize(new anchor.BN(0)).accounts({
            signer:wallet.publicKey,
            bondingCurve: account,
            vault:vaultAccount,
            systemProgram: anchor.web3.SystemProgram.programId
        }).signers([account2]).rpc()
        console.log("🚀 ~ initialize ~ initialize:", initialize)
   
        const buyTokenTx = await program.methods.buyToken(new anchor.BN(100)).accounts({
            signer:account2.publicKey,
            bondingCurve: account,
            vault:vaultAccount,
            mint: new PublicKey("8H7TXDU2E6ZZLrRcpf8fvpkUnSQiFY66UhHhco13eKyg"),
            tokenAccount: new PublicKey("FJGRWNJM5JgjZhhNEJxy5E8fvCE9HuaLv8LCvDbwJsbT"),
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId
        }).signers([account2]).rpc()
        console.log("🚀 ~ buyToken ~ buyToken:", buyTokenTx)
     
      
          const sellTokenTx = await program.methods.sellToken(new anchor.BN(5)).accounts({
            signer:account2.publicKey,
            bondingCurve: account,
            vault:vaultAccount,
            mint: new PublicKey("8H7TXDU2E6ZZLrRcpf8fvpkUnSQiFY66UhHhco13eKyg"),
            tokenAccount: new PublicKey("FJGRWNJM5JgjZhhNEJxy5E8fvCE9HuaLv8LCvDbwJsbT"),
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId
        }).signers([account2]).rpc()
          console.log("🚀 ~ sellTokenTx ~ sellTokenTx:", sellTokenTx)

          const data = await program.account.bondingCurve.fetch(account)
          console.log("🚀 ~ main ~ data:", data)
      

       

    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});