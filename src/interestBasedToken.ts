import {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
} from '@solana/web3.js';
import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInterestBearingMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    amountToUiAmount,
} from '@solana/spl-token';
import { configDotenv } from 'dotenv';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
configDotenv({path:"../.env"});
(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
   
    const decimals = 9;
ExtensionType.ConfidentialTransferAccount
    const mintKeypair = Keypair.generate();
    const interesetBasedMint = await createInterestBearingMint(connection,payer,payer.publicKey,payer.publicKey,payer.publicKey,20,9,mintKeypair);
     const ata = await getOrCreateAssociatedTokenAccount(connection,payer,interesetBasedMint,payer.publicKey,undefined,undefined,undefined,TOKEN_2022_PROGRAM_ID)
    const mintTx = await mintTo(connection,payer,interesetBasedMint,ata.address,payer.publicKey,100000000000,[],undefined,TOKEN_2022_PROGRAM_ID)
    console.log("🚀 ~ mintTx:", mintTx)
    //gives the latest amount with interest
    const amount = await amountToUiAmount(connection,payer,new PublicKey("5a2mgRj6WwUmBpcAu6DKHBXTZN6MiiHXAUhum8zKG3Hb"),100000000000,TOKEN_2022_PROGRAM_ID)
    console.log("🚀 ~ amount:", amount)
    
})

()