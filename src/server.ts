import http from "http";
import { app } from "./index";

export function startServer(port = 0) {
  return new Promise<http.Server>((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}
