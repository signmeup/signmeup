# Source: https://github.com/mbanting/meteor-production-docker-example

# Base image with curl, make, gcc, python etc. needed to build platform-specific Node modules
FROM python

MAINTAINER Athyuttam Eleti, athyuttamre@gmail.com

RUN mkdir /meteor

WORKDIR /meteor

ADD . ./src

RUN \
    # Set up colors
    GREEN='\033[0;32m' \
    && NC='\033[0m' \

    # Install Meteor
    && echo "${GREEN}=> Installing Meteor...${NC}" \
    && (curl https://install.meteor.com/ | sh) \

    # Install Yarn using Meteor's node
    && echo "${GREEN}=> Installing Yarn using Meteor's node..${NC}" \
    && cd /meteor/src \
    && meteor npm install -g yarn \

    # Install app's NPM modules
    && echo "${GREEN}=> Installing app's npm modules...${NC}" \
    && meteor yarn install --production \

    # Build the Meteor app
    && echo "${GREEN}=> Bundling Meteor app...${NC}" \
    && meteor build --allow-superuser --verbose ../build --directory \

    # Install the NPM packages needed for build
    && echo "${GREEN}=> Installing npm modules in /bundle/programs/server...${NC}" \
    && cd /meteor/build/bundle/programs/server \
    && meteor npm install;

ENV PORT 80

EXPOSE 80

CMD export METEOR_SETTINGS="$(cat src/settings.json)" && node build/bundle/main.js
