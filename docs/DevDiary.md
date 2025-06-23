## Day Nr. 1 - [10.6]
            - ✅ What I worked on today: components. frontend. create game, layout
            - 💡 Biggest learning: navigating, learning how backend and frontend work together
            - ❌ Biggest mistake/blocker:
            - 📌 Notes for tomorrow: need database


## Day Nr. 2 - [11.6]
            - ✅ What I worked on today: database. backend (matchcontroller, matchmodel..). api service, 
            - 💡 Biggest learning:request and response, mvc pattern, better understanding
            - ❌ Biggest mistake/blocker: slow progress, many things to consider, so much to learn,...
            - 📌 Notes for tomorrow: need to figure out postman for api-call testing

## Day Nr. 3 - [12.6]
            - ✅ What I worked on today: backend, matchcontroller, model, debugging. JWT response request, understanding jWT better, 
            - 💡 Biggest learning:JWT req.body, postman, how calls work, environment variables, sending bearer token, good for testing
            - ❌ Biggest mistake/blocker: troubleshooting, learning different tools, debugging browser dev tools, postman...
            - 📌 Notes for tomorrow: match components for host and player. starting new game.. backend controller setup.

## Day Nr. 4 - [13.6]
            - ✅ What I worked on today: getMatchname and updatematchname., updated  backend, started with websockets., 
            - 💡 Biggest learning:req params. new route,controller,model implmented, practice. patch request. postman params.
            - ❌ Biggest mistake/blocker: still very slow progress, trying to understand it, need to think about so many things...
            - 📌 Notes for tomorrow: websockets setup. player should show up in room when entering. -> join room functionality.

## Day Nr.5 - [14.6]
            - ✅ What I worked on today: getting userflow on frontend with mockdata. frontend match concept redone. matchcontroller component with lobby, game and scoreboard components.
            - 💡 Biggest learning: proper props distrubution throughout components
            - ❌ Biggest mistake/blocker: websockets not quite doable for me yet. getting userflow done and focus on working frontend.. and afterwards implementing real-time communictaion.
            - 📌 Notes for tomorrow: getting backend ready with game db. and matchresults.

## Day Nr. 5 - [15.6]
            - ✅ What I worked on today: worked on CRUD system for Games. frontend and backend works.
            - 💡 Biggest learning: correctly passing props. still learning how it all works together.. 
            - ❌ Biggest mistake/blocker: need to rethink the userflow and the db. some things need to change. e.g. columns. 
            - 📌 Notes for tomorrow: getting real db data instead of the mockdata for the match.

## Day Nr. 6 - [16.6]
            - ✅ What I worked on today: game_sequence added. dashboard ui changes. several fixes
            - 💡 Biggest learning: debugging with network browser console. getting json through pages/components. ensuring stable and robust views by having everything stored and fetched from db.
            - ❌ Biggest mistake/blocker: long troubleshooting and testing phase since i need 2 sessions to test multiplayer functionality.
            - 📌 Notes for tomorrow: finally tackle websockets and fix some UI/UX stuff.. getting UI also done.

## Day Nr. 7 - [17.6]
            - ✅ What I worked on today: game_sequence added. dashboard ui changes. several fixes
            - 💡 Biggest learning: debugging with network browser console. getting json through pages/components. ensuring stable and robust views by having everything stored and fetched from db.
            - ❌ Biggest mistake/blocker: long troubleshooting and testing phase since i need 2 sessions to test multiplayer functionality.
            - 📌 Notes for tomorrow: finally tackle websockets and fix some UI/UX stuff.. getting UI also done.

## Day Nr. 8 - [18.6]
            - ✅ Hosting website on Campus cloud. Cors setup modified. managed to host it and sockets.io also worked.
            - 💡 Biggest learning: debugging with campus cloud console. learned how cors actually works, allowing frontend URLs. where to put ports for websockets.
            - ❌ Biggest mistake/blocker: needed to understand the whole behaviour better when trying to host things. testing is tedious when needing FileZilla uploading files, restarting,...
            - 📌 Notes for tomorrow: want to add .env.production variabales so the project works locally and when hosting, without to hardcode links and ports.

## Day Nr. 9 - [19.6]
            - ✅ What I worked on today: setting up .env.production variables for production variables when hosting. unfortunately didn't work.. campus cloud didn't set NODE_ENV varibales as it seems. (at least that was my understanding). also set up dist folder for frontend and little server to serve the html files. for frontend it works with the env.production variables. no need to change URLs hardcoded anymore.
            - 💡 Biggest learning: there is a way to seperate also the hosting and locally working place, so you dont need to hardcode things and then change it again (but with campus cloud it doesn't work as intended). npm run build to serve html files for frontend
            - ❌ Biggest mistake/blocker: .env.production variables for backend arent working.
            - 📌 Notes for tomorrow: troubleshoot the mobile phone join problem again.

## Day Nr. 10 - [20.6]
            - ✅ What I worked on today: troubleshooting way joining via smartphone dont send data in realtime to hostlobby. -> problem was the room code which i needed to set to normalize.(with smartphones you enter the code lowercase. when copying the code between browsers on the pc its uppercase). i decided to go for only numbers for now
            - 💡 Biggest learning: smartphone debugging console with usb debugging. pretty useful. destructuring variables.
            - ❌ Biggest mistake/blocker: when not having all debugging information you dont really know where to look at. smartphone logs definitly helped.
            - 📌 Notes for tomorrow: considering use characters for roomcode again, since there are more combinations possible. 


🌟 What worked well for you during the CCL?
	Working step by step, feature by feature and not doing everything at once. Focusing on one specific part, test a lot! Commit often, so you have always a save spot where you can rollback if you need to. I am proud of what i have achieved. At first I didn't know how big this will get and how many other ideas i wanted to implement. It was for sure way too much and without help of other people and tools i couldn't have made it this far. I certainly need to slow down a bit when i want to move on and try more around before something breaks. I like that i learned a lot and know what I would be able to do if i want to.

🧩 What were your biggest challenges or struggles?
To understand what i actually really need for my project, because i didn't really know how to realise it. With the inspiration of many other apps/shows and the help of chatbots i could really move a long and do everything i had in my mind step by step. it was very rewarding, but on the other hand i know that i need to go back a bit and reflect on what i have done and try a bit around so i can understand how i will implement the next things in the future.
one struggle was the limit of time. i stressed out a bit because i knew i was very slow.. then i activated AI power and then it was quite overwhelming and i couldnt really get my head around everything anymore. but now i have time to reflect everything. socket.io.. the matchController component logic and some other basic syntax and logic stuff were a bit too much for me. but it worked out in the end.

🔍 What did you manage to understand better during these two weeks?

How Fullstack work. Backend and frontend, how they work together, how they communicate. How real-time communication works. How i can test the backend with postman. passing prompts to child components. understand and learn new tools.. its basically endless learning here.

🕳️ What do you still struggle with?

actually to break a problem down to small pieces and know exactly where to start. but this comes with experience. its better to just take you time and slowly tackle your challenge instead of doing everything and way too fast. Real-time thing was something i couldn't really understand properly, but i eventually get a long with it.

🚀 Looking back to the start of the semester: Did you think you’d be able to build the app you delivered? Why or why not?
I dont think so. i wasn't even really sure how the outcome would look like and what we needed to deliver in the end. but it also shows me that you can actually achieve anything you want when you spend enough time and effort into things.

It was a great experience. Thank you for this!










