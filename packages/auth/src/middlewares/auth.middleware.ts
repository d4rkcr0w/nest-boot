import { Context } from "@nest-boot/common";
import { EntityManager } from "@mikro-orm/core";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

import { PersonalAccessToken } from "../entities";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly entityManager: EntityManager) {}

  async use(req: Request, res: Response, next: () => void): Promise<void> {
    // 获取运行上下文
    const ctx = Context.get();

    // 查找访问令牌
    const accessTokenRepository =
      this.entityManager.getRepository(PersonalAccessToken);

    const accessToken = await accessTokenRepository.findOne({
      token: this.extractAccessToken(req),
    });

    if (accessToken) {
      const repository = this.entityManager.getRepository<NestBootAuth.User>(
        accessToken.entity
      );
      const entity = await repository.findOne(accessToken.entityId);

      // 设置访问令牌和用户到运行上下文
      ctx.accessToken = accessToken.token;
      ctx.user = entity;
    }

    return next();
  }

  private extractAccessToken(req: Request): string {
    let accessToken: string;

    // 从请求头中提取访问令牌
    if (!accessToken) {
      const authorizationHeader = req.get("Authorization");
      if (authorizationHeader) {
        accessToken =
          authorizationHeader.match(/[Bb]earer\s+(.+)$/i)?.[1] || "";
      }
    }

    // 从会话中提取访问令牌
    if (!accessToken) {
      accessToken = req.cookies?.access_token;
    }

    return accessToken;
  }
}
