# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/xenial64"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080
  # Please note: non-root users can only create listening ports great than 1024
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "forwarded_port", guest: 443, host: 8443
  config.vm.network "forwarded_port", guest: 3000, host: 3000

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
    #install docker from instructions at https://docs.docker.com/engine/installation/linux/ubuntu/
    #docker prerequisites
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    #use official docker repository
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

    #install official docker
    apt-get update
    apt-get install -y docker-ce
    systemctl enable docker.service
    systemctl start docker.service
    docker --version

    #install docker-compose
    curl -L https://github.com/docker/compose/releases/download/1.12.0/docker-compose-`uname -s`-`uname -m` > /usr/bin/docker-compose
    chmod 755 /usr/bin/docker-compose
    docker-compose --version

    #set up signmeup
    [ ! -e /root/signmeup ] && (
    cp -r /vagrant /root/signmeup
    #create .env from .env.template
    cat > /root/signmeup/.env <<'EOF'
STAGE=local
HOST=localhost
MAIL_URL=smtp://smtp-relay.gmail.com:25
EOF
    )

    #start signmeup
    cd /root/signmeup
    docker-compose up -d
  SHELL
end
