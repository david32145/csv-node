import { PredicateFunction, NextStrategy } from './models'
class Filtered<T> {
  private predicates: PredicateFunction<T> []

  public constructor () {
    this.predicates = []
  }

  public addPredicate (pred: PredicateFunction<T>): Filtered<T> {
    this.predicates.push(pred)
    return this
  }

  public process (data: T, linesReadable: number, currentLine: number): NextStrategy {
    let nextStrategy = NextStrategy.PROCESS
    for (let i = 0; i < this.predicates.length; i++) {
      const strategy = this.predicates[i](data, linesReadable, currentLine)
      if (strategy === NextStrategy.NEXT) {
        nextStrategy = NextStrategy.NEXT
      }
      if (strategy === NextStrategy.STOP) {
        return NextStrategy.STOP
      }
    }
    return nextStrategy
  }
}

export default Filtered
