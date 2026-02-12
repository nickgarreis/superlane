import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authKit } from "./auth";

const http = httpRouter();
authKit.registerRoutes(http);
http.route({
  path: "/notifications-webhook",
  method: "POST",
  handler: httpAction(async () => new Response("Notifications webhook disabled", { status: 410 })),
});

export default http;
