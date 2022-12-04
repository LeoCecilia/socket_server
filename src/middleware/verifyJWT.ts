import jwt, { JwtPayload } from "jsonwebtoken";
import { Middleware } from "koa";

export const verifyJWT: Middleware = (ctx, next) => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    ctx.status = 401;
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;
    if (!decoded.name) {
      ctx.status = 403;
      return next();
    }
    return next();
  } catch (err) {
    ctx.status = 403;
    return next();
  }
};
