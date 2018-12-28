NODE=node

if ! type "$NODE" > /dev/null; then
  sudo curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
  export NVM_DIR="${XDG_CONFIG_HOME/:-$HOME/.}nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    sudo nvm install --lts=carbon
fi

sudo npm install parcel-bundler -g
sudo npm run test