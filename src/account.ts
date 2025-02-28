import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {Connection,LAMPORTS_PER_SOL,Keypair,SystemProgram,Transaction,sendAndConfirmTransaction,PublicKey,clusterApiUrl} from '@solana/web3.js';
import bs58 from "bs58";
import { configDotenv } from 'dotenv';
configDotenv({path:"../.env"});
async function solTest(){
    const client = new Connection(clusterApiUrl('devnet'),"confirmed")
   
    const filters = [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 32,
            bytes: "Bz7j5ucs3XDxaUfbQa9peb3bLmrS9wWXhQpDhP3scbFi", //wallet address string
          },
        },
      ];
      const accounts = await client.getParsedProgramAccounts( 
        TOKEN_PROGRAM_ID, //importing from solana spl-token library
        { filters }
      );
      console.log("🚀 ~ solTest ~ accounts:", accounts[4].account.data)

    const senderkeypair = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
    console.log(await client.getAccountInfo(new PublicKey("EbNpvSu28kxmTu5svmmYa5HxqUUuV9BX8GVGMRwK5ATV")))
    const transaction = new Transaction().add(
        SystemProgram.transfer({
         fromPubkey: senderkeypair.publicKey,
         toPubkey: new PublicKey("CrKQzir1WEGRiQyk4PSn8hB36suFRgEsauaJvbHEo65D"),
         lamports: LAMPORTS_PER_SOL * 1,
        }),
     );

 const tx = await sendAndConfirmTransaction(
    client,
    transaction,
    [senderkeypair],
 );
 console.log("🚀 ~ solTest ~ signature:", tx)

}
solTest()
