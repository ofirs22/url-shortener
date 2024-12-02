# Url Shortener

## Description
This project aims to get a long Url and return a short url for better readability
Url's then can be displayed, deleted and updated (only the long url can be updated)
Url's can be shorten weather the user is logged in or not, logged in users can enjoy the extra functionality described above (display, edit and delete)

## Installation
   in the root folder (where client and server directories) run npm run install:all
   to install both dependencies

### Prerequisites
- Node.js (18+)

### Steps
1. Clone the repository:
   git clone https://github.com/ofirs22/url-shortener.git

2. Navigate to the project directory:
   cd url-shortener
3. Install the dependencies:
   npm run install:all
   run dev server and client - npm run run:all
4. Dockerizing
   in root folder run - docker-compose up --build
   frontend will run on port 3000 (http://localhost:3000)
   backend will run on port 3080 (http://localhost:3000)

## Documentation
   entire design document can be found here 
   https://docs.google.com/document/d/1HdoFi9IjdwARbhwWd8ofpLtaHsoG_XZjRLHtMfKe-5k/edit?usp=sharing

## Usage
   Service can be used to manage long urls , to make links more appealing and maintainable
   authorization functionality make it easier to manage the account with all its links and provide display, edit and delete functionality

   - System can be used without loging in but edit and delete wont be available
   - You can signup using the signup button and login using the login button
   - JWT and userId will be saved in the localstorage and will be sent with every call that requires authorization

:) Hope you enjoy itץ


