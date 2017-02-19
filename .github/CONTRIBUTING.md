# Contributing

Thanks for your interest in contributing to SignMeUp! There is lots  of potential
to improve the app, including adding new features, fixing bugs, building out analytics,
making it work at other universities, and much more.

Please follow our [code of conduct](CODE_OF_CONDUCT.md), and help us do our bit in making
open-source more welcoming and inclusive.

## Issues and Bug Reports

To report an issue or bug report:

1. Open an issue and describe the problem along with the conditions under which you faced it, and any steps to reproduce the bug.
2. Contribute to discussion from maintainers and other contributors.
3. If you'd like to help fix the issue, ask to be assigned the task.
   A maintainer will help you get setup and guide you through the fix.

## Pull Requests

We have two different workflows, one for maintainers, one for external contributors. Maintainers work within the primary repo, whereas external
contributors fork the repo into their own, and open pull requests back into
`master`.

Both begin by setting up the repo and running SignMeUp locally.

### Setup

1. Install [Meteor](https://www.meteor.com/install). This installs the Node runtime and the npm package manager too.

2. Clone this repository, and install dependencies:

   ```shell
   git clone https://github.com/signmeup/signmeup.git
   cd signmeup
   meteor npm install -g yarn
   meteor yarn
   ```
3. Set up `settings.json`. To do so, start by copying the template:

   ```shell
   cp app/settings.template.json app/settings.json
   ```

   Now we need to fill in various values inside `settings.json`.

   - Replace `INSERT-PASSWORD-HERE` with a good password. Feel free to add any extra user accounts
     if you want.
   - **Optional:** fill in the `saml` settings to set up Shibboleth login. See instructions below.

4. Run the app:

   ```shell
   cd app
   meteor --settings settings.json
   ```

5. Navigate to `localhost:3000` in your web browser to see SignMeUp running!

#### SAML Authentication

In order to enable Shibboleth login locally, we need to run SignMeUp with SSL.
To do so, we will run an nginx reverse proxy on our machine.

1. Install [nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/). On macOS,
   this can be done with [Homebrew](http://brew.sh), a popular package manager:

   ```shell
   # Install Homebrew
   /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

   # Install nginx
   brew install nginx
   ```

2. Shibboleth identity providers (in our case Brown University) whitelist domains from
   which they accept requests. For Brown, the testing domain is `local.cis-dev.brown.edu:3000`; this means
   we need to run SignMeUp locally on this domain.

   In your terminal, run:

   ```shell
   sudo printf "127.0.0.1\tlocal.cis-dev.brown.edu" | sudo tee -a /etc/hosts > /dev/null
   ```

   This adds an entry matching `local.cis-dev.brown.edu` to `localhost` in your hosts file. This way
   when a browser tries to reach `local.cis-dev.brown.edu`, it actually reaches `localhost`.

   To check if the append worked, run `cat /etc/hosts` and make sure the line was added to the end.

3. To run the app on SSL, we need a cryptographic key pair. Generate self-signed certificates for `local.cis-dev.brown.edu`
   using [this website](http://selfsignedcertificate.com). Then copy the files into the nginx folder:

   ```shell
   cd /usr/local/etc/nginx
   mkdir ssl && cd ssl
   cp /path/to/cert local.cis-dev.brown.edu.crt
   cp /path/to/key local.cis-dev.brown.edu.key
   ```

4. Next, update your nginx configuration to serve as an HTTPS proxy to our Meteor app.
   Edit the file `nginx.conf`, uncomment the HTTPS section at the bottom, and update it to match the following:

   ```
   # HTTPS server

   server {
       listen       3000 ssl;
       server_name  local.cis-dev.brown.edu;

       ssl_certificate      ./ssl/local.cis-dev.brown.edu.cert;
       ssl_certificate_key  ./ssl/local.cis-dev.brown.edu.key;

       ssl_session_cache    shared:SSL:1m;
       ssl_session_timeout  5m;

       ssl_ciphers  HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers  on;

       location / {
           proxy_pass          http://localhost:8000;
           proxy_set_header    Host             $host;
           proxy_set_header    X-Real-IP        $remote_addr;
           proxy_set_header    X-Forwarded-For  $proxy_add_x_forwarded_for;
           proxy_set_header    X-Client-Verify  SUCCESS;
           proxy_set_header    X-Client-DN      $ssl_client_s_dn;
           proxy_set_header    X-SSL-Subject    $ssl_client_s_dn;
           proxy_set_header    X-SSL-Issuer     $ssl_client_i_dn;
           proxy_read_timeout 1800;
           proxy_connect_timeout 1800;
       }
   }
   ```

5. Reload the nginx configuration, and run nginx locally:

   ```shell
   nginx -s reload
   ```

6. Back to the app. Update `settings.json` to include SAML settings.

   - Replace `saml.cert` with the identity provider's cert. You can get this by talking to the
     project coordinator. They will have to notify CIS before giving it to you so CIS knows who has this cert.
   - Replace `saml.serviceProviderCert` and `saml.decryptionPvk` with a *new*
     certificate/key pair from http://selfsignedcertificate.com. Skip the header
     and footer (The `---BEGIN...` and `---END...` parts). Also remove any newlines
     to make sure the values are in a single line.

7. Finally, run SignMeUp as usual, but this time on port 8000:

   ```shell
   cd app
   meteor --settings settings.json --port 8000
   ```

   Navigate to `https://local.cis-dev.brown.edu:3000` in your web browser to see SignMeUp running on
   HTTPS. Try logging in with your Brown account to make sure it works.

## Development

We follow a pretty simple workflow, with two primary branches:

- `master` is the current working branch.
- `production` represents the publicly deployed version.

For small bug fixes and features, feel free to directly push to `master`. When
working on anything larger:

1. Branch off of `master` into something like `feature/my-feature-name`.

2. While developing, if you need to pull in changes to your branch that
   occurred after branching, use `git rebase master`.

3. Once finished developing your feature, push to GitHub, and open a pull
   pull request to the `master` branch.

4. Get feedback from other developers. You can continue pushing commits to the
   branch; these will be automatically reflected in the pull request.

5. Once approved, merge into `master`. Move on to developing something new.

If fixing a bug in production:

1. Branch off `production` into something like `hotfix/fix-this-bug`.

2. Once ready, push to GitHub, and open a pull request into `production`.

3. Once approved, merge the pull request. Then merge `production` into `master`
   so both branches are up to date.

### Debugging Meteor

In addition to the various [Meteor debugging
methods](http://joshowens.me/easily-debugging-meteor-js/),
we also have the free version of [Meteor Toys](http://meteor.toys/)
package enabled. Once the app is running, type <kbd>Ctrl</kbd>+<kbd>m</kbd> to
enable Mongol.

## Deployment

Once you've merged a bunch of features into `master`, and are ready to deploy to production, follow these steps:

1. Create a pull-request from `master` to `production` detailing your changes,
   named something like `Release 2.2.3: Add this feature, fix this bug`.

   We version our app in `major.minor.patch` format. Increment the patch number
   for bug fixes, and small additions. Increment the minor number when
   introducing new features. Increment the major version when the app has been
   majorly restructured, or your release culminates the development of many
   features.

2. Once a collaborator has looked through your changes, merge the pull request
   into `production`.

3. Create a new release on GitHub with good release notes. Name the tag and
   release something like `v2.2.3`.

3. Now, SSH into your Brown CS account. Then run `kinit`, and enter your
   password. Then type `ssh smu` to log in into the virtual machine.

4. `cd` into `/usr/local/docker/signmeup`.

   Because `docker-compose` isn't packaged for Debian yet
   (see [#2235](https://github.com/docker/compose/issues/2235)), we must run it
   in a Python `virtualenv`. Run `source venv/bin/activate` to start the virtual
   environment. Type `docker-compose` to make sure it's available.

   To deploy, run `make prod`.

   This will:
    - Pull the latest release on `master` from GitHub
    - Load the release version into an environment variable
    - Load `settings.json` into an environment variable
    - Build an image for the new codebase
    - Run it with production settings

  It will not touch the already running `db` and `proxy` containers. For more
  deployment options, check out the `Makefile`.

### Managing Docker

- If you accumulate a bunch of containers or images, clean-up with the
instructions in [this article](http://blog.yohanliyanage.com/2015/05/docker-clean-up-after-yourself/).

- If you would like to run scripts within a container, run `bash` first:

  `docker exec -it <container_name> bash`
