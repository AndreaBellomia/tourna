import type { Job } from 'bullmq'

export interface WorkerProcessDefinition<TJob extends Job = Job> {
  jobName: string
  run(job: TJob): Promise<void> | void
}

export function buildProcessDefinitionMap<TJob extends Job = Job>(
  definitions: Array<WorkerProcessDefinition<TJob>>,
): Map<string, WorkerProcessDefinition<TJob>> {
  return new Map(definitions.map((definition) => [definition.jobName, definition]))
}

export abstract class BaseWorkerProcessor<TJob extends Job = Job> {
  private processDefinitionsMap?: Map<string, WorkerProcessDefinition<TJob>>

  protected abstract getProcessDefinitions(): Array<WorkerProcessDefinition<TJob>>

  protected getUnsupportedJobErrorMessage(job: TJob): string {
    return `Unsupported job "${job.name}"`
  }

  private getDefinitionMap(): Map<string, WorkerProcessDefinition<TJob>> {
    if (!this.processDefinitionsMap) {
      this.processDefinitionsMap = buildProcessDefinitionMap(this.getProcessDefinitions())
    }

    return this.processDefinitionsMap
  }

  async process(job: TJob): Promise<void> {
    const definition = this.getDefinitionMap().get(job.name)

    if (!definition) {
      throw new Error(this.getUnsupportedJobErrorMessage(job))
    }

    await definition.run(job)
  }
}
