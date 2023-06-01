//import
//define main function
//calling main()
/*function deployFunc(hre){
    hre.getNamedAccounts
    hre.deployments

 }
 module.exports.default=deployFunc*/

/* module.exports=async(hre)=>{
    const{getNamedAccounts,deployments}=hre;

 }*/
const { networks } = require("hardhat/config")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainI is X use address y
    //if chainId is Z use address A
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //if the contrat doesnt exist we deploy a minimal version of it for our local testing/
    //deploying mocks is technically a deploy script

    //what happens when we want to change chains
    //when going for local network or hardhat we want to use a mock
    const args = ethUsdPriceFeedAddress
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [args], //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [args])
    }
    log("___ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _")
}
module.exports.tags = ["all", "FundMe"]
