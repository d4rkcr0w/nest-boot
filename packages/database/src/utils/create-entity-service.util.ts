/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyEntity,
  EntityRepository,
  FilterQuery,
  FindOptions,
  QueryOrder,
  QueryOrderMap,
} from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, Type } from "@nestjs/common";

export type ChunkByIdOptions<T, P extends string = never> = Omit<
  FindOptions<T, P>,
  "offset" | "orderBy"
>;

export interface EntityService<T extends AnyEntity<T>> {
  entityClass: Type<T>;

  repository: EntityRepository<T>;

  chunkById<P extends string = never>(
    where: FilterQuery<T>,
    options: ChunkByIdOptions<T, P>,
    callback: (entities: T[]) => Promise<void>
  ): Promise<this>;
}

export function createEntityService<T extends AnyEntity<T> & { id: string }>(
  entityClass: Type<T>
): Type<EntityService<T>> {
  @Injectable()
  class AbstractEntityService implements EntityService<T> {
    @InjectRepository(entityClass)
    readonly repository: EntityRepository<T>;

    readonly entityClass = entityClass;

    async chunkById<P extends string = never>(
      where: FilterQuery<T>,
      options: ChunkByIdOptions<T, P>,
      callback: (entities: T[]) => Promise<void>
    ): Promise<this> {
      let lastId: string = null;
      let count = 0;

      do {
        // eslint-disable-next-line no-await-in-loop
        const entities = await this.repository.find(
          {
            $and: [where, { id: { $gt: lastId } }],
          } as FilterQuery<T>,
          { ...options, orderBy: { id: QueryOrder.ASC } as QueryOrderMap<T> }
        );

        count = entities.length;

        if (entities.length > 0) {
          lastId = entities[count - 1].id;
        }

        // eslint-disable-next-line no-await-in-loop
        await callback(entities);
      } while ((options?.limit || 0) === count);

      return this;
    }
  }

  return AbstractEntityService;
}
