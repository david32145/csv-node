export type PipelineFunction<T> = (value: T, index: number) => T 

class Pipeline<T> {
  private pipelines: PipelineFunction<T> []

  public constructor() {
    this.pipelines = []
  }

  public pipe(pipe: PipelineFunction<T>): Pipeline<T> {
    this.pipelines.push(pipe)
    return this
  }

  public process(data: T): T {
    const newData = this
      .pipelines
      .reduce((acc, item, index) => item(acc, index), data)

    return newData
  }
}

export default Pipeline