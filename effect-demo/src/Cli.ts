/* eslint-env node */

import * as Command from "@effect/cli/Command"
import * as Options from "@effect/cli/Options"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

// ===== OPZIONI GLOBALI =====
const config = Options.text("config")
const logfile = Options.text("logfile").pipe(Options.optional)

// ===== COMANDO ROOT: uzu (senza subcommands) =====
export const cliCommandWithoutSubcommands = Command.make(
  "uzu",
  { config, logfile },
  () => Console.log("Usage: uzu primedata <update>")
).pipe(
  Command.withDescription("CLI demo - use --help for available commands")
)

// ===== SUBCOMMAND LIVELLO 1: primedata =====
const primedataCommand = Command.make(
  "primedata",
  {},
  () => Console.log("Usage: uzu primedata update")
).pipe(
  Command.withDescription("Manages primedata")
)

// ===== SUBCOMMAND LIVELLO 2: update =====
const noPush = Options.boolean("no-push").pipe(Options.optional)

const updateCommand = Command.make(
  "update",
  { noPush },
  (subcommandConfig: { noPush: Option.Option<boolean> }) =>
    Effect.flatMap(cliCommandWithoutSubcommands, (parentConfig) =>
      Effect.gen(function*() {
        const { config, logfile } = parentConfig

        yield* Effect.logInfo("=== UPDATE ===")
        yield* Effect.logInfo(`Config: ${config}`)
        yield* Effect.logInfo(`Logfile: ${Option.getOrElse(logfile, () => "none")}`)
        yield* Effect.logInfo(`No Push: ${Option.getOrElse(subcommandConfig.noPush, () => false)}`)
      }))
).pipe(
  Command.withDescription("Updates primedata")
)

// ===== COMPOSIZIONE COMANDI =====
const primedataWithUpdate = primedataCommand.pipe(
  Command.withSubcommands([updateCommand])
)

const command = cliCommandWithoutSubcommands.pipe(
  Command.withSubcommands([primedataWithUpdate])
)

export const run = Command.run(command, {
  name: "Effect CLI Demo",
  version: "1.0.0"
})
