#Art Auction Blockchain Application

##Introduction

This Hyperledger/Fabric The fabric is an implementation of blockchain technology, leveraging familiar and proven technologies. It is a modular architecture allowing pluggable implementations of various function. It features powerful container technology to host any mainstream language for smart contracts development. Chaincode (smart contracts) or blockchain applications run on the fabric. Chaincode is written in Go language 

The original intention of this application is to understand how to write a Go application on the Hyperledger/Fabric. This initial version was written to understand the different chaincode api's, the boundary that separates what goes into the blockchain and what lives within the enterprise application, usage of database features, error management etc.

## Application Description

This application deals with auctioning ART on the block chain. The blockchain makes sense here as there are many different stakeholders and can leverage the benifits of the "Network Effect". This application deals with the following stake holders:
* Buyers and Sellers or Traders (TRD)
* Banks (BNK)
* Insurance Companies (INS)
* Shipping and Forwarding (SHP)
* Auction Houses (AH)
* Art Dealers (DEL)
* Artists (ART)

The typical business process is shown below
<Insert Business Process Picture here>

1. Artists, Traders, Dealers own ART items
2. To trade on the block chain, the stakeholder has to open an account on the block chain
3. The account holder can register their items on the block chain
4. When they see an opportunity to make money, they would like to sell it, hence they engage an Auction House to place the Item on auction.
5. The Auction House (possibly will get the item validated, valued) and then decide to accept the item , place it on auction and open it up for accepting bids. They may also advertise a "BuyItNow" price
6. During the window of the auction, bidders can place bids
7. When the auction expires, the Auction House picks the highest bid and converts it to a transaction ( A  transaction in the real world could mean creating insurance and shipping docs, collecting payment and commissions, issuing a new title or certificate to the new owner etc.) and transfers ownership to the buyer and updates the price with the new "Hammer" price.






##Environment Setup
Please review instructions on setting up the [Development Environment](https://github.com/hyperledger/fabric/blob/master/docs/dev-setup/devnet-setup.md) as well as the setting up the [Sandbox Environment](https://github.com/hyperledger/fabric/blob/master/docs/API/SandboxSetup.md) to execute the chaincode.
