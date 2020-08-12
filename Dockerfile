# Satge 0, "build-stage", based on Node.js
FROM node:14.5.0-alpine

RUN mkdir -p /src/app
WORKDIR /src/app

ADD package.json package.json
ADD package-lock.json package-lock.json
ADD build build
ADD bin bin
ADD app.js app.js
ADD public public
ADD client_secret.json client_secret.json
ADD project-ocr.json project-ocr.json
RUN npm i
RUN apk add --update curl python bash &&  rm -rf /var/cache/apk/*
RUN curl -sSL https://sdk.cloud.google.com > /tmp/gcl && bash /tmp/gcl --install-dir=~/gcloud --disable-prompts
ENV PATH $PATH:/root/gcloud/google-cloud-sdk/bin
ENV CLOUDSDK_CORE_DISABLE_PROMPTS=1
RUN gcloud beta auth configure-docker
RUN gcloud auth activate-service-account --key-file project-ocr.json
#RUN gcloud auth application-default login

EXPOSE 3001 80

CMD ["npm", "start"]
