# Tunnel

This docker-compose service is responsible for creating a secure tunnel betwee
ports exposed within the docker-compose network to a server with a public IP
address. This is useful for services that need to be accessible from the
internet such as the MQTT server.

This is only used for development and demo purposes. In a production, this is
not required.

## Setup

Copy your id_rsa file into the `/tunnel` directory. This file is used to
authenticate with the server that will be used to create the tunnel.
