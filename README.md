[![Documentation Status](https://readthedocs.org/projects/itpeople-blockchain-auction/badge/?version=latest)](http://itpeople-blockchain-auction.readthedocs.io/en/latest/?badge=latest)

#Art Auction Blockchain Application
Credits: Ratnakar Asara, Nishi Nidamarty, Ramesh Thoomu, Adam Gordon and Mohan Venkataraman

##Introduction

This Hyperledger/Fabric The fabric is an implementation of blockchain technology, leveraging familiar and proven technologies. It is a modular architecture allowing pluggable implementations of various function. It features powerful container technology to host any mainstream language for smart contracts development. Chaincode (smart contracts) or blockchain applications run on the fabric. Chaincode is written in Go language 

The original intention of this application is to understand how to write a Go application on the Hyperledger/Fabric. This initial version was written to understand the different chaincode api's, the boundary that separates what goes into the blockchain and what lives within the enterprise application, usage of database features, error management etc.

![auction_chain](docs/images/auction_chain.png)

## Application Description

This application deals with auctioning ART on the block chain. The blockchain makes sense here as there are many different stakeholders and can leverage the benefits of the "Network Effect". This application deals with the following stake holders:
* Buyers and Sellers or Traders (TRD)
* Banks (BNK)
* Insurance Companies (INS)
* Shipping and Forwarding (SHP)
* Auction Houses (AH)
* Art Dealers (DEL)
* Artists (ART)

The typical business process is shown below
![Business Process](docs/images/art_process.png)

###Registering Accounts

Artists, Traders, Dealers own **Assets** (Items). Auction Houses, Banks, Insurance Companies and Service Providers play a role in the auction process. To conduct business on the block chain, the stakeholder has to open an account on the block chain. In the production world, prior to opening an account, all of the stake-holder details may be authenticated by another blockchain like an IDaaS (Identity-as-a-Service). There are various types of stake holders as listed above, each with a different interest.

###Registering Assets or Items

The Seller (Trader) who owns **Assets** must register the asset on the block chain in order to conduct business. When an **Asset** is submitted for registration, the chaincode does the following:
    * Checks if the owner is registered
    * Converts any presented "Certificate of Authenticity" or a credibly issued image to a byte stream, generates a key, encrypts the byte stream using the key and stores the image on the BC. It provides the key to the **owner** for safe keeping and future reference
    * Makes entries into the Item History so that the lifecycle of the Asset can be reviewed at any time

###Making a Request to Auction an Asset

When the owner of an Asset sees an opportunity to make money, they would like to auction the Asset. They engage an Auction House and make a **request to auction** the Asset. The request always specifies a **Reserve Price"**. Sometimes, the seller (owner) may additionally specify a **"Buy It Now"** price as well. When the request is made, the item, owner and the auction house are all validated. (The chaincode simply validates that they are all registered on the BC).

The Auction House will most likely get the Asset authenticated and valued before deciding to accept the item. One of the ways by which they could do some preliminary authentication is to request the **seller** to enter his **private key**, account-id and the registered item number. While the item number and account identifier is a straight validation, the key will be used to decrypt and view the stored "certificate of authenticity or image". The state of the Auction is set to **INIT** at this point, until it is **OPENED**.

###Opening the Auction Item for Bids

The Auction House will choose a time frame to place the item on auction and **OPEN** it up for accepting bids from potential Buyers. They may, if applicable, advertise the **"BuyItNow"** price.

### "Buy It Now" and Accepting Bids

During the window of the auction, potential buyers can place bids. If a Buyer wishes to exercise the "Buy It Now", they can buy the item right away provided there is no bid higher than the "BuyItNow" price.

Bids are accepted from buyers if
   * The Bids have are equal or greater than the **Reserve Price"**
   * The auction is still **OPEN**
   * The Buyer has a registered account

### Buy It Now

When a buyer chooses this option, the chain code does the following
    * Validates the Buyer
    * Checks if there are any bidders whose bid is higher than the ** "Buy It Now" ** price. If so, the offer is rejected
    * If the **"Buy It Now"** price is applicable, it immediately ** "CLOSES" ** the auctions, creates a **transaction**
    * It assigns the Asset to the new owner
    * It also generates a new **Key**, re-encrypts the "Certificate of Ownership or Image", and provides the key to the new buyer
    * The new price of the Asset is set to the **"Buy It Now"** price if not higher

### Auction Expiry

When the auction expires, the Auction House retrieves the highest bid and converts it to a **transaction** ( A transaction in the real world could mean creating insurance and shipping docs, collecting payments and commissions, issuing a new title or certificate to the new owner etc.), transfers ownership to the buyer and updates the price with the new **"Hammer"** price. It also generates a new **Key**, re-encrypts the "Certificate of Ownership or Image", and provides the key to the new buyer.

### Transfer an Item to another User

The chain code supports this scenario, by allowing a **owner** of an Asset to transfer **"ownership"** to another person. The receiving person has to be registered on the block-chain. Currently the chain code does not execute any regulatory or compliance rules.

### Validating Asset Ownership

The chain code supports this. In order to accomplish this, it does preliminary authentication by requesting the **seller** to enter his **private key**, account-id and the registered item number. While the item number and account identifier is a straight validation, the key will be used to decrypt and view the stored **"Certificate of Authenticity or image"**. If decryption fails, then it assumes that the owner is not the legal owner of the Asset.

## APIs Available
The following Invoke and Query APIs are available from both CLI and REST, and have the following signature

    func(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) 

### Invoke
                * PostUser 
                * PostItem
                * PostAuctionRequest
                * PostTransaction
                * PostBid
                * OpenAuctionForBids
                * BuyItNow
                * TransferItem
                * CloseAuction
### Query
                * GetItem
                * GetUser
                * GetAuctionRequest
                * GetTransaction
                * GetBid
                * GetLastBid
                * GetHighestBid
                * GetNoOfBidsReceived
                * GetListOfBids
                * GetItemLog
                * GetItemListByCat
                * GetUserListByCat
                * GetListOfItemsOnAuc
                * GetListOfOpenAucs
                * ValidateItemOwnership

##Environment Setup
Please review instructions on setting up the [Development Environment](https://github.com/hyperledger/fabric/blob/master/docs/dev-setup/devnet-setup.md) as well as the setting up the [Sandbox Environment](https://github.com/hyperledger/fabric/blob/master/docs/API/SandboxSetup.md) to execute the chaincode.

## Running the Application

**Cloning the auction app**
```
 cd $GOPATH/src/github.com/hyperledger/fabric
 git clone https://github.com/<username>/auction.git
```

###Terminal 1
```
 cd $GOPATH/src/github.com/hyperledger/fabric/peer
 go build
 peer node start --peer-chaincodedev
```

###Terminal 2
```
 cd $GOPATH/src/github.com/hyperledger/fabric/auction/art/artchaincode
 go build
 CORE_CHAINCODE_ID_NAME=mycc CORE_PEER_ADDRESS=0.0.0.0:30303 ./artchaincode
```
###Terminal 3
```
 cd $GOPATH/src/github.com/hyperledger/fabric/auction/art/scripts
 . ./setup.sh
```
###Run the following shell scripts

#### PostUsers
The PostUsers script inserts a set of users into the database. Today, the only validation done is to check if the user 
ID is an integer.
TODO: In a future version, the user identity will be validated against the IDaaS Blockchain prior to 
inserting into the database

`./PostUsers`

#### PostItems
The PostItems script inserts a set of ART ASSETS into the database. Before inserting the asset the chaincode checks 
if the CurrentOwner is registered as a User. Based on the image file name (in future this could be a title or some
ownership document) is retrieved and converted to a byte array ([]byte). An AES Key is generated, the byte array is encrypted
and both key and the byte array are saved in the database.A log entry is made in the Item Log. 
Please see code for detailed comments

`./PostItems`

In the business process, the owner (User ID# 100) of the ASSET (Item# 1000) requests an entity like an Auction House (User ID# 200) to put the item on auction. Before Posting the auction request, the Asset is validated against the database. The Auction House ID is verified in the User Table. A log entry is made in the Item Log.

TODO: In future, the owner of the asset will present his key to help with validation. 
The AES key will be used to un-encrypt the stored image and authenticate ASSET ownership. 

#### PostAuctionRequest

When the ASSET OWNER  of an item is ready to place his item on auction, he/she would identify an Auction House, determine what the reserve price should be and send a request to the Auction House expressing interest in placing their item on the auction block. 

`./PostAuctionRequest`

#### OpenAuctionRequestForBids

The Auction House, we assume will inspect the physical item, the certificate of authenticity, the ownership key and other details. They would also run a valuation of the item to determine if the reserve price is valid. The application assumes these have occurred outside of the scope of the application

Even though the ASSET OWNER has requested the Auction House to place the item on auction, the Auction is not yet open for acceptance of user bids. Hence any bid submitted against the item will be rejected if the auction is not open
This script opens the Auction Request for bids. It sets the status of the AuctionRequest to "OPEN". It opens a timer for 
the duration of the auction which in the example is 3 minutes. During this window, any user can submit bids against the AuctionID. Once the timer expires, a script is created and saved called "CloseAuction.sh". The script gets triggered. 

##### CloseAuction

The CloseAuction.sh script invokes CloseAuction. 
CloseAuction will first change the status of the AuctionRequest to "CLOSED". It then fetches the highest bid from the list of bids received, and converts it to a Transaction. The transaction is posted, the ASSET is retrieved from the database, its price is set to the new Hammer Price and the CurrentOwner is set to the new buyer. The ASSET image is un-encrypted with the old key, a new Key is generated and the image is encrypted with the new key. The ASSET is updated in the database.
An log entry is made in the Item Log.

TODO: In future, the Transaction will be a business document that triggers payments, shipping,insurance and commissions

`./OpenAuctionRequestForBids`

Opens the auction request for bids for 3 minutes - Auction Request ID used for testing is 1111 and Item 1000
This opens a timer for 3 minutes and once timer expires, writes a shell script to invoke CloseAuction...

As described above, once the auction is "OPEN", this script submits bids against that auctionID. Both the auctionID and the buyerID are validated before the bid is posted. Once the auction is "CLOSED", new bids will be rejected

`./Submitbids`
  submits a series of bids against auction# 1111 and item# 1000

`./SubmitQueries`
  This is list of queries that can be issued and must be used via cut and paste on command line (CLI)

After the timer expires, the Close auction should get invoked and the highest bid should be posted as a transaction

## Runnning the Application using the Web Browser

The chaincode functions can be accessed via the browser. To kick off the application, load the index.html file via the browser. We have tested the application by pre-loading some data via the CLI and using the browser to fire up a simple auction
