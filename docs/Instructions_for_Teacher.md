## 🧾 Instructions for Teacher

This file must be submitted with your final project. If any of the required information is missing or incomplete, you will receive **0 points** for your development documentation — no exceptions.

---

### ▶️ 1. Setup Instructions (Copy-paste Ready)

#### How to clone your repository:
```bash
#Repository:
https://git.nwt.fhstp.ac.at/cc241070/SS2025_CCL_cc241070

#Git Clone

git clone https://git.nwt.fhstp.ac.at/cc241070/SS2025_CCL_cc241070.git
```


COMMANDS TO INSTALL SETUP:

I used 2 bash terminals. One for frontend the other one for backend.

Terminal 1

```bash
# Backend setup
cd backend/
npm install
npm run dev
```

Terminal 2

```bash
# Frontend setup
cd frontend/
npm install
npm run dev
```

.env file setup notes:

```bash
# Environment setup 
#Create a file called .env in /backend and add the following:
DB_USERNAME=cc241070
DB_PASSWORD=Qr5@Uo4@Tn3@
DB_NAME=cc241070
ACCESS_TOKEN_SECRET=chair123
PORT = 3000
```

---

VISIT http://localhost:5173 

### 🔑 2. Credentials

#### Database Access (if applicable):
```

Host: "atp.fhstp.ac.at"
User: cc241070
Password: Qr5@Uo4@Tn3@
Database Name: cc241070
```



#### The link(s) to your instance(s):

I SUBMITTED A DIFFERENT FRONTEND LINK ON ECAMPUS FOR THE PRESENTATION. I CREATED NEW INSTANCES WITH A BETTER VERSION.

```
Backend: 
https://cc241070-10748.node.fhstp.cc

Frontend: 
https://cc241070-10749.node.fhstp.cc/
```

#### Admin Login (if you have one) - create this in your app:
```
NO ADMIN LOGIN CURRENTLY
```

#### Two Normal Users:
```
User 1 username: tester1 
User 1 Password: tester1

User 2 username: tester2 
User 2 Password: tester2
```

---

### 🧭 3. User Flow / Grading Instructions

Provide a clear walkthrough for testing your app - here's an example:

1. Visit the homepage at: https://cc241070-10749.node.fhstp.cc/

2. Login with a normal user.
Login with username: tester1, pw: tester1 in one browser session. Then open an ikognito session and login with username: tester2, pw: tester2

3. Try feature A (describe what it does).
In the dashboard you can create a new match. Select the games you want to play. (The order matters. 1st game gives one point, the 2nd one gives 2 points,...) After creating a game you land in the host lobby. There you can copy the Code and enter it in the Join match section in the dashboard of the 2nd user you are logged in. Then you can start the match and enter the results on the host screen.

4. Logout and log in as admin.
-

5. Test feature B (admin-specific function).
-

6. Navigate to page X and try action Y.
You can also navigate to the menu point manage games and add or edit a new game which you can play afterwards when creating a match.



---

Add any additional notes or testing considerations here:


- The styling is made for the desktop version. On mobile there are unresponsive elements, i focused on desktop experience first.

---
