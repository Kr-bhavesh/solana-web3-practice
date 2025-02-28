import { clusterApiUrl, Connection, Keypair,PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"});

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const senderkeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
 
(async () => {
    //ACCOUT LISTENER
  connection.onAccountChange(
    senderkeypair.publicKey,
    (updatedAccountInfo) =>
      console.log("Updated account info: ", updatedAccountInfo),
    "confirmed",
  );
})
async function programListener() {
    try {
        console.log("🚀 ~ invoking the listener");
         const programId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
         connection.onProgramAccountChange(new PublicKey(programId), async (accountInfo,context) => {
           
            const accountAddress = accountInfo.accountId.toBase58();
                console.log('Transaction slot:', context.slot);
                console.log('Account address:', accountAddress);
          
            
          });
    } catch (error) {
        console.log(`error occured while listening events ${error}`)
    }
}

(async()=>{
    await programListener()
})()


async function getTx(){
    const data=await connection.getTransaction("5SPZRYPZJjM1sGXTqdsrLY1FfoUZzTJRCtWGRhCUETx6Dw3AVCxPxSYBezWQB83v2FS5ZsSssQiojQtuzpFYkKg4")
    console.log("🚀 ~ getTx ~ data:", data);   
    
}

(async()=>{
    await getTx()
})