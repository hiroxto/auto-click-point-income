FROM node:12.16.3-alpine

# Installs latest Chromium (71) package.
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache chromium@edge harfbuzz@edge nss@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Puppeteer v1.9.0 works with Chromium 71.
# Add user so we don't need --no-sandbox.
RUN mkdir /app && \
    yarn add puppeteer@1.9.0 && \
    addgroup -S pptruser && \
    adduser -S -g pptruser pptruser && \
    mkdir -p /home/pptruser/Downloads && \
    chown -R pptruser:pptruser /home/pptruser && \
    chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

WORKDIR /app

COPY . /app

RUN yarn install

CMD ["yarn", "run", "start"]
