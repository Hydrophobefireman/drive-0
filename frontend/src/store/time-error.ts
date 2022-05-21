import {createState} from "statedrive";

export const timeError = createState<"behind" | "ahead">({name: "time-error"});
