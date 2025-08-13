import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";

interface IRoute {
  path: string;
  router: Router;
}

export const router = Router();

const moduleRoutes: IRoute[] = [
  {
    path: "/user",
    router: UserRoutes,
  },
];

moduleRoutes.forEach((module) => router.use(module.path, module.router));
