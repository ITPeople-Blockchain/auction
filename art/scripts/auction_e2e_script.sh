#!/bin/bash
ORDERER_IP=orderer.example.com:7050
ORDERER_CA=$GOPATH/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
CHANNEL_NAME=mychannel
CHAINCODE_NAME=mycc

## Install
peer chaincode install -n $CHAINCODE_NAME -v 1 -p github.com/hyperledger/fabric/examples/chaincode/go/auction
##Instantiate
peer chaincode instantiate -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -v 1 -c '{"Args":["init"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"

##Post Users - invoke
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["iPostUser","100", "USER", "Ashley Hart", "TRD",  "Morrisville Parkway, #216, Morrisville, NC 27560", "9198063535", "ashley@itpeople.com", "SUNTRUST", "0001732345", "0234678", "2017-01-02 15:04:05"]}'
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["iPostUser","200", "USER", "Sotheby", "AH",  "One Picadally Circus , #216, London, UK ", "9198063535", "admin@sotheby.com", "Standard Chartered", "0001732345", "0234678", "2017-01-02 15:04:05"]}'

##Get Users - query
peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\": [\"qGetUser\", \"100\"]}"
peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\": [\"qGetUser\", \"200\"]}"


##Post Items - invoke
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["iPostItem", "100", "ARTINV", "Shadows by Asppen", "Asppen Messer", "20140202", "Original", "landscape", "Canvas", "15 x 15 in", "art1.png","600", "100", "2017-01-23 14:04:05"]}'
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["iPostItem", "200", "ARTINV", "modern Wall Painting", "Scott Palmer", "20140202", "Reprint", "landscape", "Acrylic", "10 x 10 in", "art2.png","2600", "200", "2017-01-23 14:04:05"]}'

##Get Items - query
peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\": [\"qGetItem\", \"100\"]}"
peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\": [\"qGetItem\", \"200\"]}"


## postAuction
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\":[\"iPostAuctionRequest\", \"1000\", \"AUCREQ\", \"100\", \"200\", \"100\", \"04012016\", \"1000\", \"1000\", \"INIT\", \"2017-02-13 09:05:00\", \"2017-02-13 09:05:00\", \"2017-02-13 09:10:00\"]}"

## openAuctionRequestForBids
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\":[\"iOpenAuctionForBids\", \"1000\", \"OPENAUC\", \"10\", \"2017-02-13 09:18:00\"]}"


## submitBids $ch $chain $(((RANDOM % 3))) $auctionindex $bidNumber $userid $biduserid $bidPrice
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\":[\"iPostBid\", \"1000\", \"BID\", \"1000\", \"100\", \"100\", \"5000\", \"2017-02-13 09:19:01\"]}"
# peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\":[\"iPostBid\", \"1000\", \"BID\", \"1001\", \"200\", \"100\", \"5001\", \"2017-02-13 09:19:01\"]}"

##closeAuction
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args": ["iCloseOpenAuctions", "2016", "CLAUC", "2017-01-23 13:53:00.3 +0000 UTC"]}'

#Query for the item
peer chaincode query -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\": [\"qGetItem\", \"1000\"]}"


AES_KEY="/UucdM++9gqy3X7TztFTbPbSiEsbj4WudUi2CuSZ4OU="

## transferItem
peer chaincode invoke -o $ORDERER_IP --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c "{\"Args\": [\"iTransferItem\", \"100\", \"100\", $AES_KEY, \"200\", \"XFER\",\"2017-01-24 11:00:00\"]}"
