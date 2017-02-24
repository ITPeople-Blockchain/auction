docker rm `docker ps -a | tail -1| cut -d " " -f1`
