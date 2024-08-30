# Web Tic Tac Toe Game

Web Tic Tac Toe is a web based game app that's integrated with Vite and Python-flask. Delivered to make users enjoys a smooth gaming opportunity anywhere while staying connected.

## How to Initiate  the Game

To Initiate this game, it is pertinent to set up some dependencies and resources that will be useless for serving the game right. If you don't already have python, python-pip and npm installed, start by installing that.

- Start by having a virtual environment to avoid unnecessary conflicts with other file system. This should be done in the root directory `web_tic_tac_toe/web_tic_tac_toe`

```bash
python3 -m venv .venv
npm install
```

- Activate the virtual environment 

``` bash
source .venv/bin/activate
```

- Install the python libraries needed to host server

```bash
pip3 install -r requirements.txt
```

- Start the Server (flask) app

`Terminal 1`
``` bash
python3 -m app
```
- Start the Client (Vite) app

`Terminal 2`
``` bash
npm run dev
```

This will most likely run as 
`http://localhost/5173`  if the port is free and open
