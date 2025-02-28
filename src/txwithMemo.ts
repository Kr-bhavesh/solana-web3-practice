import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
    Connection,
    Keypair,
    SystemProgram,
    LAMPORTS_PER_SOL,
    PublicKey,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
import { configDotenv } from "dotenv";
   configDotenv({path:"../.env"});
  (async () => {
    const fromKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
    const toKeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.RECEIVER_PRIVATE_KEY as string)));
   
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed",
    );
   
    const airdropSignature = await connection.requestAirdrop(
      fromKeypair.publicKey,
      LAMPORTS_PER_SOL,
    );
   
    await connection.confirmTransaction(airdropSignature);
   
    const lamportsToSend = 10;
   
    const transferTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toKeypair.publicKey,
        lamports: lamportsToSend,
      }),
    );
   
    transferTransaction.add(
      new TransactionInstruction({
        keys: [
          { pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true },
        ],
        data: Buffer.from("Transaction with memo", "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      }),
    );
   
    const tx = await sendAndConfirmTransaction(connection, transferTransaction, [
      fromKeypair,
    ]);
    console.log("🚀 ~ tx:", tx)
  })();