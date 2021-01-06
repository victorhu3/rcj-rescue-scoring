FROM ryorobo/rcj-scoring-base:latest

COPY . /opt/rcj-cms/
WORKDIR /opt/rcj-cms

RUN npm run build

ENTRYPOINT ["/start.sh"]
EXPOSE 80
