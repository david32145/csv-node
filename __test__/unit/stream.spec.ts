import { streamReader } from "~/lib/stream"
import path from "path"

describe("Stream", () => {
  test("It should be throw an error if file not found", async () => {
    const file = path.resolve(__dirname, "..", "tmp", "file_not_found.csv")

    await expect(streamReader(file, {
      onNextLine: () => true,
      onError: () => { }
    })).rejects.toThrow('csv not found at:')
  })
})