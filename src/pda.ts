import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { PublicKey } from "@solana/web3.js";
import crypto from "crypto";

const nonceBuffer = Buffer.from("8CdXt9cSkjccu1BnCjQvcQ3hYGK9psK3RZfcSAcWUbhd", 'utf-8');
const hashedNonce = crypto.createHash('sha256').update(nonceBuffer).digest();

const programId = new PublicKey("CLE3ifpoh8fkpueVCAXL5dTXuH4F1smvs1bVt58zZ8iW");

const bump = 255; 


export function getPdaFromProgramId(){
  const vault = new PublicKey("8rqtiKA8NLDnNaupZR8DLpvP6VMK3sEEhvxFE1MxH3Gp");
  const key = new PublicKey("7vkbmM5aZ69yYdzqYzeAyLSfWcBuajugcKi41TG7MCD3")
  const pda =  findProgramAddressSync([vault.toBuffer(),key.toBuffer()],programId)
   const [address,bump] = pda;
   console.log("��� ~ getFromProgram ~ address:", address.toBase58(), "bump:", bump);
}
getPdaFromProgramId();
export function getPda(programId:PublicKey){
    const pda = PublicKey.createProgramAddressSync(
        [hashedNonce, Buffer.from([bump])],
        programId
      );
     
  console.log("🚀 ~ PDA:", pda.toBase58());
  return pda;  
}
