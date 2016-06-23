Terminal 1
==========
$ cd $GOPATH/src/github.com/hyperledger/fabric/peer
$ go build
$ ./peer peer --peer-chaincodedev

Terminal 2
==========
$ cd  $GOPATH/src/github.com/hyperledger/fabric
$ cd art/artchaincode
$ go build art_app.go
$ CORE_CHAINCODE_ID_NAME=mycc CORE_PEER_ADDRESS=0.0.0.0:30303 ./artchaincode

Terminal 3
==========
$ cd  $GOPATH/src/github.com/hyperledger/fabric/art/scripts
$ . ./setup.sh

#run the following shell scripts

# The PostUsers script inserts a set of users into the database. Today, the only validation done is to check if the user 
# ID is an integer.
#
# TODO: In a future version, the user identity will be validated against the IDaaS Blockchain prior to 
# inserting into the database

./PostUsers


# The PostItems script inserts a set of ART ASSETS into the database. Before inserting the asset the chaincode checks 
# if the CurrentOwner is registered as a User. Based on the image file name (in future this could be a title or some
# ownership document) is retrieved and converted to a byte array ([]byte). An AES Key is generated, the byte array is encrypted
# and both key and the byte array are saved in the database.A log entry is made in the Item Log. 
# Please see code for detailed comments

./PostItems

# In the business process, the owner (User ID# 100) of the ASSET (Item# 1000) requests an entity like an Auction House (User ID# 200)
# to put the item on auction. Before Posting the auction request, the Asset is validated against the database. The Auction House 
# ID is verified in the User Table. A log entry is made in the Item Log.
#
# TODO: In future, the owner of the asset will present his key to help with validation. 
# The AES key will be used to un-encrypt the stored image and authenticate ASSET ownership. 

./PostAuctionRequest

# Even though the ASSET OWNER has requested the Auction House to place the item on auction, the Auction is not yet open for
# acceptance of user bids. Hence any bid submitted against the item will be rejected if the auction is not open

# This script opens the Auction Request for bids. It sets the status of the AuctionRequest to "OPEN". It opens a timer for 
# the duration of the auction which in the example is 3 minutes. During this window, any user can submit bids against the AuctionID. 
# Once the timer expires, a script is created and saved called "CloseAuction.sh". The script gets triggered. 
# The CloseAuction.sh script invokes CloseAuction. 
# CloseAuction will first change the status of the AuctionRequest to "CLOSED". It then fetches the highest bid from the list of bids received, 
# and converts it to a Transaction. The transaction is posted, the ASSET is retrieved from the database, its price is set 
# to the new Hammer Price and the CurrentOwner is set to the new buyer. The ASSET image is un-encrypted with the old key, 
# a new Key is generated and the image is encrypted with the new key. The ASSET is updated in the database.
# An log entry is made in the Item Log.
#
#TODO: In future, the Transaction will be a business document that triggers payments, shipping,
# insurance and commissions

./OpenAuctionRequestForBids
  Opens the auction request for bids for 3 minutes - Auction Request ID used for testing is 1111 and Item 1000
  This opens a timer for 3 minutes and once timer expires, writes a shell script to invoke CloseAuction...

# As described above, once the auction is "OPEN", this script submits bids against that auctionID. Both thhe auctionID and the buyerID
# are validated before the bid is posted. Once the auction is "CLOSED", new bids will be rejected

./Submitbids
  submits a series of bids against auction# 1111 and item# 1000

./SubmitQueries
  This is list of queries that can be issued and must be used via cut and paste on command line (CLI)


After the timer expires, the Close auction should get invoked and the highest bid should be posted as a transaction


