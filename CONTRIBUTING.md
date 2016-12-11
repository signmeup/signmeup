# Contributing

Contributions are welcome from one and all. There is lots  of potential
to improve the app, including new features and bug fixes, adding analytics, making
it work at other universities, and much more.

We follow a [code of conduct](CODE_OF_CONDUCT.md), and hope to do our bit in making
open-source more welcoming and inclusive.

## Issues and Bug Reports

To report an issue or bug report:

1. Open an issue, describe the issue, and include the conditions under which you faced it.
2. Contribute to disccusion from maintainers and other contributors
3. If you'd like to help fix the issue, ask to be assigned the task.
   A maintainer will help you get setup and guide you through the fix.

## Pull Requests

We have two different workflows, one for maintainers, one for external contributors.
Both begin by setting up the repo and running SignMeUp locally.

### Setup

1. Install [Meteor](https://www.meteor.com/install). This installs Node and npm as well.

2. Clone this repository, and install dependencies:

   ```shell
   git clone https://github.com/athyuttamre/signmeup.git
   cd signmeup
   meteor npm install
   ```
3. Set up `settings.json`. To do so, start by copying the template:

   ```shell
   cp app/settings.template.json app/settings.json
   ```

   Now we need to fill in various values inside `settings.json`.

   - Replace `INSERT-PASSWORD-HERE` with a good password. Feel free to add any extra user accounts
     if you want.
   - **Optional:** fill in the `saml` settings to set up Shibboleth login. See instructions below.
   - **Optional:** replace `appID` and `appSecret` with the correct values from kadira.io to track
     the app's performance.

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
   this can be done with Homebrew, a popular package manager:

   ```shell
   # 1. Install Homebrew
   /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

   # 2. Install nginx
   brew install nginx
   ```

3. Generate self-signed certificates for `local.cis-dev.brown.edu` using
   http://selfsignedcertificate.com, and add the two files to the `nginx/ssl` folder. Change the certificate's extension from `.cert` to `.crt`.

4. In your terminal, run:

   ```shell
   $ sudo printf "127.0.0.1\tlocal.cis-dev.brown.edu" | sudo tee -a /etc/hosts > /dev/null
   ```

   This adds an entry matching `local.cis-dev.brown.edu` to `localhost`. The
   Docker container usually runs on `localhost:3000`, but this lets you load it
   when pointing to `local.cis-dev.brown.edu:3000`.

   To check if the append worked, run `$ cat /etc/hosts` and make sure the line was added to the end.

5. `cd` into the `signmeup` directory, and proceed to create a `settings.json`
   file from `settings.template.json`:

    ```shell
    $ cp app/settings.template.json app/settings.json
    ```

6. Now we need to fill in various values inside `settings.json`.

   - Replace `INSERT-PASSWORD-HERE` with a good password.
   - Replace `saml.cert` with the IDP cert. You can get this by talking to the
     project coordinator. They will have to notify CIS before giving it to you
     so CIS knows who has this cert.
   - Replace `saml.serviceProviderCert` and `saml.decryptionPvk` with a *new*
     certificate/key pair from http://selfsignedcertificate.com. Skip the header
     and footer (The `---BEGIN...` and `---END...` parts). Also remove any newlines
     to make sure the values are in a single line.
   - Replace `appID` and `appSecret` with the correct values from kadira.io.

7. Finally, from the `signmeup` directory, run `docker-compose up`. The first
   time will take a long time since it'll pull all the dependent images along
   the way.

   Your code will be bind-mounted onto the Docker container, allowing
   you to edit in your text editor and see the changes in real-time.

8. Open your browser, and navigate to `https://local.cis-dev.brown.edu:3000`. You
   will probably receive a safety warning since you're using self-signed certs.
   Click on Advanced, and continue to the app.

9. Use `docker-compose logs` to see all the logs in realtime. Use
   `docker-compose logs app` to see just your Meteor app's logs.

When running the local version of the app, you might notice that starting the
app container is slow, and sometimes takes a long time at `=> Starting proxy`.
This is normal, just wait it out.

If everything went well so far, you should see something like this when running `docker-compose logs app`:

![Successful setup.](img/successful-setup.png)

## Development

We follow the [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) method of developing software.

This method has two important axioms:

- `master` is always ready to deploy.
- `dev` represents the current version under development.

Never directly push to either of these branches.

When developing a new feature, or fixing a bug:

1. Branch off of `dev` into something like `feature/my-feature-name`.

2. While developing, if you need to pull in changes to `dev` that occurred after
   branching, use `git rebase dev`.

3. Once finished developing your feature, push to GitHub, and open a pull
   pull request to the `dev` branch.

4. Get feedback from other developers. You can continue pushing commits to the
   branch; these will be automatically reflected in the pull request.

5. Once approved, merge into `dev`. Move on to developing something new.

If fixing a bug in production:

1. Branch off `master` into something like `hotfix/fix-this-bug`.

2. Once ready, push to GitHub, and open two pull requests, one to `master`, and
   one to `dev`.

3. Once approved, merge both pull requests.

## Production

Once you've merged a bunch of features into `dev`, and are ready to deploy to production, follow these steps:

1. Create a pull-request from `dev` to `master` branch detailing your changes,
   named something like `Release 2.2.3: Add this feature, fix this bug`.

   We version our app in `major.minor.patch` format. Increment the patch number
   for bug fixes, and small additions. Increment the minor number when
   introducing new features. Increment the major version when the app has been
   majorly restructured, or your release culminates the development of many
   features.

2. Once a collaborator has looked through your changes, merge the pull request
   into `master`.

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

## Docker Tips

If you accumulate a bunch of containers or images, clean-up with the
instructions in [this article](http://blog.yohanliyanage.com/2015/05/docker-clean-up-after-yourself/).
