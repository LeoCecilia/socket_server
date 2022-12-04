import dotenv from "dotenv";

import Koa from "koa";
import { koaBody } from "koa-body";
import { createServer } from "http";
import cors from "@koa/cors";

dotenv.config({ path: `${process.cwd()}/.env.${process.env.NODE_ENV}` });

import { authRouter } from "./routes/auth";
import dbConnect from "./lib/connectDB";
import { verifyJWT } from "./middleware/verifyJWT";
import { corsOptions } from "./config/corsOptions";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";
import { updateDataTimer } from "./lib/timer";

let app = new Koa();

dbConnect();

app.use(cors(corsOptions));

app.use(koaBody()).use(authRouter.routes()).use(authRouter.allowedMethods());

app.use(verifyJWT);

app.use((ctx, next) => {
  console.log("ctx", ctx);
  next();
});

app.listen(3003);

let server = createServer(app.callback());

let io = new Server(server, {
  allowEIO3: true,
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// io.use(async (socket, next) => {
//   try {
//     return next();
//     // console.log("socket", socket.handshake.query.token);
//     // const token = socket.handshake.query.token as string;
//     // const decoded = jwt.verify(
//     //   token,
//     //   process.env.ACCESS_TOKEN_SECRET!
//     // ) as JwtPayload;
//     // console.log("io decoded", decoded);
//     // // socket.name = decoded.name;
//     // if (decoded.name) {
//     //   return next();
//     // }
//   } catch (err) {}
// });
const data = require("./data/data");

updateDataTimer(
  data,
  (data) => {
    data.nectar++;
  },
  9 * 1000
);

io.on("connection", (socket) => {
  console.log("Connected");
  let count = 0;
  const interval = setInterval(() => {
    if (count >= 1000) {
      console.log("all data sent");
      clearInterval(interval);
      return;
    }
    io.emit("socket_data", data);
  }, 9 * 1000);
  socket.on("disconnect", () => {
    console.log("disConnected");
    clearInterval(interval);
  });
});

server.listen(3004);
