import { configDotenv } from "dotenv";
import {
    clusterApiUrl,
    Connection,
    Keypair,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
  } from '@solana/web3.js';
  import {
    createInitializeMetadataPointerInstruction,
    createInitializeMintInstruction,
    ExtensionType,
    getMintLen,
    LENGTH_SIZE,
   mintTo,
    TOKEN_2022_PROGRAM_ID,
    TYPE_SIZE,
    TOKEN_PROGRAM_ID,
    getOrCreateAssociatedTokenAccount,
  } from '@solana/spl-token';
  import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';
  import bs58 from 'bs58';
import { PublicKey } from "@solana/web3.js";
  configDotenv({path:"../.env"});

  
  (async () => {
    const payer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
  
    const mint = Keypair.generate();
    const decimals = 9;
  
    const metadata:TokenMetadata = {
      mint: mint.publicKey,
      name: 'Astronoaut',
      symbol: 'AMC', 
      // uri: 'https://gateway.pinata.cloud/ipfs/QmUfVwM36h4WUHz64orKvHhshP3mzW7WMydtokEnchvZSc',
      uri:"https://gateway.pinata.cloud/ipfs/QmWPAwatLmLdyFauK8U4iRsT1WSPMf3rZeqdtMzcXKJA2V",
      additionalMetadata: [['createor', 'bahe'],['diksjd','jsxjdjjkd']],
      


    };
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    const mintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
      createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mint.publicKey,
        metadata: mint.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
      }))
    const tx = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mint]);
    console.log("🚀 ~ tx:", tx)

  })

async function mint(address:string){
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const payer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
    const tac = await getOrCreateAssociatedTokenAccount(connection,payer,new PublicKey(address),payer.publicKey,
  undefined,undefined,undefined,TOKEN_2022_PROGRAM_ID)
    const mintTx = await mintTo(connection,payer,new PublicKey(address),tac.address,payer.publicKey,500000000000,[],undefined,TOKEN_2022_PROGRAM_ID);
    console.log("🚀 ~ mint:", mintTx)
}
(async()=>await mint("3TkaYWFXya528K1afRad1FpXEZnZunf632iML2pVEvAc"))()

 async function associatedTokenAccounts(){
  const payer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
  const connection = new Connection(clusterApiUrl("devnet"));
  const tokenAccounts = 
  await connection.getTokenAccountsByOwner(payer.publicKey,{programId:TOKEN_PROGRAM_ID})
  console.log("🚀 ~ associatedTokenAccounts ~ tokenAccounts:", tokenAccounts)
  const tokenAccounts2022 = await connection.getTokenAccountsByOwner(payer.publicKey,{
    programId:TOKEN_2022_PROGRAM_ID,
  })
  console.log("🚀 ~ associatedTokenAccounts ~ tokenAccounts2022:", tokenAccounts2022)
  }

// associatedTokenAccounts()