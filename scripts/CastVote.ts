import * as dotenv from 'dotenv';
import { BigNumber, ethers } from 'ethers';
import { attachToBallot, configureWallet, getCleanArguments } from './Utils';
dotenv.config();



async function main() {
    // Get wallet configuration for voter
    const signerWallet = configureWallet(process.env.VOTER_THAT_VOTES_PRIVATE_KEY)

    // Attach ballot contract.
    const ballotContractInstance = await attachToBallot(signerWallet)

    // Get clean args [2:]
    const args = getCleanArguments(process.argv)
    
    // Parse proposalIndex as number
    const proposal: number = Number(args[0])

    // If it's not a number, error.
    if (isNaN(proposal)) {
        throw new Error("Proposal provided was not numeric.")
    }

    const action:string = "Vote"
    console.log(`Executing ${action} transaction`);

    // Call function to vote. Sub 1 because of indexing in contract.
    const voteTx = await ballotContractInstance.vote(BigNumber.from(proposal - 1))

    console.log(`Waiting for confirmations...`);

    const voteTxReceipt = await voteTx.wait()

    console.log(`
        Action: ${action}
        Voter: ${voteTxReceipt.from}
        Vote: Proposal ${proposal}
        Tx hash: ${voteTxReceipt.transactionHash}
        Block: ${voteTxReceipt.blockNumber}
        Contract Address: ${process.env.BALLOT_CONTRACT_ADDRESS}
        Cost in ETH: ${ethers.utils.formatEther(voteTxReceipt.gasUsed.mul(voteTxReceipt.effectiveGasPrice))}
        Confirmations: ${voteTxReceipt.confirmations}
    `)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
