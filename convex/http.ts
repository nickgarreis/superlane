import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authKit } from "./auth";
import { resend } from "./notificationsEmail";

const http = httpRouter();
authKit.registerRoutes(http);
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => resend.handleResendEventWebhook(ctx, req)),
});

export default http;
