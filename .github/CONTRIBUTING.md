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

2. If you're a maintainer, clone this repository. Otherwise fork it, and install dependencies:

   ```shell
   git clone https://github.com/<username>/signmeup.git
   cd signmeup
   meteor npm install -g yarn
   meteor yarn
   ```
3. Set up `settings.json`. To do so, start by copying the template:

   ```shell
   cp settings.template.json settings.json
   ```

   Now we need to fill in various values inside `settings.json`.

   - Replace `INSERT-PASSWORD-HERE` with a good password. Feel free to add any extra user accounts
     if you want.
   - **Optional:** fill in the `google` settings to set up Google login. See instructions below.

4. Run the app:

   ```shell
   meteor --settings settings.json
   ```

5. Navigate to `localhost:3000` in your web browser to see SignMeUp running!

Note that to log into the test accounts you'll need to navigate to
`localhost:3000/login-password` rather than clicking on the "Sign In" button.

#### Google Authentication

The example `settings.template.json` contains a test client ID and secret that should work locally for Google authentication.
If you want to use your own client ID and secret you can generate and install it using these instructions:

1. Visit the [Google cloud console](https://console.cloud.google.com) and sign into your account if you're not already signed in (note: an account managed by a third party such as Brown may not work).

2. Create a new project with any name and ID. If you already have a current project open you can select its name in the top bar and create a new project from the window that pops up.

3. Once the project has been created, go to its dashboard and select "APIs & Services". Then go to the "Credentials" pane using the left navigation bar.

4. Click "Create credentials" and select "OAuth client ID". You may be asked to configure a consent screen, which can be configured with any values of your choosing.

5. Select "Web application" and give it any name. Under "Authorized JavaScript origins", be sure to include `http://localhost:3000`. Under "Authorized redirect URIs", be sure to include `http://localhost:3000/_oauth/google`.

6. After clicking "Save", you should be presented with your client ID and secret. These values can be copied into your `settings.json`.

7. After restarting your server you should be able to login with your Brown google credentials!

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

### Writing Quality Commit Messages

When committing changes, there are a few important points to remember:

1. Use the imperative form. Instead of writing `fixed bug`, write `fix bug`. This convention is helpful as it describes what will happen after your commit is applied.

2. Write concise, descriptive messages about what changes were made and why. For example, prefer `Fix failing server call in createTicket` over `got createTicket to work!`.

3. Reference issue numbers correctly. For example, `Fix #178: Add section about commit messages to CONTRIBUTING.md`.

To learn more about writing great commit messages, see this [article](https://chris.beams.io/posts/git-commit/). 


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
