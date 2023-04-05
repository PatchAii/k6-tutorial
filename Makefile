FILE:=
TEST_ENDPOINT:=http://host.docker.internal

start-target:
	docker run -d --rm --name k6-target -p 80:80 kennethreitz/httpbin

# valid for MacOs config
run:
	@docker run --rm -it -v ${PWD}/src:/app -w /app grafana/k6:0.42.0 run -e TEST_ENDPOINT=$(TEST_ENDPOINT) $(FILE)