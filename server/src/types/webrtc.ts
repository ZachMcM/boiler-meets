export interface WebRTCOffer {
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidate {
  candidate: RTCIceCandidateInit;
}

export interface RoomData {
  user1: string;
  user2: string;
  createdAt: number;
}

export interface UserJoinedEvent {
  userId: string;
}

export interface UserLeftEvent {
  userId: string;
}

export interface UserReadyEvent {
  userId: string;
}

export interface OfferEvent {
  offer: RTCSessionDescriptionInit;
  from: string;
}

export interface AnswerEvent {
  answer: RTCSessionDescriptionInit;
  from: string;
}

export interface IceCandidateEvent {
  candidate: RTCIceCandidateInit;
  from: string;
}

export interface RoomFoundEvent {
  roomId: string;
}

export interface ErrorEvent {
  message: string;
}