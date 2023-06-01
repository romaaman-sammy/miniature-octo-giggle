//Script for Interacting with our smart contract
const {getNamedAccounts,deployements,ethers}= require("hardhat")
const { getFunctionDocumentation } = require("typechain")



async function main() {

const deployer = (await getNamedAccounts()).deployer
console.log("_ _ _ Contract deploying on Sepolia_ _ _")
const fundMe = await ethers.getContract("FundMe",deployer)
console.log("_ _ _ _ _Funding contract _ _ _ _")
const transactionResponse = await fundMe.fund({value:ethers.utils.parseEther("0.35")})
await transactionResponse.wait(1)
console.log("Funded")




}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
