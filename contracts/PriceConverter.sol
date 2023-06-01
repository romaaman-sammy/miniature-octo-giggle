// SPDX-License-Identifier:MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter{

    function getPrice(AggregatorV3Interface priceFeed)internal view returns(uint256){
    /*AggregatorV3Interface priceEth = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);*//*Removes need 
    for hardcoding this bit of code here*/    
    (,int price,,,)=priceFeed.latestRoundData();
    return uint256(price*1e10);

    }

    function getConversionRate(uint256 etherValue,AggregatorV3Interface priceFeed)internal view returns(uint256){
        //converts msg.value from eth to in terms of dollars 
        uint256 etherPrice = getPrice(priceFeed);
        uint256 priceEthinUsd = (etherPrice*etherValue)/1e18;
        return priceEthinUsd;

    }

}
