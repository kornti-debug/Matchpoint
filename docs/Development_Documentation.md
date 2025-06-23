Development - Documentation

💻 1. Hosting Setup

Where and how did you host your app?
On Campus Cloud. Used 2 instances. One for backend and one for frontend. I set the specific links and ports of the campus cloud links into my code. i also changed the vite.config to make vite listen to all network interaces.

What tools/services did you use for you app?
Vite, React, React Router DOM, PostCSS, AutoPrefixer, Node.js, Nodemon, Express, Tailwind, CORS, MySQL, JWT, Bcrypt, Socket.IO, WebSocket, Dotenv, NPM

How did you deploy the frontend and backend?
i set the needed public URLs and the Websocket PORT fort my project. Copied everything except for nodemodules via FileZilla on the Campus cloud servers. Started them.

🏗️ 4. Project Architecture

Briefly explain your folder and file structure. Example:

/backend
  ├── lib/
  ├── middlewares/
  ├── models/
  ├── controllers/
  ├── routes/
  ├── services/
  ├── .env/
  ├── .env.production/
  ├── .gitignore/
  ├── package-lock.json/
  ├── package.json/
  └── server.js/

	
/frontend
  ├── public/
  ├── src/
	  ├── components/
	  ├── assets/
	  ├── services/
	  ├── App.jsx/
  ├── index.html/
  ├── server.js/
  ├── .env/
  ├── .env.production/
  ├── tailwind.config.js/
  ├── vite.config.js/
  ├── package-lock.json/
  ├── .gitignore/
  └── package.json/


👤 5. User Interaction Overview

Explain how a user should interact with your app:

What problem does your solution solve? What is it's main purpose?
My app is a game show entertainmaint app. Like kahoot. It offers games which can be created and played. It offers a plattform where people can host a room and invite other players to play their games. 

What features should I test?
match creation, math joining, playing games, walk trough the match until the end. eventually create games as well.


What is the main flow?
playing matches which consits of games.

Any design decisions you want to highlight?
MatchController holds all the logic and sends them to the child components which all belong to the matchcontroller component.

Any known issues or limitations?
-