FROM ryorobo/rcj-scoring-base:latest

COPY . /opt/rcj-scoring-system/
WORKDIR /opt/rcj-scoring-system

RUN npm run build

ENTRYPOINT ["/start.sh"]
EXPOSE 80
