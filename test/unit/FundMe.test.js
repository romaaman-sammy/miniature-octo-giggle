const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts,network } = require("hardhat")
const{developmentChains}=require("../../helper-hardhat-config")

!developmentChains.includes(network.name)?describe.skip

:describe("FundMe", async function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("0.1") //1ETH
    beforeEach(async function () {
        //deploy our hardhat function using hardhat deploy
        //const accounts = await ethers.getSigners()
        //const accountzero = accounts[0]
        //const {deployer} = await getNamedAccounts()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async function () {
        it("sets aggregator addresses correctly", async function () {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith
        })
        it("updates the amount funded datastructure", async function () {
            await fundMe.fund({ value: sendValue })
            const amountmap = await fundMe.getaddressToAmountFunded(deployer)
            assert.equal(amountmap.toString(), sendValue.toString())
        })
        it("adds funder to array funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })
    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("Withdraw ETH from a single funder", async function () {
            //arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectivegasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectivegasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            //assert
            assert.equal(endingFundMeBalance, "0")
            assert.equal(
                (startingFundMeBalance.add(startingDeployerBalance)).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
        it("allows us to withdraw with multiple funders", async function () {
           //arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            //Act
            const transactionResponse=await fundMe.withdraw()

            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectivegasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectivegasPrice)
          
            //Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            //Make sure the funders are reset properly
            await expect(fundMe.funders(0)).to.be.reverted

            for(i=1;i<6;i++){
                assert.equal(await fundMe.getaddressToAmountFunded(accounts[i].address),0)
            }


        })
        it("only allows the owner to withdraw",async function(){
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted
        })
    })
})
