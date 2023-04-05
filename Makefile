FILE:=
TEST_ENDPOINT:=http://host.docker.internal

start:
	docker-compose up -d
stop:
	docker-compose down

# valid for MacOs config
run:
	docker exec -it k6 k6 run $(FILE)