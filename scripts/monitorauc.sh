art_auc="/opt/gopath/src/github.com/hyperledger/fabric/examples/chaincode/go/artfun/"
count=2000000

echo "Closing Auction: - This script watches for closeauction.sh in the artfun directory "
echo "                 - It then executes the script and deletes the file "
cnt=0
while true
do
   ((cnt+=1)) # bump the counter by 1
   # do something if the file exists
   if [[ -f $art_auc/closeauction.sh ]]
   then
      echo "Closing Auction: "
      cat $art_auc/closeauction.sh
      sh $art_auc/closeauction.sh
      sleep 1
      rm $art_auc/closeauction.sh
   fi
   if [[ $cnt -gt $count ]]
   then # stop the loop if file does not appear
      echo "Its time to shut shop"
      exit
   fi
   sleep 120
done
# end script
