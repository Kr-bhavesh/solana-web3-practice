import * as anchor from '@project-serum/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import bs58 from 'bs58';
import { configDotenv } from 'dotenv';
configDotenv({ path: "../.env" });
async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "processed");

    const wallet = new anchor.Wallet(Keypair.fromSecretKey(new Uint8Array(bs58.decode(process.env.SENDER_PRIVATE_KEY as string))));
    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        { commitment: "processed" }
    );
    anchor.setProvider(provider);

    const programId = new anchor.web3.PublicKey("7cpyWot5Ngskx5Ut9a16YL85VYZjf5Ea2SZ8Nf5aUK8i");

    const program = new Program(
        {
            "version": "0.1.0",
            "name": "todo_list",
            "instructions": [
                {
                    "name": "initializeTodoList",
                    "accounts": [
                        {
                            "name": "signer",
                            "isMut": true,
                            "isSigner": true
                        },
                        {
                            "name": "todoList",
                            "isMut": true,
                            "isSigner": false
                        },
                        {
                            "name": "systemProgram",
                            "isMut": false,
                            "isSigner": false
                        }
                    ],
                    "args": [
                        {
                            "name": "todoListId",
                            "type": "u64"
                        }
                    ]
                },
                {
                    "name": "addTodo",
                    "accounts": [
                        {
                            "name": "signer",
                            "isMut": true,
                            "isSigner": true
                        },
                        {
                            "name": "todoList",
                            "isMut": true,
                            "isSigner": false
                        },
                        {
                            "name": "systemProgram",
                            "isMut": false,
                            "isSigner": false
                        }
                    ],
                    "args": [
                        {
                            "name": "todoListId",
                            "type": "u64"
                        },
                        {
                            "name": "title",
                            "type": "string"
                        },
                        {
                            "name": "description",
                            "type": "string"
                        },
                        {
                            "name": "endDate",
                            "type": "u64"
                        }
                    ],
                    "returns": "u64"
                },
                {
                    "name": "updateTodo",
                    "accounts": [
                        {
                            "name": "signer",
                            "isMut": true,
                            "isSigner": true
                        },
                        {
                            "name": "todoList",
                            "isMut": true,
                            "isSigner": false
                        },
                        {
                            "name": "systemProgram",
                            "isMut": false,
                            "isSigner": false
                        }
                    ],
                    "args": [
                        {
                            "name": "todoListId",
                            "type": "u64"
                        },
                        {
                            "name": "todoId",
                            "type": "u64"
                        },
                        {
                            "name": "description",
                            "type": "string"
                        },
                        {
                            "name": "endDate",
                            "type": "u64"
                        }
                    ],
                    "returns": "u64"
                },
                {
                    "name": "finishTodo",
                    "accounts": [
                        {
                            "name": "signer",
                            "isMut": true,
                            "isSigner": true
                        },
                        {
                            "name": "todoList",
                            "isMut": true,
                            "isSigner": false
                        },
                        {
                            "name": "systemProgram",
                            "isMut": false,
                            "isSigner": false
                        }
                    ],
                    "args": [
                        {
                            "name": "todoListId",
                            "type": "u64"
                        },
                        {
                            "name": "todoId",
                            "type": "u64"
                        }
                    ],
                    "returns": "u64"
                },
                {
                    "name": "deleteTodo",
                    "accounts": [
                        {
                            "name": "signer",
                            "isMut": true,
                            "isSigner": true
                        },
                        {
                            "name": "todoList",
                            "isMut": true,
                            "isSigner": false
                        },
                        {
                            "name": "systemProgram",
                            "isMut": false,
                            "isSigner": false
                        }
                    ],
                    "args": [
                        {
                            "name": "todoListId",
                            "type": "u64"
                        }
                    ]
                }
            ],
            "accounts": [
                {
                    "name": "TodoList",
                    "type": {
                        "kind": "struct",
                        "fields": [
                            {
                                "name": "todoListId",
                                "type": "u64"
                            },
                            {
                                "name": "owner",
                                "type": "publicKey"
                            },
                            {
                                "name": "todos",
                                "type": {
                                    "vec": {
                                        "defined": "Todo"
                                    }
                                }
                            },
                            {
                                "name": "registeredOn",
                                "type": "i64"
                            },
                            {
                                "name": "finishedTodos",
                                "type": "u64"
                            },
                            {
                                "name": "pendingTodos",
                                "type": "u64"
                            }
                        ]
                    }
                }
            ],
            "types": [
                {
                    "name": "Todo",
                    "type": {
                        "kind": "struct",
                        "fields": [
                            {
                                "name": "title",
                                "type": "string"
                            },
                            {
                                "name": "description",
                                "type": "string"
                            },
                            {
                                "name": "endDate",
                                "type": "u64"
                            },
                            {
                                "name": "isCompleted",
                                "type": "bool"
                            }
                        ]
                    }
                }
            ],
            "errors": [
                {
                    "code": 6000,
                    "name": "Unauthorized",
                    "msg": "You are not authorized to perform this action."
                }
            ]
        },
        programId,
        provider
    );

    try {
        const id = 1;
        const idBuffer = Buffer.from(new Uint8Array([id]));  // Convert the `id` to a buffer (a single byte in this case)
        
        const todoAccount = await PublicKey.findProgramAddress(
            [Buffer.from(new anchor.BN(id).toArrayLike(Buffer,"le",8)), wallet.publicKey.toBuffer()],
            programId
        );
        console.log("🚀 ~ main ~ todoAccount:", todoAccount)
        
        const tx = await program.methods.initializeTodoList(new anchor.BN(id)).accounts({
            signer:wallet.publicKey,
            todoList:todoAccount[0],
            systemProgram:anchor.web3.SystemProgram.programId
        }).rpc()
        console.log("🚀 ~ tx ~ tx:", tx)
       
      
       const addTodo = await program.methods.addTodo(new anchor.BN(id),"todo","first todo",new anchor.BN(Date.now()+2300)).accounts({
        signer:wallet.publicKey,
        todoList:todoAccount[0],
        systemProgram:anchor.web3.SystemProgram.programId
       }).rpc()
      const todo = await program.account.todoList.fetch(todoAccount[0])
      console.log("🚀 ~ main ~ todo:", todo)
     const finishTodo = await program.methods.finishTodo(new anchor.BN(id),new anchor.BN(0)).accounts({
            signer:wallet.publicKey,
            todoList:todoAccount[0],
            systemProgram:anchor.web3.SystemProgram.programId
           }).rpc()
       console.log("🚀 ~ main ~ addTodo:", finishTodo)
    const deleteTodo = await program.methods.deleteTodo(new anchor.BN(1)).accounts({
        signer:wallet.publicKey,
        todoList:todoAccount[0],
        systemProgram:anchor.web3.SystemProgram.programId
    }).rpc()
    console.log("🚀 ~ main ~ deleteTodo:", deleteTodo)


    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

main().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});