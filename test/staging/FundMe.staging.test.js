const{getNamedAccounts,deployments, ethers,network}=require("hardhat")
const{developmentChains}=require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)?describe.skip

:describe("FundMe",async function(){
    let fundMe
    let deployer
    const sendValue=ethers.utils.parseEther("0.05")
    beforeEach(async function(){
        deployer = (await getNamedAccounts()).deployer
       // await deployments.fixture("all") we dont do this bcoz we assume it is already deployed
        fundMe = await ethers.getContract("FundMe",deployer)
//we dont use mock bcoz we assume we are on a testnet
    })
    it("allows people to fund and withdraw",async function(){
        await expect(fundMe.fund()).to.be.reverted
        await fundMe.fund({value:sendValue})
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(),"0")

    })
})