import { approve, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";

import bs58 from "bs58";
import { configDotenv } from "dotenv";
configDotenv({path:"../.env"})
export const approvalTest= async() =>{
    try {
        const connection = new Connection(clusterApiUrl("devnet"));
        const signer = Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string)));
        const mint = new PublicKey("Bm8St3hRa2oKoBpumum8zCL56f7JCw7MaEyPNyCUurrF");
        const senderAta = await getAssociatedTokenAddress(mint,signer.publicKey,undefined,TOKEN_2022_PROGRAM_ID);
        const approveTx = await approve(connection,signer,senderAta,new PublicKey("Gcf2Gs9mmDNiAk4hiLKu47rXskGA1cZpwKuHyG7f8SMf"),signer,BigInt(100000000000),undefined,undefined,TOKEN_2022_PROGRAM_ID);
        console.log("🚀 ~ constapprovalTest ~ approveTx:", approveTx)
    } catch (error) {
        console.log("Error :",error);
    }
}

approvalTest();