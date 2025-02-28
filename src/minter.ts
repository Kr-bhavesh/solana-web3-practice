import { clusterApiUrl, Connection,Keypair,PublicKey } from "@solana/web3.js";
import { createMint,mintTo,getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID,transferChecked} from "@solana/spl-token";
import bs58 from "bs58";
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"});
async function mintToken(){
    const connection = new Connection("https://api.devnet.solana.com","finalized");
    const senderkeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));

    const mint = await createMint(connection,senderkeypair,senderkeypair.publicKey,null,9)
    console.log("🚀 ~ mintToken ~ mint:", mint.toBase58())
      
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderkeypair,
        new PublicKey("8H7TXDU2E6ZZLrRcpf8fvpkUnSQiFY66UhHhco13eKyg"),
        senderkeypair.publicKey
      )
      console.log("🚀 ~ mintToken ~ tokenAccount:", tokenAccount.address.toBase58())
      const tx = await mintTo(
        connection,
        senderkeypair,
        new PublicKey("GFNtEB1LFDhfjNAtNbGv9zogABVGSfKmtCQStM4Fir8y"),
        tokenAccount.address,
        senderkeypair,
        500000000000 
      )
      console.log("🚀 ~ mintToken ~ tx:", tx)
        const tac = await getOrCreateAssociatedTokenAccount(connection,senderkeypair,new PublicKey("99oNWyBpBBoznmebN1sqqTra1RyK2ae4H4AurqYKCUF9"),new PublicKey("7gfLANkiG5cDUhUfA1ZdBtTbmmA5Kv5D3PzW4VvVpwL4"),
         true,undefined,undefined,TOKEN_2022_PROGRAM_ID)
        console.log("🚀 ~ mintToken ~ tac:", tac)
        
}

(async()=>{
    await mintToken()
})

async function transferToken(){
  
  const connection = new Connection(clusterApiUrl('devnet'));
  const sender = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.VISMAY_KEY as string)));
  const senderAta = await getOrCreateAssociatedTokenAccount(connection,sender,new PublicKey("Bm8St3hRa2oKoBpumum8zCL56f7JCw7MaEyPNyCUurrF"),new PublicKey("8CdXt9cSkjccu1BnCjQvcQ3hYGK9psK3RZfcSAcWUbhd"),undefined,undefined,undefined,TOKEN_2022_PROGRAM_ID)
  const receiverAta = await getOrCreateAssociatedTokenAccount(connection,sender,new PublicKey("Bm8St3hRa2oKoBpumum8zCL56f7JCw7MaEyPNyCUurrF"),new PublicKey("Gcf2Gs9mmDNiAk4hiLKu47rXskGA1cZpwKuHyG7f8SMf"),undefined,undefined,undefined,TOKEN_2022_PROGRAM_ID);
  const tx = await transferChecked(connection,sender,senderAta.address,new PublicKey("Bm8St3hRa2oKoBpumum8zCL56f7JCw7MaEyPNyCUurrF"),
 receiverAta.address,sender,BigInt(30),9,undefined,undefined,TOKEN_2022_PROGRAM_ID);
 console.log("🚀 ~ transferToken ~ tx:", tx)



}
transferToken()
