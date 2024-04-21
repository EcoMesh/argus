FROM alpine:latest

RUN apk update --no-cache && apk add openssh-client --no-cache

ENV REMOTE_HOST your_remote_host
ENV SSH_USER your_ssh_username

COPY id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa

HEALTHCHECK --interval=5s --timeout=3s \
    CMD grep -vq "remote port forwarding failed" ssh.log

# Create the SSH tunnel script
RUN echo "#!/bin/sh" > /usr/local/bin/start_tunnel.sh && \
    echo "ssh -o StrictHostKeyChecking=no -N \$SSH_OPTS -i /root/.ssh/id_rsa 2>&1 | tee ssh.log" >> /usr/local/bin/start_tunnel.sh && \
    chmod +x /usr/local/bin/start_tunnel.sh


# Start the SSH tunnel when the container starts
CMD ["/usr/local/bin/start_tunnel.sh"]