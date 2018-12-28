NODE=$(command -v node)
if [ "$NODE" == "node" ]; then
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
  export NVM_DIR="${XDG_CONFIG_HOME/:-$HOME/.}nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
    nvm install --lts=carbon
fi

npm install parcel-bundler -g
npm run test