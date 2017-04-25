# Start with Node v4 + yarn as base image
FROM node:argon
MAINTAINER Athyuttam Eleti, athyuttamre@gmail.com

# Create folders for our app
RUN mkdir -p /meteor/src
RUN mkdir -p /meteor/build
WORKDIR /meteor/src

# Install Meteor
RUN mkdir .meteor
# In copying the `release` file first, we ensure we skip the cache only when our
# app updates it's Meteor version.
COPY .meteor/release .meteor
RUN curl https://install.meteor.com/ | sh

# Download app dependencies
# Again, in copying `package.json` first, we ensure we skip the cache only if
# our dependencies have changed.
COPY package.json .
RUN yarn install --production
RUN yarn add bcrypt

# Add source code
ADD . .

# Build Meteor app
# Note: we cannot cache Atmosphere packages like we did with NPM packages above;
# see issue here: https://github.com/meteor/meteor/issues/7914
RUN meteor build --allow-superuser --verbose ../build --directory

# Download dependencies for built app
WORKDIR /meteor/build/bundle/programs/server
RUN yarn install

# Set default port for Meteor from 3000->80
ENV PORT 80
EXPOSE 80

# Load settings and run app
WORKDIR /meteor
CMD export METEOR_SETTINGS="$(cat src/settings.json)" && node build/bundle/main.js
