DOCKER_REGISTRY=ghcr.io/noahcardoza

.PHONY: build-docker-images push-docker-images deploy-docker-images

deploy-docker-images: build-docker-images push-docker-images

build-docker-images:
	@docker build -t $(DOCKER_REGISTRY)/argus-frontend:latest frontend
	@docker build -t $(DOCKER_REGISTRY)/argus-backend:latest backend
	@docker build -t $(DOCKER_REGISTRY)/argus-mqtt-monitor:latest mosquitto

push-docker-images:
	@docker push $(DOCKER_REGISTRY)/argus-frontend:latest
	@docker push $(DOCKER_REGISTRY)/argus-backend:latest
	@docker push $(DOCKER_REGISTRY)/argus-mqtt-monitor:latest