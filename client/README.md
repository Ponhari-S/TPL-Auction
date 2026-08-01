TPL-AUCTION

-Set-Up of MERN Project
-Dependencies Installed
-Cluster Creation

-Setup MongoDB connection
-Basic Express server with a test route
-Design User schema

-Build signup API

-Build login API
-Auth middleware
-React: Login/Signup page UI

-Connect frontend auth to backend
-Test full signup/login flow
-Protect routes with JWT
-Design Player schema

-Design Team schema
-Design AuctionState schema
-Write seed script to import player data into DB
-Build Player CRUD API

-Build Team CRUD API
-Home page layout: Header component

-Player Info section
-Register for Auction button
-API to update player status

-"View Team" navigation link
-Route setup
-Admin-only "Register Team" form UI

-Captain-only "Select Team" flow

-Auction Rules by Admin

-Retention UI and API

-Auction queue builder: generate ordered list of registered players
-Wire controls to backend auction state, test state transitions

-Admin Start/Pause/Resume auction controls
-Basic Socket SetUp

-Sketch the auction engine state machine

-Implement "next player" logic: pull from queue, broadcast playerUp event
-Implement timer logic

-Implement bid:place socket event with server-side validation

-Implement Player Sold Logic
-Implement Player UnSold Logic

-Final Unsold Logic
-Captain Reconnect

-Auction Page
-Live Stats Display

-Display current price + current bidding team, live via socket
-Bid button for captains, disabled states

-Countdown timer UI component, synced with server
-Remaining purse display per team, live update on bid

-Live squad list sidebar for each team during auction
-Style polish Auction page, check responsive layout

-Get Gemini API key, test a basic call with sample stats
-Write prompt to generate overall rating from bat/bowl/field stats

-Integrate Gemini call into the player seeding script (cache rating in DB)
-Display cached rating on Player Info + Auction page
-Refine sold logic: update player price/team atomically
-Refine unsold requeue: verify correct end-of-queue placement

