import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { createAssociatedTokenAccountInstruction, createCloseAccountInstruction, createSyncNativeInstruction, getAssociatedTokenAddress, NATIVE_MINT } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"})
async function wrapSol(connection: Connection, wallet: Keypair): Promise<PublicKey> {
    const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        wallet.publicKey
    );
    console.log("🚀 ~ wrapSol ~ associatedTokenAccount:", associatedTokenAccount)

    const wrapTransaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedTokenAccount,
            wallet.publicKey,
            NATIVE_MINT
        ),
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: associatedTokenAccount,
            lamports: LAMPORTS_PER_SOL,
        }),
        createSyncNativeInstruction(associatedTokenAccount)
    );
    const tx = await sendAndConfirmTransaction(connection, wrapTransaction, [wallet]);
    console.log("🚀 ~ wrapSol ~ tx:", tx)

    return associatedTokenAccount;
}

const connection = new Connection(clusterApiUrl("devnet"));
const wallet = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
wrapSol(connection,wallet);


async function unwrapSol(
    connection: Connection,
    wallet: Keypair,
    tokenAccount: PublicKey
): Promise<void> {
    const unwrapTransaction = new Transaction().add(
        createCloseAccountInstruction(
            tokenAccount,
            wallet.publicKey,
            wallet.publicKey
        )
    );
    const tx = await sendAndConfirmTransaction(connection, unwrapTransaction, [wallet]);
    console.log("🚀 ~ tx:", tx)
}
unwrapSol(connection,wallet,new PublicKey("3nwe4wHKMgLz8mENG317LvUB2E5MNaY8xYkXNbEjUVdt"))