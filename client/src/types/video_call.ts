import type { User } from "./user"

export type VideoCallData = {
    otherUser: User | null,
    matched: boolean,
    callLength: number,
    numberCallExtensions: number //TODO replace this with meaningful statistics once algorithm is introduced
    callEndedByUser: boolean
}