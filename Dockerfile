FROM centos:7
RUN mkdir /meeting-server
COPY ./* /meeting-server/
WORKDIR /meeting-server
RUN xz -d /meeting-server/node-v14.16.0-linux-x64.tar.xz && \
    tar -xvf /meeting-server/node-v14.16.0-linux-x64.tar && \
    yum install -y unzip && \
    unzip /meeting-server/dist.zip && \
    ln -s /meeting-server/node-v14.16.0-linux-x64/bin/npm /usr/local/bin/npm && \
    ln -s /meeting-server/node-v14.16.0-linux-x64/bin/node /usr/local/bin/node
RUN npm install --registry=https://registry.npm.taobao.org
EXPOSE 443
ENTRYPOINT ["node", "/meeting-server/meeting-server.js"]
