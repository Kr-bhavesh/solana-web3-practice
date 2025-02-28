import { closeAccount,getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Connection,PublicKey } from "@solana/web3.js";
import { clusterApiUrl } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58"
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"});



async function recover() {
    const connection = new Connection(clusterApiUrl('devnet'));
     const sender = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
     const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        new PublicKey("655Qg1wq7fbk8C6JhVcQzWK1PzwvJjm4uxZBdkFPF37B"),
        sender.publicKey
      )
      
      const tx = await closeAccount(connection,sender,
        tokenAccount.address,
        sender.publicKey,
        sender
      )
      console.log("🚀 ~ recover ~ tx:", tx)
}

recover()