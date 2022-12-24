// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./PriceConverter.sol";

// this is a customized error introduced in 0.8.4 version
// though this seems like a function, in testing with JS,
// it will be used as String in expect.to.be.revertedWith()
// And, as a best practice, contract name is added before the function name
error FundMe__NotOwner();

contract FundMe {
    // this line enables us to call PriceConverter functions on uint256 data type variables
    using PriceConverter for uint256;

    // saving the address of the owner so that only the owner can withdraw funds from this contract
    // we are making this a immutable variable for gas optimization
    // as we are assigning the variable on a different line from declaring the variable,
    // we have to use "immutable" instead of "constant"
    address public immutable i_owner; // i => immutable

    // as we are declaring and assigning the variable in the same line,
    // we are using "constant" variable for gas optimization
    uint256 public constant MIN_USD = 50; // all caps => constant variable

    // a public array to show the list of all the funders
    address[] public funders;
    // a mapping to show who funded how much
    mapping(address => uint256) public addressToAmountFunded;

    // constructor will be immediately called after contract deployment
    // msg.sender will have the address of whoever deployed the contract
    // sending the priceFeed address manually because different chains will have
    // different addresses for fetching the price from chainlink oracle
    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // modifers are used during function declaration statement. Thus,
    // the modifier will be called first before executing the function
    modifier onlyOwner() {
        // this is the normal approach
        // -> require(msg.sender == i_owner, "Only the owner can withdraw funds");
        // this is the gas optimized approach
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner(); // reverting with the customized error
        }
        _; // executes the rest of the code
    }

    // "payable" function is needed for the smart contract to receive crypto
    function fund() public payable {
        // if the require assertion fails,
        // any calculations before "require" will be undone
        // and any calculation after this statement will not be exectued (thus no further gas spent)
        // As we are using a library, "this" will be passed as the first argument
        // So, msg.value.getConversionRate() = getConversionRate(msg.value)
        // multiplying min_usd by 10^18, because "getConversionRate()" will return a value with 18 decimal places
        // And for correct comparison, we need to have both the values with same number of decimal places
        require(
            msg.value.getConversionRate(priceFeed) >= (MIN_USD * 1e18),
            "Please pay the minimum amount"
        );

        // storing the info of donor
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    // to withdraw the whole amount from the smart contract wallet
    // by using the modifier "onlyOwner", we are making sure that only owner can withdraw the funds stored
    function withdraw() public onlyOwner {
        // N.B:
        // there are different gas cost for different OP Codes. Among those,
        // the OP Codes for storing and reading from a storage variable, consumes a lot of gas
        // so it always recommended to use storage variables as less as possible and use memory variables wherever it is possible

        // for loop is to reset the whole "addressToAmountFunded" variable
        // to optimize gas, we are saving the funders array from storage to memory, before accessing it
        address[] memory memory_funders = funders;
        for (uint256 idx = 0; idx < memory_funders.length; ++idx) {
            addressToAmountFunded[memory_funders[idx]] = 0;
        }
        // resetting the array "funders"
        funders = new address[](0);

        // "transfer", "send", and "call" can be used for sending ETH from one wallet to another.
        // The difference is explained in documentation, but currently it is recommended to use
        // "call" for transfering tokens in a blockchain.
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Transaction Failed");
    }

    // NOTE:

    // Solidity have 2 special functions => "receive()" and "fallback()
    // it is possible to directly send crypto to the contract address without having to
    // call the "fund()" function which is written inside the smart contract

    // in remix, there is a box for "CALLDATA".
    // If the input field of "CALLDATA" is kept empty, the "receive()" special function will be called
    // If the input field is provided with some data, the "fallback()" special function will be invoked

    // both receive and fallback must be declared without using the keyword "function"
    // and both of these must be external and payable

    // COMMENTING BECAUSE THEY ARE NOT NEEDED NOW
    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }
}
