import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
} from '@solana/web3.js';
import {
    createInitializeNonTransferableMintInstruction,
    createInitializeMintInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { configDotenv } from 'dotenv';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
configDotenv({path:"../.env"});
(async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const payer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
   
    const decimals = 9;

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const mintLen = getMintLen([ExtensionType.NonTransferable]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
    const tx = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);
    console.log("🚀 ~ tx:", tx)
    
})

