const token = artifacts.require('../contracts/JJGToken.sol')
const crowdsale = artifacts.require('../contracts/JJGCrowdsale.sol')
const setDefaultAccount = require('../scripts/setDefaultAccount.js')

module.exports = function(deployer, network, accounts) {
    const rate = new web3.BigNumber(10)
    const wallet = '0xa11EC1A3F4f10D17B535611e2Ee8077c95cD727a'
    // Setup default account
    setDefaultAccount(web3)
    const account = web3.eth.accounts.pop()
    // Get gas limit
    let gasLimit = web3.eth.getBlock('latest').gasLimit
    let gasPrice = web3.eth.gasPrice
    if (process.argv[4] === '--staging') {
        gasPrice *= 4
    }
    console.log(`Determined gas limit: ${gasLimit}; and gas price: ${gasPrice}; max deployment price is ${web3.fromWei(gasPrice * gasLimit, 'ether')} ETH`)
    // Deploy contract
    return deployer
        .then(() => {
            return deployer.deploy(token, { gas: gasLimit, gasPrice: gasPrice, from: account })
        })
        .then(() => {
            // Get gas limit
            gasLimit = web3.eth.getBlock('latest').gasLimit
            console.log(`Determined gas limit: ${gasLimit}; and gas price: ${gasPrice}; estimate max deployment price is ${web3.fromWei(gasPrice * gasLimit, 'ether')} ETH`)
            console.log('This might take a while, please, be patient')
            return deployer.deploy(
                crowdsale,
                token.address,
                rate,
                wallet,
                { gas: gasLimit, gasPrice: gasPrice, from: account },
            )
        })
        .then(() => {
            // Make smart-contract an owner
            var tokenContract = web3.eth.contract(token.abi).at(token.address)
            tokenContract.transferOwnership(crowdsale.address)
        });
}