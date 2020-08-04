# Satge 0, "build-stage", based on Node.js
FROM node:12.16.0 

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


EXPOSE 3001 80

CMD ["npm", "start"]
