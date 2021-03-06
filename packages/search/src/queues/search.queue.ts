import { AnyEntity } from "@mikro-orm/core";
import { BaseQueue, Job, Queue } from "@nest-boot/queue";

import { SearchEngine } from "../engines/search.engine";

export interface SearchQueueOptions {
  index: string;
  entities: AnyEntity[];
}

@Queue({
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
})
export class SearchQueue extends BaseQueue<
  SearchQueueOptions,
  void,
  "makeSearchable" | "unmakeSearchable"
> {
  constructor(readonly searchEngine: SearchEngine) {
    super();
  }

  async processor(
    job: Job<SearchQueueOptions, void, "makeSearchable" | "unmakeSearchable">
  ): Promise<void> {
    const { index, entities } = job.data;

    switch (job.name) {
      case "makeSearchable":
        await this.searchEngine.update(index, entities);
        break;
      case "unmakeSearchable":
        await this.searchEngine.delete(index, entities);
        break;
      default:
    }
  }
}
