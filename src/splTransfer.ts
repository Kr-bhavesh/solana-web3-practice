import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID, transfer } from '@solana/spl-token';
import bs58 from 'bs58';
import { configDotenv } from 'dotenv';
configDotenv({path:"../.env"});
(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)))
  

    const toWallet = Keypair.generate();

    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);

    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        100000000000
    );
    console.log('mint tx:', signature);

    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        50000000000
    );
    console.log("🚀 ~ signature:", signature)
})()


async function splTransfer(){
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const fromWallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)))
  

    const mint = new PublicKey("Bm8St3hRa2oKoBpumum8zCL56f7JCw7MaEyPNyCUurrF")
    const account = await getOrCreateAssociatedTokenAccount(connection,
        fromWallet,
        mint,
        fromWallet.publicKey,
        undefined,
        "finalized",
        {commitment:"finalized"},
        TOKEN_2022_PROGRAM_ID,
    )
       const tokenAccounts2022 = await connection.getTokenAccountsByOwner(fromWallet.publicKey,{
          programId:TOKEN_2022_PROGRAM_ID,
        })
   const tx = await transfer(
    connection,
    fromWallet,
    tokenAccounts2022.value[0].pubkey,
    new PublicKey("NbUutn4WkEw6CQKxb8TbMKcwCpXdxjx2i3xYFfYq831"),
    fromWallet.publicKey,
    50000000000,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
   )   
    console.log("🚀 ~ splTransfer ~ tx:", tx)
    }
// splTransfer()