import Router from "koa-router";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

import { Users } from "../models/user";

const authRouter = new Router({ prefix: "/auth" });

function generateAccessToken(user: { name: string }) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
}

authRouter.post("/register", async (ctx, next) => {
  const { userName, password } = ctx.request.body;
  if (!userName || !password) {
    ctx.status = 400;
    ctx.body = {
      message: "username and password are required",
    };
    return next();
  }

  const duplicate = await Users.findOne({ name: userName });
  if (duplicate) {
    ctx.status = 409;
    return next();
  }
  try {
    // encrypt password
    const hashedPwd = await bcrypt.hash(password, 10);
    const result = await Users.create({ name: userName, password: hashedPwd });
    console.log("create user", result);
    ctx.status = 201;
    ctx.body = { message: `New user ${userName} created!` };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: (err as Error).message };
  }
});

authRouter.post("/login", async (ctx, next) => {
  console.log("login", ctx);
  const cookies = ctx.cookies;
  const { userName, password } = ctx.request.body;
  if (!userName || !password) {
    ctx.status = 400;
    ctx.body = {
      message: "username and password are required",
    };
    return next();
  }
  const foundUser = await Users.findOne({ name: userName });
  if (!foundUser) {
    ctx.status = 401;
    return next();
  }
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const user = { name: foundUser.name };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "5d",
    });
    const token = cookies.get("jwt");
    let newRefreshTokenArray = !token
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt: string) => rt !== token);
    if (token) {
      const foundToken = await Users.findOne({ refreshToken });
      if (!foundToken) {
        newRefreshTokenArray = [];
      }
      ctx.cookies.set("jwt", null, {
        httpOnly: true,
        sameSite: "none",
      });
    }
    foundUser.refreshToken = [...newRefreshTokenArray, refreshToken];
    const result = await foundUser.save();
    console.log("update user token", result);
    ctx.cookies.set("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    ctx.body = { accessToken, name: foundUser.name };
  } else {
    ctx.status = 401;
  }
});

authRouter.get("/refreshToken", async (ctx, next) => {
  const cookies = ctx.cookies;
  const refreshToken = cookies.get("jwt");
  if (!refreshToken) {
    ctx.status = 401;
    return next();
  }
  const foundUser = await Users.findOne({ refreshToken });
  console.log("refreshToken foundUser", foundUser);
  if (!foundUser) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      ) as JwtPayload;
      await Users.updateOne(
        {
          name: decoded.name,
        },
        { refreshToken: [] }
      );
    } catch (err) {
      ctx.status = 403;
      return next();
    }
    ctx.status = 403;
    return next();
  }
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt: string) => rt !== refreshToken
  );
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;
    if (foundUser.name !== decoded.name) {
      ctx.status = 403;
      return next();
    }

    const assessToken = jwt.sign(
      {
        name: decoded.name,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign(
      {
        name: foundUser.userName,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "5d" }
    );

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();
    console.log("foundUser refreshToken", newRefreshToken);
    ctx.cookies.set("jwt", newRefreshToken, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    ctx.body = { assessToken };
  } catch (err) {
    foundUser.refreshToken = [...newRefreshTokenArray];
    await foundUser.save();
    ctx.status = 403;
    return next();
  }
});

authRouter.post("/logout", async (ctx, next) => {
  const refreshToken = ctx.cookies.get("jwt");
  if (!refreshToken) {
    ctx.status = 204;
    return next();
  }
  const foundUser = await Users.findOne({ refreshToken });
  if (foundUser) {
    foundUser.refreshToken = foundUser.refreshToken.filter(
      (rt: string) => rt !== refreshToken
    );
    const result = await foundUser.save();
    console.log("logout user save", result);
  }

  ctx.cookies.set("jwt", null, {
    httpOnly: true,
    sameSite: "none",
  });
  ctx.status = 204;
  return next();
});

export { authRouter };
