TAG := moonwell-gov-verification

build-docker:
	docker build -t $(TAG) .

build:
	docker run --rm -it \
		-v $$(pwd):$$(pwd) \
		--workdir $$(pwd) \
		$(TAG) \
		npm run build --report

bash:
	docker run --rm -it \
		-v $$(pwd)/../:$$(pwd)/../ \
		--workdir $$(pwd) \
		$(TAG) \
		bash
