import { Match } from "effect";
import React from "react";


type Props = {
  type: "nsfw" | "action" | "adventure" | "superhero" | "horror",
  rating?: number;
}

const Tag = React.memo((props: Props) => Match.value(props.type).pipe(
  Match.when("action", () => <span className="bg-yellow-500/10 px-3 py-1 w-17 font-medium squiricle text-xs text-yellow-500">ACTION</span>),
  Match.when("adventure", () => <span className="bg-green-500/10 px-3 py-1 w-23 font-medium squiricle text-xs text-green-500">ADVENTURE</span>),
  Match.when("nsfw", () => <span className="bg-pink-500/10 px-3 py-1 w-14 font-medium squiricle text-xs text-pink-500">NSFW</span>),
  Match.when("superhero", () => <span className="bg-blue-500/10 px-3 py-1 w-23 font-medium squiricle text-xs text-blue-500">SUPERHERO</span>),
  Match.when("horror", () => <span className="bg-black px-3 py-1 w-17 font-medium squiricle text-xs text-neutral-400">HORROR</span>),
  Match.orElse(() => <span className="bg-neutral-500/10 px-3 py-1 w-20 font-medium squiricle text-xs text-neutral-500">UNKNOWN</span>)
))

export default Tag
