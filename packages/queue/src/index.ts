/* eslint-disable @typescript-eslint/no-namespace */

import { BulkJobOptions, Job, JobsOptions as JobOptions } from "bullmq";

declare global {
  namespace NestBootCommon {
    interface Context {
      job?: Job;
    }
  }
}

export * from "./base.queue";
export * from "./queue.decorator";
export * from "./queue.module";

export { BulkJobOptions, Job, JobOptions };
