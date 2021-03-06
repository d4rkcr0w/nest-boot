import { AnyEntity, FilterQuery, FindOptions } from "@mikro-orm/core";
import { SearchableOptions, SearchEngineInterface } from "@nest-boot/search";
import { Config, MeiliSearch } from "meilisearch";

export class MeiliSearchEngine implements SearchEngineInterface {
  private readonly meilisearch: MeiliSearch;

  constructor(config: MeiliSearch | Config) {
    this.meilisearch =
      config instanceof MeiliSearch ? config : new MeiliSearch(config);
  }

  async search(
    index: string,
    query?: string,
    filter?: string,
    options?: FindOptions<AnyEntity>
  ): Promise<[AnyEntity["id"][], number]> {
    // const whereFilter = options.where && this.getWhereFilter(options.where);
    // const response = await this.meilisearch.index(index).search(query, {
    //   filter: whereFilter ? `(${whereFilter}) AND (${filter})` : filter,
    //   limit: options.take,
    //   offset: options.skip,
    //   sort: options.order
    //     ? Object.entries(options.order).map(
    //         ([key, value]) =>
    //           `${key}:${value === "ASC" || value === 1 ? "asc" : "desc"}`
    //       )
    //     : [],
    // });
    // return [response.hits.map(({ id }) => id), response.nbHits];

    return [[], 0];
  }

  async update(index: string, entities: AnyEntity[]): Promise<void> {
    await this.meilisearch.index(index).addDocuments(entities);
  }

  async delete(index: string, entities: AnyEntity[]): Promise<void> {
    await this.meilisearch
      .index(index)
      .deleteDocuments(entities.map(({ id }) => id));
  }

  async flush(index: string): Promise<void> {
    await this.meilisearch.index(index).deleteAllDocuments();
  }

  async createIndex(index: string, options: SearchableOptions) {
    const indexInstance = this.meilisearch.index(index);

    await Promise.all([
      indexInstance.updateFilterableAttributes(options.searchableAttributes),
      indexInstance.updateSortableAttributes(options.sortableAttributes),
    ]);
  }

  async deleteIndex(index: string) {
    await this.meilisearch.deleteIndex(index);
  }

  private getWhereFilter(
    where: FilterQuery<AnyEntity> | FilterQuery<AnyEntity>[]
  ): string {
    if (where instanceof Array) {
      return where.map((item) => this.getWhereFilter(item)).join(" OR ");
    }

    return (
      Object.entries(where)
        .map(([key, value]) => {
          if (value instanceof Object) {
            switch (value.type) {
              case "lessThan":
                return `${key} < ${value.value}`;
              case "lessThanOrEqual":
                return `${key} <= ${value.value}`;
              case "moreThan":
                return `${key} > ${value.value}`;
              case "moreThanOrEqual":
                return `${key} >= ${value.value}`;
              default:
            }
          }

          return `${key} = ${value}`;
        })
        .join(" AND ") || null
    );
  }
}
